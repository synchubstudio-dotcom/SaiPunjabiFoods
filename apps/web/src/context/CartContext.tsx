'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { IProduct, FulfillmentMethod } from '@sai-punjabi/shared';
import { api } from '../lib/api';

export interface CartItem {
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  isVegetarian: boolean;
  variantName?: string;
  addOns?: Array<{ name: string; price: number }>;
}

export interface PricingBreakdown {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  appliedPromotion?: {
    promotionId: string;
    promoCode: string;
    name: string;
    discountAmount: number;
  };
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  fulfillmentMethod: FulfillmentMethod;
  setFulfillmentMethod: (method: FulfillmentMethod) => void;
  promoCode: string;
  pricing: PricingBreakdown;
  calculating: boolean;
  addToCart: (
    product: IProduct,
    quantity?: number,
    variantName?: string,
    addOns?: Array<{ name: string; price: number }>
  ) => void;
  updateQuantity: (productId: string, variantName: string | undefined, quantity: number) => void;
  removeFromCart: (productId: string, variantName?: string) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => Promise<void>;
  removePromoCode: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'sai_punjabi_cart_items';
const PROMO_STORAGE_KEY = 'sai_punjabi_promo_code';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('delivery');
  const [promoCode, setPromoCode] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [pricing, setPricing] = useState<PricingBreakdown>({
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    deliveryFee: 40,
    totalAmount: 0,
  });

  // Load from local storage on mount
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
      const savedPromo = localStorage.getItem(PROMO_STORAGE_KEY);
      if (savedItems) setItems(JSON.parse(savedItems));
      if (savedPromo) setPromoCode(savedPromo);
    } catch {
      // Local storage unreadable
    }
  }, []);

  // Save items to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore
    }
  }, [items]);

  // Recalculate prices from API whenever items, promoCode, or fulfillmentMethod changes
  const recalculate = useCallback(async () => {
    if (items.length === 0) {
      setPricing({
        subtotal: 0,
        discountAmount: 0,
        taxAmount: 0,
        deliveryFee: fulfillmentMethod === 'delivery' ? 40 : 0,
        totalAmount: 0,
      });
      return;
    }

    setCalculating(true);
    try {
      const data = await api.post<PricingBreakdown>('/cart/calculate', {
        items: items.map((i) => ({
          productId: i.productId,
          variantName: i.variantName,
          addOns: i.addOns,
          quantity: i.quantity,
        })),
        promoCode: promoCode || undefined,
        fulfillmentMethod,
      });

      setPricing(data);
    } catch (err: any) {
      // If promo error, clear invalid promo
      if (promoCode && err.message?.toLowerCase().includes('coupon')) {
        setPromoCode('');
        localStorage.removeItem(PROMO_STORAGE_KEY);
      }
    } finally {
      setCalculating(false);
    }
  }, [items, promoCode, fulfillmentMethod]);

  useEffect(() => {
    recalculate();
  }, [recalculate]);

  const addToCart = (
    product: IProduct,
    quantity: number = 1,
    variantName?: string,
    addOns: Array<{ name: string; price: number }> = []
  ) => {
    let unitPrice = product.price;

    if (variantName && product.variants) {
      const v = product.variants.find((v) => v.name === variantName);
      if (v) unitPrice = v.price;
    }

    if (addOns && addOns.length > 0) {
      const addOnsCost = addOns.reduce((sum, a) => sum + a.price, 0);
      unitPrice += addOnsCost;
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === product._id && (i.variantName || '') === (variantName || '')
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          image: product.images?.[0] || '',
          price: unitPrice,
          quantity,
          isVegetarian: product.isVegetarian,
          variantName,
          addOns,
        },
      ];
    });

    setIsDrawerOpen(true);
  };

  const updateQuantity = (
    productId: string,
    variantName: string | undefined,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantName);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (
          item.productId === productId &&
          (item.variantName || '') === (variantName || '')
        ) {
          return { ...item, quantity: Math.min(50, quantity) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, variantName?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.productId === productId &&
            (item.variantName || '') === (variantName || '')
          )
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode('');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(PROMO_STORAGE_KEY);
  };

  const applyPromoCode = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    setPromoCode(cleanCode);
    localStorage.setItem(PROMO_STORAGE_KEY, cleanCode);
  };

  const removePromoCode = () => {
    setPromoCode('');
    localStorage.removeItem(PROMO_STORAGE_KEY);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        isDrawerOpen,
        setIsDrawerOpen,
        fulfillmentMethod,
        setFulfillmentMethod,
        promoCode,
        pricing,
        calculating,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyPromoCode,
        removePromoCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
