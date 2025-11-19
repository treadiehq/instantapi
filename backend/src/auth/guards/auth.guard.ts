import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Check for Bearer token
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const user = await this.authService.validateToken(token);
        request.user = user;
        return true;
      } catch (error) {
        // Token invalid, continue to check API key
      }
    }

    // Check for API key in header
    const apiKey = request.headers['x-api-key'];
    if (apiKey) {
      try {
        const org = await this.authService.validateApiKey(apiKey);
        request.user = org;
        return true;
      } catch (error) {
        throw new UnauthorizedException('Invalid API key');
      }
    }

    throw new UnauthorizedException('No valid authentication provided');
  }
}

