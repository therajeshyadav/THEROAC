const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587;
    const service = process.env.EMAIL_SERVICE || undefined;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      service,
      secure: port === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Email transporter configuration failed:', error.message);
      } else {
        console.log('Email transporter connected and ready.');
      }
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || `"The ROAC" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw new Error('Failed to send email');
    }
  }

  async sendVerificationEmail(email, verificationToken, userName) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - The ROAC</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1A1719 0%, #2D2A2E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #FFD600; color: #1A1719; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Welcome to The ROAC!</h1></div>
          <div class="content">
            <h2>Hi ${userName || 'there'},</h2>
            <p>Thank you for registering with The ROAC! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>If the button doesn't work, copy this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't sign up, please ignore this email.</p>
            <p>Best regards,<br>The ROAC Team</p>
          </div>
          <div class="footer"><p>&copy; 2025 The ROAC. All rights reserved.</p></div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail(email, 'Verify Your Email Address - The ROAC', html);
  }

  async sendPasswordResetEmail(email, resetToken, userName) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - The ROAC</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1A1719 0%, #2D2A2E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #FFD600; color: #1A1719; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Password Reset Request</h1></div>
          <div class="content">
            <h2>Hi ${userName || 'there'},</h2>
            <p>We received a request to reset your password for The ROAC account. If this was you, click below:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>If the button doesn't work, copy this link:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Note:</strong>
              <ul>
                <li>This link expires in 1 hour.</li>
                <li>If you didn't request this reset, ignore this email.</li>
              </ul>
            </div>
            <p>Best regards,<br>The ROAC Team</p>
          </div>
          <div class="footer"><p>&copy; 2025 The ROAC. All rights reserved.</p></div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail(email, 'Reset Your Password - The ROAC', html);
  }

  async sendWelcomeEmail(email, userName) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to The ROAC!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1A1719 0%, #2D2A2E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #FFD600; color: #1A1719; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Welcome to The ROAC!</h1></div>
          <div class="content">
            <h2>Hi ${userName || 'there'},</h2>
            <p>Your email has been verified and your account is now active.</p>
            <ul>
              <li>💼 Explore jobs and opportunities</li>
              <li>🎓 Join workshops and hackathons</li>
              <li>🤝 Connect with professionals</li>
            </ul>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/login" class="button">Start Exploring</a>
            </div>
            <p>Welcome aboard!<br>The ROAC Team</p>
          </div>
          <div class="footer"><p>&copy; 2025 The ROAC. All rights reserved.</p></div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail(email, 'Welcome to The ROAC! 🎉', html);
  }
}

module.exports = new EmailService();