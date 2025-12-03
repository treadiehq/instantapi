import { Injectable, InternalServerErrorException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ExecutionResultDto } from './dto/create-endpoint.dto';

interface CloudflareSandboxRequest {
  endpointId: string;
  code: string;
  language: 'javascript' | 'python';
  input: any;
  mode: 'standard' | 'webhook';
  headers?: Record<string, string>;
}

interface CloudflareSandboxResponse {
  result?: any;
  logs?: string[];
  durationMs?: number;
  error?: {
    message: string;
    stack?: string;
  } | null;
}

export interface RateLimitInfo {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

@Injectable()
export class ExecutionService {
  private readonly sandboxUrl: string;

  constructor(private prisma: PrismaService) {
    // Get Cloudflare Sandbox URL from environment
    this.sandboxUrl = process.env.CLOUDFLARE_SANDBOX_URL || 'http://localhost:8787';
  }

  /**
   * Check rate limit for an endpoint
   * Returns rate limit info and whether the request is allowed
   */
  async checkRateLimit(endpointId: string, rateLimit: number, rateLimitWindow: number): Promise<RateLimitInfo> {
    const windowStart = new Date(Date.now() - rateLimitWindow * 1000);
    
    // Count requests in the current window
    const requestCount = await this.prisma.executionLog.count({
      where: {
        endpointId,
        createdAt: {
          gte: windowStart,
        },
      },
    });

    const remaining = Math.max(0, rateLimit - requestCount);
    const resetAt = new Date(Date.now() + rateLimitWindow * 1000);

    return {
      allowed: requestCount < rateLimit,
      limit: rateLimit,
      remaining,
      resetAt,
    };
  }

  /**
   * Execute user code via Cloudflare Sandbox Worker
   * 
   * This service proxies execution requests to a Cloudflare Sandbox Worker
   * which safely executes JS or Python code in an isolated VM.
   */
  async execute(
    endpoint: { id: string; language: string; code: string; kind?: string; rateLimit?: number; rateLimitWindow?: number },
    input: any,
    headers?: Record<string, string>,
    metadata?: { ipAddress?: string; userAgent?: string },
  ): Promise<ExecutionResultDto & { rateLimitInfo?: RateLimitInfo }> {
    const startTime = Date.now();

    // Check rate limit
    const rateLimit = endpoint.rateLimit ?? 100;
    const rateLimitWindow = endpoint.rateLimitWindow ?? 60;
    const rateLimitInfo = await this.checkRateLimit(endpoint.id, rateLimit, rateLimitWindow);

    if (!rateLimitInfo.allowed) {
      // Log the rate-limited request
      await this.logExecution(
        endpoint.id,
        0,
        false,
        { message: 'Rate limit exceeded' },
        input,
        null,
        429,
        metadata?.ipAddress,
        metadata?.userAgent,
      );

      return {
        error: { 
          message: `Rate limit exceeded. Limit: ${rateLimitInfo.limit} requests per ${rateLimitWindow} seconds. Try again in ${Math.ceil((rateLimitInfo.resetAt.getTime() - Date.now()) / 1000)} seconds.` 
        },
        durationMs: 0,
        rateLimitInfo,
      };
    }

    try {

      // Determine mode based on endpoint kind
      const mode = endpoint.kind === 'webhook' ? 'webhook' : 'standard';

      // Prepare request to Cloudflare Sandbox Worker
      const sandboxRequest: CloudflareSandboxRequest = {
        endpointId: endpoint.id,
        code: endpoint.code,
        language: endpoint.language as 'javascript' | 'python',
        input,
        mode,
        headers: mode === 'webhook' ? headers : undefined,
      };

      // Call Cloudflare Sandbox Worker
      const response = await fetch(`${this.sandboxUrl}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sandboxRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new InternalServerErrorException(
          `Sandbox execution failed: ${response.status}`,
        );
      }

      const sandboxResult: CloudflareSandboxResponse = await response.json();
      const durationMs = sandboxResult.durationMs || (Date.now() - startTime);

      // If sandbox returned an error about local dev mode, use local fallback
      if (sandboxResult.error && sandboxResult.error.message && sandboxResult.error.message.includes('Cloudflare Sandbox binding not available')) {
        return this.executeLocally(endpoint, input, headers);
      }


      // Log execution to database
      await this.logExecution(
        endpoint.id,
        durationMs,
        !sandboxResult.error,
        sandboxResult.error,
        input,
        sandboxResult.result,
        sandboxResult.error ? 500 : 200,
        metadata?.ipAddress,
        metadata?.userAgent,
      );

      return {
        result: sandboxResult.result,
        logs: sandboxResult.logs || [],
        error: sandboxResult.error || undefined,
        durationMs,
        rateLimitInfo,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;

      // Log failed execution
      await this.logExecution(
        endpoint.id,
        durationMs,
        false,
        { message: error.message },
        input,
        null,
        500,
        metadata?.ipAddress,
        metadata?.userAgent,
      );

      // Check if it's a network error (sandbox worker not available)
      if (error.message?.includes('fetch') || error.code === 'ECONNREFUSED') {
        return {
          error: { message: 'Sandbox worker unavailable. Please ensure the Cloudflare Sandbox Worker is running.' },
          durationMs,
        };
      }

      return {
        error: { message: error.message || 'Execution failed' },
        durationMs,
      };
    }
  }

  /**
   * Log execution to database
   */
  private async logExecution(
    endpointId: string,
    durationMs: number,
    success: boolean,
    error: any,
    requestBody: any,
    responseBody: any,
    statusCode: number = 200,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      // Truncate large bodies to prevent database bloat
      const truncateJson = (obj: any, maxLength = 10000): any => {
        const str = JSON.stringify(obj);
        if (str.length > maxLength) {
          return { _truncated: true, preview: str.substring(0, maxLength) + '...' };
        }
        return obj;
      };

      await this.prisma.executionLog.create({
        data: {
          endpointId,
          durationMs,
          success,
          error: error ? (typeof error === 'string' ? error : error.message) : null,
          requestBody: requestBody ? truncateJson(requestBody) : null,
          responseBody: responseBody ? truncateJson(responseBody) : null,
          statusCode,
          ipAddress,
          userAgent,
        },
      });
    } catch (err) {
      console.error('Failed to log execution:', err.message);
      // Don't throw - logging failures shouldn't break execution
    }
  }

  /**
   * Local fallback execution for development
   * Only for JavaScript when Sandbox is unavailable
   */
  private async executeLocally(
    endpoint: { id: string; language: string; code: string; kind?: string },
    input: any,
    headers?: Record<string, string>,
  ): Promise<ExecutionResultDto> {
    const startTime = Date.now();
    const logs: string[] = [];

    try {
      if (endpoint.language === 'javascript') {
        // Create a sandboxed context
        const sandbox = {
          input,
          headers: headers || {},
          console: {
            log: (...args: any[]) => {
              logs.push(args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
              ).join(' '));
            },
          },
          // Simple fetch implementation for local dev
          fetch: async (url: string, options?: any) => {
            logs.push(`[Local Dev] Outbound HTTP: ${options?.method || 'GET'} ${url}`);
            // Actually perform the fetch for local dev
            const response = await fetch(url, options);
            return response;
          },
        };

        // Execute the code in a safer context
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const handlerArgs = endpoint.kind === 'webhook' ? 'input, headers' : 'input';
        const fn = new AsyncFunction('sandbox', `
          with (sandbox) {
            ${endpoint.code}
            
            // Auto-detect: use handler if defined, otherwise return last expression
            if (typeof handler === 'function') {
              return handler(${handlerArgs});
            } else {
              // Code executed, return the last expression or undefined
              return typeof result !== 'undefined' ? result : undefined;
            }
          }
        `);

        const result = await fn(sandbox);
        const durationMs = Date.now() - startTime;

        logs.unshift('[Local Dev] Executing JavaScript locally (not in Cloudflare Sandbox)');

        return {
          result,
          logs,
          durationMs,
        };
      } else {
        // Python not supported in local development
        return {
          error: { message: 'Python execution requires Cloudflare Sandbox (production deployment). Use JavaScript for local development.' },
          logs: ['[Local Dev] Python requires production Cloudflare Workers deployment'],
          durationMs: Date.now() - startTime,
        };
      }
    } catch (error: any) {
      return {
        error: { message: error.message || 'Local execution failed' },
        logs,
        durationMs: Date.now() - startTime,
      };
    }
  }
}

