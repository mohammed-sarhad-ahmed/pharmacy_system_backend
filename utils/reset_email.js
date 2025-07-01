const renderEmail = require('./render_template_async');
const Email = require('./email');

class ResetEmail extends Email {
  constructor(emailTemplatePath, name, userEmail, subject, resetUrl) {
    super(emailTemplatePath, name, userEmail, subject);
    this.resetUrl = resetUrl;
  }

  async sendEmail() {
    const html = await renderEmail(this.emailTemplatePath, {
      name: this.name,
      link: this.resetUrl
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

module.exports = ResetEmail;
