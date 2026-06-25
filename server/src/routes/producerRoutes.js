import { Router } from 'express';
import { asyncHandler } from '../utils/AppError.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { uploadToCloudinary } from '../middlewares/upload.js';
import { AppError } from '../utils/AppError.js';
import {
  getProducers,
  getProducerBySlug,
  adminCreateProducer,
  adminUpdateProducer,
  adminDeleteProducer,
} from '../controllers/shopController.js';

const router = Router();

router.get('/', asyncHandler(getProducers));
router.get('/:slug', asyncHandler(getProducerBySlug));

const adminRouter = Router();
adminRouter.use(authenticate, requireAdmin);
adminRouter.post('/', asyncHandler(adminCreateProducer));
adminRouter.put('/:id', asyncHandler(adminUpdateProducer));
adminRouter.delete('/:id', asyncHandler(adminDeleteProducer));
adminRouter.post('/upload', upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Aucune image fournie', 400);
  const url = await uploadToCloudinary(req.file.buffer, 'nflowers/producers');
  res.json({ success: true, data: { url } });
}));

router.use('/admin', adminRouter);

export default router;
