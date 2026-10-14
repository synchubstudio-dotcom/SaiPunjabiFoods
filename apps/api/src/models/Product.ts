import mongoose, { Document, Schema, Model } from 'mongoose';
import { IProduct, IProductVariant, IProductAddOn, SpiceLevel } from '@sai-punjabi/shared';

export interface IProductDocument extends Omit<IProduct, '_id' | 'createdAt' | 'updatedAt' | 'categoryId'>, Document {
  categoryId: mongoose.Types.ObjectId;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
  },
  { _id: false }
);

const ProductAddOnSchema = new Schema<IProductAddOn>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [1, 'Price must be positive'],
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    images: {
      type: [String],
      required: [true, 'At least one product image is required'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'Product must have at least one image',
      },
    },
    isVegetarian: {
      type: Boolean,
      default: true,
      index: true,
    },
    spiceLevel: {
      type: String,
      enum: ['mild', 'medium', 'spicy', 'extra_spicy'],
      default: 'medium',
    },
    dietaryInfo: {
      type: [String],
      default: [],
    },
    allergens: {
      type: [String],
      default: [],
    },
    variants: [ProductVariantSchema],
    addOns: [ProductAddOnSchema],
    preparationTimeMinutes: {
      type: Number,
      default: 20,
      min: 5,
      max: 180,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    seoTitle: {
      type: String,
      trim: true,
    },
    seoDescription: {
      type: String,
      trim: true,
    },
    averageRating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and category filtering
ProductSchema.index({ name: 'text', description: 'text', shortDescription: 'text' });
ProductSchema.index({ categoryId: 1, isAvailable: 1, price: 1 });

export const Product: Model<IProductDocument> =
  mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);
