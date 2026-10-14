import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Promotion } from '../models/Promotion';
import { PromotionRedemption } from '../models/PromotionRedemption';
import { Review } from '../models/Review';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../middleware/errorHandler';

// GET /api/v1/admin/dashboard-stats
export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      revenueStats,
      todayRevenueStats,
      activePromotionsCount,
      totalCustomers,
      recentOrders,
      recentReviews,
      popularDishesAgg,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: { $in: ['pending', 'confirmed', 'preparing', 'out_for_delivery'] } }),
      Order.countDocuments({ orderStatus: 'delivered' }),
      Order.countDocuments({ orderStatus: 'cancelled' }),

      // Total verified revenue
      Order.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
      ]),

      // Today's revenue
      Order.aggregate([
        { $match: { paymentStatus: 'completed', createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, todayRevenue: { $sum: '$totalAmount' } } },
      ]),

      // Active promotions
      Promotion.countDocuments({
        isActive: true,
        startAt: { $lte: now },
        endAt: { $gte: now },
      }),

      // Total registered customers
      User.countDocuments({ role: 'customer' }),

      // Recent 8 orders
      Order.find().sort({ createdAt: -1 }).limit(8),

      // Recent reviews
      Review.find().sort({ createdAt: -1 }).limit(5),

      // Popular dishes aggregation
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.name' },
            isVegetarian: { $first: '$items.isVegetarian' },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.subtotal' },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 6 },
      ]),
    ]);

    const totalRevenue = revenueStats[0]?.totalRevenue || 0;
    const todayRevenue = todayRevenueStats[0]?.todayRevenue || 0;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        todayRevenue: Math.round(todayRevenue * 100) / 100,
        activePromotionsCount,
        totalCustomers,
        popularDishes: popularDishesAgg,
        recentOrders,
        recentReviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/admin/customers
export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page = '1', limit = '20' } = req.query;
    const query: any = { role: 'customer' };

    if (search && typeof search === 'string' && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [customers, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    // Attach order summary for each customer
    const customerIds = customers.map((c) => c._id);
    const orderAggregates = await Order.aggregate([
      { $match: { customerId: { $in: customerIds } } },
      {
        $group: {
          _id: '$customerId',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
        },
      },
    ]);

    const orderMap = new Map(orderAggregates.map((oa) => [oa._id.toString(), oa]));

    const enrichedCustomers = customers.map((c) => {
      const summary = orderMap.get(c._id.toString());
      return {
        ...c.toJSON(),
        orderCount: summary?.orderCount || 0,
        totalSpent: summary?.totalSpent || 0,
      };
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        customers: enrichedCustomers,
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

// PATCH /api/v1/admin/customers/:id/toggle-status
export const toggleCustomerStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      throw new AppError('Customer not found', HTTP_STATUS.NOT_FOUND);
    }

    if (user.role === 'admin') {
      throw new AppError('Cannot deactivate administrator accounts through customer management', HTTP_STATUS.FORBIDDEN);
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Customer account has been ${user.isActive ? 'activated' : 'deactivated'}`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
