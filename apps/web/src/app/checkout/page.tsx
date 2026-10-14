'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../lib/utils';
import { api } from '../../lib/api';
import { IAddress } from '@sai-punjabi/shared';

// Dynamically load Razorpay SDK script
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    pricing,
    clearCart,
    fulfillmentMethod,
    setFulfillmentMethod,
    promoCode,
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<'online_razorpay' | 'cash_on_delivery'>('online_razorpay');
  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Customer contact info
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');

  // Address selection
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);
  const [newAddress, setNewAddress] = useState<IAddress>({
    street: '',
    landmark: '',
    city: 'New Delhi',
    state: 'Delhi',
    postalCode: '110026',
    isDefault: true,
  });

  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Your cart is empty</h2>
        <p className="text-sm text-stone-500">Please select delicious Punjabi food items before proceeding to checkout.</p>
        <Link href="/menu" className="inline-block px-6 py-2.5 rounded-full bg-brand-maroon-700 text-white font-bold text-xs">
          Return to Menu
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      // Determine delivery address
      let deliveryAddress: IAddress | undefined = undefined;
      if (fulfillmentMethod === 'delivery') {
        if (user && user.addresses && user.addresses.length > 0 && selectedAddressIndex !== -1) {
          deliveryAddress = user.addresses[selectedAddressIndex];
        } else {
          deliveryAddress = newAddress;
        }

        if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.postalCode) {
          throw new Error('Please provide a complete delivery address with PIN code');
        }
      }

      if (!customerPhone || !customerPhone.match(/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/)) {
        throw new Error('Please provide a valid Indian 10-digit mobile number for order notifications');
      }

      // Step 1: Create Order on server
      const orderPayload = {
        items: items.map((i) => ({
          productId: i.productId,
          variantName: i.variantName,
          addOns: i.addOns,
          quantity: i.quantity,
        })),
        fulfillmentMethod,
        deliveryAddress,
        orderNotes,
        promoCode: promoCode || undefined,
        paymentMethod,
        customerDetails: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
      };

      const res = await api.post<{ order: any; razorpay?: any }>('/orders', orderPayload);
      const createdOrder = res.order;

      // Step 2: Handle Online Razorpay Payment
      if (paymentMethod === 'online_razorpay' && res.razorpay) {
        const isLoaded = await loadRazorpayScript();

        // If Razorpay SDK loaded and not in simulated test mode
        if (isLoaded && (window as any).Razorpay && !res.razorpay.orderId.startsWith('order_sim_')) {
          const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder_id';

          const options = {
            key: razorpayKey,
            amount: res.razorpay.amount,
            currency: 'INR',
            name: 'Sai Punjabi Restaurant',
            description: `Order #${createdOrder.orderNumber}`,
            order_id: res.razorpay.orderId,
            prefill: {
              name: customerName,
              email: customerEmail,
              contact: customerPhone,
            },
            theme: {
              color: '#7A131A',
            },
            handler: async (response: any) => {
              try {
                await api.post('/payments/verify-razorpay', {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  orderId: createdOrder._id,
                });

                clearCart();
                router.push(`/order-confirmation/${createdOrder._id}`);
              } catch (err: any) {
                setErrorMessage('Payment verification failed. Please check with support.');
                setSubmitting(false);
              }
            },
            modal: {
              ondismiss: () => {
                setSubmitting(false);
                setErrorMessage('Payment cancelled. Your order remains pending.');
              },
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
          return;
        }

        // Test/Simulation fallback: simulate instant verification for rapid local verification
        await api.post('/payments/verify-razorpay', {
          razorpayOrderId: res.razorpay.orderId,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          razorpaySignature: 'simulated_signature_valid',
          orderId: createdOrder._id,
        });

        clearCart();
        router.push(`/order-confirmation/${createdOrder._id}`);
        return;
      }

      // Step 3: Cash on Delivery or Instant Confirmation
      clearCart();
      router.push(`/order-confirmation/${createdOrder._id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please review your details.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-black text-brand-maroon-950">
          Secure Checkout
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Complete your contact & delivery details to enjoy authentic Amritsari food
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Details & Address & Payment */}
        <div className="lg:col-span-8 space-y-6">
          {/* Fulfillment Method Selector */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <h3 className="font-serif text-base font-bold text-stone-900">
              1. Delivery Method
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFulfillmentMethod('delivery')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  fulfillmentMethod === 'delivery'
                    ? 'border-brand-maroon-700 bg-brand-cream-50 ring-2 ring-brand-maroon-700/20'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-stone-900">Doorstep Delivery</span>
                  <MapPin className="w-4 h-4 text-brand-maroon-700" />
                </div>
                <p className="text-xs text-stone-500 mt-1">Average 35-45 mins hot delivery</p>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentMethod('pickup')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  fulfillmentMethod === 'pickup'
                    ? 'border-brand-maroon-700 bg-brand-cream-50 ring-2 ring-brand-maroon-700/20'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-stone-900">Takeaway Pickup</span>
                  <Clock className="w-4 h-4 text-brand-maroon-700" />
                </div>
                <p className="text-xs text-stone-500 mt-1">Ready in 20 mins from kitchen</p>
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900">
              2. Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Phone (10 Digits)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address (if delivery) */}
          {fulfillmentMethod === 'delivery' && (
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-serif text-base font-bold text-stone-900">
                3. Delivery Address
              </h3>

              {/* Saved addresses picker if user has saved addresses */}
              {user && user.addresses && user.addresses.length > 0 && (
                <div className="space-y-2 mb-4">
                  <label className="text-xs font-semibold text-stone-700 block">Select from Saved Addresses</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {user.addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedAddressIndex(idx)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedAddressIndex === idx
                            ? 'border-brand-maroon-700 bg-brand-cream-50 ring-2 ring-brand-maroon-700/20'
                            : 'border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <span className="text-xs font-bold text-brand-maroon-900 block">{addr.label || 'Saved Address'}</span>
                        <p className="text-xs text-stone-600 mt-1">{addr.street}, {addr.city} - {addr.postalCode}</p>
                      </div>
                    ))}
                    <div
                      onClick={() => setSelectedAddressIndex(-1)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-center text-xs font-bold ${
                        selectedAddressIndex === -1
                          ? 'border-brand-maroon-700 bg-brand-cream-50 text-brand-maroon-900'
                          : 'border-dashed border-stone-300 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      + Deliver to another address
                    </div>
                  </div>
                </div>
              )}

              {/* New or manual address form */}
              {(!user || user.addresses?.length === 0 || selectedAddressIndex === -1) && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Street Address / House No. / Flat
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      placeholder="e.g. Flat 302, Green Park Apartments, Ring Road"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">Landmark</label>
                      <input
                        type="text"
                        value={newAddress.landmark || ''}
                        onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                        placeholder="Near Metro Station"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">PIN Code (6 Digits)</label>
                      <input
                        type="text"
                        required
                        pattern="^[1-9][0-9]{5}$"
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        placeholder="110026"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900">
              4. Payment Method
            </h3>
            <div className="space-y-3">
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'online_razorpay'
                    ? 'border-brand-maroon-700 bg-brand-cream-50 ring-2 ring-brand-maroon-700/20'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'online_razorpay'}
                  onChange={() => setPaymentMethod('online_razorpay')}
                  className="mt-1 text-brand-maroon-700 focus:ring-brand-maroon-700"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-stone-900">
                      Razorpay Online Payment (UPI, Cards, Netbanking)
                    </span>
                    <CreditCard className="w-4 h-4 text-brand-maroon-700" />
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Instant zero-contact payment via Google Pay, PhonePe, Paytm, or Credit/Debit Cards.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-brand-maroon-700 bg-brand-cream-50 ring-2 ring-brand-maroon-700/20'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cash_on_delivery'}
                  onChange={() => setPaymentMethod('cash_on_delivery')}
                  className="mt-1 text-brand-maroon-700 focus:ring-brand-maroon-700"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-stone-900">Cash on Delivery (COD)</span>
                    <Banknote className="w-4 h-4 text-brand-gold-600" />
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Pay with cash or UPI QR code at the time of food delivery.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Cooking notes */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
            <label className="font-serif text-sm font-bold text-stone-900 block">
              Special Kitchen Instructions
            </label>
            <textarea
              rows={2}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. Extra sirka pyaaz, make paneer tikka slightly crispier, less oil..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
            />
          </div>
        </div>

        {/* Right Order Review & Place Order Button */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-5 sticky top-28">
            <h3 className="font-serif text-lg font-bold text-brand-maroon-950 pb-2 border-b border-stone-100">
              Order Summary
            </h3>

            {/* Items summary */}
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {items.map((i) => (
                <div key={`${i.productId}-${i.variantName}`} className="flex justify-between text-xs">
                  <span className="text-stone-700 font-medium">
                    {i.quantity}x {i.name} {i.variantName ? `(${i.variantName})` : ''}
                  </span>
                  <span className="font-bold text-stone-900">{formatINR(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Bill Lines */}
            <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">{formatINR(pricing.subtotal)}</span>
              </div>

              {pricing.discountAmount > 0 && (
                <div className="flex justify-between text-green-700 font-bold">
                  <span>Festival Coupon Savings</span>
                  <span>- {formatINR(pricing.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>{formatINR(pricing.taxAmount)}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>
                  {pricing.deliveryFee === 0 ? (
                    <span className="text-green-700 font-bold">FREE</span>
                  ) : (
                    formatINR(pricing.deliveryFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-lg font-black text-brand-maroon-950 border-t border-stone-200 pt-3">
                <span>To Pay</span>
                <span>{formatINR(pricing.totalAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-4 rounded-xl font-bold text-sm shadow-warm flex items-center justify-center gap-2 transition-all ${
                submitting
                  ? 'bg-stone-300 text-stone-500 cursor-wait'
                  : 'bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {submitting ? (
                <span>Placing your order...</span>
              ) : (
                <>
                  <span>Place Order • {formatINR(pricing.totalAmount)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-[11px] text-stone-400 text-center flex items-center justify-center gap-1.5 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              <span>Safe & Encrypted 256-bit Checkout</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
