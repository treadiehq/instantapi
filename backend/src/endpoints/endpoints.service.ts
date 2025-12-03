import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEndpointDto, CreateFileEndpointDto, CreateEndpointResponseDto } from './dto/create-endpoint.dto';

@Injectable()
export class EndpointsService {
  constructor(private prisma: PrismaService) {}

  // Helper to get TTL in minutes (supports both ttlMinutes and legacy ttlHours)
  private getTtlMinutes(dto: { ttlMinutes?: number; ttlHours?: number }): number {
    if (dto.ttlMinutes !== undefined) {
      return dto.ttlMinutes;
    }
    if (dto.ttlHours !== undefined) {
      return dto.ttlHours * 60; // Convert hours to minutes
    }
    return 60; // Default: 1 hour
  }

  async createEndpoint(dto: CreateEndpointDto, organizationId: string | null): Promise<CreateEndpointResponseDto> {
    const now = new Date();
    const ttlMinutes = this.getTtlMinutes(dto);
    const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);
    const kind = dto.kind ?? 'snippet';
    const rateLimit = dto.rateLimit ?? 100;
    const rateLimitWindow = dto.rateLimitWindow ?? 60;

    const endpoint = await this.prisma.endpoint.create({
      data: {
        organizationId,
        language: dto.language,
        code: dto.code,
        kind,
        name: dto.name,
        description: dto.description,
        ttlMinutes,
        expiresAt,
        rateLimit,
        rateLimitWindow,
      },
    });


    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

    return {
      id: endpoint.id,
      language: endpoint.language,
      url: `${backendUrl}/run/${endpoint.id}`,
      expiresAt: expiresAt.toISOString(),
      ttlMinutes,
      ttlHours: Math.round(ttlMinutes / 60 * 100) / 100, // For backward compatibility
      kind,
      name: endpoint.name,
      description: endpoint.description,
      rateLimit: endpoint.rateLimit,
      rateLimitWindow: endpoint.rateLimitWindow,
    };
  }

  async createFileEndpoint(code: string, dto: CreateFileEndpointDto, organizationId: string): Promise<CreateEndpointResponseDto> {
    const now = new Date();
    const ttlMinutes = this.getTtlMinutes(dto);
    const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);
    const kind = dto.kind ?? 'file';

    const endpoint = await this.prisma.endpoint.create({
      data: {
        organizationId,
        language: dto.language,
        code,
        kind,
        name: dto.name,
        description: dto.description,
        ttlMinutes,
        expiresAt,
      },
    });


    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

    return {
      id: endpoint.id,
      language: endpoint.language,
      url: `${backendUrl}/run/${endpoint.id}`,
      expiresAt: expiresAt.toISOString(),
      ttlMinutes,
      ttlHours: Math.round(ttlMinutes / 60 * 100) / 100, // For backward compatibility
      kind,
      name: endpoint.name,
      description: endpoint.description,
    };
  }

  async getEndpoint(id: string) {
    const endpoint = await this.prisma.endpoint.findUnique({
      where: { id },
    });

    if (!endpoint) {
      throw new NotFoundException('Endpoint not found');
    }

    // Check if expired
    if (endpoint.expiresAt < new Date()) {
      // Optionally clean up expired endpoint
      await this.prisma.endpoint.delete({ where: { id } });
      throw new NotFoundException('Endpoint expired');
    }

    return endpoint;
  }

  // List all endpoints for an organization
  async listEndpoints(organizationId: string) {
    
    const endpoints = await this.prisma.endpoint.findMany({
      where: {
        organizationId,
        expiresAt: {
          gt: new Date(), // Only non-expired
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        language: true,
        kind: true,
        ttlMinutes: true,
        rateLimit: true,
        rateLimitWindow: true,
        createdAt: true,
        expiresAt: true,
      },
    });


    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

    return endpoints.map(endpoint => ({
      ...endpoint,
      ttlHours: Math.round(endpoint.ttlMinutes / 60 * 100) / 100, // For backward compatibility
      url: `${backendUrl}/run/${endpoint.id}`,
    }));
  }

  // Delete an endpoint
  async deleteEndpoint(id: string, organizationId: string): Promise<void> {
    // First, verify the endpoint exists and belongs to this organization
    const endpoint = await this.prisma.endpoint.findUnique({
      where: { id },
    });

    if (!endpoint) {
      throw new NotFoundException('Endpoint not found');
    }

    if (endpoint.organizationId !== organizationId) {
      throw new ForbiddenException('You do not have permission to delete this endpoint');
    }

    // Delete the endpoint
    await this.prisma.endpoint.delete({
      where: { id },
    });

  }

  // Cleanup expired endpoints (can be called periodically)
  async cleanupExpiredEndpoints() {
    const result = await this.prisma.endpoint.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }
}
