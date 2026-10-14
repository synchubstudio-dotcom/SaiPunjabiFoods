import mongoose, { Document, Schema, Model } from 'mongoose';
import {
  IOrder,
  IOrderItemSnapshot,
  IOrderStatusHistory,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  FulfillmentMethod,
} from '@sai-punjabi/shared';

export interface IOrderDocument extends Omit<IOrder, '_id' | 'createdAt' | 'updatedAt' | 'customerId'>, Document {
  customerId: mongoose.Types.ObjectId;
}

const OrderItemSnapshotSchema = new Schema<IOrderItemSnapshot>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String },
    isVegetarian: { type: Boolean, default: true },
    variantName: { type: String },
    addOns: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>(
  {
    status: {
      type: String,
      required: true,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ],
    },
    timestamp: { type: String, default: () => new Date().toISOString() },
    note: { type: String },
    updatedBy: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customerDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    items: [OrderItemSnapshotSchema],
    subtotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    fulfillmentMethod: {
      type: String,
      enum: ['delivery', 'pickup'],
      default: 'delivery',
    },
    deliveryAddress: {
      label: { type: String },
      street: { type: String },
      landmark: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
    },
    orderNotes: { type: String },
    appliedPromotion: {
      promoCode: { type: String },
      discountAmount: { type: Number },
      promotionId: { type: String },
      name: { type: String },
    },
    paymentMethod: {
      type: String,
      enum: ['online_razorpay', 'cash_on_delivery'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },
    statusHistory: [OrderStatusHistorySchema],
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String },
    estimatedDeliveryTime: { type: String },
  },
  {
    timestamps: true,
  }
);

// Helper function to generate unique order number SP-YYMMDD-XXXX
export const generateOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SP-${year}${month}${day}-${randomSuffix}`;
};

export const Order: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);
