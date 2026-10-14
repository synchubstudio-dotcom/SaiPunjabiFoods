import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../middleware/errorHandler';

// POST /api/v1/reviews
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, orderId, rating, title, comment } = req.body;
    const customerId = req.user!._id;

    // Check verified purchase eligibility:
    // User must have at least one delivered order
    let isVerifiedPurchase = false;
    const orderQuery: any = {
      customerId,
      orderStatus: 'delivered',
    };

    if (orderId) {
      orderQuery._id = orderId;
    }

    if (productId) {
      orderQuery['items.productId'] = productId;
    }

    const eligibleOrder = await Order.findOne(orderQuery);
    if (eligibleOrder) {
      isVerifiedPurchase = true;
    }

    // Check for duplicate review from this customer for the same product or order
    const duplicateQuery: any = { customerId };
    if (productId) duplicateQuery.productId = productId;
    if (orderId) duplicateQuery.orderId = orderId;

    const existingReview = await Review.findOne(duplicateQuery);
    if (existingReview) {
      throw new AppError(
        'You have already submitted a review for this purchase',
        HTTP_STATUS.CONFLICT
      );
    }

    const review = await Review.create({
      customerId,
      customerName: req.user!.name,
      productId,
      orderId,
      rating,
      title,
      comment,
      isVerifiedPurchase,
      moderationStatus: 'approved', // Auto-approved or pending based on moderation policy
    });

    // Update product rating aggregate if product review
    if (productId) {
      const stats = await Review.aggregate([
        { $match: { productId: review.productId, moderationStatus: 'approved' } },
        {
          $group: {
            _id: '$productId',
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ]);

      if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
          averageRating: Math.round(stats[0].avgRating * 10) / 10,
          totalReviews: stats[0].count,
        });
      }
    }

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Thank you! Your review has been submitted.',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/reviews
export const getReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, page = '1', limit = '10' } = req.query;
    const query: any = { moderationStatus: 'approved' };

    if (productId) {
      query.productId = productId;
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Review.countDocuments(query),
    ]);

    // Calculate rating distribution
    const ratingBreakdown = await Review.aggregate([
      { $match: query },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        reviews,
        ratingBreakdown,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/reviews/admin (Admin)
export const getAdminReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const query: any = {};
    if (status) query.moderationStatus = status;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('productId', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Review.countDocuments(query),
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/reviews/:id/moderate (Admin)
export const moderateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { moderationStatus, adminResponse } = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
      {
        moderationStatus,
        adminResponse,
      },
      { new: true }
    );

    if (!review) {
      throw new AppError('Review not found', HTTP_STATUS.NOT_FOUND);
    }

    // Recalculate average rating for product if applicable
    if (review.productId) {
      const stats = await Review.aggregate([
        { $match: { productId: review.productId, moderationStatus: 'approved' } },
        {
          $group: {
            _id: '$productId',
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ]);

      if (stats.length > 0) {
        await Product.findByIdAndUpdate(review.productId, {
          averageRating: Math.round(stats[0].avgRating * 10) / 10,
          totalReviews: stats[0].count,
        });
      }
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Review marked as ${moderationStatus}`,
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};
