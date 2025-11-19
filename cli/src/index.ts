#!/usr/bin/env node

import axios, { AxiosError } from 'axios';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

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

let isShuttingDown = false;

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

  try {
    // Register tunnel with backend
    console.log(chalk.gray(`Registering tunnel for ${targetUrl}...`));
    const registerResponse = await axios.post<RegisterResponse>(
      `${backendUrl}/api/tunnels/register`,
      { targetUrl },
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
        await axios.delete(`${backendUrl}/api/tunnels/${id}`);
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
          { timeout: 30000 },
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
                });
              } catch (streamError) {
                console.log(chalk.gray(`  └─`), chalk.red('Stream error'), chalk.red(streamError));
              }
            });

            localResponse.data.on('end', async () => {
              // Send EOF signal
              await axios.post(`${backendUrl}/api/tunnels/${id}/stream`, {
                requestId,
                eof: true,
              });
              console.log(chalk.gray(`  └─`), chalk.green('Stream completed'));
            });

            localResponse.data.on('error', async (streamError: any) => {
              console.log(chalk.gray(`  └─`), chalk.red('✗'), chalk.red(streamError.message));
              // Mark as failed
              await axios.post(`${backendUrl}/api/tunnels/${id}/stream`, {
                requestId,
                eof: true,
              });
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
            });

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
            });
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
        console.error(chalk.gray(`  Make sure the backend is running at ${backendUrl}`));
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
          default: 'http://localhost:3001',
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
  .demandCommand(1, 'You need to specify a command')
  .help()
  .alias('help', 'h')
  .version('1.0.0')
  .alias('version', 'v')
  .parse();

