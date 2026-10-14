import { Router } from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
} from '../controllers/productController';
import { protect, optionalAuth } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validateBody } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '@sai-punjabi/shared';

const router = Router();

// Public routes
router.get('/', optionalAuth, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', getProductBySlug);

// Admin-protected routes
router.post('/', protect, authorize('admin'), validateBody(createProductSchema), createProduct);
router.put('/:id', protect, authorize('admin'), validateBody(updateProductSchema), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.patch('/:id/toggle-availability', protect, authorize('admin'), toggleProductAvailability);

export default router;
