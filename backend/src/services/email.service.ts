/**
 * Email Service
 * 
 * POC implementation that logs emails to console.
 * Structured to be easily replaced with real SMTP implementation later.
 * 
 * To replace with real SMTP:
 * 1. Install nodemailer: npm install nodemailer @types/nodemailer
 * 2. Replace the sendEmail method implementation
 * 3. Add SMTP configuration to .env (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailConfig {
  from: string;
  enabled: boolean;
  // Future SMTP config:
  // host?: string;
  // port?: number;
  // secure?: boolean;
  // auth?: {
  //   user: string;
  //   pass: string;
  // };
}

export class EmailService {
  private config: EmailConfig;

  constructor(config?: Partial<EmailConfig>) {
    this.config = {
      from: config?.from || process.env.EMAIL_FROM || 'noreply@recruitment.com',
      enabled: config?.enabled !== undefined ? config.enabled : process.env.EMAIL_ENABLED === 'true',
    };
  }

  /**
   * Send an email
   * 
   * POC: Logs to console
   * Production: Replace with actual SMTP implementation
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.config.enabled) {
      console.log('[EmailService] Email sending is disabled');
      return false;
    }

    // POC Implementation: Log to console
    console.log('\n' + '='.repeat(80));
    console.log('📧 EMAIL SENT');
    console.log('='.repeat(80));
    console.log(`From: ${options.from || this.config.from}`);
    console.log(`To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
    if (options.cc) {
      console.log(`CC: ${Array.isArray(options.cc) ? options.cc.join(', ') : options.cc}`);
    }
    if (options.bcc) {
      console.log(`BCC: ${Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc}`);
    }
    console.log(`Subject: ${options.subject}`);
    console.log('-'.repeat(80));
    console.log('TEXT VERSION:');
    console.log(options.text);
    console.log('-'.repeat(80));
    console.log('HTML VERSION:');
    console.log(options.html);
    console.log('='.repeat(80) + '\n');

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100));

    return true;

    /* 
    // PRODUCTION IMPLEMENTATION (using nodemailer):
    
    import nodemailer from 'nodemailer';
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      const info = await transporter.sendMail({
        from: options.from || this.config.from,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      console.log(`[EmailService] Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('[EmailService] Failed to send email:', error);
      return false;
    }
    */
  }

  /**
   * Send multiple emails
   */
  async sendBulkEmails(emails: EmailOptions[]): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const email of emails) {
      try {
        const success = await this.sendEmail(email);
        if (success) {
          sent++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error('[EmailService] Error sending email:', error);
        failed++;
      }
    }

    return { sent, failed };
  }

  /**
   * Validate email address
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get email configuration
   */
  getConfig(): EmailConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const emailService = new EmailService();

