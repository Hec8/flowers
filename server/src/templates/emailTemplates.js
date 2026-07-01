import { buildEmailHtml, emailButton, emailInfoBox } from './emailLayout.js';

export function passwordResetEmail({ name, resetUrl }) {
  const greeting = name ? `Bonjour ${name} !` : 'Bonjour !';

  const contentHtml = `
    <p style="margin:0 0 16px;">
      Vous avez demandé la réinitialisation de votre mot de passe NFlowers.
    </p>
    <p style="margin:0 0 16px;">
      Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
      Ce lien est valable <strong>1 heure</strong>.
    </p>
    ${emailButton(resetUrl, 'Réinitialiser mon mot de passe')}
    <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">
      Si vous n&apos;êtes pas à l&apos;origine de cette demande, ignorez simplement cet e-mail.
      Votre mot de passe restera inchangé.
    </p>
    <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;word-break:break-all;">
      Lien direct : <a href="${resetUrl}" style="color:#1a6b3c;">${resetUrl}</a>
    </p>
  `;

  return buildEmailHtml({
    preheader: 'Réinitialisez votre mot de passe NFlowers — lien valable 1 heure',
    greeting,
    contentHtml,
    footerNote: 'Pour votre sécurité, ne partagez jamais ce lien.',
  });
}

export function orderConfirmationEmail({ orderNumber, totalAmount, status, paymentUrl }) {
  const isPaid = !paymentUrl;

  const contentHtml = isPaid
    ? `
      <p style="margin:0 0 16px;">
        🎉 Votre paiement a bien été reçu ! Votre commande est maintenant <strong>confirmée</strong> et sera préparée dans les meilleurs délais.
      </p>
      ${emailInfoBox([
        { label: 'N° de commande', value: orderNumber },
        { label: 'Montant payé', value: `${Number(totalAmount).toLocaleString('fr-FR')} FCFA` },
        { label: 'Statut', value: status },
      ])}
      <p style="margin:20px 0 0;">Vous recevrez une notification dès que votre commande sera expédiée.</p>
    `
    : `
      <p style="margin:0 0 16px;">
        Nous avons bien reçu votre demande de commande. <strong>Il ne vous reste plus qu'à finaliser votre paiement</strong> pour que nous commencions sa préparation.
      </p>
      ${emailInfoBox([
        { label: 'N° de commande', value: orderNumber },
        { label: 'Montant total', value: `${Number(totalAmount).toLocaleString('fr-FR')} FCFA` },
        { label: 'Statut', value: 'En attente de paiement' },
      ])}
      ${emailButton(paymentUrl, 'Finaliser mon paiement')}
      <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">
        Ce lien est valable 24 heures. Passé ce délai, contactez notre service client.
      </p>
    `;

  return buildEmailHtml({
    preheader: isPaid
      ? `Paiement confirmé — Commande ${orderNumber} — NFlowers`
      : `Votre commande ${orderNumber} est en attente de paiement — NFlowers`,
    greeting: isPaid ? 'Paiement confirmé ✓' : 'Votre commande a bien été reçue !',
    contentHtml,
    footerNote: 'Une question ? Contactez notre service client au (+229) 53 89 36 25.',
  });
}
