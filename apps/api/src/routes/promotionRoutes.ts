import { Router } from 'express';
import {
  getActivePromotions,
  validatePromoCode,
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionRedemptions,
} from '../controllers/promotionController';
import { protect, optionalAuth } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validateBody } from '../middleware/validate';
import {
  createPromotionSchema,
  updatePromotionSchema,
  applyPromoSchema,
} from '@sai-punjabi/shared';

const router = Router();

// Public
router.get('/active', getActivePromotions);
router.post('/validate-code', optionalAuth, validateBody(applyPromoSchema), validatePromoCode);

// Admin-only management
router.get('/', protect, authorize('admin'), getAllPromotions);
router.post('/', protect, authorize('admin'), validateBody(createPromotionSchema), createPromotion);
router.put('/:id', protect, authorize('admin'), validateBody(updatePromotionSchema), updatePromotion);
router.delete('/:id', protect, authorize('admin'), deletePromotion);
router.get('/:id/redemptions', protect, authorize('admin'), getPromotionRedemptions);

export default router;
