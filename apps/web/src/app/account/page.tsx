'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Package,
  ArrowRight,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { IOrder, IAddress } from '@sai-punjabi/shared';
import { formatINR, formatDate, formatTime } from '../../lib/utils';
import { api } from '../../lib/api';

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout, addAddress, deleteAddress } = useAuth();

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // New address state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState<IAddress>({
    label: 'Home',
    street: '',
    landmark: '',
    city: 'New Delhi',
    state: 'Delhi',
    postalCode: '110026',
    isDefault: false,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      const fetchOrders = async () => {
        try {
          const data = await api.get<{ orders: IOrder[] }>('/orders/my-orders');
          setOrders(data.orders || []);
        } catch (err) {
          console.error('Failed to load orders', err);
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchOrders();
    }
  }, [user, loading, router]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.postalCode) return;
    try {
      await addAddress(newAddr);
      setShowAddAddress(false);
      setNewAddr({
        label: 'Home',
        street: '',
        landmark: '',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110026',
        isDefault: false,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to add address');
    }
  };

  if (loading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-pulse space-y-4">
        <div className="h-8 w-48 bg-stone-200 mx-auto rounded" />
        <div className="h-64 bg-stone-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Profile Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-warm gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-maroon-700 text-brand-gold-400 font-serif font-black text-2xl flex items-center justify-center shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-black text-brand-maroon-950">{user.name}</h1>
            <p className="text-xs text-stone-500">{user.email} • {user.phone || 'No phone added'}</p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-gold-100 text-brand-gold-800">
              {user.role === 'admin' ? 'Administrator' : 'Sai Punjabi Patron'}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Saved Delivery Addresses */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-maroon-700" />
              Saved Delivery Addresses
            </h2>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-maroon-700 hover:text-brand-maroon-900"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>

          {showAddAddress && (
            <form onSubmit={handleAddAddress} className="p-4 rounded-2xl bg-white border border-brand-gold-400 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-stone-800">New Address Details</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block">Label</label>
                  <input
                    type="text"
                    value={newAddr.label}
                    onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                    placeholder="Home / Office"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block">PIN Code</label>
                  <input
                    type="text"
                    required
                    pattern="^[1-9][0-9]{5}$"
                    value={newAddr.postalCode}
                    onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                    placeholder="110026"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-stone-600 block">Street & Flat</label>
                <input
                  type="text"
                  required
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  placeholder="Flat 101, Sai Enclave"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block">City</label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block">Landmark</label>
                  <input
                    type="text"
                    value={newAddr.landmark || ''}
                    onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                    placeholder="Near Park"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-brand-maroon-700 text-white text-xs font-bold hover:bg-brand-maroon-800"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          {user.addresses?.length === 0 ? (
            <p className="text-xs text-stone-500 italic p-4 bg-white rounded-xl border border-stone-200">
              No saved addresses. Add your home or office address for 1-click checkout.
            </p>
          ) : (
            user.addresses?.map((addr) => (
              <div
                key={addr._id}
                className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-sm flex items-start justify-between gap-3"
              >
                <div>
                  <span className="text-xs font-bold text-brand-maroon-900 block">{addr.label || 'Address'}</span>
                  <p className="text-xs text-stone-600 mt-0.5">{addr.street}, {addr.city} - {addr.postalCode}</p>
                  {addr.landmark && <span className="text-[10px] text-stone-400 block">Landmark: {addr.landmark}</span>}
                </div>
                <button
                  onClick={() => addr._id && deleteAddress(addr._id)}
                  className="text-stone-400 hover:text-red-600 p-1"
                  title="Remove address"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Order History */}
        <div id="orders" className="lg:col-span-7 space-y-4">
          <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-maroon-700" />
            Order History
          </h2>

          {ordersLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-stone-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-stone-200 text-center space-y-2">
              <p className="text-sm font-semibold text-stone-800">No orders placed yet</p>
              <p className="text-xs text-stone-500">Your delicious food journey starts today!</p>
              <Link
                href="/menu"
                className="inline-block mt-2 px-5 py-2 rounded-full bg-brand-maroon-700 text-white font-bold text-xs"
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3 hover:border-brand-gold-400 transition-colors"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <div>
                      <span className="font-mono text-xs font-black text-brand-maroon-900 block">
                        #{order.orderNumber}
                      </span>
                      <span className="text-[11px] text-stone-400">{formatDate(order.createdAt)} at {formatTime(order.createdAt)}</span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          order.orderStatus === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.orderStatus === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}
                      >
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-stone-600 line-clamp-1">
                    {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-black text-sm text-stone-900">
                      Total: {formatINR(order.totalAmount)}
                    </span>

                    <Link
                      href={`/tracking/${order.orderNumber}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-maroon-700 hover:text-brand-maroon-900"
                    >
                      <span>Live Tracking</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
