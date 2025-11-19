import { Module } from '@nestjs/common';
import { TunnelsController } from './tunnels.controller';
import { TunnelsService } from './tunnels.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TunnelsController],
  providers: [TunnelsService],
  exports: [TunnelsService],
})
export class TunnelsModule {}

