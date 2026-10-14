import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { PaymentService } from '../src/services/paymentService';
import { signToken, verifyToken } from '../src/utils/token';
import {
  signupSchema,
  checkoutSchema,
  createPromotionSchema,
} from '@sai-punjabi/shared';

describe('Security & Payment Verification Unit Tests', () => {
  it('should accurately verify authentic Razorpay HMAC-SHA256 signature', () => {
    const orderId = 'order_test_12345';
    const paymentId = 'pay_test_67890';
    const secret = 'test_secret_key_sai_punjabi';

    // Simulate server ENV
    const originalSecret = process.env.RAZORPAY_KEY_SECRET;
    process.env.RAZORPAY_KEY_SECRET = secret;

    const payload = `${orderId}|${paymentId}`;
    const authenticSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const isValid = PaymentService.verifyPaymentSignature(
      orderId,
      paymentId,
      authenticSignature
    );

    expect(isValid).toBe(true);

    // Tampered signature should strictly fail
    const isTamperedValid = PaymentService.verifyPaymentSignature(
      orderId,
      paymentId,
      'tampered_bad_signature_00000000000000000000000000000000000000000000'
    );
    expect(isTamperedValid).toBe(false);

    process.env.RAZORPAY_KEY_SECRET = originalSecret;
  });

  it('should sign and verify JWT tokens containing user role and email', () => {
    const payload = {
      userId: '64e1f73b60c04f2d3a9b1234',
      role: 'customer',
      email: 'customer@example.com',
    };

    const token = signToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.email).toBe(payload.email);
  });

  it('should enforce strict Indian phone number and password requirements in signupSchema', () => {
    // Valid customer payload
    const validData = {
      name: 'Harpreet Singh',
      email: 'harpreet@example.com',
      password: 'StrongPassword123!',
      phone: '+919876543210',
    };
    expect(signupSchema.safeParse(validData).success).toBe(true);

    // Weak password without uppercase/digit should fail
    const weakPassword = {
      ...validData,
      password: 'weak',
    };
    expect(signupSchema.safeParse(weakPassword).success).toBe(false);

    // Invalid phone number format should fail
    const invalidPhone = {
      ...validData,
      phone: '12345',
    };
    expect(signupSchema.safeParse(invalidPhone).success).toBe(false);
  });

  it('should enforce delivery address when checkout fulfillmentMethod is delivery', () => {
    const checkoutWithoutAddress = {
      items: [
        {
          productId: '64e1f73b60c04f2d3a9b1234',
          quantity: 2,
        },
      ],
      fulfillmentMethod: 'delivery',
      paymentMethod: 'cash_on_delivery',
      customerDetails: {
        name: 'Simran Kaur',
        email: 'simran@example.com',
        phone: '9876543210',
      },
    };

    const result = checkoutSchema.safeParse(checkoutWithoutAddress);
    expect(result.success).toBe(false);
  });

  it('should validate promotion date ranges and percentage discounts', () => {
    const validPromo = {
      name: 'Diwali Dhamaka',
      description: 'Special Diwali discount for all families',
      campaignType: 'festival',
      festivalName: 'Diwali',
      discountType: 'percentage',
      discountValue: 20,
      maxDiscount: 150,
      minOrderValue: 500,
      promoCode: 'DIWALI20',
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 86400000).toISOString(),
      isActive: true,
    };

    expect(createPromotionSchema.safeParse(validPromo).success).toBe(true);
  });
});
