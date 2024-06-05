const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = 'Ujjwal <ujjwalbit45@gmail.com>';
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(subject, html) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    const html = `
      <div>
        <p>Hi ${this.firstName},</p>
        <p>Welcome to our application! We're glad to have you with us.</p>
      </div>
    `;
    await this.send('Welcome to our Software!', html);
  }

  async sendPasswordReset() {
    const html = `
      <div>
        <p>Hi ${this.firstName},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${this.url}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;
    await this.send('Your password reset token (valid for only 10 minutes)', html);
  }
};
