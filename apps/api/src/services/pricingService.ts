import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { Promotion } from '../models/Promotion';
import { PromotionRedemption } from '../models/PromotionRedemption';
import { RestaurantSettings } from '../models/RestaurantSettings';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../constants';
import {
  ICartItem,
  ICartCalculation,
  FulfillmentMethod,
  IOrderItemSnapshot,
} from '@sai-punjabi/shared';

export interface CalculateCartOptions {
  items: Array<{
    productId: string;
    variantName?: string;
    addOns?: Array<{ name: string; price?: number }>;
    quantity: number;
  }>;
  promoCode?: string;
  fulfillmentMethod?: FulfillmentMethod;
  customerId?: string;
}

export interface VerifiedPricingResult {
  snapshots: IOrderItemSnapshot[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  appliedPromotion?: {
    promotionId: string;
    promoCode: string;
    name: string;
    discountAmount: number;
  };
}

export class PricingService {
  public static async calculateOrderPricing(
    options: CalculateCartOptions
  ): Promise<VerifiedPricingResult> {
    const { items, promoCode, fulfillmentMethod = 'delivery', customerId } = options;

    if (!items || items.length === 0) {
      throw new AppError('Cart must contain at least one dish', HTTP_STATUS.BAD_REQUEST);
    }

    // 1. Fetch restaurant settings for taxes & delivery
    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = await RestaurantSettings.create({});
    }

    // 2. Fetch all products in a single database query
    const productIds = items.map((i) => i.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    const snapshots: IOrderItemSnapshot[] = [];
    let subtotal = 0;

    for (const item of items) {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) {
        throw new AppError(
          `Dish with ID ${item.productId} was not found in the restaurant menu`,
          HTTP_STATUS.NOT_FOUND
        );
      }

      if (!dbProduct.isAvailable) {
        throw new AppError(
          `"${dbProduct.name}" is currently sold out or unavailable from the kitchen`,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Base price or variant price
      let unitPrice = dbProduct.price;
      let matchedVariantName: string | undefined = undefined;

      if (item.variantName && dbProduct.variants && dbProduct.variants.length > 0) {
        const foundVariant = dbProduct.variants.find(
          (v) => v.name.toLowerCase() === item.variantName!.toLowerCase()
        );
        if (foundVariant) {
          unitPrice = foundVariant.price;
          matchedVariantName = foundVariant.name;
        }
      }

      // Add-ons calculation based purely on database prices
      const verifiedAddOns: Array<{ name: string; price: number }> = [];
      if (item.addOns && item.addOns.length > 0 && dbProduct.addOns) {
        for (const requestedAddOn of item.addOns) {
          const dbAddOn = dbProduct.addOns.find(
            (a) => a.name.toLowerCase() === requestedAddOn.name.toLowerCase()
          );
          if (dbAddOn) {
            verifiedAddOns.push({ name: dbAddOn.name, price: dbAddOn.price });
            unitPrice += dbAddOn.price;
          }
        }
      }

      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      snapshots.push({
        productId: dbProduct._id.toString(),
        name: dbProduct.name,
        image: dbProduct.images && dbProduct.images.length > 0 ? dbProduct.images[0] : '',
        isVegetarian: dbProduct.isVegetarian,
        variantName: matchedVariantName,
        addOns: verifiedAddOns,
        quantity: item.quantity,
        unitPrice,
        subtotal: itemSubtotal,
      });
    }

    // 3. Promotional discount evaluation
    let discountAmount = 0;
    let appliedPromotion:
      | {
          promotionId: string;
          promoCode: string;
          name: string;
          discountAmount: number;
        }
      | undefined = undefined;

    if (promoCode && promoCode.trim() !== '') {
      const cleanCode = promoCode.trim().toUpperCase();
      const now = new Date();

      const promo = await Promotion.findOne({
        promoCode: cleanCode,
        isActive: true,
      });

      if (!promo) {
        throw new AppError(`Invalid or inactive coupon code "${cleanCode}"`, HTTP_STATUS.BAD_REQUEST);
      }

      if (now < promo.startAt) {
        throw new AppError(
          `Coupon "${cleanCode}" is not active yet. Starts on ${promo.startAt.toLocaleDateString()}`,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      if (now > promo.endAt) {
        throw new AppError(`Coupon "${cleanCode}" has expired`, HTTP_STATUS.BAD_REQUEST);
      }

      if (subtotal < promo.minOrderValue) {
        throw new AppError(
          `Coupon "${cleanCode}" requires a minimum order value of ₹${promo.minOrderValue}`,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
        throw new AppError(
          `Coupon "${cleanCode}" has reached its maximum usage limit`,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      if (customerId && promo.perCustomerUsageLimit) {
        const customerUsageCount = await PromotionRedemption.countDocuments({
          promotionId: promo._id,
          customerId,
        });

        if (customerUsageCount >= promo.perCustomerUsageLimit) {
          throw new AppError(
            `You have already used coupon "${cleanCode}" the maximum allowed number of times`,
            HTTP_STATUS.BAD_REQUEST
          );
        }
      }

      // Calculate discount amount
      if (promo.discountType === 'percentage') {
        let calculated = (subtotal * promo.discountValue) / 100;
        if (promo.maxDiscount && promo.maxDiscount > 0) {
          calculated = Math.min(calculated, promo.maxDiscount);
        }
        discountAmount = Math.round(calculated * 100) / 100;
      } else {
        // Fixed discount
        discountAmount = Math.min(promo.discountValue, subtotal);
      }

      appliedPromotion = {
        promotionId: promo._id.toString(),
        promoCode: promo.promoCode || cleanCode,
        name: promo.name,
        discountAmount,
      };
    }

    // 4. Delivery Fee
    let deliveryFee = 0;
    if (fulfillmentMethod === 'delivery') {
      if (subtotal >= settings.freeDeliveryThreshold) {
        deliveryFee = 0; // Free delivery threshold met!
      } else {
        deliveryFee = settings.deliveryFeeDefault;
      }
    }

    // 5. Taxes (GST applied to taxable subtotal after discount)
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round((taxableAmount * (settings.taxPercentage / 100)) * 100) / 100;

    // 6. Final grand total
    const totalAmount = Math.max(0, taxableAmount + taxAmount + deliveryFee);

    return {
      snapshots,
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount,
      taxAmount,
      deliveryFee,
      totalAmount: Math.round(totalAmount * 100) / 100,
      appliedPromotion,
    };
  }
}
