const renderEmail = require('./render_template_async');
const Email = require('./email');

class VerifyEmail extends Email {
  constructor(emailTemplatePath, name, userEmail, subject, code) {
    super(emailTemplatePath, name, userEmail, subject);
    this.code = code;
  }

  async sendEmail() {
    const html = renderEmail(this.emailTemplatePath, {
      name: this.name,
      code: this.code
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: this.to,
      subject: this.subject,
      html
    };
    // we need await do not remove it vscode is being stupid
    await this.transporter.sendMail(mailOptions);
  }
}

module.exports = VerifyEmail;
