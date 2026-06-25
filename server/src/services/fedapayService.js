import { FedaPay, Transaction } from 'fedapay';

let configured = false;

function configureFedaPay() {
  if (configured) return;
  const apiKey = process.env.FEADAPAY_SECRET_KEY;
  if (!apiKey) {
    throw new Error('FEADAPAY_SECRET_KEY non configurée');
  }
  FedaPay.setApiKey(apiKey);
  FedaPay.setEnvironment(process.env.FEADAPAY_ENV || 'sandbox');
  configured = true;
}

/** Normalise un numéro béninois (8 chiffres, sans indicatif 229) */
export function normalizeBeninPhone(phone) {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('229') && digits.length >= 11) digits = digits.slice(3);
  if (digits.length === 8) return digits;
  return null;
}

/** URL de retour après paiement — doit être joignable par le navigateur client */
export function buildFedaPayCallbackUrl(orderId) {
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  return `${clientUrl}/commande/confirmation/${orderId}?payment=feadapay`;
}

function buildCustomerPayload(customer) {
  const payload = {
    firstname: customer.firstname,
    lastname: customer.lastname,
    email: customer.email,
  };

  const phone = normalizeBeninPhone(customer.phone);
  if (phone) {
    payload.phone_number = { number: phone, country: customer.country || 'bj' };
  }

  return payload;
}

/**
 * Crée une transaction FedaPay et retourne l'URL de paiement.
 */
export async function createFedaPayTransaction({
  amount,
  description,
  callbackUrl,
  customer,
  merchantReference,
}) {
  configureFedaPay();

  const payload = {
    description,
    amount: Math.round(amount),
    currency: { iso: 'XOF' },
    callback_url: callbackUrl,
    customer: buildCustomerPayload(customer),
  };

  if (merchantReference) {
    payload.merchant_reference = merchantReference;
  }

  const transaction = await Transaction.create(payload);
  const tokenResponse = await transaction.generateToken();

  return {
    transactionId: transaction.id,
    paymentUrl: tokenResponse.url,
    token: tokenResponse.token,
  };
}

/** Regénère un lien de paiement pour une transaction existante (declined/canceled) */
export async function regenerateFedaPayPaymentUrl(transactionId) {
  configureFedaPay();
  const transaction = await Transaction.retrieve(transactionId);
  const tokenResponse = await transaction.generateToken();
  return {
    transactionId: transaction.id,
    paymentUrl: tokenResponse.url,
    status: transaction.status,
  };
}

export async function verifyFedaPayTransaction(transactionId) {
  configureFedaPay();
  return Transaction.retrieve(transactionId);
}
