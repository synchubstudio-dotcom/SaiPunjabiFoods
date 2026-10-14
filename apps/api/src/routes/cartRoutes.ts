import { Router } from 'express';
import {
  calculateCart,
  getCart,
  saveCart,
  clearCart,
  mergeGuestCart,
} from '../controllers/cartController';
import { optionalAuth, protect } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { calculateCartSchema } from '@sai-punjabi/shared';

const router = Router();

router.post('/calculate', optionalAuth, validateBody(calculateCartSchema), calculateCart);
router.get('/', optionalAuth, getCart);
router.post('/', optionalAuth, saveCart);
router.delete('/', optionalAuth, clearCart);
router.post('/merge', protect, mergeGuestCart);

export default router;
