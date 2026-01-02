import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { EmailService } from './email.service';
import { SignupDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { randomBytes } from 'crypto';

// Reserved organization names that cannot be used
const RESERVED_ORG_NAMES = [
  // System & Admin
  'admin', 'administrator', 'root', 'system', 'support', 'help',
  'api', 'www', 'cdn', 'mail', 'email', 'smtp', 'ftp', 'ssh',
  
  // Common Subdomains
  'app', 'dashboard', 'console', 'portal', 'panel', 'login', 'signup',
  'auth', 'account', 'accounts', 'user', 'users', 'profile',
  
  // Infrastructure
  'server', 'database', 'db', 'cache', 'queue', 'worker', 'jobs',
  'static', 'assets', 'media', 'uploads', 'downloads', 'files',
  
  // API & Webhooks
  'webhook', 'webhooks', 'callback', 'oauth', 'api-key', 'apikey',
  'endpoint', 'endpoints', 'tunnel', 'tunnels', 'proxy',
  
  // Documentation & Info
  'docs', 'documentation', 'blog', 'news', 'about', 'contact',
  'terms', 'privacy', 'legal', 'status', 'health',
  
  // Common Business
  'sales', 'marketing', 'billing', 'invoice', 'payment', 'subscribe',
  'enterprise', 'business', 'corporate', 'company', 'organization',
  
  // Reserved for InstantAPI
  'instantapi', 'instant-api', 'instant', 'treadie', 'treadieiq', 'kage', 'onboardbase', 'random', 'number',
  
  // Test & Demo
  'test', 'testing', 'demo', 'sandbox', 'example', 'sample',
  'staging', 'dev', 'development', 'prod', 'production',
  
  // Prevent Abuse
  'abuse', 'security', 'report', 'spam', 'noreply', 'no-reply',
  'postmaster', 'hostmaster', 'webmaster', 'moderator', 'null',
  'undefined', 'anonymous', 'guest', 'public', 'private',
];

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private email: EmailService,
  ) {}

  private isReservedOrgName(name: string): boolean {
    const normalized = name.toLowerCase().trim();
    return RESERVED_ORG_NAMES.includes(normalized);
  }

  async signup(dto: SignupDto): Promise<{ message: string }> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists. Please login instead.');
    }

    // Normalize organization name for consistent comparison and storage
    const normalizedOrgName = dto.organizationName.toLowerCase().trim();

    // Check if organization name is reserved
    if (this.isReservedOrgName(normalizedOrgName)) {
      throw new BadRequestException('This organization name is reserved and cannot be used. Please choose a different name.');
    }

    // Check if organization name already exists (case-insensitive)
    const existingOrg = await this.prisma.organization.findFirst({
      where: { name: normalizedOrgName },
    });

    if (existingOrg) {
      throw new ConflictException('An organization with this name already exists. Please choose a different name.');
    }

    // Generate signup magic link (account will be created on verification)
    await this.generateSignupMagicLink(dto.email, normalizedOrgName);

    return {
      message: 'Check your email for a magic link to complete your signup.',
    };
  }

  async login(dto: LoginDto): Promise<{ message: string }> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('No account found with this email exists. Please sign up instead.');
    }

    // Generate and send magic link
    await this.generateAndSendMagicLink(user.id, dto.email);

    return {
      message: 'Check your email for a magic link to sign in.',
    };
  }

  async verifyMagicLink(token: string): Promise<AuthResponseDto> {
    // Find magic link
    const magicLink = await this.prisma.magicLink.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!magicLink) {
      throw new UnauthorizedException('Invalid magic link');
    }

    // Check if already used
    if (magicLink.usedAt) {
      throw new UnauthorizedException('Magic link has already been used');
    }

    // Check if expired
    if (new Date() > magicLink.expiresAt) {
      throw new UnauthorizedException('Magic link has expired');
    }

    // Mark as used
    await this.prisma.magicLink.update({
      where: { id: magicLink.id },
      data: { usedAt: new Date() },
    });

    let user = magicLink.user;

    // If this is a signup link, create the account now
    if (magicLink.type === 'signup') {
      // Double-check email and org name still available
      const existingUser = await this.prisma.user.findUnique({
        where: { email: magicLink.email },
      });

      if (existingUser) {
        throw new ConflictException('An account with this email was created while you were verifying');
      }

      // Normalize organization name (should already be normalized from signup, but ensure consistency)
      const normalizedOrgName = magicLink.organizationName.toLowerCase().trim();

      // Check if organization name is reserved
      if (this.isReservedOrgName(normalizedOrgName)) {
        throw new BadRequestException('This organization name is reserved and cannot be used');
      }

      const existingOrg = await this.prisma.organization.findFirst({
        where: { name: normalizedOrgName },
      });

      if (existingOrg) {
        throw new ConflictException('This organization name was taken while you were verifying');
      }

      // Create organization with normalized name
      const org = await this.prisma.organization.create({
        data: {
          name: normalizedOrgName,
        },
      });

      // Create user
      user = await this.prisma.user.create({
        data: {
          email: magicLink.email,
          organizationId: org.id,
          lastLoginAt: new Date(),
        },
        include: {
          organization: true,
        },
      });
    } else {
      // Login link - update last login
      user = await this.prisma.user.update({
        where: { id: magicLink.userId },
        data: { lastLoginAt: new Date() },
        include: { organization: true },
      });
    }

    // Generate JWT
    const jwtToken = this.jwt.sign({
      sub: user.id,
      email: user.email,
      orgId: user.organizationId,
    });

    return {
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
        organizationName: user.organization.name,
      },
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwt.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { organization: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        userId: user.id,
        email: user.email,
        organizationId: user.organizationId,
        organizationName: user.organization.name,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async createApiKey(
    organizationId: string,
    name: string,
  ): Promise<{ key: string; name: string }> {
    // Check if API key with this name already exists for this organization
    const existing = await this.prisma.apiKey.findFirst({
      where: {
        organizationId,
        name,
      },
    });

    if (existing) {
      throw new BadRequestException('An API key with this name already exists');
    }

    const key = `ik_${randomBytes(32).toString('hex')}`;

    await this.prisma.apiKey.create({
      data: {
        organizationId,
        name,
        key,
      },
    });

    return { key, name };
  }

  async listApiKeys(organizationId: string): Promise<any[]> {
    const apiKeys = await this.prisma.apiKey.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiKeys;
  }

  async deleteApiKey(organizationId: string, apiKeyId: string): Promise<void> {
    // Verify the API key belongs to this organization
    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        id: apiKeyId,
        organizationId,
      },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.apiKey.delete({
      where: { id: apiKeyId },
    });
  }

  async validateApiKey(key: string): Promise<any> {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { key },
      include: { organization: true },
    });

    if (!apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Update last used
    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      organizationId: apiKey.organizationId,
      organizationName: apiKey.organization.name,
    };
  }

  private async generateAndSendMagicLink(
    userId: string,
    email: string,
  ): Promise<void> {
    // Generate random token
    const token = randomBytes(32).toString('hex');

    // Expires in 15 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Save to database
    await this.prisma.magicLink.create({
      data: {
        userId,
        email,
        type: 'login',
        token,
        expiresAt,
      },
    });

    // Send login email
    await this.email.sendLoginEmail(email, token);
  }

  private async generateSignupMagicLink(
    email: string,
    organizationName: string,
  ): Promise<void> {
    // Generate random token
    const token = randomBytes(32).toString('hex');

    // Expires in 15 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Save to database (no userId yet - will be created on verification)
    await this.prisma.magicLink.create({
      data: {
        email,
        type: 'signup',
        organizationName,
        token,
        expiresAt,
      },
    });

    // Send signup email
    await this.email.sendSignupEmail(email, token);
  }
}

