import express, { Express, Request, Response } from 'express';
import getPort from 'get-port';
import * as fs from 'fs';
import * as path from 'path';

interface FunctionHandler {
  (input: any): any | Promise<any>;
}

interface SDKMetadata {
  port: number;
  functions: string[];
  pid: number;
}

class InstantAPISDK {
  private app: Express;
  private port: number | null = null;
  private functions: Map<string, FunctionHandler> = new Map();
  private metadataPath: string = path.join(process.cwd(), '.instant-api-sdk.json');
  private server: any = null;

  constructor() {
    this.app = express();
    this.app.use(express.json());

    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'ok',
        functions: Array.from(this.functions.keys()),
        port: this.port,
      });
    });

    // Handle function invocations
    this.app.post('/fn/:name', async (req: Request, res: Response) => {
      const functionName = req.params.name;
      const handler = this.functions.get(functionName);

      if (!handler) {
        return res.status(404).json({
          error: 'Function not found',
          availableFunctions: Array.from(this.functions.keys()),
        });
      }

      try {
        const input = req.body;
        const result = await handler(input);
        res.json({ result });
      } catch (error: any) {
        res.status(500).json({
          error: error.message,
          stack: error.stack,
        });
      }
    });

    // Cleanup on exit
    process.on('exit', () => {
      this.cleanup();
    });

    process.on('SIGINT', () => {
      this.cleanup();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      this.cleanup();
      process.exit(0);
    });
  }

  /**
   * Expose a function via Instant API
   * @param name - Function name (used in URL path)
   * @param handler - Function that takes input and returns result
   */
  async expose(name: string, handler: FunctionHandler): Promise<void> {
    if (this.functions.has(name)) {
      throw new Error(`Function "${name}" is already exposed`);
    }

    this.functions.set(name, handler);

    // Start server if not already started
    if (!this.server) {
      await this.startServer();
    } else {
      // Update metadata
      await this.writeMetadata();
    }

    console.log(`✓ Function "${name}" exposed at http://localhost:${this.port}/fn/${name}`);
  }

  private async startServer(): Promise<void> {
    // Get available port
    this.port = await getPort({ port: [7777, 7778, 7779, 7780, 7781] });

    // Start Express server
    this.server = this.app.listen(this.port, () => {
      console.log(`🚀 Instant API SDK running on http://localhost:${this.port}`);
      console.log(`Functions: ${Array.from(this.functions.keys()).join(', ')}`);
    });

    // Write metadata file
    await this.writeMetadata();
  }

  private async writeMetadata(): Promise<void> {
    const metadata: SDKMetadata = {
      port: this.port!,
      functions: Array.from(this.functions.keys()),
      pid: process.pid,
    };

    fs.writeFileSync(this.metadataPath, JSON.stringify(metadata, null, 2));
  }

  private cleanup(): void {
    if (fs.existsSync(this.metadataPath)) {
      fs.unlinkSync(this.metadataPath);
    }

    if (this.server) {
      this.server.close();
    }
  }

  /**
   * Stop the SDK server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.cleanup();
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Singleton instance
const sdk = new InstantAPISDK();

/**
 * Expose a function via Instant API
 * 
 * @example
 * ```typescript
 * import { expose } from '@instantapi/sdk';
 * 
 * expose('hello', (input) => {
 *   return { message: `Hello, ${input.name}!` };
 * });
 * 
 * expose('calculate', async (input) => {
 *   const result = input.a + input.b;
 *   return { result };
 * });
 * ```
 * 
 * Then run:
 * ```bash
 * npx instant-api expose hello
 * # or
 * npx instant-api expose http://localhost:7777/fn/hello
 * ```
 */
export async function expose(name: string, handler: FunctionHandler): Promise<void> {
  return sdk.expose(name, handler);
}

/**
 * Stop the SDK server
 */
export async function stop(): Promise<void> {
  return sdk.stop();
}

export default { expose, stop };

