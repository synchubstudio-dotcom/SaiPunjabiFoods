'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Bike,
  PackageCheck,
  AlertTriangle,
  MapPin,
  RefreshCw,
  Phone,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { IOrder, OrderStatus } from '@sai-punjabi/shared';
import { useSocket } from '../../../context/SocketContext';
import { formatINR, formatTime, formatDate } from '../../../lib/utils';
import { api } from '../../../lib/api';

const STATUS_STEPS: Array<{ key: OrderStatus; label: string; icon: any; description: string }> = [
  {
    key: 'pending',
    label: 'Order Placed',
    icon: Clock,
    description: 'We received your order and sent it to the kitchen',
  },
  {
    key: 'confirmed',
    label: 'Kitchen Confirmed',
    icon: CheckCircle2,
    description: 'Chef has accepted your order and fired up the clay tandoor',
  },
  {
    key: 'preparing',
    label: 'Cooking & Simmering',
    icon: ChefHat,
    description: 'Fresh rotis, simmering curries, and kebabs cooking on coals',
  },
  {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    icon: Bike,
    description: 'Rider is on the way with your hot meal in insulated bags',
  },
  {
    key: 'delivered',
    label: 'Delivered Fresh',
    icon: PackageCheck,
    description: 'Enjoy your authentic Punjabi feast with family!',
  },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const { socket, joinOrderRoom, leaveOrderRoom } = useSocket();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveUpdated, setLiveUpdated] = useState(false);

  const fetchOrder = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setIsRefreshing(true);
    try {
      const data = await api.get<{ order: IOrder }>(`/orders/track/${orderNumber}`);
      setOrder(data.order);
      if (data.order?._id) {
        joinOrderRoom(data.order._id);
      }
    } catch (err) {
      console.error('Failed to load tracking data', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
    }
    return () => {
      if (order?._id) {
        leaveOrderRoom(order._id);
      }
    };
  }, [orderNumber]);

  // Real-time WebSocket event listener
  useEffect(() => {
    if (!socket || !order?._id) return;

    const handleUpdate = (updatedOrder: any) => {
      if (updatedOrder._id === order._id || updatedOrder.orderNumber === order.orderNumber) {
        setOrder(updatedOrder);
        setLiveUpdated(true);
        setTimeout(() => setLiveUpdated(false), 3000);
      }
    };

    socket.on('order:status_changed', handleUpdate);

    return () => {
      socket.off('order:status_changed', handleUpdate);
    };
  }, [socket, order]);

  // Fallback Polling every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (order && order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled') {
        fetchOrder(false);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [order]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse space-y-6">
        <div className="h-8 w-48 bg-stone-200 mx-auto rounded" />
        <div className="h-64 bg-stone-100 rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Order not found</h2>
        <p className="text-xs text-stone-500">
          No live tracking record found for #{orderNumber}. Please check the order number.
        </p>
        <Link
          href="/menu"
          className="inline-block px-6 py-2.5 rounded-full bg-brand-maroon-700 text-white font-bold text-xs"
        >
          Return to Menu
        </Link>
      </div>
    );
  }

  // Determine current timeline progress index
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/menu"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-brand-maroon-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </Link>

        <button
          onClick={() => fetchOrder(false)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Status Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-warm space-y-6 relative overflow-hidden">
        {liveUpdated && (
          <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-xs font-bold py-1 px-4 text-center animate-pulse">
            ⚡ Live Status Update Just Received!
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Live Order Tracker
            </span>
            <h1 className="font-mono text-2xl sm:text-3xl font-black text-brand-maroon-950 mt-0.5">
              #{order.orderNumber}
            </h1>
          </div>

          <div className="sm:text-right">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Estimated Delivery
            </span>
            <p className="font-bold text-lg text-brand-gold-700 flex items-center sm:justify-end gap-1.5 mt-0.5">
              <Clock className="w-5 h-5 text-brand-gold-600" />
              <span>{order.estimatedDeliveryTime || '35-45 mins'}</span>
            </p>
          </div>
        </div>

        {/* Visual Progress Stepper */}
        {isCancelled ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Order Cancelled</h4>
              <p className="text-xs text-red-600">This order was cancelled. Please contact restaurant support.</p>
            </div>
          </div>
        ) : (
          <div className="py-6 border-y border-stone-100 space-y-8">
            <div className="relative">
              {/* Stepper Line */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-stone-200 md:hidden" />
              <div className="hidden md:block absolute top-6 left-10 right-10 h-0.5 bg-stone-200" />

              {/* Steps Desktop */}
              <div className="hidden md:grid grid-cols-5 gap-2 relative z-10">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'bg-brand-maroon-700 text-white shadow-lg ring-4 ring-brand-maroon-100 scale-110'
                            : isDone
                            ? 'bg-green-600 text-white'
                            : 'bg-stone-100 text-stone-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-brand-maroon-950 font-black' : isDone ? 'text-stone-800' : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Steps Mobile Vertical */}
              <div className="md:hidden space-y-6 relative z-10">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                          isCurrent
                            ? 'bg-brand-maroon-700 text-white shadow-md ring-4 ring-brand-maroon-100'
                            : isDone
                            ? 'bg-green-600 text-white'
                            : 'bg-stone-100 text-stone-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${isCurrent ? 'text-brand-maroon-900' : 'text-stone-800'}`}>
                          {step.label}
                        </h4>
                        <p className="text-xs text-stone-500 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Status Audit History */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-stone-900">Status Timeline</h4>
            <div className="space-y-2">
              {order.statusHistory.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-50">
                  <span className="font-semibold text-stone-800 capitalize">
                    {h.status.replace(/_/g, ' ')} {h.note ? `— ${h.note}` : ''}
                  </span>
                  <span className="text-stone-400 font-mono text-[11px] shrink-0">
                    {formatTime(h.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Items & Details */}
        <div className="space-y-3 pt-2">
          <h4 className="font-serif text-sm font-bold text-stone-900">Order Items ({order.items?.length})</h4>
          <div className="space-y-2">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs py-1 border-b border-stone-50">
                <span className="text-stone-700 font-medium">
                  {item.quantity}x {item.name} {item.variantName ? `(${item.variantName})` : ''}
                </span>
                <span className="font-bold text-stone-900">{formatINR(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-stone-500 gap-3">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-brand-gold-600" />
            <span>Kitchen Helpline: +91 98765 43210</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900">Total: {formatINR(order.totalAmount)}</span>
            <span className="px-2 py-0.5 rounded-full bg-stone-100 font-semibold uppercase text-[10px]">
              {order.paymentMethod === 'online_razorpay' ? 'Paid Online' : 'Cash on Delivery'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
