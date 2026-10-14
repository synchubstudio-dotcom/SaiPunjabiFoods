import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validateBody } from '../middleware/validate';
import { updateSettingsSchema } from '@sai-punjabi/shared';

const router = Router();

router.get('/', getSettings);
router.put('/', protect, authorize('admin'), validateBody(updateSettingsSchema), updateSettings);

export default router;
