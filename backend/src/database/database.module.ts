import { Module, Global } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

/**
 * Global DatabaseModule that provides a singleton PrismaService instance
 * across the entire application.
 * 
 * Using @Global() ensures that PrismaService is available to all modules
 * without needing to import DatabaseModule everywhere, and ensures only
 * one database connection pool is created.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}

