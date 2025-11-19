import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: any;
  private readonly isProduction: boolean;

  constructor(private config: ConfigService) {
    this.isProduction = this.config.get('NODE_ENV') === 'production';
    
    if (this.isProduction) {
      const resendApiKey = this.config.get('RESEND_API_KEY');
      if (resendApiKey) {
        // Dynamically import Resend only in production
        import('resend').then((module) => {
          this.resend = new module.Resend(resendApiKey);
        });
      } else {
        this.logger.warn('RESEND_API_KEY not set - emails will be printed to console');
      }
    }
  }

  async sendMagicLink(email: string, magicLink: string): Promise<void> {
    const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify?token=${magicLink}`;

    if (!this.isProduction || !this.resend) {
      // Local development: print to terminal
      this.logger.log('==========================================');
      this.logger.log('🔐 MAGIC LINK FOR LOCAL DEVELOPMENT');
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
        from: this.config.get('EMAIL_FROM') || 'noreply@instantapi.dev',
        to: email,
        subject: 'Sign in to Instant API',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Instant API</h1>
              </div>
              
              <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #111827; margin-top: 0;">Sign in to your account</h2>
                <p style="color: #6b7280; font-size: 16px;">Click the button below to sign in to Instant API. This link will expire in 15 minutes.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Sign In</a>
                </div>
                
                <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
                  Or copy and paste this link into your browser:<br>
                  <a href="${verifyUrl}" style="color: #667eea; word-break: break-all;">${verifyUrl}</a>
                </p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                  If you didn't request this email, you can safely ignore it.
                </p>
              </div>
            </body>
          </html>
        `,
        text: `Sign in to Instant API\n\nClick this link to sign in: ${verifyUrl}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this email, you can safely ignore it.`,
      });
      
      this.logger.log(`Magic link sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}`, error);
      throw new Error('Failed to send magic link email');
    }
  }
}

