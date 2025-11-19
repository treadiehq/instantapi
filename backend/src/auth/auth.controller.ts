import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  SignupDto,
  LoginDto,
  VerifyMagicLinkDto,
  AuthResponseDto,
} from './dto/auth.dto';
import { AuthGuard } from './guards/auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('verify')
  async verify(@Body() dto: VerifyMagicLinkDto): Promise<AuthResponseDto> {
    return this.authService.verifyMagicLink(dto.token);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: any) {
    return {
      user: {
        id: req.user.userId,
        email: req.user.email,
        organizationId: req.user.organizationId,
        organizationName: req.user.organizationName,
      },
    };
  }

  @Post('api-key')
  @UseGuards(AuthGuard)
  async createApiKey(@Req() req: any, @Body('name') name: string) {
    return this.authService.createApiKey(req.user.organizationId, name);
  }
}

