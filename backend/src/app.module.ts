import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EndpointsModule } from './endpoints/endpoints.module';
import { TunnelsModule } from './tunnels/tunnels.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    EndpointsModule,
    TunnelsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}

