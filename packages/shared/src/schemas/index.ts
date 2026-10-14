import { z } from 'zod';

// Address Schema
export const addressSchema = z.object({
  label: z.string().optional().default('Home'),
  street: z.string().min(3, 'Street address is required'),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().regex(/^[1-9][0-9]{5}$/, 'Invalid Indian 6-digit PIN code'),
  isDefault: z.boolean().optional().default(false),
});

// Authentication Schemas
export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  phone: z
    .string()
    .regex(/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/, 'Please enter a valid Indian mobile number')
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  phone: z
    .string()
    .regex(/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/, 'Please enter a valid Indian mobile number')
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

// Category Schemas
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required').max(100),
  slug: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// Product Variant and Add-on Schemas
export const productVariantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  price: z.number().positive('Price must be greater than 0'),
  compareAtPrice: z.number().positive().optional(),
});

export const productAddOnSchema = z.object({
  name: z.string().min(1, 'Add-on name is required'),
  price: z.number().min(0, 'Price must be 0 or positive'),
});

// Product Schemas
export const createProductSchema = z.object({
  name: z.string().min(2, 'Dish name is required').max(120),
  slug: z.string().optional(),
  shortDescription: z.string().max(250).optional(),
  description: z.string().min(10, 'Detailed description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  price: z.number().positive('Base price must be greater than 0'),
  compareAtPrice: z.number().positive().optional(),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
  isVegetarian: z.boolean().default(true),
  spiceLevel: z.enum(['mild', 'medium', 'spicy', 'extra_spicy']).default('medium'),
  dietaryInfo: z.array(z.string()).optional().default([]),
  allergens: z.array(z.string()).optional().default([]),
  variants: z.array(productVariantSchema).optional().default([]),
  addOns: z.array(productAddOnSchema).optional().default([]),
  preparationTimeMinutes: z.number().int().min(5).max(180).default(20),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

// Cart Schemas
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantName: z.string().optional(),
  addOns: z.array(productAddOnSchema).optional().default([]),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(50),
});

export const calculateCartSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'Cart cannot be empty'),
  promoCode: z.string().optional(),
  fulfillmentMethod: z.enum(['delivery', 'pickup']).default('delivery'),
});

// Checkout Schema
export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'Order must contain at least one item'),
  fulfillmentMethod: z.enum(['delivery', 'pickup']),
  deliveryAddress: addressSchema.optional(),
  orderNotes: z.string().max(500).optional(),
  promoCode: z.string().optional(),
  paymentMethod: z.enum(['online_razorpay', 'cash_on_delivery']),
  customerDetails: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().regex(/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/, 'Valid phone number is required'),
  }),
}).refine(
  (data) => {
    if (data.fulfillmentMethod === 'delivery' && !data.deliveryAddress) {
      return false;
    }
    return true;
  },
  {
    message: 'Delivery address is mandatory for delivery orders',
    path: ['deliveryAddress'],
  }
);

// Payment Verification Schema
export const razorpayVerifySchema = z.object({
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required'),
  orderId: z.string().min(1, 'Internal order ID is required'),
});

// Order Status Update Schema
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'preparing',
    'ready_for_pickup',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ]),
  note: z.string().max(300).optional(),
  estimatedDeliveryTime: z.string().optional(),
});

// Review Schemas
export const createReviewSchema = z.object({
  productId: z.string().optional(),
  orderId: z.string().optional(),
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5),
  title: z.string().min(2, 'Review title is required').max(100),
  comment: z.string().min(5, 'Review content must be at least 5 characters').max(1000),
});

export const moderateReviewSchema = z.object({
  moderationStatus: z.enum(['pending', 'approved', 'rejected']),
  adminResponse: z.string().max(500).optional(),
});

// Promotion Schemas
export const createPromotionSchema = z.object({
  name: z.string().min(2, 'Promotion title is required').max(100),
  slug: z.string().optional(),
  description: z.string().min(5, 'Description is required').max(500),
  campaignType: z.enum(['festival', 'seasonal', 'flash_sale', 'general']),
  festivalName: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive('Discount value must be greater than 0'),
  maxDiscount: z.number().positive().optional(),
  minOrderValue: z.number().min(0).default(0),
  promoCode: z.string().min(3).max(20).toUpperCase().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  isActive: z.boolean().default(true),
  usageLimit: z.number().int().positive().optional(),
  perCustomerUsageLimit: z.number().int().positive().optional(),
  applicableCategories: z.array(z.string()).optional().default([]),
  applicableProducts: z.array(z.string()).optional().default([]),
  stackingPolicy: z.enum(['exclusive', 'stackable']).default('exclusive'),
  bannerImage: z.string().url().optional().or(z.literal('')),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const updatePromotionSchema = createPromotionSchema.partial();

export const applyPromoSchema = z.object({
  code: z.string().min(1, 'Promo code is required').toUpperCase(),
  cartSubtotal: z.number().positive('Cart subtotal must be greater than 0'),
});

// Settings Schema
export const updateSettingsSchema = z.object({
  restaurantName: z.string().min(2).optional(),
  tagline: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z
    .object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(),
      country: z.string(),
    })
    .optional(),
  openingHours: z.record(z.string()).optional(),
  taxPercentage: z.number().min(0).max(50).optional(),
  deliveryFeeDefault: z.number().min(0).optional(),
  freeDeliveryThreshold: z.number().min(0).optional(),
  isOrderingOpen: z.boolean().optional(),
  codEnabled: z.boolean().optional(),
  announcementBanner: z
    .object({
      enabled: z.boolean(),
      text: z.string(),
      link: z.string().optional(),
    })
    .optional(),
  socialLinks: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      twitter: z.string().optional(),
      youtube: z.string().optional(),
    })
    .optional(),
});
