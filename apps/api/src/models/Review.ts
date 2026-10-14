import mongoose, { Document, Schema, Model } from 'mongoose';
import { IReview, ModerationStatus } from '@sai-punjabi/shared';

export interface IReviewDocument extends Omit<IReview, '_id' | 'createdAt' | 'updatedAt' | 'customerId' | 'productId' | 'orderId'>, Document {
  customerId: mongoose.Types.ObjectId;
  productId?: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
      index: true,
    },
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminResponse: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

export const Review: Model<IReviewDocument> =
  mongoose.models.Review || mongoose.model<IReviewDocument>('Review', ReviewSchema);
