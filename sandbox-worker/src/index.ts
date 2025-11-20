/**
 * Cloudflare Sandbox Worker for Instant API
 * 
 * This worker uses Cloudflare's production Sandbox SDK to safely execute
 * user-provided JavaScript and Python code in isolated containers.
 * 
 * Reference: https://developers.cloudflare.com/sandbox/
 */

import { getSandbox } from '@cloudflare/sandbox';

export { Sandbox } from '@cloudflare/sandbox';

export interface Env {
  Sandbox: any; // Sandbox binding (note: capital S, not SANDBOX)
}

interface ExecutionRequest {
  endpointId: string;
  code: string;
  language: 'javascript' | 'python';
  input: any;
  mode: 'standard' | 'webhook';
  headers?: Record<string, string>;
}

interface ExecutionResponse {
  result?: any;
  logs?: string[];
  durationMs: number;
  error?: {
    message: string;
    stack?: string;
  } | null;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // CORS headers for local development
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    // Health check
    if (request.method === 'GET' && new URL(request.url).pathname === '/') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'instant-api-sandbox-worker',
        timestamp: new Date().toISOString(),
        sdk: '@cloudflare/sandbox',
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Execute endpoint
    if (request.method === 'POST' && new URL(request.url).pathname === '/execute') {
      const startTime = Date.now();
      try {
        const body: ExecutionRequest = await request.json();
        const { endpointId, code, language, input, mode, headers: requestHeaders } = body;

        // Validate request
        if (!code || !language) {
          return new Response(JSON.stringify({
            error: { message: 'Missing required fields: code and language' },
            durationMs: Date.now() - startTime,
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        // Execute code based on language
        let result: ExecutionResponse;
        if (language === 'javascript') {
          result = await executeJavaScript(env, code, input, mode || 'standard', requestHeaders);
        } else if (language === 'python') {
          result = await executePython(env, code, input, mode || 'standard', requestHeaders);
        } else {
          return new Response(JSON.stringify({
            error: { message: `Unsupported language: ${language}` },
            durationMs: Date.now() - startTime,
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        return new Response(JSON.stringify(result), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (error: any) {
        console.error('Execution error:', error);
        return new Response(JSON.stringify({
          error: { message: error.message || 'Execution failed' },
          durationMs: Date.now() - startTime,
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    return new Response('Not Found', {
      status: 404,
      headers: corsHeaders,
    });
  },
};

/**
 * Execute JavaScript code using Cloudflare Sandbox SDK (or fallback for local dev)
 * 
 * The user's code should define a handler function that accepts input
 * and returns a result.
 */
async function executeJavaScript(
  env: Env,
  code: string,
  input: any,
  mode: 'standard' | 'webhook',
  headers?: Record<string, string>,
): Promise<ExecutionResponse> {
  const logs: string[] = [];
  const startTime = Date.now();
  
  try {
    // Check if Sandbox binding is available (production)
    if (env.Sandbox) {
      // Get sandbox instance (unique per execution)
      const sessionId = `js-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const sandbox = getSandbox(env.Sandbox, sessionId);

      // Create a Node.js execution context with fetch enabled
      const ctx = await sandbox.createCodeContext({ language: 'javascript' });

      // Wrap user code to call handler with input and headers (for webhook mode)
      const handlerArgs = mode === 'webhook' 
        ? `${JSON.stringify(input)}, ${JSON.stringify(headers || {})}` 
        : JSON.stringify(input);
      
      const wrappedCode = `
// Expose fetch for outbound HTTP requests
const fetch = globalThis.fetch;

${code}

// Auto-detect: use handler if defined, otherwise return last expression
if (typeof handler === 'function') {
  handler(${handlerArgs});
} else {
  // Return the last expression or result variable if defined
  typeof result !== 'undefined' ? result : undefined;
}
`;

      // Execute the code
      const execResult = await sandbox.runCode(wrappedCode, { context: ctx });

      // Extract result and logs
      const result = execResult.results?.[0]?.text ? JSON.parse(execResult.results[0].text) : null;
      const sandboxLogs = execResult.logs || [];
      const durationMs = Date.now() - startTime;

      return {
        result,
        logs: sandboxLogs,
        durationMs,
        error: null,
      };
    }
    
    // Fallback for local development (when Sandbox binding not available)
    // Cloudflare Workers blocks eval/Function constructor for security
    // For full functionality, deploy to Cloudflare with Workers Paid plan
    
    logs.push('[Local Dev Mode] Cloudflare Sandbox binding not available');
    logs.push('[Local Dev Mode] JavaScript execution requires production deployment');
    logs.push('[Local Dev Mode] Deploy to Cloudflare Workers with Paid plan to enable');
    logs.push('[Local Dev Mode] Or test via the UI at http://localhost:3000');

    return {
      error: { message: 'Cloudflare Sandbox binding not available in local development. Deploy to Cloudflare Workers (Paid plan) for full execution, or use the web UI for testing.' },
      logs,
      durationMs: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      error: { message: error.message || 'JavaScript execution failed', stack: error.stack },
      logs,
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Execute Python code using Cloudflare Sandbox SDK (or fallback for local dev)
 * 
 * The user's code should define a handler function that accepts input
 * and returns a result.
 */
async function executePython(
  env: Env,
  code: string,
  input: any,
  mode: 'standard' | 'webhook',
  headers?: Record<string, string>,
): Promise<ExecutionResponse> {
  const logs: string[] = [];
  const startTime = Date.now();
  
  try {
    // Check if Sandbox binding is available (production)
    if (env.Sandbox) {
      // Get sandbox instance (unique per execution)
      const sessionId = `py-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const sandbox = getSandbox(env.Sandbox, sessionId);

      // Create a Python execution context
      const ctx = await sandbox.createCodeContext({ language: 'python' });

      // Wrap user code to call handler with input and headers (for webhook mode)
      const handlerArgs = mode === 'webhook' 
        ? `input_data, ${JSON.stringify(headers || {})}` 
        : 'input_data';
      
      const wrappedCode = `
import json
import urllib.request
import urllib.parse

# Simple HTTP helpers for outbound requests
def http_get(url):
    """Simple GET request helper"""
    with urllib.request.urlopen(url) as response:
        return json.loads(response.read().decode())

def http_post(url, data=None):
    """Simple POST request helper"""
    data_bytes = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=data_bytes, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())

${code}

# Auto-detect: use handler if defined, otherwise return result variable
input_data = ${JSON.stringify(input)}

if 'handler' in dir():
    result = handler(${handlerArgs})
else:
    # Return result variable if defined, otherwise None
    result = result if 'result' in dir() else None

result
`;

      // Execute the code
      const execResult = await sandbox.runCode(wrappedCode, { context: ctx });

      // Extract result and logs
      const result = execResult.results?.[0]?.text ? JSON.parse(execResult.results[0].text) : null;
      const sandboxLogs = execResult.logs || [];
      const durationMs = Date.now() - startTime;

      return {
        result,
        logs: sandboxLogs,
        durationMs,
        error: null,
      };
    }
    
    // Fallback for local development: Python not available without actual Cloudflare Sandbox
    logs.push('[Local Dev] Python execution requires Cloudflare Sandbox binding');
    logs.push('[Local Dev] Deploy to Cloudflare Workers with Paid plan to enable Python');
    logs.push('[Local Dev] For now, try JavaScript examples instead');

    return {
      error: { message: 'Python execution requires Cloudflare Workers Paid plan with Sandbox binding. Use JavaScript for local development.' },
      logs,
      durationMs: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      error: { message: error.message || 'Python execution failed', stack: error.stack },
      logs,
      durationMs: Date.now() - startTime,
    };
  }
}
