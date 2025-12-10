const { google } = require('googleapis');
const { getAccessToken } = require('./gmailAuth');
require('dotenv').config();
class EmailService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  async init() {
    this.oauth2Client = await getAccessToken();

    if (!this.oauth2Client) {
      console.error("Gmail OAuth client unavailable.");
      return;
    }

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    console.log('Gmail API EmailService initialized.');
    this.initialized = true;
  }

  // --- Generic Gmail API Sender ---
  async sendEmail(to, subject, html) {
    try {
      const messageParts = [
        `From: ${process.env.EMAIL_FROM}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        html,
      ];

      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage },
      });

      console.log(`Email sent successfully to ${to}. Gmail ID: ${response.data.id}`);
      return { success: true, messageId: response.data.id };
    } catch (error) {
      console.error('Error sending email via Gmail API:', error.message);
      throw new Error('Failed to send email');
    }
  }

  // --- Verification Email ---
  async sendVerificationEmail(email, verificationToken, userName) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    const html = `
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - The ROAC</title>
        <style>
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1A1719, #2D2A2E); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #FFD600; color: #1A1719; text-decoration: none; padding: 12px 25px; border-radius: 50px; font-weight: bold; }
          .footer { text-align: center; color: #777; margin-top: 30px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Welcome to The ROAC</h1></div>
          <div class="content">
            <h2>Hi ${userName || 'there'},</h2>
            <p>Thank you for joining The ROAC! Please verify your email by clicking the button below:</p>
            <div style="text-align:center;"><a href="${verificationUrl}" class="button">Verify Email</a></div>
            <p>If that doesn’t work, copy this link into your browser:</p>
            <p style="word-break:break-all;color:#555;">${verificationUrl}</p>
            <p><strong>This link expires in 24 hours.</strong></p>
            <p>Best regards,<br>The ROAC Team</p>
          </div>
          <div class="footer">&copy; 2025 The ROAC. All rights reserved.</div>
        </div>
      </body></html>`;
    return this.sendEmail(email, 'Verify Your Email - The ROAC', html);
  }

  // --- Password Reset Email ---
  async sendPasswordResetEmail(email, resetToken, userName) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const html = `
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - The ROAC</title>
        <style>
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1A1719, #2D2A2E); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #FFD600; color: #1A1719; text-decoration: none; padding: 12px 25px; border-radius: 50px; font-weight: bold; }
          .footer { text-align: center; color: #777; margin-top: 30px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Password Reset Request</h1></div>
          <div class="content">
            <h2>Hi ${userName || 'there'},</h2>
            <p>We received a request to reset your password. Click below to reset it:</p>
            <div style="text-align:center;"><a href="${resetUrl}" class="button">Reset Password</a></div>
            <p>If that doesn’t work, copy this link into your browser:</p>
            <p style="word-break:break-all;color:#555;">${resetUrl}</p>
            <p><strong>This link expires in 1 hour.</strong></p>
            <p>If you didn’t request this, please ignore this email.</p>
            <p>Best regards,<br>The ROAC Team</p>
          </div>
          <div class="footer">&copy; 2025 The ROAC. All rights reserved.</div>
        </div>
      </body></html>`;
    return this.sendEmail(email, 'Reset Your Password - The ROAC', html);
  }

  // --- Welcome Email ---
  async sendWelcomeEmail(email, userName) {
    const html = `
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to The ROAC</title>
        <style>
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1A1719, #2D2A2E); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #FFD600; color: #1A1719; text-decoration: none; padding: 12px 25px; border-radius: 50px; font-weight: bold; }
          .footer { text-align: center; color: #777; margin-top: 30px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>🎉 Welcome to The ROAC</h1></div>
          <div class="content">
            <h2>Hi ${userName || 'there'},</h2>
            <p>Your email has been verified and your account is now active.</p>
            <ul>
              <li>💼 Explore job opportunities</li>
              <li>🎓 Join hackathons & workshops</li>
              <li>🤝 Connect with industry professionals</li>
            </ul>
            <div style="text-align:center;">
              <a href="${process.env.FRONTEND_URL || 'https://theroac.com'}/login" class="button">Start Exploring</a>
            </div>
            <p>Welcome aboard!<br>The ROAC Team</p>
          </div>
          <div class="footer">&copy; 2025 The ROAC. All rights reserved.</div>
        </div>
      </body></html>`;
    return this.sendEmail(email, 'Welcome to The ROAC', html);
  }
}

module.exports = new EmailService();
