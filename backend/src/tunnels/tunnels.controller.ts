import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  Res,
  HttpStatus,
  HttpException,
  All,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TunnelsService } from './tunnels.service';
import {
  RegisterTunnelDto,
  PollTunnelDto,
  RespondTunnelDto,
  StreamChunkDto,
} from './dto/tunnel.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller()
export class TunnelsController {
  constructor(private readonly tunnelsService: TunnelsService) {}

  @Post('api/tunnels/register')
  async register(@Body() dto: RegisterTunnelDto, @Req() req: any) {
    const organizationId = req.user?.organizationId || null;
    return this.tunnelsService.register(dto, organizationId);
  }

  @Post('api/tunnels/:id/poll')
  async poll(
    @Param('id') tunnelId: string,
    @Body() dto: PollTunnelDto,
    @Req() req: any,
  ) {
    const maxWaitMs = dto.maxWaitMs || 25000;
    const organizationId = req.user?.organizationId || null;
    return this.tunnelsService.poll(tunnelId, maxWaitMs, organizationId);
  }

  @Post('api/tunnels/:id/respond')
  async respond(
    @Param('id') tunnelId: string,
    @Body() dto: RespondTunnelDto,
    @Req() req: any,
  ) {
    const organizationId = req.user?.organizationId || null;
    await this.tunnelsService.respond(tunnelId, dto, organizationId);
    return { success: true };
  }

  @Get('api/tunnels')
  @UseGuards(AuthGuard)
  async list(@Req() req: any) {
    return this.tunnelsService.listActiveTunnels(req.user.organizationId);
  }

  @Delete('api/tunnels/:id')
  @UseGuards(AuthGuard)
  async deactivate(@Param('id') tunnelId: string, @Req() req: any) {
    await this.tunnelsService.deactivateTunnel(tunnelId, req.user.organizationId);
    return { success: true };
  }

  @Post('api/tunnels/:id/stream')
  async stream(
    @Param('id') tunnelId: string,
    @Body() dto: StreamChunkDto,
    @Req() req: any,
  ) {
    const organizationId = req.user?.organizationId || null;
    if (dto.eof) {
      // Mark stream as complete
      await this.tunnelsService.markStreamComplete(dto.requestId, organizationId);
    } else if (dto.chunk !== undefined && dto.sequence !== undefined) {
      // Add stream chunk
      await this.tunnelsService.addStreamChunk(
        dto.requestId,
        dto.sequence,
        dto.chunk,
        organizationId,
      );
    }
    return { success: true };
  }

  // Public tunnel endpoint - receives requests and proxies through CLI
  @All('t/:id/*')
  @All('t/:id')
  async handleTunnelRequest(
    @Param('id') tunnelId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      // Validate tunnel exists and is active
      const tunnel = await this.tunnelsService.getTunnel(tunnelId);
      if (!tunnel.isActive) {
        return res.status(404).json({ error: 'Tunnel not found or inactive' });
      }

      // Extract request details
      const method = req.method;
      const path = req.path.replace(`/t/${tunnelId}`, '') || '/';

      // Capture headers (filter to safe subset)
      const headers: Record<string, any> = {};
      Object.keys(req.headers).forEach((key) => {
        if (
          key.toLowerCase().startsWith('x-') ||
          ['content-type', 'user-agent', 'accept', 'authorization'].includes(
            key.toLowerCase(),
          )
        ) {
          headers[key] = req.headers[key];
        }
      });

      // Capture body
      let body = null;
      if (req.body && Object.keys(req.body).length > 0) {
        body = req.body;
      }


      // Create tunnel request
      const { id: requestId, isStreaming } =
        await this.tunnelsService.createRequest(
          tunnelId,
          method,
          path,
          headers,
          body,
        );

      // Handle streaming (SSE/WebSocket fallback) vs standard requests
      if (isStreaming) {
        // Set up SSE headers
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no', // Disable nginx buffering
        });

        // Stream chunks as they arrive
        let lastSequence = 0;
        const streamInterval = setInterval(async () => {
          try {
            const chunks = await this.tunnelsService.getStreamChunks(
              requestId,
              lastSequence,
            );

            for (const chunk of chunks) {
              res.write(chunk.chunk);
              lastSequence = chunk.sequence + 1;
            }

            // Check if stream is complete
            const request = await this.tunnelsService.getRequest(requestId);
            if (request.status === 'completed') {
              clearInterval(streamInterval);
              res.end();
            }
          } catch (error) {
            clearInterval(streamInterval);
            res.end();
          }
        }, 100); // Check for new chunks every 100ms

        // Cleanup on client disconnect
        req.on('close', () => {
          clearInterval(streamInterval);
        });

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(streamInterval);
          res.end();
        }, 300000);
      } else {
        // Standard request-response flow
        try {
          const response = await this.tunnelsService.waitForResponse(
            requestId,
            30000,
          );

          // Apply response headers
          if (response.headers) {
            Object.keys(response.headers).forEach((key) => {
              res.setHeader(key, response.headers[key]);
            });
          }

          // Send response
          return res.status(response.statusCode).json(response.body);
        } catch (error: any) {
          if (error.message === 'Tunnel timeout') {
            return res.status(504).json({
              error: 'Gateway Timeout',
              message:
                'The tunnel did not respond in time. Make sure your CLI is running.',
            });
          }
          throw error;
        }
      }
    } catch (error: any) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
      });
    }
  }
}

