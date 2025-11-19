export class CreateEndpointDto {
  language: 'javascript' | 'python';
  code: string;
  name?: string;
  description?: string;
  ttlHours?: number; // default 24
  kind?: 'snippet' | 'webhook'; // "file" handled by CreateFileEndpointDto
}

export class CreateFileEndpointDto {
  language: 'javascript' | 'python';
  name?: string;
  description?: string;
  ttlHours?: number; // default 24
  kind?: 'snippet' | 'webhook' | 'file'; // default "file"
}

export class CreateEndpointResponseDto {
  id: string;
  language: string;
  url: string;
  expiresAt: string;
  ttlHours: number;
  kind: string;
  name?: string;
  description?: string;
}

export class ExecutionResultDto {
  result?: any;
  logs?: string[];
  error?: { message: string; stack?: string } | string;
  durationMs?: number;
}

