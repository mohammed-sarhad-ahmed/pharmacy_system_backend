const nodeMailer = require('nodemailer');

class Email {
  transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  constructor(emailTemplatePath, name, userEmail, subject) {
    this.emailTemplatePath = emailTemplatePath;
    this.name = name;
    this.to = userEmail;
    this.subject = subject;
  }
}

module.exports = Email;
