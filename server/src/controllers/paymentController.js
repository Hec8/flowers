import prisma from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { verifyFedaPayTransaction, regenerateFedaPayPaymentUrl } from '../services/fedapayService.js';
import { sendEmail } from '../config/mailer.js';
import { orderConfirmationEmail } from '../templates/emailTemplates.js';

/** Envoie l'e-mail de confirmation de paiement — séparé pour être réutilisable */
async function sendPaymentConfirmedEmail(order) {
  try {
    if (!order?.user?.email && !order?.userId) return;

    let email = order.user?.email;
    let name = order.user?.name;

    // Si la relation user n'est pas chargée, on la fetch
    if (!email) {
      const user = await prisma.user.findUnique({
        where: { id: order.userId },
        select: { email: true, name: true },
      });
      email = user?.email;
      name = user?.name;
    }

    if (!email) return;

    await sendEmail({
      to: email,
      subject: `Paiement confirmé — Commande ${order.orderNumber} — NFlowers`,
      html: orderConfirmationEmail({
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: 'CONFIRMÉE',
        paymentUrl: null,
      }),
    });

    console.log(`[Email] Confirmation paiement envoyée à ${email} (commande ${order.orderNumber})`);
  } catch (mailErr) {
    console.error('[Email] Erreur confirmation paiement:', mailErr.message);
  }
}

async function confirmFedaPayOrder(transactionId, orderIdHint) {
  const transaction = await verifyFedaPayTransaction(transactionId);

  const order = orderIdHint
    ? await prisma.order.findUnique({
        where: { id: orderIdHint },
        include: { user: { select: { email: true, name: true } } },
      })
    : await prisma.order.findFirst({
        where: { fedapayTransactionId: String(transactionId) },
        include: { user: { select: { email: true, name: true } } },
      });

  if (!order) {
    return { order: null, transaction, updated: false };
  }

  if (transaction.status === 'approved' && order.paymentStatus !== 'PAID') {
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        fedapayTransactionId: String(transactionId),
      },
      include: { user: { select: { email: true, name: true } } },
    });

    await sendPaymentConfirmedEmail(updated);

    return { order: updated, transaction, updated: true };
  }

  return { order, transaction, updated: false };
}

/** Webhook / callback FedaPay — confirme le paiement d'une commande */
export const fedapayCallback = async (req, res) => {
  const transactionId = req.query.id || req.body?.entity?.id || req.body?.id;
  const orderId = req.query.orderId;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  if (!transactionId) {
    // Si c'est un GET sans transaction, on redirige quand même vers l'accueil
    if (req.method === 'GET') {
      return res.redirect(`${clientUrl}/commandes`);
    }
    return res.status(400).json({ success: false, message: 'Transaction ID manquant' });
  }

  try {
    const { order, transaction, updated } = await confirmFedaPayOrder(transactionId, orderId);

    // Pour les GET (retour navigateur depuis FedaPay), toujours rediriger
    if (req.method === 'GET') {
      const qs = new URLSearchParams({
        payment: 'feadapay',
        id: String(transactionId),
        status: transaction?.status || 'pending',
      });
      const destination = orderId
        ? `${clientUrl}/commande/confirmation/${orderId}?${qs}`
        : `${clientUrl}/commandes?${qs}`;
      return res.redirect(destination);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande introuvable' });
    }

    res.json({
      success: true,
      message: updated ? 'Paiement confirmé' : 'Paiement déjà confirmé',
      orderId: order.id,
    });
  } catch (err) {
    console.error('FedaPay callback error:', err.message);

    // Pour un GET, ne pas retourner un 500 — rediriger quand même le client
    if (req.method === 'GET') {
      const qs = new URLSearchParams({
        payment: 'feadapay',
        id: String(transactionId),
        status: 'pending',
        ...(orderId ? {} : {}),
      });
      const destination = orderId
        ? `${clientUrl}/commande/confirmation/${orderId}?${qs}`
        : `${clientUrl}/commandes`;
      return res.redirect(destination);
    }

    res.status(500).json({ success: false, message: 'Erreur vérification paiement' });
  }
};

/** Vérifie manuellement le statut d'un paiement (retour client) */
export const checkPaymentStatus = async (req, res) => {
  const { orderId } = req.params;
  const transactionIdParam = req.query.id || req.query.transactionId;

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: req.user.id },
    include: { user: { select: { email: true, name: true } } },
  });

  if (!order) throw new AppError('Commande introuvable', 404);

  const txId = transactionIdParam || order.fedapayTransactionId;

  if (txId && order.paymentStatus === 'PENDING') {
    try {
      const { order: updated, transaction } = await confirmFedaPayOrder(txId, order.id);
      const finalOrder = updated || order;

      if (finalOrder?.paymentStatus === 'PAID') {
        return res.json({ success: true, data: finalOrder, fedapayStatus: 'approved' });
      }

      return res.json({
        success: true,
        data: finalOrder,
        fedapayStatus: transaction?.status,
      });
    } catch (err) {
      console.error('Payment verify error:', err.message);
    }
  }

  // Si la commande est déjà PAID mais l'email n'a pas été envoyé (fallback)
  // On vérifie si l'email de confirmation n'a pas encore été tracké
  if (order.paymentStatus === 'PAID' && req.query.sendEmail === 'true') {
    await sendPaymentConfirmedEmail(order);
  }

  res.json({ success: true, data: order });
};

/** Regénère un lien FedaPay pour une commande en attente (transaction declined/canceled) */
export const retryFedaPayPayment = async (req, res) => {
  const { orderId } = req.params;

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: req.user.id,
      paymentMethod: 'FEADAPAY',
      paymentStatus: 'PENDING',
    },
  });

  if (!order) throw new AppError('Commande introuvable ou déjà payée', 404);
  if (!order.fedapayTransactionId) {
    throw new AppError('Aucune transaction FedaPay associée à cette commande', 400);
  }

  try {
    const existing = await verifyFedaPayTransaction(order.fedapayTransactionId);

    if (existing.status === 'approved') {
      const { order: updated } = await confirmFedaPayOrder(order.fedapayTransactionId, order.id);
      return res.json({ success: true, data: updated, paymentUrl: null });
    }

    const feda = await regenerateFedaPayPaymentUrl(order.fedapayTransactionId);
    return res.json({ success: true, data: order, paymentUrl: feda.paymentUrl });
  } catch (err) {
    console.error('FedaPay retry error:', err.message);
    throw new AppError(`Impossible de relancer le paiement: ${err.message}`, 502);
  }
};
