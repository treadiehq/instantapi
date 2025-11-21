import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEndpointDto, CreateFileEndpointDto, CreateEndpointResponseDto } from './dto/create-endpoint.dto';

@Injectable()
export class EndpointsService {
  constructor(private prisma: PrismaService) {}

  async createEndpoint(dto: CreateEndpointDto, organizationId: string | null): Promise<CreateEndpointResponseDto> {
    const now = new Date();
    const ttlHours = dto.ttlHours ?? 24;
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);
    const kind = dto.kind ?? 'snippet';

    const endpoint = await this.prisma.endpoint.create({
      data: {
        organizationId,
        language: dto.language,
        code: dto.code,
        kind,
        name: dto.name,
        description: dto.description,
        ttlHours,
        expiresAt,
      },
    });


    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

    return {
      id: endpoint.id,
      language: endpoint.language,
      url: `${backendUrl}/run/${endpoint.id}`,
      expiresAt: expiresAt.toISOString(),
      ttlHours,
      kind,
      name: endpoint.name,
      description: endpoint.description,
    };
  }

  async createFileEndpoint(code: string, dto: CreateFileEndpointDto, organizationId: string): Promise<CreateEndpointResponseDto> {
    const now = new Date();
    const ttlHours = dto.ttlHours ?? 24;
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);
    const kind = dto.kind ?? 'file';

    const endpoint = await this.prisma.endpoint.create({
      data: {
        organizationId,
        language: dto.language,
        code,
        kind,
        name: dto.name,
        description: dto.description,
        ttlHours,
        expiresAt,
      },
    });


    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

    return {
      id: endpoint.id,
      language: endpoint.language,
      url: `${backendUrl}/run/${endpoint.id}`,
      expiresAt: expiresAt.toISOString(),
      ttlHours,
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
        ttlHours: true,
        createdAt: true,
        expiresAt: true,
      },
    });


    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

    return endpoints.map(endpoint => ({
      ...endpoint,
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

