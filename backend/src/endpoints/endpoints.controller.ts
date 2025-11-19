import {
  Controller,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Get,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EndpointsService } from './endpoints.service';
import { ExecutionService } from './execution.service';
import { CreateEndpointDto, CreateFileEndpointDto } from './dto/create-endpoint.dto';

@Controller()
export class EndpointsController {
  constructor(
    private readonly endpointsService: EndpointsService,
    private readonly executionService: ExecutionService,
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
   */
  @Post('api/endpoints')
  @HttpCode(HttpStatus.CREATED)
  async createEndpoint(@Body() createEndpointDto: CreateEndpointDto) {
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

    return this.endpointsService.createEndpoint(createEndpointDto);
  }

  /**
   * Create a new API endpoint from file upload
   * POST /api/endpoints/file
   * Form data: file (required), language, name, description, ttlHours, kind
   */
  @Post('api/endpoints/file')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async createFileEndpoint(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    // Validate file
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Validate file size (64KB limit)
    const MAX_FILE_SIZE = 64 * 1024; // 64KB
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 64KB limit');
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
      ttlHours: body.ttlHours ? parseInt(body.ttlHours, 10) : undefined,
      kind: body.kind || 'file',
    };

    return this.endpointsService.createFileEndpoint(code, dto);
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
    @Param() headers: any,
  ) {
    try {
      // Get endpoint from database
      const endpoint = await this.endpointsService.getEndpoint(id);

      // Extract relevant headers for webhook mode
      const requestHeaders = headers ? Object.keys(headers).reduce((acc, key) => {
        if (key.toLowerCase().startsWith('x-') || ['content-type', 'user-agent'].includes(key.toLowerCase())) {
          acc[key] = headers[key];
        }
        return acc;
      }, {} as Record<string, string>) : {};

      // Execute via Cloudflare Sandbox
      const result = await this.executionService.execute(
        endpoint,
        input,
        requestHeaders,
      );

      return result;
    } catch (error) {
      return {
        error: error.message || 'Endpoint not found or expired',
      };
    }
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

