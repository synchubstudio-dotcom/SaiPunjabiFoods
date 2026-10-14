'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, Check } from 'lucide-react';
import { IProduct, IProductVariant, IProductAddOn } from '@sai-punjabi/shared';
import { useCart } from '../context/CartContext';
import { formatINR } from '../lib/utils';

interface ProductModalProps {
  product: IProduct;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<IProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [selectedAddOns, setSelectedAddOns] = useState<IProductAddOn[]>([]);
  const [quantity, setQuantity] = useState(1);

  const toggleAddOn = (addOn: IProductAddOn) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.name === addOn.name);
      if (exists) {
        return prev.filter((a) => a.name !== addOn.name);
      } else {
        return [...prev, addOn];
      }
    });
  };

  const calculateTotal = () => {
    let base = selectedVariant ? selectedVariant.price : product.price;
    const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
    return (base + addOnsTotal) * quantity;
  };

  const handleConfirm = () => {
    addToCart(
      product,
      quantity,
      selectedVariant?.name,
      selectedAddOns.map((a) => ({ name: a.name, price: a.price }))
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header Image */}
          <div className="relative h-44 w-full bg-stone-100">
            {product.images?.[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
              />
            )}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`w-3 h-3 rounded-sm border ${
                    product.isVegetarian ? 'border-brand-veg bg-brand-veg' : 'border-brand-nonveg bg-brand-nonveg'
                  }`}
                />
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {product.name}
                </h3>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Portion / Variant Options */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2 border-t border-stone-100 pt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  Select Portion Size
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {product.variants.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedVariant?.name === v.name
                          ? 'border-brand-maroon-700 bg-brand-cream-50 ring-2 ring-brand-maroon-700/20'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-stone-900">{v.name}</span>
                        {selectedVariant?.name === v.name && (
                          <Check className="w-3.5 h-3.5 text-brand-maroon-700" />
                        )}
                      </div>
                      <span className="text-sm font-extrabold text-brand-maroon-900 mt-1 block">
                        {formatINR(v.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons Options */}
            {product.addOns && product.addOns.length > 0 && (
              <div className="space-y-2 border-t border-stone-100 pt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  Add-Ons & Accompaniments
                </label>
                <div className="space-y-2">
                  {product.addOns.map((addon) => {
                    const isSelected = selectedAddOns.some((a) => a.name === addon.name);
                    return (
                      <div
                        key={addon.name}
                        onClick={() => toggleAddOn(addon)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-brand-gold-500 bg-amber-50/50'
                            : 'border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-brand-gold-600 focus:ring-brand-gold-500"
                          />
                          <span className="text-xs font-medium text-stone-800">{addon.name}</span>
                        </div>
                        <span className="text-xs font-bold text-stone-700">
                          +{formatINR(addon.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center justify-between border-t border-stone-100 pt-4">
              <span className="text-xs font-bold text-stone-700">Quantity</span>
              <div className="flex items-center border border-stone-200 rounded-lg shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-l-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-xs font-bold text-stone-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-r-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 bg-brand-cream-50 border-t border-brand-cream-200 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-stone-500 uppercase block font-semibold">Total Price</span>
              <span className="text-lg font-black text-brand-maroon-950">{formatINR(calculateTotal())}</span>
            </div>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 px-4 rounded-xl bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Add to Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
