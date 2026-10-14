'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  ShoppingBag,
  Share2,
  UtensilsCrossed,
} from 'lucide-react';
import { IOrder } from '@sai-punjabi/shared';
import { formatINR, formatDate, formatTime } from '../../../lib/utils';
import { api } from '../../../lib/api';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.get<{ order: IOrder }>(`/orders/${orderId}`);
        setOrder(data.order);
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-pulse space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-200 mx-auto" />
        <div className="h-8 w-64 bg-stone-200 mx-auto rounded" />
        <div className="h-40 bg-stone-200 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Order not found</h2>
        <Link href="/" className="inline-block px-6 py-2.5 rounded-full bg-brand-maroon-700 text-white font-bold text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Success Badge */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-black text-brand-maroon-950">
          Order Confirmed!
        </h1>
        <p className="text-sm text-stone-600">
          Thank you, <strong>{order.customerDetails.name}</strong>. The kitchen has received your order and started preparing your fresh Punjabi delicacies.
        </p>
      </div>

      {/* Order Card */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-warm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
          <div>
            <span className="text-xs text-stone-400 uppercase font-semibold">Order Number</span>
            <p className="font-mono text-base font-black text-brand-maroon-900">{order.orderNumber}</p>
          </div>
          <div className="sm:text-right">
            <span className="text-xs text-stone-400 uppercase font-semibold">Estimated Time</span>
            <p className="text-sm font-bold text-stone-800 flex items-center gap-1 sm:justify-end">
              <Clock className="w-4 h-4 text-brand-gold-600" />
              <span>35-45 mins</span>
            </p>
          </div>
        </div>

        {/* Items Snapshot */}
        <div className="space-y-3">
          <h3 className="font-serif text-sm font-bold text-stone-900">Ordered Dishes</h3>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs py-1 border-b border-stone-50">
                <span className="text-stone-700 font-medium">
                  {item.quantity}x {item.name} {item.variantName ? `(${item.variantName})` : ''}
                </span>
                <span className="font-bold text-stone-900">{formatINR(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Details */}
        {order.fulfillmentMethod === 'delivery' && order.deliveryAddress && (
          <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-100 pt-4">
            <span className="font-bold text-stone-900 block flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-maroon-700" />
              Delivery Destination
            </span>
            <p>{order.deliveryAddress.street}, {order.deliveryAddress.city} - {order.deliveryAddress.postalCode}</p>
          </div>
        )}

        {/* Bill Summary */}
        <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-100 pt-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatINR(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-700 font-semibold">
              <span>Festival Discount</span>
              <span>- {formatINR(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>GST (5%)</span>
            <span>{formatINR(order.taxAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{order.deliveryFee === 0 ? 'FREE' : formatINR(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-base font-black text-brand-maroon-950 border-t border-stone-200 pt-2">
            <span>Total Paid</span>
            <span>{formatINR(order.totalAmount)}</span>
          </div>
        </div>

        {/* Live Tracking CTA */}
        <div className="pt-2">
          <Link
            href={`/tracking/${order.orderNumber}`}
            className="w-full py-4 rounded-xl bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-bold text-sm shadow-warm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Track Order in Real-Time</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
