'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../lib/utils';

export const CartDrawer = () => {
  const {
    items,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    pricing,
    promoCode,
    applyPromoCode,
    removePromoCode,
    calculating,
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [promoError, setPromoError] = useState('');

  if (!isDrawerOpen) return null;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setPromoError('');
    try {
      await applyPromoCode(inputCode.trim());
      setInputCode('');
    } catch (err: any) {
      setPromoError(err.message || 'Failed to apply coupon');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 sm:p-6 bg-brand-cream-50 border-b border-brand-cream-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-maroon-800" />
              <h2 className="font-serif text-xl font-bold text-brand-maroon-950">
                Your Delicious Order
              </h2>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-full hover:bg-brand-cream-200 text-stone-500 hover:text-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 rounded-full bg-brand-cream-100 mx-auto flex items-center justify-center text-brand-maroon-600">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-800">
                  Your food cart is empty
                </h3>
                <p className="text-sm text-stone-500 max-w-xs mx-auto">
                  Satisfy your cravings with our mouth-watering tandoori and curries!
                </p>
                <Link
                  href="/menu"
                  onClick={() => setIsDrawerOpen(false)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-maroon-700 text-white font-semibold text-sm hover:bg-brand-maroon-800 transition-colors"
                >
                  Explore Menu
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantName || 'default'}`}
                  className="flex gap-4 p-3 rounded-xl border border-stone-100 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                >
                  {/* Dish Thumbnail */}
                  {item.image && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-sm shrink-0 border ${
                              item.isVegetarian
                                ? 'border-brand-veg bg-brand-veg'
                                : 'border-brand-nonveg bg-brand-nonveg'
                            }`}
                          />
                          <h4 className="font-semibold text-sm text-stone-900 truncate">
                            {item.name}
                          </h4>
                        </div>
                        {item.variantName && (
                          <span className="text-xs text-brand-gold-700 font-medium">
                            Portion: {item.variantName}
                          </span>
                        )}
                        {item.addOns && item.addOns.length > 0 && (
                          <p className="text-xs text-stone-500 truncate">
                            + {item.addOns.map((a) => a.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId, item.variantName)}
                        className="text-stone-400 hover:text-red-600 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-sm text-brand-maroon-900">
                        {formatINR(item.price * item.quantity)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-stone-200 bg-white rounded-lg shadow-sm">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantName,
                              item.quantity - 1
                            )
                          }
                          className="p-1 hover:bg-stone-100 rounded-l-lg text-stone-600"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantName,
                              item.quantity + 1
                            )
                          }
                          className="p-1 hover:bg-stone-100 rounded-r-lg text-stone-600"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer / Calculation */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 bg-brand-cream-50 border-t border-brand-cream-200 space-y-4">
              {/* Promo Code Input */}
              {promoCode ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Coupon <strong>{promoCode}</strong> applied</span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-stone-400 hover:text-stone-700 underline text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-1">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Enter coupon (e.g. DIWALI20)"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 uppercase"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-gold-600 hover:bg-brand-gold-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-xs text-red-600 pl-1">{promoError}</p>
                  )}
                </form>
              )}

              {/* Bill Details */}
              <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-200 pt-3">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatINR(pricing.subtotal)}</span>
                </div>

                {pricing.discountAmount > 0 && (
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>Festival Coupon Discount</span>
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

                <div className="flex justify-between text-base font-bold text-brand-maroon-950 border-t border-stone-300 pt-2">
                  <span>Total Amount</span>
                  <span>{formatINR(pricing.totalAmount)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
