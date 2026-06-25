import { Router } from 'express';
import { asyncHandler } from '../utils/AppError.js';
import { authenticate } from '../middlewares/auth.js';
import { fedapayCallback, checkPaymentStatus, retryFedaPayPayment } from '../controllers/paymentController.js';

const router = Router();

router.get('/payments/fedapay/callback', asyncHandler(fedapayCallback));
router.post('/payments/fedapay/callback', asyncHandler(fedapayCallback));
router.get('/orders/:orderId/payment-status', authenticate, asyncHandler(checkPaymentStatus));
router.post('/orders/:orderId/retry-payment', authenticate, asyncHandler(retryFedaPayPayment));

export default router;
