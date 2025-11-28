import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';

@Injectable()
export class DatabaseMaintenanceService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseMaintenanceService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Run initial optimization on startup
    await this.analyzeDatabase();
  }

  // Run ANALYZE weekly to update query planner statistics
  @Cron(CronExpression.EVERY_WEEK)
  async analyzeDatabase() {
    this.logger.log('Running ANALYZE to update query planner statistics...');

    try {
      // ANALYZE updates statistics for the query planner
      // This helps PostgreSQL choose optimal query execution plans
      await this.prisma.$executeRawUnsafe('ANALYZE;');
      
      this.logger.log('Database analysis completed successfully');
    } catch (error) {
      this.logger.error('Failed to analyze database', error);
    }
  }

  // Run VACUUM on tables with high delete activity (weekly)
  @Cron(CronExpression.EVERY_WEEK)
  async vacuumTables() {
    this.logger.log('Running VACUUM on high-activity tables...');

    try {
      // VACUUM reclaims storage from deleted rows
      // Critical for tables with lots of DELETEs (like our cleanup jobs)
      const tables = [
        '"TunnelRequest"',
        '"TunnelStreamEvent"',
        '"ExecutionLog"',
        '"MagicLink"'
      ];

      for (const table of tables) {
        await this.prisma.$executeRawUnsafe(`VACUUM ANALYZE ${table};`);
        this.logger.log(`Vacuumed table: ${table}`);
      }

      this.logger.log('Vacuum completed successfully');
    } catch (error) {
      this.logger.error('Failed to vacuum tables', error);
    }
  }

  // Get table sizes for monitoring
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async logTableSizes() {
    this.logger.log('Checking database table sizes...');

    try {
      const result = await this.prisma.$queryRaw<Array<{
        table_name: string;
        total_size: string;
        table_size: string;
        indexes_size: string;
        row_count: bigint;
      }>>`
        SELECT 
          schemaname || '.' || tablename AS table_name,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
          pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size,
          n_live_tup AS row_count
        FROM pg_tables
        LEFT JOIN pg_stat_user_tables ON pg_tables.tablename = pg_stat_user_tables.relname
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
      `;

      this.logger.log('=== Database Table Sizes ===');
      result.forEach(row => {
        this.logger.log(
          `${row.table_name}: ${row.total_size} (${row.row_count} rows) - Table: ${row.table_size}, Indexes: ${row.indexes_size}`
        );
      });
    } catch (error) {
      this.logger.error('Failed to get table sizes', error);
    }
  }

  // Check index usage
  @Cron(CronExpression.EVERY_WEEK)
  async checkIndexUsage() {
    this.logger.log('Checking index usage statistics...');

    try {
      const result = await this.prisma.$queryRaw<Array<{
        table_name: string;
        index_name: string;
        index_scans: bigint;
        rows_read: bigint;
        index_size: string;
      }>>`
        SELECT 
          schemaname || '.' || tablename AS table_name,
          indexname AS index_name,
          idx_scan AS index_scans,
          idx_tup_read AS rows_read,
          pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC;
      `;

      this.logger.log('=== Index Usage Statistics ===');
      result.forEach(row => {
        if (row.index_scans === BigInt(0)) {
          this.logger.warn(
            `⚠️  Unused index: ${row.index_name} on ${row.table_name} (${row.index_size})`
          );
        } else {
          this.logger.log(
            `${row.index_name}: ${row.index_scans} scans, ${row.rows_read} rows (${row.index_size})`
          );
        }
      });
    } catch (error) {
      this.logger.error('Failed to check index usage', error);
    }
  }

  // Get slow queries (if pg_stat_statements extension is enabled)
  async getSlowQueries() {
    this.logger.log('Checking for slow queries...');

    try {
      // This requires pg_stat_statements extension
      // Enable with: CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
      const result = await this.prisma.$queryRaw<Array<{
        query: string;
        calls: bigint;
        mean_time: number;
        total_time: number;
      }>>`
        SELECT 
          LEFT(query, 100) AS query,
          calls,
          mean_exec_time AS mean_time,
          total_exec_time AS total_time
        FROM pg_stat_statements
        WHERE mean_exec_time > 100  -- queries taking > 100ms average
        ORDER BY mean_exec_time DESC
        LIMIT 10;
      `;

      if (result.length > 0) {
        this.logger.log('=== Slow Queries (>100ms avg) ===');
        result.forEach(row => {
          this.logger.warn(
            `${row.mean_time.toFixed(2)}ms avg (${row.calls} calls): ${row.query}...`
          );
        });
      }
    } catch (error) {
      // pg_stat_statements might not be enabled, that's ok
      this.logger.debug('pg_stat_statements not available (this is optional)');
    }
  }
}

