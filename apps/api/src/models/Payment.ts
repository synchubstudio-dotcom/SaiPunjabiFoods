import mongoose, { Document, Schema, Model } from 'mongoose';
import { IPayment, PaymentMethod, PaymentStatus } from '@sai-punjabi/shared';

export interface IPaymentDocument extends Omit<IPayment, '_id' | 'createdAt' | 'updatedAt' | 'orderId' | 'customerId'>, Document {
  orderId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  rawWebhookPayload?: any;
}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    method: {
      type: String,
      enum: ['online_razorpay', 'cash_on_delivery'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    razorpayOrderId: {
      type: String,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      index: true,
    },
    razorpaySignature: {
      type: String,
    },
    failureReason: {
      type: String,
    },
    rawWebhookPayload: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment: Model<IPaymentDocument> =
  mongoose.models.Payment || mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
