'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Clock,
  Star,
  ShieldCheck,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Flame,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { IProduct, IProductVariant, IProductAddOn, IReview } from '@sai-punjabi/shared';
import { useCart } from '../../../context/CartContext';
import { formatINR } from '../../../lib/utils';
import { api } from '../../../lib/api';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Customization selection
  const [selectedVariant, setSelectedVariant] = useState<IProductVariant | undefined>(undefined);
  const [selectedAddOns, setSelectedAddOns] = useState<IProductAddOn[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    const fetchDish = async () => {
      try {
        const data = await api.get<{ product: IProduct }>(`/products/${slug}`);
        setProduct(data.product);

        if (data.product.variants && data.product.variants.length > 0) {
          setSelectedVariant(data.product.variants[0]);
        }

        // Fetch dish reviews
        const reviewData = await api.get<{ reviews: IReview[] }>(`/reviews?productId=${data.product._id}`);
        setReviews(reviewData.reviews || []);
      } catch (err) {
        console.error('Failed to load dish details', err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchDish();
  }, [slug]);

  const toggleAddOn = (addon: IProductAddOn) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.name === addon.name);
      if (exists) return prev.filter((a) => a.name !== addon.name);
      return [...prev, addon];
    });
  };

  const calculateTotal = () => {
    if (!product) return 0;
    const base = selectedVariant ? selectedVariant.price : product.price;
    const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
    return (base + addOnsTotal) * quantity;
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(
      product,
      quantity,
      selectedVariant?.name,
      selectedAddOns.map((a) => ({ name: a.name, price: a.price }))
    );
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
        <div className="h-6 w-48 bg-stone-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-96 bg-stone-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-10 w-3/4 bg-stone-200 rounded" />
            <div className="h-6 w-1/4 bg-stone-200 rounded" />
            <div className="h-24 bg-stone-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Dish not found in menu</h2>
        <p className="text-sm text-stone-500">The dish you are looking for may have been retired or renamed.</p>
        <Link href="/menu" className="inline-block px-6 py-2.5 rounded-full bg-brand-maroon-700 text-white font-bold text-xs">
          Return to Menu
        </Link>
      </div>
    );
  }

  const categoryObj = typeof product.categoryId === 'object' ? product.categoryId : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-stone-500">
        <Link href="/" className="hover:text-brand-maroon-700">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <Link href="/menu" className="hover:text-brand-maroon-700">Menu</Link>
        {categoryObj && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <Link href={`/menu?category=${categoryObj.slug}`} className="hover:text-brand-maroon-700">
              {categoryObj.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-bold truncate">{product.name}</span>
      </nav>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Image Showcase */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative h-80 sm:h-[450px] w-full rounded-3xl overflow-hidden border border-stone-200 shadow-warm bg-stone-100">
            <Image
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80'}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-sm bg-white/95 backdrop-blur-sm border-2 flex items-center justify-center p-0.5 shadow ${
                  product.isVegetarian ? 'border-brand-veg' : 'border-brand-nonveg'
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    product.isVegetarian ? 'bg-brand-veg' : 'bg-brand-nonveg'
                  }`}
                />
              </div>

              <span className="bg-white/90 backdrop-blur-sm text-stone-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-brand-gold-600" />
                {product.preparationTimeMinutes} mins prep
              </span>
            </div>
          </div>
        </div>

        {/* Right Product Selection & Details */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-gold-700">
                {categoryObj ? categoryObj.name : 'Authentic Punjabi Special'}
              </span>
              <span className="text-stone-300">•</span>
              <div className="flex items-center gap-1 text-brand-gold-600 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-brand-gold-500 text-brand-gold-500" />
                <span>{product.averageRating?.toFixed(1) || '5.0'}</span>
                <span className="text-stone-400 font-normal">({reviews.length} reviews)</span>
              </div>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-black text-brand-maroon-950">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl sm:text-3xl font-black text-brand-maroon-900">
                {formatINR(selectedVariant ? selectedVariant.price : product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-sm text-stone-400 line-through">
                  {formatINR(product.compareAtPrice)}
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-4">
            {product.description}
          </p>

          {/* Portion Size Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 border-t border-stone-100 pt-4">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                Choose Portion Size
              </label>
              <div className="grid grid-cols-2 gap-3">
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
                        <Check className="w-4 h-4 text-brand-maroon-700" />
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

          {/* Add-ons Selection */}
          {product.addOns && product.addOns.length > 0 && (
            <div className="space-y-3 border-t border-stone-100 pt-4">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                Add-ons & Accompaniments
              </label>
              <div className="space-y-2">
                {product.addOns.map((addon) => {
                  const isChecked = selectedAddOns.some((a) => a.name === addon.name);
                  return (
                    <div
                      key={addon.name}
                      onClick={() => toggleAddOn(addon)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        isChecked ? 'border-brand-gold-500 bg-amber-50/50' : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-brand-gold-600 focus:ring-brand-gold-500"
                        />
                        <span className="text-xs font-semibold text-stone-900">{addon.name}</span>
                      </div>
                      <span className="text-xs font-bold text-brand-maroon-900">
                        +{formatINR(addon.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dietary & Allergens tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {product.dietaryInfo?.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-brand-cream-100 text-brand-maroon-800 border border-brand-cream-300"
              >
                {tag}
              </span>
            ))}
            {product.allergens && product.allergens.length > 0 && (
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
                Allergens: {product.allergens.join(', ')}
              </span>
            )}
          </div>

          {/* Quantity and Order Action Bar */}
          <div className="p-4 rounded-2xl bg-brand-cream-50 border border-brand-cream-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-stone-300 bg-white rounded-xl shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-stone-100 rounded-l-xl text-stone-600"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-stone-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-stone-100 rounded-r-xl text-stone-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div>
                <span className="text-[10px] text-stone-500 uppercase block font-semibold">Total</span>
                <span className="text-lg font-black text-brand-maroon-950">
                  {formatINR(calculateTotal())}
                </span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.isAvailable}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                product.isAvailable
                  ? addedSuccess
                    ? 'bg-green-600 text-white'
                    : 'bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white hover:scale-105 active:scale-95'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Order!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{product.isAvailable ? 'Add to Cart' : 'Currently Unavailable'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="space-y-6 border-t border-stone-200 pt-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl font-bold text-brand-maroon-950">
              Customer Reviews ({reviews.length})
            </h3>
            <p className="text-xs text-stone-500">Real feedback from verified diners</p>
          </div>
          <Link
            href="/reviews"
            className="text-xs font-bold text-brand-maroon-700 hover:text-brand-maroon-900 underline"
          >
            Leave a Review
          </Link>
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-2">
            <p className="text-sm font-semibold text-stone-700">No reviews yet for this dish.</p>
            <p className="text-xs text-stone-500">Be the first to order and share your authentic dining review!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-brand-gold-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-brand-gold-500 text-brand-gold-500" />
                    ))}
                  </div>
                  {rev.isVerifiedPurchase && (
                    <span className="text-[10px] text-green-700 font-bold flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      <ShieldCheck className="w-3 h-3" /> Verified Purchase
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-stone-900">{rev.title}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>
                <span className="text-[11px] text-stone-400 block pt-1">— {rev.customerName}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
