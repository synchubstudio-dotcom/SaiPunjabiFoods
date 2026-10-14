import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { protect, optionalAuth } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validateBody } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '@sai-punjabi/shared';

const router = Router();

// Public routes
router.get('/', optionalAuth, getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin-protected routes
router.post('/', protect, authorize('admin'), validateBody(createCategorySchema), createCategory);
router.put('/:id', protect, authorize('admin'), validateBody(updateCategorySchema), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;
