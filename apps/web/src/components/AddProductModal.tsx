'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Utensils,
  Clock,
  IndianRupee,
  Flame,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { ICategory, IProduct, IProductVariant, IProductAddOn, SpiceLevel } from '@sai-punjabi/shared';
import { api } from '../lib/api';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ICategory[];
  onSuccess: (product: IProduct) => void;
}

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

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?._id || '');
  const [price, setPrice] = useState<string>('');
  const [compareAtPrice, setCompareAtPrice] = useState<string>('');
  const [isVegetarian, setIsVegetarian] = useState(true);
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>('medium');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState(20);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Dynamic variants
  const [variants, setVariants] = useState<IProductVariant[]>([]);
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantPrice, setNewVariantPrice] = useState('');

  // Dynamic add-ons
  const [addOns, setAddOns] = useState<IProductAddOn[]>([]);
  const [newAddOnName, setNewAddOnName] = useState('');
  const [newAddOnPrice, setNewAddOnPrice] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim() || name.trim().length < 2) {
      setError('Dish name must be at least 2 characters long.');
      return;
    }

    if (!categoryId) {
      setError('Please select a food category.');
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Please provide a valid base price greater than 0.');
      return;
    }

    const trimmedDesc = description.trim() || shortDescription.trim();
    if (!trimmedDesc || trimmedDesc.length < 10) {
      setError('Detailed description must be at least 10 characters long.');
      return;
    }

    const validImageUrl = imageUrl.trim() || PRESET_IMAGES[0].url;

    setLoading(true);

    try {
      const payload: any = {
        name: name.trim(),
        categoryId,
        price: numPrice,
        isVegetarian,
        spiceLevel,
        shortDescription: shortDescription.trim() || undefined,
        description: trimmedDesc,
        images: [validImageUrl],
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
      onSuccess(res.product);
      onClose();
    } catch (err: any) {
      console.error('Failed to create food item', err);
      setError(err.message || 'Failed to add dish to menu. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-brand-maroon-900 to-brand-maroon-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-gold-500/20 border border-brand-gold-400/40 flex items-center justify-center text-brand-gold-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold">Add New Food Item to Menu</h2>
              <p className="text-[11px] text-brand-gold-300">
                Instantly published to menu & synchronized across active customers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5 border-b border-stone-100 pb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold-600" />
              <span>Dish Overview</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  Dish Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amritsari Paneer Tikka"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-stone-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  Food Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-white"
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

            {/* Price and Compare Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  Base Price (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-stone-400">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="290"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-stone-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  Compare At / MRP (₹) <span className="text-stone-400 font-normal">(Optional discount tag)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-stone-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="340"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-stone-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Dietary Type & Spice Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1.5">Dietary Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVegetarian(true)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
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
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-white"
                >
                  <option value="mild">Mild (Gentle & fragrant)</option>
                  <option value="medium">Medium (Classic Punjabi Tadka)</option>
                  <option value="spicy">Spicy (Highway Dhaba Kick)</option>
                  <option value="extra_spicy">Extra Spicy (Teekha Special)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Descriptions */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5 border-b border-stone-100 pb-2">
              <Utensils className="w-3.5 h-3.5 text-brand-gold-600" />
              <span>Descriptions</span>
            </h3>

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                Short Catchphrase / Highlight
              </label>
              <input
                type="text"
                placeholder="e.g. Clay-oven charred paneer in rich tomato-cashew makhani gravy"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Slow-cooked with pure desi cow ghee, hand-pounded Amritsari spices, fresh malai, and served piping hot..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-stone-50/50"
              />
              <span className="text-[11px] text-stone-400 block mt-1">Minimum 10 characters</span>
            </div>
          </div>

          {/* Section 3: Dish Image */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5 border-b border-stone-100 pb-2">
              <ImageIcon className="w-3.5 h-3.5 text-brand-gold-600" />
              <span>Dish Photo & Media</span>
            </h3>

            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                Image URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-stone-50/50"
              />
            </div>

            {/* Quick Preset Selector */}
            <div>
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide block mb-1.5">
                Quick Select Authentic Preset Photo:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PRESET_IMAGES.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(p.url)}
                    className={`relative rounded-xl overflow-hidden border p-1 text-center transition-all ${
                      imageUrl === p.url
                        ? 'border-brand-maroon-700 ring-2 ring-brand-maroon-700/30'
                        : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div className="relative h-12 w-full rounded-lg overflow-hidden mb-1">
                      <Image src={p.url} alt={p.label} fill className="object-cover" />
                    </div>
                    <span className="text-[10px] font-semibold text-stone-700 block truncate">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Operational Controls & Portion Variants */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5 border-b border-stone-100 pb-2">
              <Clock className="w-3.5 h-3.5 text-brand-gold-600" />
              <span>Portions, Add-ons & Kitchen Status</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">Prep Time (Mins)</label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={preparationTimeMinutes}
                  onChange={(e) => setPreparationTimeMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-stone-50/50"
                />
              </div>

              <div className="flex items-center gap-3 pt-5">
                <input
                  type="checkbox"
                  id="modal-isAvailable"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-maroon-700 focus:ring-brand-gold-500"
                />
                <label htmlFor="modal-isAvailable" className="text-xs font-bold text-stone-900 cursor-pointer">
                  In Stock (Available Now)
                </label>
              </div>

              <div className="flex items-center gap-3 pt-5">
                <input
                  type="checkbox"
                  id="modal-isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-gold-600 focus:ring-brand-gold-500"
                />
                <label htmlFor="modal-isFeatured" className="text-xs font-bold text-stone-900 cursor-pointer">
                  Featured on Homepage ★
                </label>
              </div>
            </div>

            {/* Optional Portion Variants */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">Portion Variants (Optional)</span>
                <span className="text-[10px] text-stone-500">e.g. Half / Full / Regular</span>
              </div>

              {variants.map((v, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-stone-200">
                  <span className="font-semibold text-stone-900">{v.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-brand-maroon-900">₹{v.price}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Variant Name (e.g. Full Portion)"
                  value={newVariantName}
                  onChange={(e) => setNewVariantName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-white"
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={newVariantPrice}
                  onChange={(e) => setNewVariantPrice(e.target.value)}
                  className="w-24 px-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-white font-bold"
                />
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 text-white font-bold text-xs hover:bg-stone-900"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Optional Add-ons */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">Add-ons & Sides (Optional)</span>
                <span className="text-[10px] text-stone-500">e.g. Extra Butter, Sirka Onion</span>
              </div>

              {addOns.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-stone-200">
                  <span className="font-semibold text-stone-900">{a.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-brand-maroon-900">+₹{a.price}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAddOn(i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add-on Name (e.g. Extra Butter)"
                  value={newAddOnName}
                  onChange={(e) => setNewAddOnName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-white"
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={newAddOnPrice}
                  onChange={(e) => setNewAddOnPrice(e.target.value)}
                  className="w-24 px-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-white font-bold"
                />
                <button
                  type="button"
                  onClick={handleAddAddOn}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 text-white font-bold text-xs hover:bg-stone-900"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Adding Dish to Menu...</span>
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
    </div>
  );
};

