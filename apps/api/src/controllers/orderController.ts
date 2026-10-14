import { Request, Response, NextFunction } from 'express';
import { Order, generateOrderNumber } from '../models/Order';
import { Promotion } from '../models/Promotion';
import { PromotionRedemption } from '../models/PromotionRedemption';
import { PricingService } from '../services/pricingService';
import { PaymentService } from '../services/paymentService';
import { emitNewOrder, emitOrderStatusUpdate } from '../sockets/orderSocket';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../middleware/errorHandler';
import { OrderStatus } from '@sai-punjabi/shared';

// Allowed state transitions map
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_pickup', 'out_for_delivery', 'cancelled'],
  ready_for_pickup: ['delivered', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

// POST /api/v1/orders
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      items,
      fulfillmentMethod,
      deliveryAddress,
      orderNotes,
      promoCode,
      paymentMethod,
      customerDetails,
    } = req.body;

    const customerId = req.user ? req.user._id : undefined;

    if (!customerId) {
      throw new AppError('Please log in or create an account to place an order', HTTP_STATUS.UNAUTHORIZED);
    }

    // 1. Server-side price & discount recalculation (Never trust client totals!)
    const pricing = await PricingService.calculateOrderPricing({
      items,
      promoCode,
      fulfillmentMethod,
      customerId: customerId.toString(),
    });

    const orderNumber = generateOrderNumber();

    // 2. Prepare Razorpay order if online payment
    let razorpayOrderId: string | undefined = undefined;
    if (paymentMethod === 'online_razorpay') {
      const razorpayRes = await PaymentService.createRazorpayOrder(
        pricing.totalAmount,
        orderNumber
      );
      razorpayOrderId = razorpayRes.id;
    }

    // 3. Create Order document
    const initialStatus: OrderStatus =
      paymentMethod === 'cash_on_delivery' ? 'confirmed' : 'pending';

    const order = await Order.create({
      orderNumber,
      customerId,
      customerDetails: {
        name: customerDetails?.name || req.user?.name || '',
        email: customerDetails?.email || req.user?.email || '',
        phone: customerDetails?.phone || req.user?.phone || '',
      },
      items: pricing.snapshots,
      subtotal: pricing.subtotal,
      discountAmount: pricing.discountAmount,
      taxAmount: pricing.taxAmount,
      deliveryFee: pricing.deliveryFee,
      totalAmount: pricing.totalAmount,
      fulfillmentMethod,
      deliveryAddress: fulfillmentMethod === 'delivery' ? deliveryAddress : undefined,
      orderNotes,
      appliedPromotion: pricing.appliedPromotion,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: initialStatus,
      statusHistory: [
        {
          status: initialStatus,
          timestamp: new Date().toISOString(),
          note:
            paymentMethod === 'cash_on_delivery'
              ? 'Order placed with Cash on Delivery'
              : 'Order created, awaiting online payment',
          updatedBy: 'System',
        },
      ],
      razorpayOrderId,
      estimatedDeliveryTime: '35-45 mins',
    });

    // 4. If promotion applied, register atomic redemption
    if (pricing.appliedPromotion) {
      try {
        await Promise.all([
          PromotionRedemption.create({
            promotionId: pricing.appliedPromotion.promotionId,
            customerId,
            orderId: order._id,
            promoCode: pricing.appliedPromotion.promoCode,
            discountApplied: pricing.appliedPromotion.discountAmount,
          }),
          Promotion.findByIdAndUpdate(pricing.appliedPromotion.promotionId, {
            $inc: { usageCount: 1 },
          }),
        ]);
      } catch (e) {
        console.error('Error logging promotion redemption:', e);
      }
    }

    // 5. Emit real-time notification to admin room
    emitNewOrder(order);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order,
        razorpay:
          paymentMethod === 'online_razorpay'
            ? {
                orderId: razorpayOrderId,
                amount: Math.round(pricing.totalAmount * 100),
                currency: 'INR',
              }
            : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/orders/my-orders
export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ customerId: req.user!._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ customerId: req.user!._id }),
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/orders/:id
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    let query: any = { _id: id };

    // If not admin, restrict to own order
    if (req.user?.role !== 'admin') {
      query.customerId = req.user?._id;
    }

    const order = await Order.findOne(query);
    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/orders/track/:orderNumber
export const trackOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderNumber } = req.params;

    let query: any = {};
    if (orderNumber.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: orderNumber };
    } else {
      query = { orderNumber: orderNumber.toUpperCase() };
    }

    const order = await Order.findOne(query).select(
      'orderNumber items fulfillmentMethod deliveryAddress totalAmount orderStatus paymentStatus statusHistory estimatedDeliveryTime customerDetails.name createdAt'
    );

    if (!order) {
      throw new AppError('No order found matching the provided reference', HTTP_STATUS.NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/orders (Admin)
export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      status,
      paymentStatus,
      fulfillmentMethod,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    const query: any = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (fulfillmentMethod) query.fulfillmentMethod = fulfillmentMethod;

    if (search && typeof search === 'string' && search.trim() !== '') {
      query.$or = [
        { orderNumber: { $regex: search.trim(), $options: 'i' } },
        { 'customerDetails.name': { $regex: search.trim(), $options: 'i' } },
        { 'customerDetails.phone': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(query),
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        orders,
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

// PATCH /api/v1/orders/:id/status (Admin)
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, note, estimatedDeliveryTime } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
    }

    const currentStatus = order.orderStatus as OrderStatus;
    const targetStatus = status as OrderStatus;

    // Validate state machine transition
    const allowedTargets = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowedTargets.includes(targetStatus) && currentStatus !== targetStatus) {
      throw new AppError(
        `Invalid status transition: Cannot transition order from "${currentStatus}" to "${targetStatus}". Permitted transitions: ${allowedTargets.join(', ')}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    order.orderStatus = targetStatus;
    if (estimatedDeliveryTime) {
      order.estimatedDeliveryTime = estimatedDeliveryTime;
    }

    // Add status history entry
    order.statusHistory.push({
      status: targetStatus,
      timestamp: new Date().toISOString(),
      note: note || `Order status updated to ${targetStatus}`,
      updatedBy: req.user?.name || 'Admin',
    });

    await order.save();

    // Emit real-time WebSocket update
    emitOrderStatusUpdate(order._id.toString(), order);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Order status successfully changed to ${targetStatus}`,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
