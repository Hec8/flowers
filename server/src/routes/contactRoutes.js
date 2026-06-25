import { Router } from 'express';
import { asyncHandler } from '../utils/AppError.js';
import { submitContact, subscribeNewsletter } from '../controllers/shopController.js';

const router = Router();

router.post('/contact', asyncHandler(submitContact));
router.post('/newsletter', asyncHandler(subscribeNewsletter));

export default router;
