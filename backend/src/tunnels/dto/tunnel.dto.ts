import { IsString, IsNumber, IsOptional, IsObject, IsUrl, Matches } from 'class-validator';

export class RegisterTunnelDto {
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
  }, {
    message: 'targetUrl must be a valid URL with http:// or https:// protocol',
  })
  @Matches(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/, {
    message: 'targetUrl must be localhost or 127.0.0.1 only (e.g., http://localhost:3000/api)',
  })
  targetUrl: string;
}

export class RegisterTunnelResponseDto {
  id: string;
  publicUrl: string;
  targetUrl: string;
  createdAt: string;
}

export class PollTunnelDto {
  @IsOptional()
  @IsNumber()
  maxWaitMs?: number;
}

export class PollTunnelResponseDto {
  requestId: string | null;
  method?: string;
  path?: string;
  headers?: Record<string, any>;
  body?: any;
  isStreaming?: boolean;
}

export class RespondTunnelDto {
  @IsString()
  requestId: string;

  @IsNumber()
  statusCode: number;

  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @IsOptional()
  body?: any;
}

export class StreamChunkDto {
  @IsString()
  requestId: string;

  @IsOptional()
  @IsNumber()
  sequence?: number;

  @IsOptional()
  @IsString()
  chunk?: string;

  @IsOptional()
  eof?: boolean;
}

export class TunnelListItemDto {
  id: string;
  targetUrl: string;
  createdAt: string;
  lastSeenAt: string;
  isActive: boolean;
}

