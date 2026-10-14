import { Router } from 'express';
import {
  verifyRazorpayPayment,
  handleRazorpayWebhook,
} from '../controllers/paymentController';
import { protect } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { razorpayVerifySchema } from '@sai-punjabi/shared';

const router = Router();

router.post(
  '/verify-razorpay',
  protect,
  validateBody(razorpayVerifySchema),
  verifyRazorpayPayment
);

// Raw webhook listener
router.post('/webhook', handleRazorpayWebhook);

export default router;
