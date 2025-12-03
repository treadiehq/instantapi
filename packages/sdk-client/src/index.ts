/**
 * InstantAPI Client SDK
 * 
 * Run AI agents with an API - like Replicate, but for your custom agents.
 * 
 * @example
 * ```typescript
 * import InstantAPI from '@instantapihq/client';
 * 
 * const api = new InstantAPI({ apiKey: 'ik_your_key' });
 * 
 * // Run any deployed agent
 * const result = await api.run('agent-id', { prompt: 'Hello!' });
 * console.log(result);
 * ```
 */

export interface InstantAPIOptions {
  /** Your InstantAPI API key (starts with 'ik_') */
  apiKey?: string;
  /** Base URL for the API (default: https://api.instantapi.co) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

export interface RunOptions {
  /** Custom headers to include in the request */
  headers?: Record<string, string>;
  /** Override timeout for this specific request */
  timeout?: number;
}

export interface RunResult<T = any> {
  /** The result returned by your agent */
  result: T;
  /** Logs from console.log/print statements */
  logs?: string[];
  /** Execution duration in milliseconds */
  durationMs: number;
  /** Error information if execution failed */
  error?: {
    message: string;
    stack?: string;
  } | null;
}

export class InstantAPIError extends Error {
  public statusCode: number;
  public response: any;

  constructor(message: string, statusCode: number, response?: any) {
    super(message);
    this.name = 'InstantAPIError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

export class InstantAPI {
  private apiKey?: string;
  private baseUrl: string;
  private timeout: number;

  constructor(options: InstantAPIOptions = {}) {
    this.apiKey = options.apiKey || process.env.INSTANT_API_KEY;
    this.baseUrl = options.baseUrl || process.env.INSTANT_API_BASE_URL || 'https://api.instantapi.co';
    this.timeout = options.timeout || 30000;

    // Remove trailing slash from baseUrl
    if (this.baseUrl.endsWith('/')) {
      this.baseUrl = this.baseUrl.slice(0, -1);
    }
  }

  /**
   * Run a deployed agent with the given input
   * 
   * @param agentId - The agent/endpoint ID (e.g., 'cmiplsu200013w2qx' or a custom name)
   * @param input - The input to pass to your agent's handler function
   * @param options - Optional configuration for this request
   * @returns The result from your agent
   * 
   * @example
   * ```typescript
   * // Simple usage
   * const result = await api.run('my-chatbot', { prompt: 'Hello!' });
   * 
   * // With full result including logs and duration
   * const { result, logs, durationMs } = await api.run('my-agent', { data: 'test' });
   * ```
   */
  async run<T = any>(
    agentId: string,
    input: Record<string, any> = {},
    options: RunOptions = {}
  ): Promise<RunResult<T>> {
    const url = `${this.baseUrl}/run/${agentId}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add API key if available
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options.timeout || this.timeout
    );

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(input),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new InstantAPIError(
          data.error?.message || data.message || 'Request failed',
          response.status,
          data
        );
      }

      return data as RunResult<T>;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new InstantAPIError('Request timeout', 408);
      }

      if (error instanceof InstantAPIError) {
        throw error;
      }

      throw new InstantAPIError(
        error.message || 'Network error',
        0,
        error
      );
    }
  }

  /**
   * Create a new agent/endpoint
   * 
   * @param options - Agent configuration
   * @returns The created endpoint details
   * 
   * @example
   * ```typescript
   * const endpoint = await api.create({
   *   code: 'function handler(input) { return { hello: input.name }; }',
   *   language: 'javascript',
   *   name: 'my-greeter'
   * });
   * 
   * console.log(endpoint.url); // https://api.instantapi.co/run/...
   * ```
   */
  async create(options: {
    code: string;
    language: 'javascript' | 'python';
    name?: string;
    description?: string;
    ttlHours?: number;
  }): Promise<{
    id: string;
    url: string;
    expiresAt: string;
    ttlHours: number;
    name?: string;
    description?: string;
  }> {
    const url = `${this.baseUrl}/api/endpoints`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(options),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new InstantAPIError(
        data.error?.message || data.message || 'Failed to create endpoint',
        response.status,
        data
      );
    }

    return data;
  }

  /**
   * List all your deployed agents/endpoints
   * Requires authentication
   * 
   * @returns Array of your endpoints
   */
  async list(): Promise<Array<{
    id: string;
    name?: string;
    description?: string;
    language: string;
    url: string;
    createdAt: string;
    expiresAt: string;
  }>> {
    if (!this.apiKey) {
      throw new InstantAPIError('API key required to list endpoints', 401);
    }

    const url = `${this.baseUrl}/api/endpoints`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new InstantAPIError(
        data.error?.message || data.message || 'Failed to list endpoints',
        response.status,
        data
      );
    }

    return data;
  }

  /**
   * Delete an agent/endpoint
   * Requires authentication
   * 
   * @param agentId - The agent/endpoint ID to delete
   */
  async delete(agentId: string): Promise<void> {
    if (!this.apiKey) {
      throw new InstantAPIError('API key required to delete endpoints', 401);
    }

    const url = `${this.baseUrl}/api/endpoints/${agentId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new InstantAPIError(
        data.error?.message || data.message || 'Failed to delete endpoint',
        response.status,
        data
      );
    }
  }
}

// Default export for simple usage: import InstantAPI from '@instantapihq/client'
export default InstantAPI;

