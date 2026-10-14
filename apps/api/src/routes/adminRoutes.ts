import { Router } from 'express';
import {
  getDashboardStats,
  getCustomers,
  toggleCustomerStatus,
} from '../controllers/adminController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

// Protect all admin routes with authentication and role check
router.use(protect, authorize('admin'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/customers', getCustomers);
router.patch('/customers/:id/toggle-status', toggleCustomerStatus);

export default router;
