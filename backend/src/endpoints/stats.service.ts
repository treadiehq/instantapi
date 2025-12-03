import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface EndpointStats {
  endpointId: string;
  totalCalls: number;
  successCount: number;
  errorCount: number;
  errorRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  callsLast24h: number;
  callsLast7d: number;
  lastCalledAt: Date | null;
}

export interface EndpointCallHistory {
  timestamp: Date;
  calls: number;
  errors: number;
  avgLatency: number;
}

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get stats for a single endpoint
   */
  async getEndpointStats(endpointId: string): Promise<EndpointStats> {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all-time stats
    const allTimeStats = await this.prisma.executionLog.aggregate({
      where: { endpointId },
      _count: { id: true },
      _avg: { durationMs: true },
    });

    // Get success/error counts
    const successCount = await this.prisma.executionLog.count({
      where: { endpointId, success: true },
    });

    const errorCount = await this.prisma.executionLog.count({
      where: { endpointId, success: false },
    });

    // Get calls in last 24h
    const callsLast24h = await this.prisma.executionLog.count({
      where: {
        endpointId,
        createdAt: { gte: last24h },
      },
    });

    // Get calls in last 7 days
    const callsLast7d = await this.prisma.executionLog.count({
      where: {
        endpointId,
        createdAt: { gte: last7d },
      },
    });

    // Get last called timestamp
    const lastLog = await this.prisma.executionLog.findFirst({
      where: { endpointId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    // Calculate p95 latency (approximate - get all latencies and calculate)
    const latencies = await this.prisma.executionLog.findMany({
      where: { endpointId },
      select: { durationMs: true },
      orderBy: { durationMs: 'asc' },
    });

    let p95LatencyMs = 0;
    if (latencies.length > 0) {
      const p95Index = Math.floor(latencies.length * 0.95);
      p95LatencyMs = latencies[p95Index]?.durationMs || latencies[latencies.length - 1].durationMs;
    }

    const totalCalls = allTimeStats._count.id || 0;
    const errorRate = totalCalls > 0 ? (errorCount / totalCalls) * 100 : 0;

    return {
      endpointId,
      totalCalls,
      successCount,
      errorCount,
      errorRate: Math.round(errorRate * 100) / 100,
      avgLatencyMs: Math.round(allTimeStats._avg.durationMs || 0),
      p95LatencyMs,
      callsLast24h,
      callsLast7d,
      lastCalledAt: lastLog?.createdAt || null,
    };
  }

  /**
   * Get stats for all endpoints in an organization
   */
  async getOrganizationStats(organizationId: string): Promise<{
    endpoints: EndpointStats[];
    totals: {
      totalCalls: number;
      totalErrors: number;
      avgLatencyMs: number;
      activeEndpoints: number;
    };
  }> {
    // Get all endpoints for the org
    const endpoints = await this.prisma.endpoint.findMany({
      where: { organizationId },
      select: { id: true },
    });

    const endpointIds = endpoints.map(e => e.id);

    // Get stats for each endpoint
    const endpointStats = await Promise.all(
      endpointIds.map(id => this.getEndpointStats(id))
    );

    // Calculate totals
    const totalCalls = endpointStats.reduce((sum, s) => sum + s.totalCalls, 0);
    const totalErrors = endpointStats.reduce((sum, s) => sum + s.errorCount, 0);
    const totalLatency = endpointStats.reduce((sum, s) => sum + (s.avgLatencyMs * s.totalCalls), 0);
    const avgLatencyMs = totalCalls > 0 ? Math.round(totalLatency / totalCalls) : 0;
    const activeEndpoints = endpointStats.filter(s => s.callsLast24h > 0).length;

    return {
      endpoints: endpointStats,
      totals: {
        totalCalls,
        totalErrors,
        avgLatencyMs,
        activeEndpoints,
      },
    };
  }

  /**
   * Get hourly call history for an endpoint (last 24 hours)
   */
  async getEndpointCallHistory(endpointId: string, hours: number = 24): Promise<EndpointCallHistory[]> {
    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);

    // Get all logs in the time range
    const logs = await this.prisma.executionLog.findMany({
      where: {
        endpointId,
        createdAt: { gte: startTime },
      },
      select: {
        createdAt: true,
        success: true,
        durationMs: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by hour
    const hourlyData: Map<string, { calls: number; errors: number; totalLatency: number }> = new Map();

    for (let i = 0; i < hours; i++) {
      const hourStart = new Date(now.getTime() - (hours - i) * 60 * 60 * 1000);
      const hourKey = hourStart.toISOString().slice(0, 13); // YYYY-MM-DDTHH
      hourlyData.set(hourKey, { calls: 0, errors: 0, totalLatency: 0 });
    }

    for (const log of logs) {
      const hourKey = log.createdAt.toISOString().slice(0, 13);
      const existing = hourlyData.get(hourKey);
      if (existing) {
        existing.calls++;
        if (!log.success) existing.errors++;
        existing.totalLatency += log.durationMs;
      }
    }

    return Array.from(hourlyData.entries()).map(([hourKey, data]) => ({
      timestamp: new Date(hourKey + ':00:00.000Z'),
      calls: data.calls,
      errors: data.errors,
      avgLatency: data.calls > 0 ? Math.round(data.totalLatency / data.calls) : 0,
    }));
  }

  /**
   * Get recent request logs for an endpoint (summary view)
   */
  async getRecentLogs(endpointId: string, limit: number = 50): Promise<any[]> {
    return this.prisma.executionLog.findMany({
      where: { endpointId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        durationMs: true,
        success: true,
        error: true,
        statusCode: true,
        ipAddress: true,
        userAgent: true,
      },
    });
  }

  /**
   * Get detailed log entry with full request/response and console output
   * For the observability/trace viewer
   */
  async getLogDetail(logId: string): Promise<any> {
    return this.prisma.executionLog.findUnique({
      where: { id: logId },
      select: {
        id: true,
        createdAt: true,
        durationMs: true,
        success: true,
        error: true,
        statusCode: true,
        ipAddress: true,
        userAgent: true,
        requestBody: true,
        responseBody: true,
        consoleLogs: true,
        Endpoint: {
          select: {
            id: true,
            name: true,
            language: true,
          },
        },
      },
    });
  }

  /**
   * Get recent logs with full details (for log viewer)
   */
  async getDetailedLogs(endpointId: string, limit: number = 20): Promise<any[]> {
    return this.prisma.executionLog.findMany({
      where: { endpointId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        durationMs: true,
        success: true,
        error: true,
        statusCode: true,
        ipAddress: true,
        userAgent: true,
        requestBody: true,
        responseBody: true,
        consoleLogs: true,
      },
    });
  }
}

