// User and Authentication Types
export type UserRole = 'customer' | 'admin';

export interface IAddress {
  _id?: string;
  label?: string; // 'Home', 'Work', 'Other'
  street: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  addresses: IAddress[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category Types
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// Product Variant and Add-On
export interface IProductVariant {
  name: string; // e.g. "Half", "Full", "Small", "Regular"
  price: number;
  compareAtPrice?: number;
}

export interface IProductAddOn {
  name: string; // e.g. "Extra Butter", "Green Chutney", "Sirka Onion"
  price: number;
}

// Product Types
export type SpiceLevel = 'mild' | 'medium' | 'spicy' | 'extra_spicy';

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description: string;
  categoryId: string | ICategory;
  price: number;
  compareAtPrice?: number;
  images: string[];
  isVegetarian: boolean;
  spiceLevel?: SpiceLevel;
  dietaryInfo?: string[];
  allergens?: string[];
  variants?: IProductVariant[];
  addOns?: IProductAddOn[];
  preparationTimeMinutes: number;
  isAvailable: boolean;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

// Cart Types
export interface ICartItemAddOn {
  name: string;
  price: number;
}

export interface ICartItem {
  productId: string;
  product?: IProduct;
  variantName?: string;
  addOns?: ICartItemAddOn[];
  quantity: number;
  unitPrice: number;
  itemSubtotal: number;
}

export interface ICartCalculation {
  items: ICartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  appliedPromotion?: {
    code: string;
    discountValue: number;
    description: string;
  };
}

// Order Status & Fulfillment
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded';

export type PaymentMethod =
  | 'online_razorpay'
  | 'cash_on_delivery';

export type FulfillmentMethod =
  | 'delivery'
  | 'pickup';

export interface IOrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string; // Admin ID or system
}

export interface IOrderItemSnapshot {
  productId: string;
  name: string;
  image?: string;
  isVegetarian: boolean;
  variantName?: string;
  addOns?: ICartItemAddOn[];
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  customerId: string | IUser;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  items: IOrderItemSnapshot[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  fulfillmentMethod: FulfillmentMethod;
  deliveryAddress?: IAddress;
  orderNotes?: string;
  appliedPromotion?: {
    promoCode: string;
    discountAmount: number;
    promotionId?: string;
    name?: string;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusHistory: IOrderStatusHistory[];
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment Types
export interface IPayment {
  _id: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Review Types
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface IReview {
  _id: string;
  customerId: string | { _id: string; name: string };
  customerName: string;
  productId?: string | { _id: string; name: string; slug: string };
  orderId?: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  moderationStatus: ModerationStatus;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

// Dynamic Festival Promotions
export type CampaignType = 'festival' | 'seasonal' | 'flash_sale' | 'general';
export type DiscountType = 'percentage' | 'fixed';
export type StackingPolicy = 'exclusive' | 'stackable';

export interface IPromotion {
  _id: string;
  name: string;
  slug: string;
  description: string;
  campaignType: CampaignType;
  festivalName?: string; // Diwali, Holi, Navratri, etc.
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number;
  minOrderValue: number;
  promoCode?: string;
  startAt: string;
  endAt: string;
  isActive: boolean;
  usageLimit?: number;
  perCustomerUsageLimit?: number;
  usageCount: number;
  applicableCategories?: string[];
  applicableProducts?: string[];
  stackingPolicy: StackingPolicy;
  bannerImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// Restaurant Settings
export interface IRestaurantSettings {
  _id?: string;
  restaurantName: string;
  tagline: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  openingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  taxPercentage: number;
  deliveryFeeDefault: number;
  freeDeliveryThreshold: number;
  isOrderingOpen: boolean;
  codEnabled: boolean;
  announcementBanner?: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  updatedAt?: string;
}

// Standard API Envelope
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
