import { Router } from 'express';
import { asyncHandler } from '../utils/AppError.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import {
  getDashboard,
  adminGetUsers,
  adminToggleUser,
  adminGetContactMessages,
  adminMarkContactRead,
  adminGetNewsletterSubscriptions,
  seedStaticProducts,
} from '../controllers/shopController.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', asyncHandler(getDashboard));
router.get('/users', asyncHandler(adminGetUsers));
router.patch('/users/:id/toggle', asyncHandler(adminToggleUser));
router.get('/contact-messages', asyncHandler(adminGetContactMessages));
router.patch('/contact-messages/:id/read', asyncHandler(adminMarkContactRead));
router.get('/newsletter', asyncHandler(adminGetNewsletterSubscriptions));
router.post('/seed-products', asyncHandler(seedStaticProducts));

export default router;
