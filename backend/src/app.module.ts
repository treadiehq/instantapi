import { Module } from '@nestjs/common';
import { EndpointsModule } from './endpoints/endpoints.module';
import { TunnelsModule } from './tunnels/tunnels.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [EndpointsModule, TunnelsModule],
  providers: [PrismaService],
})
export class AppModule {}

