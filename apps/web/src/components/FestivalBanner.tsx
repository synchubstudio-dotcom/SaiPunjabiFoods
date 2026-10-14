'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Copy, Check, ArrowRight } from 'lucide-react';
import { IPromotion } from '@sai-punjabi/shared';
import { useCart } from '../context/CartContext';

interface FestivalBannerProps {
  promotions: IPromotion[];
}

export const FestivalBanner: React.FC<FestivalBannerProps> = ({ promotions }) => {
  const { applyPromoCode } = useCart();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!promotions || promotions.length === 0) return null;
  const promo = promotions[0];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    applyPromoCode(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-maroon-950 via-brand-maroon-900 to-brand-maroon-800 text-white p-6 sm:p-10 shadow-2xl border-2 border-brand-gold-500/50">
      {/* Decorative patterns */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-brand-gold-500/10 blur-3xl pointer-events-none" />
      <div className="absolute left-1/2 -top-20 w-48 h-48 rounded-full bg-brand-maroon-500/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center lg:text-left max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold-500/20 border border-brand-gold-400 text-brand-gold-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{promo.festivalName || 'Special'} Celebration Offer</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {promo.name}
          </h2>

          <p className="text-sm sm:text-base text-stone-200 leading-relaxed">
            {promo.description}
          </p>

          <p className="text-xs text-brand-gold-300 font-medium">
            * Valid on orders above ₹{promo.minOrderValue}
            {promo.maxDiscount ? ` (Max discount ₹${promo.maxDiscount})` : ''}
          </p>
        </div>

        {/* Promo code CTA box */}
        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-center gap-3 bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-brand-gold-400/30">
          {promo.promoCode && (
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-xl border border-dashed border-brand-gold-400">
              <span className="font-mono text-base font-extrabold text-brand-gold-300 tracking-wider">
                {promo.promoCode}
              </span>
              <button
                onClick={() => handleCopy(promo.promoCode!)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-brand-gold-300 hover:text-white transition-colors"
                title="Copy coupon"
              >
                {copiedCode === promo.promoCode ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          )}

          <Link
            href="/menu"
            className="w-full text-center px-6 py-2.5 rounded-xl bg-brand-gold-500 hover:bg-brand-gold-600 text-brand-maroon-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg"
          >
            <span>Order Feast Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
