import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EndpointsModule } from './endpoints/endpoints.module';
import { TunnelsModule } from './tunnels/tunnels.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Scheduled tasks for cleanup jobs
    ScheduleModule.forRoot(),
    // Rate limiting to prevent DDoS attacks
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,    // 1 second window
        limit: 10,    // Max 10 requests per second
      },
      {
        name: 'medium',
        ttl: 60000,   // 1 minute window
        limit: 100,   // Max 100 requests per minute
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour window
        limit: 1000,  // Max 1000 requests per hour
      },
    ]),
    AuthModule,
    EndpointsModule,
    TunnelsModule,
    AdminModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

