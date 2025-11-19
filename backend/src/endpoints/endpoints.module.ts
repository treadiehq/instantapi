import { Module } from '@nestjs/common';
import { EndpointsController } from './endpoints.controller';
import { EndpointsService } from './endpoints.service';
import { ExecutionService } from './execution.service';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EndpointsController],
  providers: [EndpointsService, ExecutionService, PrismaService],
})
export class EndpointsModule {}

