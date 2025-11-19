import { Module } from '@nestjs/common';
import { EndpointsController } from './endpoints.controller';
import { EndpointsService } from './endpoints.service';
import { ExecutionService } from './execution.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [EndpointsController],
  providers: [EndpointsService, ExecutionService, PrismaService],
})
export class EndpointsModule {}

