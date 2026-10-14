import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or local api directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5000',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',

  // MongoDB
  MONGODB_URI:
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sai_punjabi_db',

  // Auth & Security
  JWT_SECRET: process.env.JWT_SECRET || 'sai_punjabi_super_secret_jwt_key_2026_dev',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_NAME: process.env.COOKIE_NAME || 'sai_punjabi_token',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'sai_punjabi_cookie_signing_secret',

  // Admin seed
  ADMIN_NAME: process.env.ADMIN_NAME || 'Sai Punjabi Administrator',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@saipunjabifoods.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@SaiPunjabi2026!',
  ADMIN_PHONE: process.env.ADMIN_PHONE || '+919876543210',

  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_id',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_test_webhook_secret',

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  // Restaurant defaults
  RESTAURANT_NAME: process.env.RESTAURANT_NAME || 'Sai Punjabi',
  RESTAURANT_TAGLINE:
    process.env.RESTAURANT_TAGLINE || 'Authentic Amritsari & Punjabi Cuisine',
  TAX_RATE_PERCENTAGE: parseFloat(process.env.TAX_RATE_PERCENTAGE || '5.0'),
  DELIVERY_FEE_DEFAULT: parseFloat(process.env.DELIVERY_FEE_DEFAULT || '40.0'),
  FREE_DELIVERY_THRESHOLD: parseFloat(process.env.FREE_DELIVERY_THRESHOLD || '499.0'),
  CASH_ON_DELIVERY_ENABLED: process.env.CASH_ON_DELIVERY_ENABLED !== 'false',
};
