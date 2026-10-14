'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Tag,
  Check,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../lib/utils';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    pricing,
    promoCode,
    applyPromoCode,
    removePromoCode,
    fulfillmentMethod,
    setFulfillmentMethod,
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setErrorMsg('');
    try {
      await applyPromoCode(inputCode.trim());
      setInputCode('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid coupon code');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-brand-cream-100 mx-auto flex items-center justify-center text-brand-maroon-700">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h1 className="font-serif text-3xl font-black text-brand-maroon-950">Your Cart is Empty</h1>
        <p className="text-sm text-stone-600 max-w-sm mx-auto">
          Explore our clay-oven tandoori starters, rich Punjabi gravies, and authentic chur chur naans!
        </p>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-bold text-sm shadow-warm transition-transform hover:scale-105"
        >
          <span>Browse Authentic Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-brand-maroon-950">
            Shopping Cart
          </h1>
          <p className="text-xs text-stone-500 mt-1">Review your meal selection before checkout</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-stone-500 hover:text-red-600 underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left items list */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantName || 'default'}`}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-white border border-stone-200 shadow-sm gap-4"
            >
              <div className="flex items-center gap-4">
                {item.image && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-sm border ${
                        item.isVegetarian
                          ? 'border-brand-veg bg-brand-veg'
                          : 'border-brand-nonveg bg-brand-nonveg'
                      }`}
                    />
                    <h3 className="font-bold text-base text-stone-900">{item.name}</h3>
                  </div>
                  {item.variantName && (
                    <span className="text-xs text-brand-gold-700 font-semibold block">
                      Portion: {item.variantName}
                    </span>
                  )}
                  {item.addOns && item.addOns.length > 0 && (
                    <p className="text-xs text-stone-500">
                      Add-ons: {item.addOns.map((a) => a.name).join(', ')}
                    </p>
                  )}
                  <span className="text-sm font-extrabold text-brand-maroon-900 block">
                    {formatINR(item.price)} each
                  </span>
                </div>
              </div>

              {/* Quantity Controls & Item Total */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50 shadow-sm">
                  <button
                    onClick={() => updateQuantity(item.productId, item.variantName, item.quantity - 1)}
                    className="p-1.5 hover:bg-stone-200 text-stone-600 rounded-l-lg"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3.5 text-xs font-bold text-stone-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.variantName, item.quantity + 1)}
                    className="p-1.5 hover:bg-stone-200 text-stone-600 rounded-r-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <span className="font-black text-base text-brand-maroon-950 min-w-20 text-right">
                  {formatINR(item.price * item.quantity)}
                </span>

                <button
                  onClick={() => removeFromCart(item.productId, item.variantName)}
                  className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Fulfillment Toggle */}
          <div className="p-4 rounded-2xl bg-brand-cream-50 border border-brand-cream-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-stone-900">Choose Fulfillment Option</h4>
              <p className="text-xs text-stone-500">Contactless doorstep delivery or kitchen takeaway</p>
            </div>
            <div className="flex items-center bg-stone-200/70 p-1 rounded-xl">
              <button
                onClick={() => setFulfillmentMethod('delivery')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  fulfillmentMethod === 'delivery'
                    ? 'bg-white text-brand-maroon-900 shadow-sm'
                    : 'text-stone-600'
                }`}
              >
                Doorstep Delivery
              </button>
              <button
                onClick={() => setFulfillmentMethod('pickup')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  fulfillmentMethod === 'pickup'
                    ? 'bg-white text-brand-maroon-900 shadow-sm'
                    : 'text-stone-600'
                }`}
              >
                Restaurant Pickup
              </button>
            </div>
          </div>
        </div>

        {/* Right order summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-5">
            <h3 className="font-serif text-lg font-bold text-brand-maroon-950 pb-2 border-b border-stone-100">
              Order Bill Summary
            </h3>

            {/* Promo Code Input */}
            {promoCode ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-900 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Coupon <strong>{promoCode}</strong> applied</span>
                </div>
                <button onClick={removePromoCode} className="text-stone-400 hover:text-stone-700 underline">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Coupon Code (DIWALI20)"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-gold-600 hover:bg-brand-gold-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {errorMsg && <p className="text-xs text-red-600 pl-1">{errorMsg}</p>}
              </form>
            )}

            {/* Price lines */}
            <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">{formatINR(pricing.subtotal)}</span>
              </div>

              {pricing.discountAmount > 0 && (
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>Promotion Savings</span>
                  <span>- {formatINR(pricing.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>{formatINR(pricing.taxAmount)}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>
                  {pricing.deliveryFee === 0 ? (
                    <span className="text-green-700 font-bold">FREE</span>
                  ) : (
                    formatINR(pricing.deliveryFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-lg font-black text-brand-maroon-950 border-t border-stone-200 pt-3">
                <span>Grand Total</span>
                <span>{formatINR(pricing.totalAmount)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 rounded-xl bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-bold text-sm shadow-warm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
