'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Star, Plus } from 'lucide-react';
import { IProduct } from '@sai-punjabi/shared';
import { useCart } from '../context/CartContext';
import { formatINR } from '../lib/utils';
import { ProductModal } from './ProductModal';

interface ProductCardProps {
  product: IProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasCustomizations =
    (product.variants && product.variants.length > 0) ||
    (product.addOns && product.addOns.length > 0);

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasCustomizations) {
      setIsModalOpen(true);
    } else {
      addToCart(product, 1);
    }
  };

  return (
    <>
      <div className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-warm transition-all duration-300 flex flex-col h-full">
        {/* Image Container */}
        <Link href={`/menu/${product.slug}`} className="relative h-48 sm:h-52 w-full overflow-hidden block bg-stone-100">
          <Image
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {/* Pure Veg / Non-Veg emblem */}
            <div
              className={`w-5 h-5 rounded-sm bg-white/95 backdrop-blur-sm border-2 flex items-center justify-center p-0.5 shadow ${
                product.isVegetarian ? 'border-brand-veg' : 'border-brand-nonveg'
              }`}
              title={product.isVegetarian ? 'Pure Vegetarian' : 'Non-Vegetarian'}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  product.isVegetarian ? 'bg-brand-veg' : 'bg-brand-nonveg'
                }`}
              />
            </div>

            {/* Preparation time */}
            {product.preparationTimeMinutes && (
              <span className="bg-white/90 backdrop-blur-sm text-stone-700 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Clock className="w-3 h-3 text-brand-gold-600" />
                {product.preparationTimeMinutes}m
              </span>
            )}
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-brand-maroon-950/80 backdrop-blur-sm text-brand-gold-300 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
            <Star className="w-3 h-3 fill-brand-gold-400 text-brand-gold-400" />
            <span>{product.averageRating?.toFixed(1) || '5.0'}</span>
          </div>
        </Link>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
          <div>
            <Link href={`/menu/${product.slug}`} className="hover:text-brand-maroon-700 transition-colors">
              <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 leading-snug line-clamp-1">
                {product.name}
              </h3>
            </Link>
            <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
              {product.shortDescription || product.description}
            </p>
          </div>

          {/* Price and Add CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-extrabold text-brand-maroon-900">
                  {formatINR(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-xs text-stone-400 line-through">
                    {formatINR(product.compareAtPrice)}
                  </span>
                )}
              </div>
              {hasCustomizations && (
                <span className="text-[10px] text-brand-gold-700 font-semibold block">
                  Customizable
                </span>
              )}
            </div>

            <button
              onClick={handleAddClick}
              disabled={!product.isAvailable}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                product.isAvailable
                  ? 'bg-brand-gold-500 hover:bg-brand-gold-600 text-brand-maroon-950 hover:scale-105 active:scale-95'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{product.isAvailable ? (hasCustomizations ? 'Customise' : 'Add') : 'Sold Out'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {isModalOpen && (
        <ProductModal product={product} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};
