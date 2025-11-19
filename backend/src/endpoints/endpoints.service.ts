import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEndpointDto, CreateFileEndpointDto, CreateEndpointResponseDto } from './dto/create-endpoint.dto';

@Injectable()
export class EndpointsService {
  constructor(private prisma: PrismaService) {}

  async createEndpoint(dto: CreateEndpointDto): Promise<CreateEndpointResponseDto> {
    const now = new Date();
    const ttlHours = dto.ttlHours ?? 24;
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);
    const kind = dto.kind ?? 'snippet';

    const endpoint = await this.prisma.endpoint.create({
      data: {
        language: dto.language,
        code: dto.code,
        kind,
        name: dto.name,
        description: dto.description,
        ttlHours,
        expiresAt,
      },
    });

    console.log(`✅ Created endpoint ${endpoint.id} (${endpoint.language}, ${kind}, TTL: ${ttlHours}h)`);

    return {
      id: endpoint.id,
      language: endpoint.language,
      url: `http://localhost:3001/run/${endpoint.id}`,
      expiresAt: expiresAt.toISOString(),
      ttlHours,
      kind,
      name: endpoint.name,
      description: endpoint.description,
    };
  }

  async createFileEndpoint(code: string, dto: CreateFileEndpointDto): Promise<CreateEndpointResponseDto> {
    const now = new Date();
    const ttlHours = dto.ttlHours ?? 24;
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);
    const kind = dto.kind ?? 'file';

    const endpoint = await this.prisma.endpoint.create({
      data: {
        language: dto.language,
        code,
        kind,
        name: dto.name,
        description: dto.description,
        ttlHours,
        expiresAt,
      },
    });

    console.log(`✅ Created file endpoint ${endpoint.id} (${endpoint.language}, ${kind}, TTL: ${ttlHours}h)`);

    return {
      id: endpoint.id,
      language: endpoint.language,
      url: `http://localhost:3001/run/${endpoint.id}`,
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

  // Cleanup expired endpoints (can be called periodically)
  async cleanupExpiredEndpoints() {
    const result = await this.prisma.endpoint.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`🧹 Cleaned up ${result.count} expired endpoints`);
    return result.count;
  }
}

