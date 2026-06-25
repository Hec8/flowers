import prisma from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { verifyFedaPayTransaction, regenerateFedaPayPaymentUrl } from '../services/fedapayService.js';

async function confirmFedaPayOrder(transactionId, orderIdHint) {
  const transaction = await verifyFedaPayTransaction(transactionId);

  const order = orderIdHint
    ? await prisma.order.findUnique({ where: { id: orderIdHint } })
    : await prisma.order.findFirst({
        where: { fedapayTransactionId: String(transactionId) },
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
    });
    return { order: updated, transaction, updated: true };
  }

  return { order, transaction, updated: false };
}

/** Webhook / callback FedaPay — confirme le paiement d'une commande */
export const fedapayCallback = async (req, res) => {
  const transactionId = req.query.id || req.body?.entity?.id || req.body?.id;
  const orderId = req.query.orderId;

  if (!transactionId) {
    return res.status(400).json({ success: false, message: 'Transaction ID manquant' });
  }

  try {
    const { order, transaction, updated } = await confirmFedaPayOrder(transactionId, orderId);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (req.method === 'GET' && orderId) {
      const qs = new URLSearchParams({
        payment: 'feadapay',
        id: String(transactionId),
        status: transaction.status || 'pending',
      });
      return res.redirect(`${clientUrl}/commande/confirmation/${orderId}?${qs}`);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande introuvable' });
    }

    if (transaction.status !== 'approved') {
      return res.json({ success: true, message: 'Paiement en attente', status: transaction.status });
    }

    res.json({
      success: true,
      message: updated ? 'Paiement confirmé' : 'Paiement déjà confirmé',
      orderId: order.id,
    });
  } catch (err) {
    console.error('FedaPay callback error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur vérification paiement' });
  }
};

/** Vérifie manuellement le statut d'un paiement (retour client) */
export const checkPaymentStatus = async (req, res) => {
  const { orderId } = req.params;
  const transactionIdParam = req.query.id || req.query.transactionId;

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: req.user.id },
  });

  if (!order) throw new AppError('Commande introuvable', 404);

  const txId = transactionIdParam || order.fedapayTransactionId;

  if (txId && order.paymentStatus === 'PENDING') {
    try {
      const { order: updated, transaction } = await confirmFedaPayOrder(txId, order.id);
      if (updated?.paymentStatus === 'PAID') {
        return res.json({ success: true, data: updated, fedapayStatus: 'approved' });
      }
      return res.json({
        success: true,
        data: updated || order,
        fedapayStatus: transaction?.status,
      });
    } catch (err) {
      console.error('Payment verify error:', err.message);
    }
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
