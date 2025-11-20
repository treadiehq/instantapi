import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * AdminGuard - Restricts access to admin-only routes
 * 
 * Checks if the authenticated user's email is in the ADMIN_EMAILS environment variable.
 * Supports multiple admin emails separated by commas.
 * 
 * Setup:
 * 1. Set ADMIN_EMAILS in .env or Railway: ADMIN_EMAILS=admin@example.com,admin2@example.com
 * 2. Apply guard to routes: @UseGuards(AuthGuard, AdminGuard)
 * 
 * Note: AuthGuard must be applied first to populate request.user
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private adminEmails: Set<string>;

  constructor() {
    // Parse admin emails once on startup and cache in memory
    const emailsString = process.env.ADMIN_EMAILS || '';
    this.adminEmails = new Set(
      emailsString
        .split(',')
        .map(email => email.trim().toLowerCase())
        .filter(email => email.length > 0)
    );

    if (this.adminEmails.size === 0) {
      console.warn('⚠️  No admin emails configured. Set ADMIN_EMAILS environment variable.');
    } else {
      console.log(`🔐 Admin guard initialized with ${this.adminEmails.size} admin(s)`);
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Populated by AuthGuard

    if (!user?.email) {
      throw new ForbiddenException('Authentication required');
    }

    const isAdmin = this.adminEmails.has(user.email.toLowerCase());

    if (!isAdmin) {
      console.log(`🚫 Admin access denied for: ${user.email}`);
      throw new ForbiddenException('Admin access required');
    }

    console.log(`✅ Admin access granted: ${user.email}`);
    return true;
  }
}

