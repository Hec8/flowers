import { Router } from 'express';
import { asyncHandler } from '../utils/AppError.js';
import { authenticate } from '../middlewares/auth.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../controllers/shopController.js';

const router = Router();

router.use(authenticate);
router.get('/', asyncHandler(getWishlist));
router.post('/', asyncHandler(addToWishlist));
router.delete('/:productId', asyncHandler(removeFromWishlist));

export default router;
