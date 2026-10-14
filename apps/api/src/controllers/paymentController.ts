import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { Payment } from '../models/Payment';
import { PaymentService } from '../services/paymentService';
import { emitOrderStatusUpdate } from '../sockets/orderSocket';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../middleware/errorHandler';

// POST /api/v1/payments/verify-razorpay
export const verifyRazorpayPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    // 1. Find internal order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    // 2. Cryptographic signature check (Never trust client redirect!)
    const isValid = PaymentService.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      // Record failed payment attempt
      await Payment.create({
        orderId: order._id,
        customerId: order.customerId,
        amount: order.totalAmount,
        currency: 'INR',
        method: 'online_razorpay',
        status: 'failed',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        failureReason: 'Signature verification failed',
      });

      throw new AppError(
        'Payment signature verification failed. Please contact support if your account was debited.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // 3. Mark payment as completed idempotently
    order.paymentStatus = 'completed';
    order.orderStatus = 'confirmed';
    order.razorpayPaymentId = razorpayPaymentId;
    order.statusHistory.push({
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      note: `Online payment verified successfully (Payment ID: ${razorpayPaymentId})`,
      updatedBy: 'Razorpay Gateway',
    });

    await order.save();

    // 4. Save Payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayPaymentId },
      {
        orderId: order._id,
        customerId: order.customerId,
        amount: order.totalAmount,
        currency: 'INR',
        method: 'online_razorpay',
        status: 'completed',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      },
      { upsert: true, new: true }
    );

    // 5. Emit real-time update
    emitOrderStatusUpdate(order._id.toString(), order);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      data: {
        order,
        payment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/payments/webhook
export const handleRazorpayWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    const isValid = PaymentService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const paymentEntity = payload.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const order = await Order.findOne({ razorpayOrderId });
        if (order && order.paymentStatus !== 'completed') {
          order.paymentStatus = 'completed';
          order.orderStatus = 'confirmed';
          order.razorpayPaymentId = razorpayPaymentId;
          order.statusHistory.push({
            status: 'confirmed',
            timestamp: new Date().toISOString(),
            note: 'Payment confirmed via Razorpay Webhook',
            updatedBy: 'Webhook',
          });
          await order.save();

          await Payment.findOneAndUpdate(
            { razorpayPaymentId },
            {
              orderId: order._id,
              customerId: order.customerId,
              amount: order.totalAmount,
              currency: 'INR',
              method: 'online_razorpay',
              status: 'completed',
              razorpayOrderId,
              razorpayPaymentId,
              rawWebhookPayload: req.body,
            },
            { upsert: true }
          );

          emitOrderStatusUpdate(order._id.toString(), order);
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;

      if (razorpayOrderId) {
        const order = await Order.findOne({ razorpayOrderId });
        if (order && order.paymentStatus !== 'completed') {
          order.paymentStatus = 'failed';
          await order.save();
          emitOrderStatusUpdate(order._id.toString(), order);
        }
      }
    }

    // Always respond 200 OK to Razorpay webhook acknowledgments
    res.status(HTTP_STATUS.OK).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};
