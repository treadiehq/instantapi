import {
  Controller,
  Get,
  Delete,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminEndpointsQueryDto } from './dto/admin.dto';

@Controller('api/admin')
@UseGuards(AuthGuard, AdminGuard) // Require authentication AND admin access
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get admin dashboard statistics
   * GET /api/admin/stats
   */
  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  /**
   * Get all endpoints with filtering and pagination
   * GET /api/admin/endpoints
   * Query params: page, limit, authType, language, search, sortBy, sortOrder
   */
  @Get('endpoints')
  async getEndpoints(@Query() query: AdminEndpointsQueryDto) {
    return this.adminService.getEndpoints(query);
  }

  /**
   * Delete a single endpoint
   * DELETE /api/admin/endpoints/:id
   */
  @Delete('endpoints/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEndpoint(@Param('id') id: string, @Req() req: any) {
    await this.adminService.deleteEndpoint(id, req.user.email);
    return { success: true };
  }

  /**
   * Bulk delete endpoints
   * POST /api/admin/endpoints/bulk-delete
   * Body: { endpointIds: string[] }
   */
  @Post('endpoints/bulk-delete')
  async bulkDeleteEndpoints(
    @Body() body: { endpointIds: string[] },
    @Req() req: any,
  ) {
    const deletedCount = await this.adminService.bulkDeleteEndpoints(
      body.endpointIds,
      req.user.email,
    );
    return { success: true, deletedCount };
  }
}

