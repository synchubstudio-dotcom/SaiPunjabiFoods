import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICartItemSchema {
  productId: mongoose.Types.ObjectId;
  variantName?: string;
  addOns?: Array<{ name: string; price: number }>;
  quantity: number;
}

export interface ICartDocument extends Document {
  customerId?: mongoose.Types.ObjectId;
  sessionId?: string;
  items: ICartItemSchema[];
  appliedPromoCode?: string;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItemSchema>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantName: { type: String },
    addOns: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
      default: 1,
    },
  },
  { _id: true }
);

const CartSchema = new Schema<ICartDocument>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    items: [CartItemSchema],
    appliedPromoCode: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically clear guest carts after 14 days
CartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 14 * 24 * 60 * 60 });

export const Cart: Model<ICartDocument> =
  mongoose.models.Cart || mongoose.model<ICartDocument>('Cart', CartSchema);
