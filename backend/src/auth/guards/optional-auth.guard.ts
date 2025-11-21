import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

/**
 * OptionalAuthGuard - Validates authentication if present, but allows the request through if not
 * 
 * Unlike AuthGuard, this does NOT throw UnauthorizedException if auth is missing.
 * Instead, it populates request.user if valid authentication is found, or leaves it undefined.
 * 
 * Use this for endpoints that work for both authenticated and unauthenticated users.
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
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
        // Token invalid, continue as unauthenticated
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
        // API key invalid, continue as unauthenticated
      }
    }

    // No authentication provided or invalid - allow through as unauthenticated
    return true;
  }
}

