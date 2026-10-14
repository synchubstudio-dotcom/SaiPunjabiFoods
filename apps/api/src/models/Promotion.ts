import mongoose, { Document, Schema, Model } from 'mongoose';
import {
  IPromotion,
  CampaignType,
  DiscountType,
  StackingPolicy,
} from '@sai-punjabi/shared';

export interface IPromotionDocument extends Omit<IPromotion, '_id' | 'createdAt' | 'updatedAt' | 'startAt' | 'endAt'>, Document {
  startAt: Date;
  endAt: Date;
}

const PromotionSchema = new Schema<IPromotionDocument>(
  {
    name: {
      type: String,
      required: [true, 'Promotion name is required'],
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: [true, 'Promotion slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    campaignType: {
      type: String,
      enum: ['festival', 'seasonal', 'flash_sale', 'general'],
      default: 'festival',
      index: true,
    },
    festivalName: {
      type: String,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: [1, 'Discount value must be greater than 0'],
    },
    maxDiscount: {
      type: Number,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    promoCode: {
      type: String,
      trim: true,
      uppercase: true,
      index: { unique: true, sparse: true },
    },
    startAt: {
      type: Date,
      required: true,
      index: true,
    },
    endAt: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    usageLimit: {
      type: Number,
      min: 1,
    },
    perCustomerUsageLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    applicableCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    stackingPolicy: {
      type: String,
      enum: ['exclusive', 'stackable'],
      default: 'exclusive',
    },
    bannerImage: {
      type: String,
      default: '',
    },
    seoTitle: {
      type: String,
      trim: true,
    },
    seoDescription: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Promotion: Model<IPromotionDocument> =
  mongoose.models.Promotion || mongoose.model<IPromotionDocument>('Promotion', PromotionSchema);
