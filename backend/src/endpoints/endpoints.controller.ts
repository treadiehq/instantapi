import {
  Controller,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EndpointsService } from './endpoints.service';
import { ExecutionService } from './execution.service';
import { StatsService } from './stats.service';
import { CreateEndpointDto, CreateFileEndpointDto } from './dto/create-endpoint.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';

@Controller()
export class EndpointsController {
  constructor(
    private readonly endpointsService: EndpointsService,
    private readonly executionService: ExecutionService,
    private readonly statsService: StatsService,
  ) {}

  /**
   * Health check endpoint
   */
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'instant-api-backend',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create a new API endpoint from snippet
   * POST /api/endpoints
   * Body: { language: "javascript" | "python", code: string, name?: string, description?: string, ttlHours?: number, kind?: "snippet" | "webhook" }
   * Auth is optional - non-authenticated users can create with 1h TTL restriction
   */
  @Post('api/endpoints')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createEndpoint(
    @Body() createEndpointDto: CreateEndpointDto,
    @Req() req: any,
  ) {
    // Basic validation
    if (!createEndpointDto.code || !createEndpointDto.language) {
      return {
        error: 'Missing required fields: code and language',
      };
    }

    if (!['javascript', 'python'].includes(createEndpointDto.language)) {
      return {
        error: 'Invalid language. Must be "javascript" or "python"',
      };
    }

    const organizationId = req.user?.organizationId || null;


    return this.endpointsService.createEndpoint(
      createEndpointDto,
      organizationId,
    );
  }

  /**
   * Create a new API endpoint from file upload
   * POST /api/endpoints/file
   * Form data: file (required), language, name, description, ttlHours, kind
   */
  @Post('api/endpoints/file')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async createFileEndpoint(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() req: any,
  ) {
    // Validate file
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Validate file size (3MB limit)
    const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 3MB limit');
    }

    // Validate file extension
    const allowedExtensions = ['.js', '.ts', '.py'];
    const extension = file.originalname.substring(file.originalname.lastIndexOf('.'));
    if (!allowedExtensions.includes(extension)) {
      throw new BadRequestException('File must be .js, .ts, or .py');
    }

    // Determine language from extension or body
    let language = body.language;
    if (!language) {
      if (extension === '.py') {
        language = 'python';
      } else if (extension === '.js' || extension === '.ts') {
        language = 'javascript';
      }
    }

    // Validate language
    if (!['javascript', 'python'].includes(language)) {
      throw new BadRequestException('Invalid language. Must be "javascript" or "python"');
    }

    // Read file contents
    const code = file.buffer.toString('utf-8');

    // Create DTO
    const dto: CreateFileEndpointDto = {
      language: language as 'javascript' | 'python',
      name: body.name,
      description: body.description,
      ttlMinutes: body.ttlMinutes ? parseInt(body.ttlMinutes, 10) : undefined,
      ttlHours: body.ttlHours ? parseInt(body.ttlHours, 10) : undefined, // Legacy support
      kind: body.kind || 'file',
    };

    return this.endpointsService.createFileEndpoint(code, dto, req.user.organizationId);
  }

  /**
   * Execute an endpoint
   * POST /run/:id
   * Body: any JSON (will be passed as input to the handler function)
   */
  @Post('run/:id')
  @HttpCode(HttpStatus.OK)
  async executeEndpoint(
    @Param('id') id: string,
    @Body() input: any,
    @Req() req: any,
  ) {
    try {
      // Get endpoint from database
      const endpoint = await this.endpointsService.getEndpoint(id);

      // Extract relevant headers for webhook mode
      const headers = req.headers || {};
      const requestHeaders = Object.keys(headers).reduce((acc, key) => {
        if (key.toLowerCase().startsWith('x-') || ['content-type', 'user-agent'].includes(key.toLowerCase())) {
          acc[key] = headers[key];
        }
        return acc;
      }, {} as Record<string, string>);

      // Extract metadata for logging
      const metadata = {
        ipAddress: req.ip || req.connection?.remoteAddress || headers['x-forwarded-for'],
        userAgent: headers['user-agent'],
      };

      // Execute via Cloudflare Sandbox
      const result = await this.executionService.execute(
        endpoint,
        input,
        requestHeaders,
        metadata,
      );

      // Add rate limit headers to response (handled by NestJS response)
      if (result.rateLimitInfo) {
        // These will be returned in the JSON response
        // For proper HTTP headers, we'd need to inject @Res() but that complicates things
      }

      return result;
    } catch (error) {
      return {
        error: error.message || 'Endpoint not found or expired',
      };
    }
  }

  /**
   * List all endpoints for the authenticated user's organization
   * GET /api/endpoints
   */
  @Get('api/endpoints')
  @UseGuards(AuthGuard)
  async listEndpoints(@Req() req: any) {
    return this.endpointsService.listEndpoints(req.user.organizationId);
  }

  /**
   * Delete an endpoint
   * DELETE /api/endpoints/:id
   */
  @Delete('api/endpoints/:id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteEndpoint(@Param('id') id: string, @Req() req: any) {
    await this.endpointsService.deleteEndpoint(id, req.user.organizationId);
    return {
      success: true,
      message: 'Endpoint deleted successfully',
    };
  }

  /**
   * Get stats for all endpoints in the organization
   * GET /api/stats
   */
  @Get('api/stats')
  @UseGuards(AuthGuard)
  async getOrganizationStats(@Req() req: any) {
    return this.statsService.getOrganizationStats(req.user.organizationId);
  }

  /**
   * Get stats for a specific endpoint
   * GET /api/endpoints/:id/stats
   */
  @Get('api/endpoints/:id/stats')
  @UseGuards(AuthGuard)
  async getEndpointStats(@Param('id') id: string, @Req() req: any) {
    // Verify endpoint belongs to user's organization
    const endpoint = await this.endpointsService.getEndpoint(id);
    if (endpoint.organizationId !== req.user.organizationId) {
      return { error: 'Endpoint not found' };
    }
    return this.statsService.getEndpointStats(id);
  }

  /**
   * Get hourly call history for an endpoint
   * GET /api/endpoints/:id/history
   */
  @Get('api/endpoints/:id/history')
  @UseGuards(AuthGuard)
  async getEndpointHistory(@Param('id') id: string, @Req() req: any) {
    // Verify endpoint belongs to user's organization
    const endpoint = await this.endpointsService.getEndpoint(id);
    if (endpoint.organizationId !== req.user.organizationId) {
      return { error: 'Endpoint not found' };
    }
    return this.statsService.getEndpointCallHistory(id);
  }

  /**
   * Get recent logs for an endpoint
   * GET /api/endpoints/:id/logs
   */
  @Get('api/endpoints/:id/logs')
  @UseGuards(AuthGuard)
  async getEndpointLogs(@Param('id') id: string, @Req() req: any) {
    // Verify endpoint belongs to user's organization
    const endpoint = await this.endpointsService.getEndpoint(id);
    if (endpoint.organizationId !== req.user.organizationId) {
      return { error: 'Endpoint not found' };
    }
    return this.statsService.getRecentLogs(id);
  }

  /**
   * Cleanup expired endpoints (can be called manually or via cron)
   * POST /api/cleanup
   */
  @Post('api/cleanup')
  async cleanup() {
    const count = await this.endpointsService.cleanupExpiredEndpoints();
    return {
      message: `Cleaned up ${count} expired endpoints`,
      count,
    };
  }
}

