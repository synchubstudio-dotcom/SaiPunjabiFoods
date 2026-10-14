import { Router } from 'express';
import {
  createReview,
  getReviews,
  getAdminReviews,
  moderateReview,
} from '../controllers/reviewController';
import { protect, optionalAuth } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validateBody } from '../middleware/validate';
import { createReviewSchema, moderateReviewSchema } from '@sai-punjabi/shared';

const router = Router();

// Public
router.get('/', optionalAuth, getReviews);

// Customer
router.post('/', protect, validateBody(createReviewSchema), createReview);

// Admin
router.get('/admin', protect, authorize('admin'), getAdminReviews);
router.patch(
  '/:id/moderate',
  protect,
  authorize('admin'),
  validateBody(moderateReviewSchema),
  moderateReview
);

export default router;
