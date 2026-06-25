import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[Email mock] To: ${to} | Subject: ${subject}`);
    return { mocked: true };
  }

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || 'NFlowers <noreply@nflowers.com>',
    to,
    subject,
    html,
  });
};

export default transporter;
