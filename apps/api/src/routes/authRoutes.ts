import { Router } from 'express';
import {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import {
  signupSchema,
  loginSchema,
  updateProfileSchema,
  addressSchema,
} from '@sai-punjabi/shared';

const router = Router();

// Public auth endpoints with strict rate limiting
router.post('/signup', authLimiter, validateBody(signupSchema), signup);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/logout', logout);

// Protected account endpoints
router.get('/me', protect, getMe);
router.put('/profile', protect, validateBody(updateProfileSchema), updateProfile);
router.post('/address', protect, validateBody(addressSchema), addAddress);
router.delete('/address/:addressId', protect, deleteAddress);

export default router;
