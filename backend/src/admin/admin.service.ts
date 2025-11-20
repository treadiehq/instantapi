import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  AdminStatsDto,
  AdminEndpointDto,
  AdminEndpointsQueryDto,
  AdminEndpointsResponseDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats(): Promise<AdminStatsDto> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Run all queries in parallel for performance
    const [
      totalEndpoints,
      authenticatedEndpoints,
      unauthenticatedEndpoints,
      totalUsers,
      endpointsCreatedToday,
      endpointsCreatedThisWeek,
      javascriptCount,
      pythonCount,
      expiringSoon,
    ] = await Promise.all([
      this.prisma.endpoint.count(),
      this.prisma.endpoint.count({ where: { organizationId: { not: null } } }),
      this.prisma.endpoint.count({ where: { organizationId: null } }),
      this.prisma.user.count(),
      this.prisma.endpoint.count({ where: { createdAt: { gte: today } } }),
      this.prisma.endpoint.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.endpoint.count({ where: { language: 'javascript' } }),
      this.prisma.endpoint.count({ where: { language: 'python' } }),
      this.prisma.endpoint.count({
        where: {
          expiresAt: { gte: now, lte: tomorrow },
        },
      }),
    ]);

    return {
      totalEndpoints,
      authenticatedEndpoints,
      unauthenticatedEndpoints,
      totalUsers,
      endpointsCreatedToday,
      endpointsCreatedThisWeek,
      javascriptCount,
      pythonCount,
      expiringSoon,
    };
  }

  async getEndpoints(query: AdminEndpointsQueryDto): Promise<AdminEndpointsResponseDto> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 50, 100); // Max 100 per page
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Filter by auth type
    if (query.authType === 'authenticated') {
      where.organizationId = { not: null };
    } else if (query.authType === 'unauthenticated') {
      where.organizationId = null;
    }

    // Filter by language
    if (query.language && query.language !== 'all') {
      where.language = query.language;
    }

    // Search in code, name, or user email
    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Sorting
    const orderBy: any = {};
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    orderBy[sortBy] = sortOrder;

    // Execute queries in parallel
    const [endpoints, total] = await Promise.all([
      this.prisma.endpoint.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          organization: {
            include: {
              users: {
                select: {
                  email: true,
                },
                take: 1,
              },
            },
          },
        },
      }),
      this.prisma.endpoint.count({ where }),
    ]);

    // Map to DTO
    const endpointDtos: AdminEndpointDto[] = endpoints.map((endpoint) => ({
      id: endpoint.id,
      language: endpoint.language,
      kind: endpoint.kind,
      code: endpoint.code,
      name: endpoint.name,
      description: endpoint.description,
      organizationId: endpoint.organizationId,
      userEmail: endpoint.organization?.users?.[0]?.email || null,
      createdAt: endpoint.createdAt,
      expiresAt: endpoint.expiresAt,
      ttlHours: endpoint.ttlHours,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      endpoints: endpointDtos,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async deleteEndpoint(endpointId: string, adminEmail: string): Promise<void> {
    const endpoint = await this.prisma.endpoint.findUnique({
      where: { id: endpointId },
    });

    if (!endpoint) {
      throw new Error('Endpoint not found');
    }

    // Delete the endpoint
    await this.prisma.endpoint.delete({
      where: { id: endpointId },
    });

    console.log(`🗑️  Admin ${adminEmail} deleted endpoint ${endpointId}`);
  }

  async bulkDeleteEndpoints(endpointIds: string[], adminEmail: string): Promise<number> {
    const result = await this.prisma.endpoint.deleteMany({
      where: {
        id: { in: endpointIds },
      },
    });

    console.log(`🗑️  Admin ${adminEmail} bulk deleted ${result.count} endpoints`);

    return result.count;
  }
}

