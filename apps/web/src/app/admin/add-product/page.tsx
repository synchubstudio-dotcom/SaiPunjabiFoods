'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  Utensils,
  Sparkles,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import { ICategory, IProduct, IProductVariant, IProductAddOn, SpiceLevel } from '@sai-punjabi/shared';

const PRESET_IMAGES = [
  {
    label: 'Dal Makhani',
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Butter Chicken',
    url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Tandoori Tikka',
    url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Amritsari Kulcha',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Biryani Feast',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Lassi / Beverage',
    url: 'https://images.unsplash.com/photo-1571006682875-e87f2231ff6f?auto=format&fit=crop&w=800&q=80',
  },
];

export default function AdminAddProductPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [isVegetarian, setIsVegetarian] = useState(true);
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>('medium');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState(20);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Dynamic portions & addons
  const [variants, setVariants] = useState<IProductVariant[]>([]);
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantPrice, setNewVariantPrice] = useState('');

  const [addOns, setAddOns] = useState<IProductAddOn[]>([]);
  const [newAddOnName, setNewAddOnName] = useState('');
  const [newAddOnPrice, setNewAddOnPrice] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdProduct, setCreatedProduct] = useState<IProduct | null>(null);

  // Auth protection
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, authLoading, router]);

  // Load categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await api.get<{ categories: ICategory[] }>('/categories?includeInactive=true');
        const cats = data.categories || [];
        setCategories(cats);
        if (cats.length > 0) {
          setCategoryId(cats[0]._id);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchCats();
    }
  }, [user]);

  const handleAddVariant = () => {
    if (!newVariantName.trim() || !newVariantPrice || Number(newVariantPrice) <= 0) return;
    setVariants((prev) => [
      ...prev,
      { name: newVariantName.trim(), price: Number(newVariantPrice) },
    ]);
    setNewVariantName('');
    setNewVariantPrice('');
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddAddOn = () => {
    if (!newAddOnName.trim() || !newAddOnPrice || Number(newAddOnPrice) < 0) return;
    setAddOns((prev) => [
      ...prev,
      { name: newAddOnName.trim(), price: Number(newAddOnPrice) },
    ]);
    setNewAddOnName('');
    setNewAddOnPrice('');
  };

  const handleRemoveAddOn = (index: number) => {
    setAddOns((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetForm = () => {
    setName('');
    setPrice('');
    setCompareAtPrice('');
    setIsVegetarian(true);
    setSpiceLevel('medium');
    setShortDescription('');
    setDescription('');
    setImageUrl(PRESET_IMAGES[0].url);
    setPreparationTimeMinutes(20);
    setIsAvailable(true);
    setIsFeatured(false);
    setVariants([]);
    setAddOns([]);
    setCreatedProduct(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || name.trim().length < 2) {
      setError('Dish name must be at least 2 characters.');
      return;
    }

    if (!categoryId) {
      setError('Please choose a category.');
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Please enter a valid price greater than 0.');
      return;
    }

    const trimmedDesc = description.trim() || shortDescription.trim();
    if (!trimmedDesc || trimmedDesc.length < 10) {
      setError('Detailed description must be at least 10 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const payload: any = {
        name: name.trim(),
        categoryId,
        price: numPrice,
        isVegetarian,
        spiceLevel,
        shortDescription: shortDescription.trim() || undefined,
        description: trimmedDesc,
        images: [imageUrl.trim() || PRESET_IMAGES[0].url],
        preparationTimeMinutes: Number(preparationTimeMinutes) || 20,
        isAvailable,
        isFeatured,
      };

      if (compareAtPrice && Number(compareAtPrice) > 0) {
        payload.compareAtPrice = Number(compareAtPrice);
      }

      if (variants.length > 0) {
        payload.variants = variants;
      }

      if (addOns.length > 0) {
        payload.addOns = addOns;
      }

      const res = await api.post<{ product: IProduct }>('/products', payload);
      setCreatedProduct(res.product);
    } catch (err: any) {
      console.error('Failed to publish food item', err);
      setError(err.message || 'Failed to add dish to menu. Please check all fields.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || (!user && !isAdmin)) {
    return <div className="p-20 text-center font-bold">Verifying Administrator Privileges...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-brand-maroon-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-maroon-700" />
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-brand-maroon-950">
              Add New Food Item
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Publish authentic Punjabi specialties directly to your digital restaurant menu in real-time.
          </p>
        </div>

        <Link
          href="/menu"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors shadow-sm"
        >
          <span>Preview Live Menu</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Success Notification Banner */}
      {createdProduct && (
        <div className="p-6 rounded-3xl bg-green-50 border border-green-200 text-green-950 space-y-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-serif text-lg font-bold">
                “{createdProduct.name}” Published Successfully!
              </h3>
              <p className="text-xs text-green-800">
                This item is now immediately live in your online menu and updated across all diners.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleResetForm}
              className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-xs transition-colors shadow"
            >
              + Add Another Food Item
            </button>
            <Link
              href={`/menu/${createdProduct.slug}`}
              target="_blank"
              className="px-4 py-2 rounded-xl bg-white border border-green-300 text-green-900 font-bold text-xs hover:bg-green-100 transition-colors"
            >
              View Dish Page
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 font-semibold text-xs transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Core Details */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-brand-maroon-950 flex items-center gap-2 pb-2 border-b border-stone-100">
            <Utensils className="w-5 h-5 text-brand-maroon-700" />
            <span>Dish Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                Dish Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Amritsari Chur Chur Kulcha"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                Menu Category <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                disabled={categoriesLoading}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-white"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                Base Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-sm font-bold text-stone-400">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="290"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-stone-50/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                Compare At / MRP (₹) <span className="text-stone-400 font-normal">(Optional strike-through)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-sm font-bold text-stone-400">₹</span>
                <input
                  type="number"
                  min="1"
                  placeholder="340"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-stone-200 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-stone-50/50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1.5">Dietary Classification</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsVegetarian(true)}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isVegetarian
                      ? 'border-brand-veg bg-green-50 text-brand-veg shadow-sm'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-veg" />
                  <span>Pure Veg</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsVegetarian(false)}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    !isVegetarian
                      ? 'border-brand-nonveg bg-red-50 text-brand-nonveg shadow-sm'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-nonveg" />
                  <span>Non-Veg</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1.5">Spice Level</label>
              <select
                value={spiceLevel}
                onChange={(e) => setSpiceLevel(e.target.value as SpiceLevel)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-white"
              >
                <option value="mild">Mild (Subtle & fragrant)</option>
                <option value="medium">Medium (Classic Punjabi Tadka)</option>
                <option value="spicy">Spicy (Highway Dhaba Kick)</option>
                <option value="extra_spicy">Extra Spicy (Teekha Special)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Descriptions */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-brand-maroon-950 flex items-center gap-2 pb-2 border-b border-stone-100">
            <Sparkles className="w-5 h-5 text-brand-gold-600" />
            <span>Story & Description</span>
          </h2>

          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1">
              Short Summary Tagline
            </label>
            <input
              type="text"
              placeholder="e.g. Crisp multilayered tandoori kulcha stuffed with spicy potato and paneer"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-stone-50/50"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1">
              Detailed Culinary Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Handcrafted dough layered with pure cow ghee and crushed anardana, baked to golden perfection inside a clay tandoor and crushed by hand with a dollop of white butter..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-stone-50/50 leading-relaxed"
            />
            <span className="text-[11px] text-stone-400 block mt-1">Minimum 10 characters</span>
          </div>
        </div>

        {/* Section 3: Photos */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-brand-maroon-950 flex items-center gap-2 pb-2 border-b border-stone-100">
            <ImageIcon className="w-5 h-5 text-brand-gold-600" />
            <span>Dish Photography</span>
          </h2>

          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1">
              Image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-stone-50/50"
            />
          </div>

          <div>
            <span className="text-xs font-bold text-stone-700 block mb-2">
              Select Preset High-Definition Photo:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {PRESET_IMAGES.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageUrl(p.url)}
                  className={`relative rounded-2xl overflow-hidden border p-1 text-center transition-all ${
                    imageUrl === p.url
                      ? 'border-brand-maroon-700 ring-2 ring-brand-maroon-700/40 shadow-sm'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <div className="relative h-16 w-full rounded-xl overflow-hidden mb-1.5">
                    <Image src={p.url} alt={p.label} fill className="object-cover" />
                  </div>
                  <span className="text-[11px] font-bold text-stone-800 block truncate">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Portions, Add-ons & Kitchen Status */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-brand-maroon-950 flex items-center gap-2 pb-2 border-b border-stone-100">
            <Clock className="w-5 h-5 text-brand-gold-600" />
            <span>Portions & Kitchen Availability</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">Preparation Time (Mins)</label>
              <input
                type="number"
                min="5"
                max="180"
                value={preparationTimeMinutes}
                onChange={(e) => setPreparationTimeMinutes(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-stone-50/50"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="page-isAvailable"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-brand-maroon-700 focus:ring-brand-gold-500"
              />
              <label htmlFor="page-isAvailable" className="text-xs font-bold text-stone-900 cursor-pointer">
                Kitchen In Stock (Available)
              </label>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="page-isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-brand-gold-600 focus:ring-brand-gold-500"
              />
              <label htmlFor="page-isFeatured" className="text-xs font-bold text-stone-900 cursor-pointer">
                Feature on Homepage ★
              </label>
            </div>
          </div>

          {/* Portion Variants */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <span className="text-xs font-bold text-stone-900 block">Optional Portion Sizes (e.g. Half / Full)</span>
            {variants.map((v, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="font-bold text-stone-900">{v.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-brand-maroon-900">₹{v.price}</span>
                  <button type="button" onClick={() => handleRemoveVariant(i)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Variant Name (e.g. Half)"
                value={newVariantName}
                onChange={(e) => setNewVariantName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-xs bg-white"
              />
              <input
                type="number"
                placeholder="Price (₹)"
                value={newVariantPrice}
                onChange={(e) => setNewVariantPrice(e.target.value)}
                className="w-24 px-3 py-2 rounded-lg border border-stone-200 text-xs bg-white font-bold"
              />
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-4 py-2 rounded-lg bg-stone-800 text-white font-bold text-xs hover:bg-stone-900"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-stone-200">
          <Link
            href="/admin"
            className="px-6 py-3 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-xl bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-bold text-sm shadow-warm transition-all flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <span>Publishing Dish...</span>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Publish Food Item to Menu</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

