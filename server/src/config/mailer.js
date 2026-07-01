import nodemailer from 'nodemailer';
import fs from 'fs';
import { LOGO_CID, LOGO_PATH } from '../templates/emailLayout.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function resolveFromAddress() {
  const raw = process.env.EMAIL_FROM?.trim();
  if (raw?.includes('@')) return raw;
  if (raw && process.env.SMTP_USER) return `${raw} <${process.env.SMTP_USER}>`;
  return process.env.SMTP_USER
    ? `NFlowers <${process.env.SMTP_USER}>`
    : 'NFlowers <noreply@nflowers.com>';
}

export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[Email mock] To: ${to} | Subject: ${subject}`);
    return { mocked: true };
  }

  const attachments = fs.existsSync(LOGO_PATH)
    ? [{ filename: 'logo.png', path: LOGO_PATH, cid: LOGO_CID }]
    : [];

  return transporter.sendMail({
    from: resolveFromAddress(),
    to,
    subject,
    html,
    attachments,
  });
};

export default transporter;
