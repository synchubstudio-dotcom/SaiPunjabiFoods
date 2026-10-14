import crypto from 'crypto';
import Razorpay from 'razorpay';
import { ENV } from '../config/env';

export class PaymentService {
  private static instance: Razorpay | null = null;

  public static getClient(): Razorpay | null {
    if (this.instance) return this.instance;

    // If test placeholder keys or not provided, return null (safe mock mode)
    if (
      !ENV.RAZORPAY_KEY_ID ||
      ENV.RAZORPAY_KEY_ID.includes('placeholder')
    ) {
      return null;
    }

    try {
      this.instance = new Razorpay({
        key_id: ENV.RAZORPAY_KEY_ID,
        key_secret: ENV.RAZORPAY_KEY_SECRET,
      });
      return this.instance;
    } catch (e) {
      console.warn('Razorpay client initialization failed, falling back to simulated mode.');
      return null;
    }
  }

  // Create Razorpay Order
  public static async createRazorpayOrder(
    amountInInr: number,
    orderNumber: string
  ): Promise<{ id: string; amount: number; currency: string }> {
    const client = this.getClient();
    const amountInPaise = Math.round(amountInInr * 100);

    if (client) {
      const razorpayOrder = await client.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          restaurant: 'Sai Punjabi',
        },
      });

      return {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount as number,
        currency: razorpayOrder.currency,
      };
    }

    // Simulated test mode when live Razorpay keys are not configured in local development
    const simulatedOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      id: simulatedOrderId,
      amount: amountInPaise,
      currency: 'INR',
    };
  }

  // Verify Razorpay Payment Signature
  public static verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    secret: string = process.env.RAZORPAY_KEY_SECRET || ENV.RAZORPAY_KEY_SECRET
  ): boolean {
    // If in simulation mode
    if (razorpayOrderId.startsWith('order_sim_')) {
      return true;
    }

    if (!secret) {
      return false;
    }

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
    const actualBuf = Buffer.from(razorpaySignature, 'utf-8');

    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  }

  // Verify Webhook Signature using raw request body
  public static verifyWebhookSignature(
    rawBody: Buffer | string,
    webhookSignature: string,
    webhookSecret: string = ENV.RAZORPAY_WEBHOOK_SECRET
  ): boolean {
    if (!webhookSecret || webhookSecret.includes('placeholder')) {
      return true;
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
    const actualBuf = Buffer.from(webhookSignature, 'utf-8');

    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  }
}
