import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  RegisterTunnelDto,
  RegisterTunnelResponseDto,
  PollTunnelResponseDto,
  RespondTunnelDto,
  TunnelListItemDto,
} from './dto/tunnel.dto';

@Injectable()
export class TunnelsService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterTunnelDto, organizationId: string | null): Promise<RegisterTunnelResponseDto> {
    const tunnel = await this.prisma.tunnel.create({
      data: {
        organizationId,
        targetUrl: dto.targetUrl,
        isActive: true,
      },
    });

    const publicUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/t/${tunnel.id}`;


    return {
      id: tunnel.id,
      publicUrl,
      targetUrl: tunnel.targetUrl,
      createdAt: tunnel.createdAt.toISOString(),
    };
  }

  async poll(
    tunnelId: string,
    maxWaitMs: number = 25000,
    organizationId: string | null,
  ): Promise<PollTunnelResponseDto> {
    // Validate tunnel exists, is active, and belongs to org
    const tunnel = await this.prisma.tunnel.findUnique({
      where: { id: tunnelId },
    });

    if (!tunnel || tunnel.organizationId !== organizationId) {
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

  async respond(tunnelId: string, dto: RespondTunnelDto, organizationId: string | null): Promise<void> {
    // Validate tunnel belongs to org
    const tunnel = await this.prisma.tunnel.findUnique({
      where: { id: tunnelId },
    });

    if (!tunnel || tunnel.organizationId !== organizationId) {
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

    await this.prisma.tunnelRequest.update({
      where: { id: dto.requestId },
      data: {
        status: 'completed',
        responseStatus: dto.statusCode,
        responseHeaders: dto.headers || {},
        responseBody: dto.body || null,
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
    // Detect SSE or WebSocket requests
    const acceptHeader = (headers['accept'] || '').toLowerCase();
    const upgradeHeader = (headers['upgrade'] || '').toLowerCase();
    const isStreaming =
      acceptHeader.includes('text/event-stream') ||
      upgradeHeader.includes('websocket');

    const request = await this.prisma.tunnelRequest.create({
      data: {
        tunnelId,
        method,
        path,
        headers,
        body,
        status: 'pending',
        isStreaming,
      },
    });

    return { id: request.id, isStreaming };
  }

  async addStreamChunk(
    requestId: string,
    sequence: number,
    chunk: string,
    organizationId: string | null,
  ): Promise<void> {
    // Validate request belongs to org's tunnel
    const request = await this.prisma.tunnelRequest.findUnique({
      where: { id: requestId },
      include: { Tunnel: true },
    });

    if (!request || request.Tunnel.organizationId !== organizationId) {
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

  async markStreamComplete(requestId: string, organizationId: string | null): Promise<void> {
    // Validate request belongs to org's tunnel
    const request = await this.prisma.tunnelRequest.findUnique({
      where: { id: requestId },
      include: { Tunnel: true },
    });

    if (!request || request.Tunnel.organizationId !== organizationId) {
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

  async deactivateTunnel(tunnelId: string, organizationId: string): Promise<void> {
    // Validate tunnel belongs to org
    const tunnel = await this.prisma.tunnel.findUnique({
      where: { id: tunnelId },
    });

    if (!tunnel || tunnel.organizationId !== organizationId) {
      throw new NotFoundException('Tunnel not found');
    }

    await this.prisma.tunnel.update({
      where: { id: tunnelId },
      data: { isActive: false },
    });

  }
}

