import { Router } from 'express';
import { asyncHandler } from '../utils/AppError.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import {
  getCart,
  syncCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  createOrder,
  getMyOrders,
  getOrderById,
  adminGetOrders,
  adminUpdateOrderStatus,
} from '../controllers/shopController.js';

const router = Router();

// Cart
router.use('/cart', authenticate);
router.get('/cart', asyncHandler(getCart));
router.post('/cart/sync', asyncHandler(syncCart));
router.post('/cart', asyncHandler(addToCart));
router.put('/cart/:id', asyncHandler(updateCartItem));
router.delete('/cart/:id', asyncHandler(removeCartItem));
router.delete('/cart', asyncHandler(clearCart));

// Orders (client)
router.post('/orders', authenticate, asyncHandler(createOrder));
router.get('/orders', authenticate, asyncHandler(getMyOrders));
router.get('/orders/:id', authenticate, asyncHandler(getOrderById));

// Admin orders
const adminRouter = Router();
adminRouter.use(authenticate, requireAdmin);
adminRouter.get('/', asyncHandler(adminGetOrders));
adminRouter.patch('/:id/status', asyncHandler(adminUpdateOrderStatus));

router.use('/admin/orders', adminRouter);

export default router;
