import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const LOGO_CID = 'nflowers-logo';
export const LOGO_PATH = path.join(__dirname, '../../assets/logo.png');

const BRAND = {
  primary: '#1a6b3c',
  primaryDark: '#0f4d2a',
  primaryLight: '#e8f5e9',
  accent: '#e8a317',
  text: '#1f2937',
  muted: '#6b7280',
  bg: '#f3f6f3',
  white: '#ffffff',
};

/**
 * Enveloppe HTML des e-mails NFlowers (logo en en-tête, charte graphique, pied de page).
 */
export function buildEmailHtml({
  preheader = '',
  greeting = '',
  contentHtml = '',
  footerNote = '',
}) {
  const clientUrl = process.env.CLIENT_URL || 'https://nflowers.com';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>NFlowers</title>
  <!--[if mso]><style>body,table,td{font-family:Arial,sans-serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:Arial,Helvetica,sans-serif;color:${BRAND.text};">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>` : ''}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${BRAND.bg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:${BRAND.white};border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(15,77,42,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND.primaryDark} 0%, ${BRAND.primary} 100%);padding:28px 32px;text-align:center;">
              <img src="cid:${LOGO_CID}" alt="NFlowers" width="140" style="display:block;margin:0 auto;max-width:140px;height:auto;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 28px;">
              ${greeting ? `<p style="margin:0 0 20px;font-size:18px;line-height:1.5;font-weight:700;color:${BRAND.primaryDark};">${greeting}</p>` : ''}
              <div style="font-size:15px;line-height:1.7;color:${BRAND.text};">
                ${contentHtml}
              </div>
            </td>
          </tr>
          <!-- Accent bar -->
          <tr>
            <td style="padding:0 32px;">
              <div style="height:4px;border-radius:999px;background:linear-gradient(90deg, ${BRAND.primaryDark}, ${BRAND.primary}, ${BRAND.accent});"></div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:${BRAND.muted};">
                Merci,<br />
                <strong style="color:${BRAND.primaryDark};">L&apos;équipe NFlowers</strong>
              </p>
              ${footerNote ? `<p style="margin:12px 0 0;font-size:12px;color:${BRAND.muted};line-height:1.6;">${footerNote}</p>` : ''}
              <p style="margin:20px 0 0;font-size:12px;">
                <a href="${clientUrl}" style="color:${BRAND.primary};text-decoration:none;font-weight:600;">Visiter le site</a>
                &nbsp;|&nbsp;
                <a href="${clientUrl}/profil" style="color:${BRAND.primary};text-decoration:none;">Mon compte</a>
              </p>
              <p style="margin:16px 0 0;font-size:11px;color:#9ca3af;">
                © ${new Date().getFullYear()} NFlowers — Fleurs &amp; plantes naturelles
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailButton(href, label) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px auto 8px;">
  <tr>
    <td align="center" style="border-radius:8px;background-color:${BRAND.primary};">
      <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

export function emailInfoBox(rows) {
  const rowsHtml = rows
    .map(
      ({ label, value }) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-size:13px;color:${BRAND.muted};width:42%;">${label}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-size:14px;font-weight:600;color:${BRAND.text};">${value}</td>
      </tr>`,
    )
    .join('');

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;background-color:${BRAND.primaryLight};border-radius:8px;padding:4px 16px;">
    ${rowsHtml}
  </table>`;
}
