import { Request, Response, NextFunction } from 'express';
import { Cart } from '../models/Cart';
import { PricingService } from '../services/pricingService';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../middleware/errorHandler';

// POST /api/v1/cart/calculate
export const calculateCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, promoCode, fulfillmentMethod } = req.body;
    const customerId = req.user?._id?.toString();

    const calculation = await PricingService.calculateOrderPricing({
      items,
      promoCode,
      fulfillmentMethod,
      customerId,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: calculation,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/cart
export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.user?._id;
    const sessionId = (req.headers['x-session-id'] as string) || req.query.sessionId;

    if (!customerId && !sessionId) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { cart: null },
      });
    }

    const query = customerId ? { customerId } : { sessionId };
    const cart = await Cart.findOne(query).populate('items.productId');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/cart
export const saveCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, appliedPromoCode, sessionId } = req.body;
    const customerId = req.user?._id;
    const activeSessionId = customerId ? undefined : (sessionId || req.headers['x-session-id']);

    if (!customerId && !activeSessionId) {
      throw new AppError('Customer or session identifier is required to save cart', HTTP_STATUS.BAD_REQUEST);
    }

    const query = customerId ? { customerId } : { sessionId: activeSessionId };

    const cart = await Cart.findOneAndUpdate(
      query,
      {
        customerId,
        sessionId: activeSessionId,
        items,
        appliedPromoCode,
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Cart updated',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/cart
export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.user?._id;
    const sessionId = (req.headers['x-session-id'] as string) || req.query.sessionId;

    const query = customerId ? { customerId } : { sessionId };
    await Cart.findOneAndDelete(query);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/cart/merge
export const mergeGuestCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required to merge cart', HTTP_STATUS.UNAUTHORIZED);
    }

    const { guestItems } = req.body;
    if (!Array.isArray(guestItems) || guestItems.length === 0) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'No guest items to merge',
      });
    }

    let customerCart = await Cart.findOne({ customerId: req.user._id });
    if (!customerCart) {
      customerCart = new Cart({ customerId: req.user._id, items: [] });
    }

    // Merge logic: if same productId and variant exists, sum quantities, else push
    for (const guestItem of guestItems) {
      const existing = customerCart.items.find(
        (ci: any) =>
          ci.productId.toString() === guestItem.productId &&
          (ci.variantName || '') === (guestItem.variantName || '')
      );

      if (existing) {
        existing.quantity = Math.min(50, existing.quantity + (guestItem.quantity || 1));
      } else {
        customerCart.items.push(guestItem);
      }
    }

    await customerCart.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Cart merged successfully',
      data: { cart: customerCart },
    });
  } catch (error) {
    next(error);
  }
};
