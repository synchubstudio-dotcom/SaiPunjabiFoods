import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  trackOrder,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController';
import { protect, optionalAuth } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validateBody } from '../middleware/validate';
import { checkoutLimiter } from '../middleware/rateLimiter';
import { checkoutSchema, updateOrderStatusSchema } from '@sai-punjabi/shared';

const router = Router();

// Customer order placement with rate limiting
router.post('/', protect, checkoutLimiter, validateBody(checkoutSchema), createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/track/:orderNumber', optionalAuth, trackOrder);
router.get('/:id', protect, getOrderById);

// Admin order management
router.get('/', protect, authorize('admin'), getAllOrders);
router.patch(
  '/:id/status',
  protect,
  authorize('admin'),
  validateBody(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;
