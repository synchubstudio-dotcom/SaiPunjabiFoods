import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPromotionRedemptionDocument extends Document {
  promotionId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  promoCode?: string;
  discountApplied: number;
  redeemedAt: Date;
}

const PromotionRedemptionSchema = new Schema<IPromotionRedemptionDocument>(
  {
    promotionId: {
      type: Schema.Types.ObjectId,
      ref: 'Promotion',
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    promoCode: {
      type: String,
      uppercase: true,
      trim: true,
    },
    discountApplied: {
      type: Number,
      required: true,
      min: 0,
    },
    redeemedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate promo redemption on the same order
PromotionRedemptionSchema.index({ promotionId: 1, orderId: 1 }, { unique: true });
PromotionRedemptionSchema.index({ promotionId: 1, customerId: 1 });

export const PromotionRedemption: Model<IPromotionRedemptionDocument> =
  mongoose.models.PromotionRedemption ||
  mongoose.model<IPromotionRedemptionDocument>('PromotionRedemption', PromotionRedemptionSchema);
