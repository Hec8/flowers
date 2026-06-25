import { Router } from 'express';
import { asyncHandler } from '../utils/AppError.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  addressValidation,
  idParamValidation,
} from '../validators/authValidators.js';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/authController.js';

const router = Router();

router.post('/register', registerValidation, validate, asyncHandler(register));
router.post('/login', loginValidation, validate, asyncHandler(login));
router.post('/refresh', asyncHandler(refresh));
router.post('/forgot-password', forgotPasswordValidation, validate, asyncHandler(forgotPassword));
router.post('/reset-password', resetPasswordValidation, validate, asyncHandler(resetPassword));

router.use(authenticate);
router.post('/logout', asyncHandler(logout));
router.get('/me', asyncHandler(getMe));
router.put('/profile', asyncHandler(updateProfile));
router.put('/change-password', asyncHandler(changePassword));

router.get('/addresses', asyncHandler(getAddresses));
router.post('/addresses', addressValidation, validate, asyncHandler(createAddress));
router.put('/addresses/:id', [...idParamValidation, ...addressValidation], validate, asyncHandler(updateAddress));
router.delete('/addresses/:id', idParamValidation, validate, asyncHandler(deleteAddress));

export default router;
