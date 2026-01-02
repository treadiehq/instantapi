import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private readonly isProduction: boolean;

  constructor(private config: ConfigService) {
    this.isProduction = this.config.get('NODE_ENV') === 'production';
    
    if (this.isProduction) {
      const resendApiKey = this.config.get('RESEND_API_KEY');
      if (resendApiKey) {
        // Initialize Resend client synchronously to avoid race condition
        this.resend = new Resend(resendApiKey);
      } else {
        this.logger.warn('RESEND_API_KEY not set - emails will be printed to console');
      }
    }
  }

  async sendSignupEmail(email: string, magicLink: string): Promise<void> {
    const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify?token=${magicLink}`;

    if (!this.isProduction || !this.resend) {
      // Local development: print to terminal
      this.logger.log('==========================================');
      this.logger.log('✨ SIGNUP LINK FOR LOCAL DEVELOPMENT');
      this.logger.log('==========================================');
      this.logger.log(`Email: ${email}`);
      this.logger.log(`Link: ${verifyUrl}`);
      this.logger.log('==========================================');
      this.logger.log('Click the link above to complete signup');
      this.logger.log('==========================================');
      return;
    }

    // Production: send via Resend
    try {
      await this.resend.emails.send({
        from: this.config.get('EMAIL_FROM') || 'Instant API <noreply@instantapi.co>',
        to: email,
        subject: 'Welcome to Instant API!',
        text: `Welcome to Instant API!

Click the link below to complete your signup:

${verifyUrl}

This link expires in 15 minutes.

If you didn't request this, you can safely ignore this email.`,
      });
      
      this.logger.log(`✨ Signup email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send signup email to ${email}`, error);
      throw new Error('Failed to send signup email');
    }
  }

  async sendLoginEmail(email: string, magicLink: string): Promise<void> {
    const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify?token=${magicLink}`;

    if (!this.isProduction || !this.resend) {
      // Local development: print to terminal
      this.logger.log('==========================================');
      this.logger.log('🔐 LOGIN LINK FOR LOCAL DEVELOPMENT');
      this.logger.log('==========================================');
      this.logger.log(`Email: ${email}`);
      this.logger.log(`Link: ${verifyUrl}`);
      this.logger.log('==========================================');
      this.logger.log('Click the link above to sign in');
      this.logger.log('==========================================');
      return;
    }

    // Production: send via Resend
    try {
      await this.resend.emails.send({
        from: this.config.get('EMAIL_FROM') || 'Instant API <noreply@instantapi.co>',
        to: email,
        subject: 'Sign in to Instant API',
        text: `Welcome back to Instant API!

Click the link below to sign in:

${verifyUrl}

This link expires in 15 minutes.

If you didn't request this, you can safely ignore this email.`,
      });
      
      this.logger.log(`🔐 Login email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send login email to ${email}`, error);
      throw new Error('Failed to send login email');
    }
  }
}
