import { Injectable, NotFoundException, ForbiddenException, PayloadTooLargeException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { randomBytes } from 'crypto';
import {
  RegisterTunnelDto,
  RegisterTunnelResponseDto,
  PollTunnelResponseDto,
  RespondTunnelDto,
  TunnelListItemDto,
} from './dto/tunnel.dto';

// Security constants
const MAX_ACTIVE_TUNNELS_AUTHENTICATED = 10;
const MAX_ACTIVE_TUNNELS_UNAUTHENTICATED = 1;
const MAX_REQUESTS_PER_MINUTE_PER_TUNNEL = 100;
const MAX_REQUEST_SIZE_BYTES = 1_000_000; // 1MB
const MAX_RESPONSE_SIZE_BYTES = 1_000_000; // 1MB
const MAX_BODY_STORAGE_SIZE = 10_000; // 10KB - store only small bodies in DB

@Injectable()
export class TunnelsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a cryptographically secure secret token for tunnel authentication
   */
  private generateSecretToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Validate tunnel ownership. For authenticated users, checks organizationId.
   * For unauthenticated users, requires a valid secretToken.
   */
  private validateTunnelOwnership(
    tunnel: { organizationId: string | null; secretToken: string },
    organizationId: string | null,
    secretToken?: string,
  ): boolean {
    // For authenticated users, check organization ID
    if (organizationId !== null) {
      return tunnel.organizationId === organizationId;
    }
    
    // For unauthenticated users, require and validate secret token
    if (!secretToken) {
      return false;
    }
    
    // Validate the secret token matches
    return tunnel.secretToken === secretToken;
  }

  async register(dto: RegisterTunnelDto, organizationId: string | null): Promise<RegisterTunnelResponseDto> {
    // Security: Limit active tunnels per organization
    const activeTunnels = await this.prisma.tunnel.count({
      where: {
        organizationId,
        isActive: true,
      },
    });

    const maxTunnels = organizationId 
      ? MAX_ACTIVE_TUNNELS_AUTHENTICATED 
      : MAX_ACTIVE_TUNNELS_UNAUTHENTICATED;

    if (activeTunnels >= maxTunnels) {
      throw new ForbiddenException(
        `Maximum ${maxTunnels} active tunnel${maxTunnels > 1 ? 's' : ''} allowed. ` +
        (organizationId ? 'Please deactivate an existing tunnel first.' : 'Please sign up for more tunnels.')
      );
    }

    // Generate a secret token for tunnel authentication
    const secretToken = this.generateSecretToken();

    const tunnel = await this.prisma.tunnel.create({
      data: {
        organizationId,
        secretToken,
        targetUrl: dto.targetUrl,
        isActive: true,
      },
    });

    const publicUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/t/${tunnel.id}`;


    return {
      id: tunnel.id,
      publicUrl,
      targetUrl: tunnel.targetUrl,
      secretToken: tunnel.secretToken, // Return secret token for CLI to use in subsequent requests
      createdAt: tunnel.createdAt.toISOString(),
    };
  }

  async poll(
    tunnelId: string,
    maxWaitMs: number = 25000,
    organizationId: string | null,
    secretToken?: string,
  ): Promise<PollTunnelResponseDto> {
    // Validate tunnel exists, is active, and belongs to org
    const tunnel = await this.prisma.tunnel.findUnique({
      where: { id: tunnelId },
    });

    if (!tunnel || !this.validateTunnelOwnership(tunnel, organizationId, secretToken)) {
      throw new NotFoundException('Tunnel not found');
    }

    if (!tunnel.isActive) {
      throw new NotFoundException('Tunnel is no longer active');
    }

    // Update lastSeenAt
    await this.prisma.tunnel.update({
      where: { id: tunnelId },
      data: { lastSeenAt: new Date() },
    });

    // Try to find a pending request
    const startTime = Date.now();
    const pollInterval = 500; // Check every 500ms

    while (Date.now() - startTime < maxWaitMs) {
      const pendingRequest = await this.prisma.tunnelRequest.findFirst({
        where: {
          tunnelId,
          status: 'pending',
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (pendingRequest) {
        // Mark as in-flight
        await this.prisma.tunnelRequest.update({
          where: { id: pendingRequest.id },
          data: { status: 'in-flight' },
        });

        return {
          requestId: pendingRequest.id,
          method: pendingRequest.method,
          path: pendingRequest.path,
          headers: pendingRequest.headers as Record<string, any>,
          body: pendingRequest.body,
          isStreaming: pendingRequest.isStreaming,
        };
      }

      // Wait before next check
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    // No request found within timeout
    return {
      requestId: null,
    };
  }

  async respond(tunnelId: string, dto: RespondTunnelDto, organizationId: string | null, secretToken?: string): Promise<void> {
    // Validate tunnel belongs to org
    const tunnel = await this.prisma.tunnel.findUnique({
      where: { id: tunnelId },
    });

    if (!tunnel || !this.validateTunnelOwnership(tunnel, organizationId, secretToken)) {
      throw new NotFoundException('Tunnel not found');
    }

    const request = await this.prisma.tunnelRequest.findUnique({
      where: { id: dto.requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.tunnelId !== tunnelId) {
      throw new NotFoundException('Request does not belong to this tunnel');
    }

    // Calculate response size and duration
    const responseSize = this.calculateSize(dto.headers || {}, dto.body);
    const durationMs = Date.now() - request.createdAt.getTime();

    // Security: Validate response size
    if (responseSize > MAX_RESPONSE_SIZE_BYTES) {
      throw new PayloadTooLargeException(
        `Response too large: ${this.formatBytes(responseSize)} (max ${this.formatBytes(MAX_RESPONSE_SIZE_BYTES)})`
      );
    }

    // Truncate large response bodies to avoid database bloat
    let storedResponseBody = dto.body;
    if (responseSize > MAX_BODY_STORAGE_SIZE) {
      storedResponseBody = {
        _truncated: true,
        _originalSize: responseSize,
        _message: 'Response body too large to store in database',
      };
    }

    await this.prisma.tunnelRequest.update({
      where: { id: dto.requestId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        responseStatus: dto.statusCode,
        responseHeaders: dto.headers || {},
        responseBody: storedResponseBody || null,
        responseSize,
        durationMs,
      },
    });

  }

  async createRequest(
    tunnelId: string,
    method: string,
    path: string,
    headers: Record<string, any>,
    body: any,
  ): Promise<{ id: string; isStreaming: boolean }> {
    // Security: Rate limit requests per tunnel
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentRequestCount = await this.prisma.tunnelRequest.count({
      where: {
        tunnelId,
        createdAt: {
          gte: oneMinuteAgo,
        },
      },
    });

    if (recentRequestCount >= MAX_REQUESTS_PER_MINUTE_PER_TUNNEL) {
      throw new ForbiddenException(
        `Rate limit exceeded: Maximum ${MAX_REQUESTS_PER_MINUTE_PER_TUNNEL} requests per minute per tunnel`
      );
    }

    // Calculate request size (headers + body)
    const requestSize = this.calculateSize(headers, body);

    // Security: Reject oversized requests
    if (requestSize > MAX_REQUEST_SIZE_BYTES) {
      throw new PayloadTooLargeException(
        `Request too large: ${this.formatBytes(requestSize)} (max ${this.formatBytes(MAX_REQUEST_SIZE_BYTES)})`
      );
    }

    // Detect SSE or WebSocket requests
    const acceptHeader = (headers['accept'] || '').toLowerCase();
    const upgradeHeader = (headers['upgrade'] || '').toLowerCase();
    const isStreaming =
      acceptHeader.includes('text/event-stream') ||
      upgradeHeader.includes('websocket');

    // Truncate large bodies to avoid database bloat
    let storedBody = body;
    if (requestSize > MAX_BODY_STORAGE_SIZE) {
      storedBody = {
        _truncated: true,
        _originalSize: requestSize,
        _message: 'Body too large to store in database',
      };
    }

    const request = await this.prisma.tunnelRequest.create({
      data: {
        tunnelId,
        method,
        path,
        headers,
        body: storedBody,
        status: 'pending',
        isStreaming,
        requestSize,
      },
    });

    return { id: request.id, isStreaming };
  }

  private calculateSize(headers: Record<string, any>, body: any): number {
    // Calculate approximate size in bytes
    let size = 0;
    
    // Headers size
    if (headers) {
      size += JSON.stringify(headers).length;
    }
    
    // Body size
    if (body) {
      if (typeof body === 'string') {
        size += body.length;
      } else {
        size += JSON.stringify(body).length;
      }
    }
    
    return size;
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  async addStreamChunk(
    requestId: string,
    sequence: number,
    chunk: string,
    organizationId: string | null,
    secretToken?: string,
  ): Promise<void> {
    // Validate request belongs to org's tunnel
    const request = await this.prisma.tunnelRequest.findUnique({
      where: { id: requestId },
      include: { Tunnel: true },
    });

    if (!request || !this.validateTunnelOwnership(request.Tunnel, organizationId, secretToken)) {
      throw new NotFoundException('Request not found');
    }

    await this.prisma.tunnelStreamEvent.create({
      data: {
        requestId,
        sequence,
        chunk,
      },
    });
  }

  async getStreamChunks(requestId: string, fromSequence: number = 0) {
    return this.prisma.tunnelStreamEvent.findMany({
      where: {
        requestId,
        sequence: {
          gte: fromSequence,
        },
      },
      orderBy: {
        sequence: 'asc',
      },
    });
  }

  async markStreamComplete(requestId: string, organizationId: string | null, secretToken?: string): Promise<void> {
    // Validate request belongs to org's tunnel
    const request = await this.prisma.tunnelRequest.findUnique({
      where: { id: requestId },
      include: { Tunnel: true },
    });

    if (!request || !this.validateTunnelOwnership(request.Tunnel, organizationId, secretToken)) {
      throw new NotFoundException('Request not found');
    }

    await this.prisma.tunnelRequest.update({
      where: { id: requestId },
      data: { status: 'completed' },
    });
  }

  async waitForResponse(
    requestId: string,
    timeoutMs: number = 30000,
  ): Promise<{
    statusCode: number;
    headers: Record<string, any>;
    body: any;
  }> {
    const startTime = Date.now();
    const pollInterval = 300; // Check every 300ms

    while (Date.now() - startTime < timeoutMs) {
      const request = await this.prisma.tunnelRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        throw new NotFoundException('Request not found');
      }

      if (request.status === 'completed') {
        return {
          statusCode: request.responseStatus || 200,
          headers: (request.responseHeaders as Record<string, any>) || {},
          body: request.responseBody,
        };
      }

      if (request.status === 'failed') {
        throw new Error('Request failed');
      }

      // Wait before next check
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    // Timeout - mark as failed
    await this.prisma.tunnelRequest.update({
      where: { id: requestId },
      data: { status: 'failed' },
    });

    throw new Error('Tunnel timeout');
  }

  async getTunnel(tunnelId: string) {
    const tunnel = await this.prisma.tunnel.findUnique({
      where: { id: tunnelId },
    });

    if (!tunnel) {
      throw new NotFoundException('Tunnel not found');
    }

    return tunnel;
  }

  async getRequest(requestId: string) {
    const request = await this.prisma.tunnelRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  async listActiveTunnels(organizationId: string): Promise<TunnelListItemDto[]> {
    const tunnels = await this.prisma.tunnel.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return tunnels.map((tunnel) => ({
      id: tunnel.id,
      targetUrl: tunnel.targetUrl,
      createdAt: tunnel.createdAt.toISOString(),
      lastSeenAt: tunnel.lastSeenAt.toISOString(),
      isActive: tunnel.isActive,
    }));
  }

  async deactivateTunnel(tunnelId: string, organizationId: string | null, secretToken?: string): Promise<void> {
    // Validate tunnel belongs to org
    const tunnel = await this.prisma.tunnel.findUnique({
      where: { id: tunnelId },
    });

    if (!tunnel || !this.validateTunnelOwnership(tunnel, organizationId, secretToken)) {
      throw new NotFoundException('Tunnel not found');
    }

    await this.prisma.tunnel.update({
      where: { id: tunnelId },
      data: { isActive: false },
    });

  }

  async getTunnelAnalytics(tunnelId: string, organizationId: string | null, secretToken?: string) {
    // Validate tunnel belongs to org
    const tunnel = await this.prisma.tunnel.findUnique({
      where: { id: tunnelId },
    });

    if (!tunnel || !this.validateTunnelOwnership(tunnel, organizationId, secretToken)) {
      throw new NotFoundException('Tunnel not found');
    }

    // Get aggregate stats
    const stats = await this.prisma.tunnelRequest.aggregate({
      where: {
        tunnelId,
        status: 'completed',
      },
      _count: {
        id: true,
      },
      _sum: {
        requestSize: true,
        responseSize: true,
        durationMs: true,
      },
      _avg: {
        durationMs: true,
      },
    });

    // Get status breakdown
    const statusBreakdown = await this.prisma.tunnelRequest.groupBy({
      by: ['status'],
      where: { tunnelId },
      _count: true,
    });

    // Get method breakdown
    const methodBreakdown = await this.prisma.tunnelRequest.groupBy({
      by: ['method'],
      where: { tunnelId },
      _count: true,
    });

    // Calculate total bandwidth (request + response)
    const totalBandwidth = 
      (stats._sum.requestSize || 0) + (stats._sum.responseSize || 0);

    return {
      tunnel: {
        id: tunnel.id,
        targetUrl: tunnel.targetUrl,
        createdAt: tunnel.createdAt.toISOString(),
        isActive: tunnel.isActive,
      },
      stats: {
        totalRequests: stats._count.id,
        totalBandwidthBytes: totalBandwidth,
        totalRequestBytes: stats._sum.requestSize || 0,
        totalResponseBytes: stats._sum.responseSize || 0,
        averageDurationMs: Math.round(stats._avg.durationMs || 0),
        totalDurationMs: stats._sum.durationMs || 0,
      },
      statusBreakdown: statusBreakdown.map(item => ({
        status: item.status,
        count: item._count,
      })),
      methodBreakdown: methodBreakdown.map(item => ({
        method: item.method,
        count: item._count,
      })),
    };
  }

  async getTunnelRequestLogs(
    tunnelId: string,
    organizationId: string | null,
    options: {
      limit?: number;
      offset?: number;
      status?: string;
    } = {},
    secretToken?: string,
  ) {
    // Validate tunnel belongs to org
    const tunnel = await this.prisma.tunnel.findUnique({
      where: { id: tunnelId },
    });

    if (!tunnel || !this.validateTunnelOwnership(tunnel, organizationId, secretToken)) {
      throw new NotFoundException('Tunnel not found');
    }

    const { limit = 50, offset = 0, status } = options;

    const where: any = { tunnelId };
    if (status) {
      where.status = status;
    }

    const [requests, total] = await Promise.all([
      this.prisma.tunnelRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          createdAt: true,
          completedAt: true,
          method: true,
          path: true,
          status: true,
          isStreaming: true,
          responseStatus: true,
          durationMs: true,
          requestSize: true,
          responseSize: true,
          headers: true,
          body: true,
          responseHeaders: true,
          responseBody: true,
        },
      }),
      this.prisma.tunnelRequest.count({ where }),
    ]);

    return {
      requests: requests.map(req => ({
        ...req,
        createdAt: req.createdAt.toISOString(),
        completedAt: req.completedAt?.toISOString(),
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }
}

