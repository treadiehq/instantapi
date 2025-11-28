import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TunnelCleanupService {
  private readonly logger = new Logger(TunnelCleanupService.name);

  constructor(private prisma: PrismaService) {}

  // Run every hour
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupOldRequests() {
    this.logger.log('Running cleanup job for old tunnel requests...');

    try {
      // Delete tunnel requests older than 24 hours
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const deleted = await this.prisma.tunnelRequest.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      this.logger.log(`Deleted ${deleted.count} old tunnel requests`);
    } catch (error) {
      this.logger.error('Failed to cleanup old tunnel requests', error);
    }
  }

  // Run every day at 2 AM
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async deactivateAbandonedTunnels() {
    this.logger.log('Deactivating abandoned tunnels...');

    try {
      // Deactivate tunnels that haven't been seen in over 1 hour
      const cutoffDate = new Date(Date.now() - 60 * 60 * 1000);

      const updated = await this.prisma.tunnel.updateMany({
        where: {
          lastSeenAt: {
            lt: cutoffDate,
          },
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      this.logger.log(`Deactivated ${updated.count} abandoned tunnels`);
    } catch (error) {
      this.logger.error('Failed to deactivate abandoned tunnels', error);
    }
  }

  // Run every day at 3 AM
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupStreamEvents() {
    this.logger.log('Cleaning up old stream events...');

    try {
      // Delete stream events for completed requests older than 24 hours
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // First, get the IDs of old completed requests
      const oldRequests = await this.prisma.tunnelRequest.findMany({
        where: {
          status: 'completed',
          createdAt: {
            lt: cutoffDate,
          },
        },
        select: {
          id: true,
        },
      });

      if (oldRequests.length > 0) {
        const requestIds = oldRequests.map(r => r.id);
        
        const deleted = await this.prisma.tunnelStreamEvent.deleteMany({
          where: {
            requestId: {
              in: requestIds,
            },
          },
        });

        this.logger.log(`Deleted ${deleted.count} old stream events`);
      }
    } catch (error) {
      this.logger.error('Failed to cleanup old stream events', error);
    }
  }
}

