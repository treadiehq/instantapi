import { Module } from '@nestjs/common';
import { TunnelsController } from './tunnels.controller';
import { TunnelsService } from './tunnels.service';
import { TunnelCleanupService } from './tunnel-cleanup.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TunnelsController],
  providers: [TunnelsService, TunnelCleanupService], // PrismaService provided by global DatabaseModule
  exports: [TunnelsService],
})
export class TunnelsModule {}

