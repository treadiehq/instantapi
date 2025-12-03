export class CreateEndpointDto {
  language: 'javascript' | 'python';
  code: string;
  name?: string;
  description?: string;
  ttlMinutes?: number; // default 60 (1 hour). Options: 5, 15, 30, 60, 360, 1440, 10080
  ttlHours?: number; // deprecated, converted to ttlMinutes for backward compatibility
  kind?: 'snippet' | 'webhook'; // "file" handled by CreateFileEndpointDto
  rateLimit?: number; // max requests per window (default 100)
  rateLimitWindow?: number; // window size in seconds (default 60)
}

export class CreateFileEndpointDto {
  language: 'javascript' | 'python';
  name?: string;
  description?: string;
  ttlMinutes?: number; // default 60 (1 hour)
  ttlHours?: number; // deprecated, converted to ttlMinutes for backward compatibility
  kind?: 'snippet' | 'webhook' | 'file'; // default "file"
  rateLimit?: number;
  rateLimitWindow?: number;
}

export class CreateEndpointResponseDto {
  id: string;
  language: string;
  url: string;
  expiresAt: string;
  ttlMinutes: number;
  ttlHours?: number; // deprecated, included for backward compatibility
  kind: string;
  name?: string;
  description?: string;
  rateLimit?: number;
  rateLimitWindow?: number;
}

export class ExecutionResultDto {
  result?: any;
  logs?: string[];
  error?: { message: string; stack?: string } | string;
  durationMs?: number;
}
