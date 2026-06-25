import { Router } from 'express';
import { asyncHandler } from '../utils/AppError.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import {
  getProducts,
  getProductBySlug,
  getCategories,
  createReview,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  uploadProductImage,
} from '../controllers/productController.js';

const router = Router();

// Public
router.get('/', asyncHandler(getProducts));
router.get('/categories', asyncHandler(getCategories));

// Admin (before /:slug — otherwise "admin" is treated as a product slug)
const adminRouter = Router();
adminRouter.use(authenticate, requireAdmin);
adminRouter.get('/', asyncHandler(adminGetProducts));
adminRouter.post('/', asyncHandler(adminCreateProduct));
adminRouter.put('/:id', asyncHandler(adminUpdateProduct));
adminRouter.delete('/:id', asyncHandler(adminDeleteProduct));
adminRouter.post('/upload', upload.single('image'), asyncHandler(uploadProductImage));
adminRouter.post('/categories', asyncHandler(adminCreateCategory));
adminRouter.put('/categories/:id', asyncHandler(adminUpdateCategory));
adminRouter.delete('/categories/:id', asyncHandler(adminDeleteCategory));
router.use('/admin', adminRouter);

// Authenticated
router.post('/:productId/reviews', authenticate, asyncHandler(createReview));

router.get('/:slug', asyncHandler(getProductBySlug));

export default router;
