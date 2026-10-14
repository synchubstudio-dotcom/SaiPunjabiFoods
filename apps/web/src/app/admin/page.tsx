'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Tags,
  Sparkles,
  MessageSquare,
  Users,
  Settings,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatINR, formatDate, formatTime } from '../../lib/utils';
import { api } from '../../lib/api';
import { IOrder, IProduct, ICategory, IPromotion, IReview, IRestaurantSettings, OrderStatus } from '@sai-punjabi/shared';

type AdminTab =
  | 'overview'
  | 'orders'
  | 'products'
  | 'categories'
  | 'promotions'
  | 'reviews'
  | 'customers'
  | 'settings';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Overview stats state
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [promotions, setPromotions] = useState<IPromotion[]>([]);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [settings, setSettings] = useState<IRestaurantSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  // Protect Admin route
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, authLoading, router]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        statsData,
        ordersData,
        productsData,
        catsData,
        promosData,
        reviewsData,
        customersData,
        settingsData,
      ] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get<{ orders: IOrder[] }>('/orders?limit=50'),
        api.get<{ products: IProduct[] }>('/products?includeUnavailable=true&limit=100'),
        api.get<{ categories: ICategory[] }>('/categories?includeInactive=true'),
        api.get<{ promotions: IPromotion[] }>('/promotions'),
        api.get<{ reviews: IReview[] }>('/reviews/admin?limit=50'),
        api.get<{ customers: any[] }>('/admin/customers?limit=50'),
        api.get<{ settings: IRestaurantSettings }>('/settings'),
      ]);

      setStats(statsData);
      setOrders(ordersData.orders || []);
      setProducts(productsData.products || []);
      setCategories(catsData.categories || []);
      setPromotions(promosData.promotions || []);
      setReviews(reviewsData.reviews || []);
      setCustomers(customersData.customers || []);
      setSettings(settingsData.settings || null);
    } catch (err: any) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAllData();
    }
  }, [user]);

  // Order status update action
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setActionMessage(`Order status updated to ${newStatus}`);
      setTimeout(() => setActionMessage(''), 3000);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  // Toggle dish availability
  const handleToggleProductAvailability = async (productId: string) => {
    try {
      await api.patch(`/products/${productId}/toggle-availability`);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle dish availability');
    }
  };

  // Moderate review
  const handleModerateReview = async (reviewId: string, moderationStatus: 'approved' | 'rejected') => {
    try {
      await api.patch(`/reviews/${reviewId}/moderate`, { moderationStatus });
      setActionMessage(`Review marked as ${moderationStatus}`);
      setTimeout(() => setActionMessage(''), 3000);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to moderate review');
    }
  };

  // Toggle customer active state
  const handleToggleCustomer = async (customerId: string) => {
    try {
      await api.patch(`/admin/customers/${customerId}/toggle-status`);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle customer status');
    }
  };

  if (authLoading || (!user && !isAdmin)) {
    return <div className="p-20 text-center font-bold">Verifying Administrator Privileges...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-maroon-700" />
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-brand-maroon-950">
              Sai Punjabi Admin Control
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Real-time Kitchen, Orders, Menu, Promotions & Customer Management
          </p>
        </div>

        <button
          onClick={loadAllData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Admin Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-200">
        {[
          { key: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
          { key: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { key: 'products', label: `Menu Dishes (${products.length})`, icon: UtensilsCrossed },
          { key: 'categories', label: `Categories (${categories.length})`, icon: Tags },
          { key: 'promotions', label: `Promotions (${promotions.length})`, icon: Sparkles },
          { key: 'reviews', label: `Reviews (${reviews.length})`, icon: MessageSquare },
          { key: 'customers', label: `Customers (${customers.length})`, icon: Users },
          { key: 'settings', label: 'Restaurant Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-maroon-700 text-white shadow-md'
                  : 'text-stone-600 hover:bg-brand-cream-100 hover:text-stone-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Sales</span>
              <p className="font-serif text-2xl sm:text-3xl font-black text-brand-maroon-950">
                {formatINR(stats?.totalRevenue || 0)}
              </p>
              <span className="text-[11px] text-green-700 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Verified online & COD
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Active Orders</span>
              <p className="font-serif text-2xl sm:text-3xl font-black text-brand-maroon-950">
                {stats?.pendingOrders || 0}
              </p>
              <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Kitchen & delivery active
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Completed Orders</span>
              <p className="font-serif text-2xl sm:text-3xl font-black text-brand-maroon-950">
                {stats?.completedOrders || 0}
              </p>
              <span className="text-[11px] text-green-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Delivered successfully
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Active Promotions</span>
              <p className="font-serif text-2xl sm:text-3xl font-black text-brand-maroon-950">
                {stats?.activePromotionsCount || 0}
              </p>
              <span className="text-[11px] text-brand-gold-700 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Live festival coupons
              </span>
            </div>
          </div>

          {/* Popular Dishes & Recent Orders Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-bold text-stone-900">Most Popular Dishes</h3>
              <div className="space-y-3">
                {stats?.popularDishes?.length === 0 ? (
                  <p className="text-xs text-stone-400">Order history will populate popular dishes.</p>
                ) : (
                  stats?.popularDishes?.map((dish: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-50">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-400">#{idx + 1}</span>
                        <span className="font-semibold text-stone-900">{dish.name}</span>
                      </div>
                      <span className="font-bold text-brand-maroon-900">{dish.totalQuantity} ordered</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-bold text-stone-900">Recent Customer Orders</h3>
              <div className="space-y-3">
                {orders.slice(0, 5).map((ord) => (
                  <div key={ord._id} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-50">
                    <div>
                      <span className="font-mono font-bold text-brand-maroon-900 block">#{ord.orderNumber}</span>
                      <span className="text-stone-500">{ord.customerDetails.name} • {ord.items.length} dishes</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-stone-900 block">{formatINR(ord.totalAmount)}</span>
                      <span className="text-[10px] uppercase font-bold text-amber-700">{ord.orderStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6">
          <h2 className="font-serif text-xl font-bold text-stone-900">Live Order Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-stone-700 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Dishes</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-maroon-900">
                      <Link href={`/tracking/${ord.orderNumber}`} className="hover:underline">
                        #{ord.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-stone-900 block">{ord.customerDetails.name}</span>
                      <span className="text-[11px] text-stone-400">{ord.customerDetails.phone}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-900">{formatINR(ord.totalAmount)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          ord.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          ord.orderStatus === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : ord.orderStatus === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value as OrderStatus)}
                        className="py-1 px-2 rounded-lg border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-gold-500 bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready_for_pickup">Ready for Pickup</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS & DISHES */}
      {activeTab === 'products' && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-stone-900">Menu Dish Catalogue</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-stone-700 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Dish</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Base Price</th>
                  <th className="py-3 px-4">Portions</th>
                  <th className="py-3 px-4">Kitchen Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-900">{prod.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          prod.isVegetarian ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {prod.isVegetarian ? 'Pure Veg' : 'Non-Veg'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-maroon-900">{formatINR(prod.price)}</td>
                    <td className="py-3 px-4">
                      {prod.variants && prod.variants.length > 0
                        ? prod.variants.map((v) => `${v.name} (₹${v.price})`).join(', ')
                        : 'Standard'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleProductAvailability(prod._id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          prod.isAvailable
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                        }`}
                      >
                        {prod.isAvailable ? 'In Stock (Available)' : 'Sold Out (Disabled)'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6">
          <h2 className="font-serif text-xl font-bold text-stone-900">Food Categories</h2>
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat._id} className="flex items-center justify-between p-3 rounded-xl border border-stone-200 text-xs">
                <div>
                  <span className="font-bold text-stone-900 block">{cat.name}</span>
                  <span className="text-stone-400">Slug: {cat.slug} • Order: {cat.displayOrder}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 font-bold uppercase text-[10px]">
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: FESTIVAL PROMOTIONS */}
      {activeTab === 'promotions' && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6">
          <h2 className="font-serif text-xl font-bold text-stone-900">Dynamic Festival Campaigns</h2>
          <div className="space-y-3">
            {promotions.map((p) => (
              <div key={p._id} className="p-4 rounded-xl border border-stone-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-brand-maroon-900">{p.name}</span>
                  <span className="font-mono font-bold bg-amber-50 px-2.5 py-1 rounded border border-amber-300 text-amber-900">
                    {p.promoCode || 'NO CODE'}
                  </span>
                </div>
                <p className="text-stone-600">{p.description}</p>
                <div className="flex items-center gap-4 text-stone-400 text-[11px] pt-1">
                  <span>Discount: {p.discountType === 'percentage' ? `${p.discountValue}%` : `₹${p.discountValue}`}</span>
                  <span>Min Order: ₹{p.minOrderValue}</span>
                  <span>Used: {p.usageCount} times</span>
                  <span>Valid: {formatDate(p.startAt)} – {formatDate(p.endAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: REVIEWS MODERATION */}
      {activeTab === 'reviews' && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6">
          <h2 className="font-serif text-xl font-bold text-stone-900">Customer Feedback & Reviews Queue</h2>
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="p-4 rounded-xl border border-stone-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900">{rev.customerName} ★ {rev.rating}/5</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      rev.moderationStatus === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : rev.moderationStatus === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rev.moderationStatus}
                  </span>
                </div>
                <h4 className="font-semibold text-stone-800">{rev.title}</h4>
                <p className="text-stone-600">{rev.comment}</p>
                <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => handleModerateReview(rev._id, 'approved')}
                    className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleModerateReview(rev._id, 'rejected')}
                    className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6">
          <h2 className="font-serif text-xl font-bold text-stone-900">Registered Customers</h2>
          <div className="space-y-3">
            {customers.map((c) => (
              <div key={c._id} className="flex items-center justify-between p-3.5 rounded-xl border border-stone-200 text-xs">
                <div>
                  <span className="font-bold text-stone-900 block">{c.name}</span>
                  <span className="text-stone-500">{c.email} • {c.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-bold text-stone-900 block">{c.orderCount || 0} orders</span>
                    <span className="text-[11px] text-stone-400">{formatINR(c.totalSpent || 0)} spent</span>
                  </div>
                  <button
                    onClick={() => handleToggleCustomer(c._id)}
                    className={`px-3 py-1 rounded-full font-bold text-xs ${
                      c.isActive
                        ? 'bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800'
                        : 'bg-red-100 text-red-800 hover:bg-green-100 hover:text-green-800'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Deactivated'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: SETTINGS */}
      {activeTab === 'settings' && settings && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4 max-w-xl text-xs">
          <h2 className="font-serif text-xl font-bold text-stone-900">Store Operational Settings</h2>
          <div className="space-y-3 pt-2">
            <div>
              <span className="font-bold text-stone-700 block">Restaurant Name:</span>
              <p className="text-stone-900 font-semibold">{settings.restaurantName}</p>
            </div>
            <div>
              <span className="font-bold text-stone-700 block">Address:</span>
              <p className="text-stone-900">{settings.address.street}, {settings.address.city} - {settings.address.postalCode}</p>
            </div>
            <div>
              <span className="font-bold text-stone-700 block">Phone & Contact:</span>
              <p className="text-stone-900">{settings.phone} • {settings.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="font-bold text-stone-700 block">GST Tax Rate:</span>
                <p className="text-stone-900 font-bold">{settings.taxPercentage}%</p>
              </div>
              <div>
                <span className="font-bold text-stone-700 block">Free Delivery Threshold:</span>
                <p className="text-stone-900 font-bold">₹{settings.freeDeliveryThreshold}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
