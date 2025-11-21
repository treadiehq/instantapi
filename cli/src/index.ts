#!/usr/bin/env node

import axios, { AxiosError } from 'axios';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface RegisterResponse {
  id: string;
  publicUrl: string;
  targetUrl: string;
  createdAt: string;
}

interface PollResponse {
  requestId: string | null;
  method?: string;
  path?: string;
  headers?: Record<string, any>;
  body?: any;
  isStreaming?: boolean;
}

interface SDKMetadata {
  port: number;
  functions: string[];
  pid: number;
}

interface Config {
  apiKey?: string;
}

let isShuttingDown = false;

// Get API key from environment or config file
function getApiKey(): string | undefined {
  // First check environment variable
  const envKey = process.env.INSTANT_API_KEY;
  if (envKey) {
    return envKey;
  }

  // Check config file in home directory
  const configPath = path.join(os.homedir(), '.instant-api-config.json');
  if (fs.existsSync(configPath)) {
    try {
      const config: Config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return config.apiKey;
    } catch (error) {
      console.warn(chalk.yellow('Warning: Failed to read config file'));
    }
  }

  return undefined;
}

// Save API key to config file
function saveApiKey(apiKey: string): void {
  const configPath = path.join(os.homedir(), '.instant-api-config.json');
  const config: Config = { apiKey };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(chalk.green(`✓ API key saved to ${configPath}`));
}

// Get auth headers (optional - can work without API key with 1hr restrictions)
function getAuthHeaders(warnIfMissing: boolean = false): Record<string, string> {
  const apiKey = getApiKey();
  if (apiKey) {
    return {
      'x-api-key': apiKey,
    };
  }
  // Warn user about 1hr limitation
  if (warnIfMissing) {
    console.log(chalk.yellow('\n⚠️  Running without authentication - tunnel will have temporary restrictions'));
    console.log(chalk.gray('   To use for longer than 1 hour, create an account and set your API key:'));
    console.log(chalk.gray('   1. Sign up at instantapi.co'));
    console.log(chalk.gray('   2. Generate an API key'));
    console.log(chalk.gray('   3. Run: npx instant-api config --api-key ik_...\n'));
  }
  return {};
}

function detectSDKMetadata(): SDKMetadata | null {
  const metadataPath = path.join(process.cwd(), '.instant-api-sdk.json');
  
  if (fs.existsSync(metadataPath)) {
    try {
      const content = fs.readFileSync(metadataPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }
  
  return null;
}

function resolveTargetUrl(input: string): string {
  // Check if it's already a full URL
  try {
    new URL(input);
    return input;
  } catch {
    // Not a URL, might be a function name
    const sdkMetadata = detectSDKMetadata();
    
    if (sdkMetadata && sdkMetadata.functions.includes(input)) {
      // It's a function name - construct URL
      const url = `http://localhost:${sdkMetadata.port}/fn/${input}`;
      console.log(chalk.gray(`Detected SDK function: ${input}`));
      console.log(chalk.gray(`Resolved to: ${url}\n`));
      return url;
    }
    
    // Assume it's a malformed URL, try to use it anyway
    return input;
  }
}

async function exposeRoute(targetUrl: string, backendUrl: string) {
  console.log(chalk.blue('🚀 Instant API - Framework Mode\n'));

  // Check if this is SDK/Function mode (requires API key)
  const isFunctionMode = targetUrl.includes('/fn/');
  const apiKey = getApiKey();
  
  if (isFunctionMode && !apiKey) {
    console.error(chalk.red('✗ Function mode requires an API key'));
    console.log(chalk.yellow('\nTo use function mode:'));
    console.log(chalk.gray('  1. Sign up at instantapi.co'));
    console.log(chalk.gray('  2. Generate an API key'));
    console.log(chalk.gray('  3. Run: npx instant-api config --api-key ik_...'));
    console.log(chalk.gray('\n  Or set environment variable: export INSTANT_API_KEY=ik_...\n'));
    process.exit(1);
  }

  const authHeaders = getAuthHeaders(!isFunctionMode);

  try {
    // Register tunnel with backend
    console.log(chalk.gray(`Registering tunnel for ${targetUrl}...`));
    const registerResponse = await axios.post<RegisterResponse>(
      `${backendUrl}/api/tunnels/register`,
      { targetUrl },
      { headers: authHeaders },
    );

    const { id, publicUrl } = registerResponse.data;

    console.log(chalk.green('✓ Tunnel registered successfully!\n'));
    console.log(chalk.bold('Public URL:'), chalk.cyan(publicUrl));
    console.log(chalk.bold('Target URL:'), chalk.yellow(targetUrl));
    console.log(chalk.bold('Tunnel ID:'), chalk.gray(id));
    console.log(chalk.gray('\nPress Ctrl+C to stop the tunnel\n'));

    // Set up graceful shutdown
    process.on('SIGINT', async () => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      console.log(chalk.yellow('\n\n🛑 Shutting down tunnel...'));

      try {
        await axios.delete(`${backendUrl}/api/tunnels/${id}`, { headers: authHeaders });
        console.log(chalk.green('✓ Tunnel deactivated'));
      } catch (error) {
        console.log(chalk.gray('(Tunnel cleanup skipped)'));
      }

      process.exit(0);
    });

    // Start polling loop
    let requestCount = 0;
    console.log(chalk.gray('Waiting for requests...\n'));

    while (!isShuttingDown) {
      try {
        // Poll for new requests
        const pollResponse = await axios.post<PollResponse>(
          `${backendUrl}/api/tunnels/${id}/poll`,
          { maxWaitMs: 25000 },
          { timeout: 30000, headers: authHeaders },
        );

        const { requestId, method, path, headers, body, isStreaming } = pollResponse.data;

        if (!requestId) {
          // No request received, continue polling
          continue;
        }

        requestCount++;
        const timestamp = new Date().toLocaleTimeString();
        console.log(
          chalk.cyan(`[${timestamp}]`),
          chalk.bold(`${method} ${path}`),
          isStreaming ? chalk.magenta('[STREAMING]') : '',
          chalk.gray(`(#${requestCount})`),
        );

        // Handle streaming vs standard requests
        if (isStreaming) {
          // Streaming request (SSE/WebSocket fallback)
          try {
            const localResponse = await axios({
              method: 'get',
              url: targetUrl + (path || ''),
              headers: { ...headers, accept: 'text/event-stream' },
              responseType: 'stream',
              timeout: 300000, // 5 minute timeout for streams
            });

            let sequence = 0;

            // Stream chunks to backend
            localResponse.data.on('data', async (chunk: Buffer) => {
              try {
                await axios.post(`${backendUrl}/api/tunnels/${id}/stream`, {
                  requestId,
                  sequence: sequence++,
                  chunk: chunk.toString(),
                }, { headers: authHeaders });
              } catch (streamError) {
                console.log(chalk.gray(`  └─`), chalk.red('Stream error'), chalk.red(streamError));
              }
            });

            localResponse.data.on('end', async () => {
              // Send EOF signal
              await axios.post(`${backendUrl}/api/tunnels/${id}/stream`, {
                requestId,
                eof: true,
              }, { headers: authHeaders });
              console.log(chalk.gray(`  └─`), chalk.green('Stream completed'));
            });

            localResponse.data.on('error', async (streamError: any) => {
              console.log(chalk.gray(`  └─`), chalk.red('✗'), chalk.red(streamError.message));
              // Mark as failed
              await axios.post(`${backendUrl}/api/tunnels/${id}/stream`, {
                requestId,
                eof: true,
              }, { headers: authHeaders });
            });
          } catch (localError: any) {
            const errorMessage =
              localError.code === 'ECONNREFUSED'
                ? 'Connection refused - is your local server running?'
                : localError.message;

            console.log(chalk.gray(`  └─`), chalk.red('✗'), chalk.red(errorMessage));

            // Mark as failed
            await axios.post(`${backendUrl}/api/tunnels/${id}/stream`, {
              requestId,
              eof: true,
            });
          }
        } else {
          // Standard request-response
          try {
            const localResponse = await axios({
              method: method?.toLowerCase() as any,
              url: targetUrl + (path || ''),
              headers: headers || {},
              data: body,
              validateStatus: () => true, // Accept any status code
              timeout: 25000,
            });

            // Send response back to backend
            await axios.post(`${backendUrl}/api/tunnels/${id}/respond`, {
              requestId,
              statusCode: localResponse.status,
              headers: localResponse.headers,
              body: localResponse.data,
            }, { headers: authHeaders });

            const statusColor =
              localResponse.status >= 200 && localResponse.status < 300
                ? chalk.green
                : localResponse.status >= 400
                ? chalk.red
                : chalk.yellow;

            console.log(
              chalk.gray(`  └─`),
              statusColor(`${localResponse.status}`),
              chalk.gray(`${JSON.stringify(localResponse.data).substring(0, 100)}${JSON.stringify(localResponse.data).length > 100 ? '...' : ''}`),
            );
          } catch (localError: any) {
            // Local request failed
            const errorMessage =
              localError.code === 'ECONNREFUSED'
                ? 'Connection refused - is your local server running?'
                : localError.message;

            console.log(chalk.gray(`  └─`), chalk.red('✗'), chalk.red(errorMessage));

            // Send error response back
            await axios.post(`${backendUrl}/api/tunnels/${id}/respond`, {
              requestId,
              statusCode: 502,
              headers: { 'content-type': 'application/json' },
              body: {
                error: 'Bad Gateway',
                message: errorMessage,
              },
            }, { headers: authHeaders });
          }
        }
      } catch (pollError: any) {
        if (isShuttingDown) break;

        // Handle polling errors
        if (pollError.code === 'ECONNABORTED') {
          // Timeout is expected, continue
          continue;
        }

        if (axios.isAxiosError(pollError)) {
          const axiosError = pollError as AxiosError;
          if (axiosError.response?.status === 404) {
            console.log(chalk.red('\n✗ Tunnel not found or expired'));
            break;
          }
        }

        console.error(chalk.red('Poll error:'), pollError.message);
        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.code === 'ECONNREFUSED') {
        console.error(
          chalk.red('\n✗ Could not connect to Instant API backend'),
        );
        console.error(chalk.gray(`  Expected backend at: ${backendUrl}`));
        console.log(chalk.yellow('\n💡 Troubleshooting:'));
        console.log(chalk.gray('  1. Make sure the backend is running'));
        console.log(chalk.gray('  2. Check if it\'s running on a different port'));
        console.log(chalk.gray('  3. Use --backend flag: npx instant-api expose <url> --backend http://localhost:PORT'));
        console.log(chalk.gray('  4. Or set environment variable: export INSTANT_API_BACKEND_URL=http://localhost:PORT\n'));
      } else if (axiosError.response) {
        console.error(
          chalk.red('\n✗ Error:'),
          axiosError.response.data || axiosError.message,
        );
      } else {
        console.error(chalk.red('\n✗ Error:'), axiosError.message);
      }
    } else {
      console.error(chalk.red('\n✗ Unexpected error:'), error.message);
    }
    process.exit(1);
  }
}

// CLI setup with yargs
yargs(hideBin(process.argv))
  .command(
    'expose <targetUrl>',
    'Expose a local HTTP endpoint to the internet',
    (yargs) => {
      return yargs
        .positional('targetUrl', {
          describe: 'Local URL to expose (e.g., http://localhost:3000/api/users)',
          type: 'string',
          demandOption: true,
        })
        .option('backend', {
          alias: 'b',
          describe: 'Instant API backend URL',
          type: 'string',
          default: process.env.INSTANT_API_BACKEND_URL || 'https://api.instantapi.co',
        });
    },
    (argv) => {
      const inputUrl = argv.targetUrl as string;
      const backendUrl = argv.backend as string;

      // Resolve target URL (handles both full URLs and function names)
      const targetUrl = resolveTargetUrl(inputUrl);

      // Validate final targetUrl format
      try {
        new URL(targetUrl);
      } catch {
        console.error(chalk.red('✗ Invalid target URL format'));
        console.error(chalk.gray('  Example: http://localhost:3000/api/users'));
        console.error(chalk.gray('  Or function name: myFunction (if SDK is running)'));
        process.exit(1);
      }

      exposeRoute(targetUrl, backendUrl);
    },
  )
  .command(
    'config',
    'Configure Instant API CLI',
    (yargs) => {
      return yargs.option('api-key', {
        describe: 'Set your Instant API key',
        type: 'string',
      });
    },
    (argv) => {
      const apiKey = argv['api-key'] as string | undefined;
      
      if (apiKey) {
        if (!apiKey.startsWith('ik_')) {
          console.error(chalk.red('✗ Invalid API key format. Should start with "ik_"'));
          process.exit(1);
        }
        saveApiKey(apiKey);
        console.log(chalk.green('\n✓ Configuration saved!'));
        console.log(chalk.gray('\nYou can now use: npx instant-api expose <url>'));
      } else {
        // Show current config
        const currentKey = getApiKey();
        if (currentKey) {
          console.log(chalk.green('API Key:'), chalk.gray(currentKey.substring(0, 10) + '...'));
        } else {
          console.log(chalk.yellow('No API key configured'));
          console.log(chalk.gray('\nSet one with: npx instant-api config --api-key ik_...'));
        }
      }
    },
  )
  .demandCommand(1, 'You need to specify a command')
  .help()
  .alias('help', 'h')
  .version('1.0.0')
  .alias('version', 'v')
  .parse();

