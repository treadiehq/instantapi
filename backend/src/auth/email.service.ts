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
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
              <div style="background: rgb(142 197 255) padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">Welcome to Instant API! 🎉</h1>
              </div>
              
              <div style="background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h2 style="color: #111827; margin-top: 0; font-size: 24px;">Let's get you started</h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.7;">
                  You're just one click away from creating APIs instantly. No servers, no deployment, no hassle.
                </p>
                
                <div style="text-align: center; margin: 35px 0;">
                  <a href="${verifyUrl}" style="display: inline-block; background: rgb(142 197 255) color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(142, 197, 255, 0.3);">Complete Signup</a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                  Or copy and paste this link into your browser:<br>
                  <a href="${verifyUrl}" style="color: rgb(100, 170, 255); word-break: break-all; text-decoration: none;">${verifyUrl}</a>
                </p>
                
                <div style="background: #f0f9ff; border-left: 4px solid rgb(142, 197, 255); padding: 16px; margin: 30px 0; border-radius: 4px;">
                  <p style="color: #1e40af; font-size: 14px; margin: 0;">
                    <strong>This link expires in 15 minutes</strong>
                  </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                  Didn't create an account? You can safely ignore this email.
                </p>
              </div>
            </body>
          </html>
        `,
        text: `Welcome to Instant API! 🎉\n\nYou're just one click away from creating APIs instantly.\n\nClick this link to complete your signup: ${verifyUrl}\n\nThis link will expire in 15 minutes.\n\nIf you didn't create an account, you can safely ignore this email.`,
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
        from: this.config.get('EMAIL_FROM') || 'Instant API <noreply@instantapi.com>',
        to: email,
        subject: 'Sign in to Instant API',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
              <div style="background: rgb(142 197 255) padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">Instant API</h1>
              </div>
              
              <div style="background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h2 style="color: #111827; margin-top: 0; font-size: 24px;">Welcome back! 👋</h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.7;">
                  Click the button below to sign in to your Instant API account.
                </p>
                
                <div style="text-align: center; margin: 35px 0;">
                  <a href="${verifyUrl}" style="display: inline-block; background: rgb(142 197 255) color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(142, 197, 255, 0.3);">Sign In to Your Account</a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                  Or copy and paste this link into your browser:<br>
                  <a href="${verifyUrl}" style="color: rgb(100, 170, 255); word-break: break-all; text-decoration: none;">${verifyUrl}</a>
                </p>
                
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 30px 0; border-radius: 4px;">
                  <p style="color: #92400e; font-size: 14px; margin: 0;">
                    <strong>This link expires in 15 minutes</strong>
                  </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                  If you didn't request this sign-in link, you can safely ignore this email.
                </p>
              </div>
            </body>
          </html>
        `,
        text: `Welcome back to Instant API! 👋\n\nClick this link to sign in: ${verifyUrl}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this sign-in link, you can safely ignore it.`,
      });
      
      this.logger.log(`🔐 Login email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send login email to ${email}`, error);
      throw new Error('Failed to send login email');
    }
  }
}
