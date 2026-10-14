import { Request, Response, NextFunction } from 'express';
import { Promotion } from '../models/Promotion';
import { PromotionRedemption } from '../models/PromotionRedemption';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../middleware/errorHandler';

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

// GET /api/v1/promotions/active
export const getActivePromotions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const promotions = await Promotion.find({
      isActive: true,
      startAt: { $lte: now },
      endAt: { $gte: now },
    }).sort({ createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { promotions },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/promotions/validate-code
export const validatePromoCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, cartSubtotal } = req.body;
    const cleanCode = code.trim().toUpperCase();
    const now = new Date();

    const promo = await Promotion.findOne({
      promoCode: cleanCode,
      isActive: true,
    });

    if (!promo) {
      throw new AppError(`Coupon "${cleanCode}" is invalid or inactive`, HTTP_STATUS.BAD_REQUEST);
    }

    if (now < promo.startAt) {
      throw new AppError(
        `Campaign "${promo.name}" starts on ${promo.startAt.toLocaleDateString()}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (now > promo.endAt) {
      throw new AppError(`Coupon "${cleanCode}" has expired`, HTTP_STATUS.BAD_REQUEST);
    }

    if (cartSubtotal < promo.minOrderValue) {
      throw new AppError(
        `Coupon requires a minimum order value of ₹${promo.minOrderValue}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      throw new AppError(
        `Coupon "${cleanCode}" has reached its maximum total redemptions`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Per-customer check if authenticated
    if (req.user && promo.perCustomerUsageLimit) {
      const redemptions = await PromotionRedemption.countDocuments({
        promotionId: promo._id,
        customerId: req.user._id,
      });

      if (redemptions >= promo.perCustomerUsageLimit) {
        throw new AppError(
          `You have already used coupon "${cleanCode}" the maximum allowed number of times`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      let calculated = (cartSubtotal * promo.discountValue) / 100;
      if (promo.maxDiscount && promo.maxDiscount > 0) {
        calculated = Math.min(calculated, promo.maxDiscount);
      }
      discountAmount = Math.round(calculated * 100) / 100;
    } else {
      discountAmount = Math.min(promo.discountValue, cartSubtotal);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Coupon "${cleanCode}" applied! You save ₹${discountAmount}`,
      data: {
        promotionId: promo._id,
        promoCode: cleanCode,
        name: promo.name,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discountAmount,
        minOrderValue: promo.minOrderValue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/promotions (Admin)
export const getAllPromotions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const promotions = await Promotion.find().sort({ startAt: -1 });
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { promotions },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/promotions (Admin)
export const createPromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, promoCode } = req.body;
    let slug = req.body.slug ? slugify(req.body.slug) : slugify(name);

    const existing = await Promotion.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const promo = await Promotion.create({
      ...req.body,
      slug,
      promoCode: promoCode ? promoCode.toUpperCase().trim() : undefined,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Promotion campaign created successfully',
      data: { promotion: promo },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/promotions/:id (Admin)
export const updatePromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.promoCode) {
      updates.promoCode = updates.promoCode.toUpperCase().trim();
    }

    const promo = await Promotion.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!promo) {
      throw new AppError('Promotion not found', HTTP_STATUS.NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Promotion updated successfully',
      data: { promotion: promo },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/promotions/:id (Admin)
export const deletePromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const promo = await Promotion.findByIdAndDelete(id);

    if (!promo) {
      throw new AppError('Promotion not found', HTTP_STATUS.NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Promotion campaign deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/promotions/:id/redemptions (Admin)
export const getPromotionRedemptions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const redemptions = await PromotionRedemption.find({ promotionId: id })
      .populate('customerId', 'name email phone')
      .populate('orderId', 'orderNumber totalAmount createdAt')
      .sort({ redeemedAt: -1 })
      .limit(100);

    const totalDiscountGiven = redemptions.reduce(
      (sum, r) => sum + (r.discountApplied || 0),
      0
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        redemptions,
        totalRedemptions: redemptions.length,
        totalDiscountGiven,
      },
    });
  } catch (error) {
    next(error);
  }
};
