'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Copy,
  Check,
  Calendar,
  Tag,
  ArrowRight,
  Flame,
  Percent,
} from 'lucide-react';
import { IPromotion } from '@sai-punjabi/shared';
import { useCart } from '../../context/CartContext';
import { formatDate } from '../../lib/utils';
import { api } from '../../lib/api';

export default function FestivalsPage() {
  const { applyPromoCode } = useCart();
  const [promotions, setPromotions] = useState<IPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const data = await api.get<{ promotions: IPromotion[] }>('/promotions/active');
        setPromotions(data.promotions || []);
      } catch (err) {
        console.error('Failed to load promotions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    applyPromoCode(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold-100 text-brand-gold-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Festive Celebrations</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-black text-brand-maroon-950">
          Festival Discounts & Offers
        </h1>
        <p className="text-sm text-stone-600">
          Celebrate Diwali, Baisakhi, Holi, and special family gatherings with authentic Punjabi
          feasts and exclusive festive coupons.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-96 rounded-3xl bg-stone-100 animate-pulse" />
          ))}
        </div>
      ) : promotions.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-stone-200 text-center space-y-3 max-w-lg mx-auto">
          <Sparkles className="w-10 h-10 text-brand-gold-500 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-stone-900">No active festival campaigns today</h3>
          <p className="text-xs text-stone-500">
            Check back soon during festive seasons for exclusive limited-time celebratory discounts!
          </p>
          <Link
            href="/menu"
            className="inline-block mt-2 px-6 py-2.5 rounded-full bg-brand-maroon-700 text-white font-bold text-xs"
          >
            Explore Daily Menu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promotions.map((promo) => (
            <div
              key={promo._id}
              className="group bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-warm transition-all flex flex-col justify-between"
            >
              <div>
                {/* Banner Thumbnail */}
                <div className="relative h-48 w-full bg-gradient-to-tr from-brand-maroon-900 to-brand-maroon-700 overflow-hidden">
                  <Image
                    src={promo.bannerImage || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80'}
                    alt={promo.name}
                    fill
                    className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-3 left-3 bg-brand-gold-500 text-brand-maroon-950 text-xs font-black uppercase px-3 py-1 rounded-full shadow">
                    {promo.discountType === 'percentage'
                      ? `${promo.discountValue}% OFF`
                      : `₹${promo.discountValue} FLAT OFF`}
                  </div>

                  {promo.festivalName && (
                    <div className="absolute bottom-3 left-4 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold-400 block">
                        Celebration
                      </span>
                      <h3 className="font-serif font-black text-xl text-white drop-shadow">
                        {promo.festivalName} Special
                      </h3>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 sm:p-6 space-y-4">
                  <h2 className="font-serif text-lg font-bold text-stone-900 leading-snug">
                    {promo.name}
                  </h2>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {promo.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-stone-500 border-t border-stone-100 pt-3">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-brand-gold-600" />
                      <span>Min Order Value: <strong>₹{promo.minOrderValue}</strong></span>
                    </div>

                    {promo.maxDiscount && (
                      <div className="flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-brand-gold-600" />
                        <span>Maximum Savings: <strong>₹{promo.maxDiscount}</strong></span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-gold-600" />
                      <span>Valid till {formatDate(promo.endAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Box */}
              <div className="p-5 sm:p-6 bg-brand-cream-50 border-t border-brand-cream-200 flex items-center justify-between gap-3">
                {promo.promoCode ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-brand-maroon-900 tracking-wider bg-white px-3 py-1.5 rounded-lg border border-brand-gold-300">
                      {promo.promoCode}
                    </span>
                    <button
                      onClick={() => handleCopyCode(promo.promoCode!)}
                      className="p-2 rounded-lg bg-white hover:bg-brand-cream-100 text-stone-700 border border-stone-200 transition-colors"
                      title="Copy & Apply coupon"
                    >
                      {copiedCode === promo.promoCode ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-green-700 font-bold">Auto-applied at checkout</span>
                )}

                <Link
                  href="/menu"
                  className="px-4 py-2.5 rounded-xl bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-transform hover:scale-105 active:scale-95"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
