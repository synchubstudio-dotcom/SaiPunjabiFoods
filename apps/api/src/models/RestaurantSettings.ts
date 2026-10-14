import mongoose, { Document, Schema, Model } from 'mongoose';
import { IRestaurantSettings } from '@sai-punjabi/shared';

export interface IRestaurantSettingsDocument extends Omit<IRestaurantSettings, '_id' | 'updatedAt'>, Document {}

const RestaurantSettingsSchema = new Schema<IRestaurantSettingsDocument>(
  {
    restaurantName: {
      type: String,
      required: true,
      default: 'Sai Punjabi',
    },
    tagline: {
      type: String,
      default: 'Authentic Amritsari & Punjabi Cuisine',
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
    },
    email: {
      type: String,
      default: 'hello@saipunjabifoods.com',
    },
    address: {
      street: { type: String, default: 'Plot 42, Punjabi Bagh Main Market' },
      city: { type: String, default: 'New Delhi' },
      state: { type: String, default: 'Delhi' },
      postalCode: { type: String, default: '110026' },
      country: { type: String, default: 'India' },
    },
    openingHours: {
      monday: { type: String, default: '11:00 AM - 11:00 PM' },
      tuesday: { type: String, default: '11:00 AM - 11:00 PM' },
      wednesday: { type: String, default: '11:00 AM - 11:00 PM' },
      thursday: { type: String, default: '11:00 AM - 11:00 PM' },
      friday: { type: String, default: '11:00 AM - 11:30 PM' },
      saturday: { type: String, default: '11:00 AM - 11:30 PM' },
      sunday: { type: String, default: '11:00 AM - 11:30 PM' },
    },
    taxPercentage: {
      type: Number,
      default: 5.0, // 5% GST for restaurants in India
      min: 0,
      max: 50,
    },
    deliveryFeeDefault: {
      type: Number,
      default: 40.0,
      min: 0,
    },
    freeDeliveryThreshold: {
      type: Number,
      default: 499.0,
      min: 0,
    },
    isOrderingOpen: {
      type: Boolean,
      default: true,
    },
    codEnabled: {
      type: Boolean,
      default: true,
    },
    announcementBanner: {
      enabled: { type: Boolean, default: true },
      text: { type: String, default: '🌟 Festive Special: Get 20% OFF on all Tandoori & Biryani delights! Use code DIWALI20' },
      link: { type: String, default: '/menu' },
    },
    socialLinks: {
      instagram: { type: String, default: 'https://instagram.com/saipunjabi' },
      facebook: { type: String, default: 'https://facebook.com/saipunjabi' },
      twitter: { type: String, default: 'https://twitter.com/saipunjabi' },
      youtube: { type: String, default: 'https://youtube.com/saipunjabi' },
    },
  },
  {
    timestamps: true,
  }
);

export const RestaurantSettings: Model<IRestaurantSettingsDocument> =
  mongoose.models.RestaurantSettings ||
  mongoose.model<IRestaurantSettingsDocument>('RestaurantSettings', RestaurantSettingsSchema);
