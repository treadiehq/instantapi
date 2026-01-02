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

    // Test endpoint from docs - Execute Python code
    if (request.method === 'GET' && new URL(request.url).pathname === '/run') {
      try {
        const sandbox = getSandbox(env.Sandbox, "test-sandbox");
        const result = await sandbox.exec('python3 -c "print(2 + 2)"');
        return new Response(JSON.stringify({
          output: result.stdout,
          error: result.stderr,
          exitCode: result.exitCode,
          success: result.success,
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (error: any) {
        console.error('Error in /run:', error);
        return new Response(JSON.stringify({
          error: error.message,
          stack: error.stack,
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    // Test endpoint from docs - Work with files
    if (request.method === 'GET' && new URL(request.url).pathname === '/file') {
      try {
        const sandbox = getSandbox(env.Sandbox, "test-sandbox");
        await sandbox.writeFile("/workspace/hello.txt", "Hello, Sandbox!");
        const file = await sandbox.readFile("/workspace/hello.txt");
        return new Response(JSON.stringify({
          content: file.content,
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (error: any) {
        return new Response(JSON.stringify({
          error: error.message,
          stack: error.stack,
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
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

      // Wrap user code to call handler with input and headers (for webhook mode)
      const wrappedCode = `
const input = ${JSON.stringify(input)};
${mode === 'webhook' ? `const headers = ${JSON.stringify(headers || {})};` : ''}

${code}

// Async IIFE to handle both sync and async handlers
(async () => {
  try {
    if (typeof handler === 'function') {
      // Await in case handler is async (works for sync too)
      const result = await handler(${mode === 'webhook' ? 'input, headers' : 'input'});
      console.log(JSON.stringify({ __result: result }));
    } else if (typeof result !== 'undefined') {
      // Return the result variable if defined
      console.log(JSON.stringify({ __result: result }));
    }
  } catch (e) {
    console.error('Handler error:', e.message);
    console.log(JSON.stringify({ __result: null, __error: e.message }));
  }
})();
`;

      // Write the code to a file
      await sandbox.writeFile('/workspace/code.js', wrappedCode);

      // Execute with Node.js
      const execResult = await sandbox.exec('node /workspace/code.js');

      // Parse result from stdout
      let result = null;
      let handlerError = null;
      const output = execResult.stdout || '';
      const lines = output.split('\n');
      
      for (const line of lines) {
        if (line.trim().startsWith('{') && line.includes('__result')) {
          try {
            const parsed = JSON.parse(line);
            result = parsed.__result;
            if (parsed.__error) {
              handlerError = parsed.__error;
            }
          } catch {}
        } else if (line.trim()) {
          logs.push(line);
        }
      }

      // Add stderr to logs
      if (execResult.stderr) {
        logs.push(...execResult.stderr.split('\n').filter(l => l.trim()));
      }

      const durationMs = Date.now() - startTime;

      // Check for execution errors
      if (execResult.exitCode !== 0) {
        return {
          error: { message: execResult.stderr || 'JavaScript execution failed with non-zero exit code' },
          logs,
          durationMs,
        };
      }

      // Check for handler-level errors (caught inside the async IIFE)
      if (handlerError) {
        return {
          error: { message: handlerError },
          logs,
          durationMs,
        };
      }

      return {
        result,
        logs,
        durationMs,
        error: null,
      };
    }
    
    // Fallback for local development (when Sandbox binding not available)
    logs.push('[Local Dev Mode] Cloudflare Sandbox binding not available');
    logs.push('[Local Dev Mode] JavaScript execution requires production deployment');
    logs.push('[Local Dev Mode] Deploy to Cloudflare Workers with Paid plan to enable');

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

      // Wrap user code to call handler with input and headers (for webhook mode)
      const inputJson = JSON.stringify(input).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const headersJson = JSON.stringify(headers || {}).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      
      const wrappedCode = `
import json
import sys

# Parse input
input_json = """${inputJson}"""
input_data = json.loads(input_json)

${mode === 'webhook' ? `
headers_json = """${headersJson}"""
headers = json.loads(headers_json)
` : ''}

${code}

# Auto-detect: use handler if defined, otherwise return result variable
if 'handler' in dir():
    result = handler(${mode === 'webhook' ? 'input_data, headers' : 'input_data'})
else:
    # Return result variable if defined, otherwise None
    result = result if 'result' in dir() else None

# Output result as JSON
print("__RESULT_START__")
print(json.dumps(result))
print("__RESULT_END__")
`;

      // Write the code to a file
      await sandbox.writeFile('/workspace/code.py', wrappedCode);

      // Execute with Python
      const execResult = await sandbox.exec('python3 /workspace/code.py');

      // Parse result from stdout
      let result = null;
      const output = execResult.stdout || '';
      const resultMatch = output.match(/__RESULT_START__\s*([\s\S]*?)\s*__RESULT_END__/);
      
      if (resultMatch) {
        try {
          result = JSON.parse(resultMatch[1].trim());
        } catch {}
      }

      // Extract logs (everything before result markers)
      const logLines = output.split('__RESULT_START__')[0].split('\n').filter(l => l.trim());
      logs.push(...logLines);

      // Add stderr to logs
      if (execResult.stderr) {
        logs.push(...execResult.stderr.split('\n').filter(l => l.trim()));
      }

      const durationMs = Date.now() - startTime;

      // Check for execution errors
      if (execResult.exitCode !== 0) {
        return {
          error: { message: execResult.stderr || 'Python execution failed with non-zero exit code' },
          logs,
          durationMs,
        };
      }

      return {
        result,
        logs,
        durationMs,
        error: null,
      };
    }
    
    // Fallback for local development: Python not available without actual Cloudflare Sandbox
    logs.push('[Local Dev] Python execution requires Cloudflare Sandbox binding');
    logs.push('[Local Dev] Deploy to Cloudflare Workers with Paid plan to enable Python');

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
