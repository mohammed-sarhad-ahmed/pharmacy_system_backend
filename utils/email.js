const nodeMailer = require('nodemailer');
const renderEmail = require('./render_template_async');

const sendEmail = async (options) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const html = await renderEmail(
    '/Users/muhamadsarhad/Desktop/pharmacy_system_backend/emails/reset_password_email.mjml',
    {
      name: options.name,
      link: options.resetUrl
    }
  );

  const mailOptions = {
    from: 'Muhamad sarhad <muhamadsarhad999@gmail.com>',
    to: options.email,
    subject: options.subject,
    html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
