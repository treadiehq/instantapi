import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class RegisterTunnelDto {
  @IsString()
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

