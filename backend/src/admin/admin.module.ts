import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard], // PrismaService provided by global DatabaseModule
  exports: [AdminGuard],
})
export class AdminModule {}

