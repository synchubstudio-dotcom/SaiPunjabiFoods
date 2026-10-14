'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { ProductCard } from '../../components/ProductCard';
import { IProduct, ICategory } from '@sai-punjabi/shared';
import { api } from '../../lib/api';

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialFeatured = searchParams.get('featured') || '';

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [vegetarianOnly, setVegetarianOnly] = useState<boolean | null>(null);
  const [spiceLevel, setSpiceLevel] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popular');

  // Load Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get<{ categories: ICategory[] }>('/categories');
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products based on active filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (vegetarianOnly !== null) params.append('vegetarian', String(vegetarianOnly));
      if (spiceLevel) params.append('spiceLevel', spiceLevel);
      if (sortBy) params.append('sort', sortBy);
      if (initialFeatured === 'true') params.append('featured', 'true');

      const data = await api.get<{ products: IProduct[] }>(`/products?${params.toString()}`);
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to fetch dishes', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, vegetarianOnly, spiceLevel, sortBy, initialFeatured]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setVegetarianOnly(null);
    setSpiceLevel('');
    setSortBy('popular');
  };

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    Boolean(searchQuery) ||
    vegetarianOnly !== null ||
    Boolean(spiceLevel);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-700">
          Amritsari Culinary Tradition
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-black text-brand-maroon-950">
          Our Authentic Menu
        </h1>
        <p className="text-sm text-stone-600">
          Every curry, bread, and kebab is handcrafted fresh to order using time-honored Punjabi
          clay tandoor grilling and pure desi cow ghee.
        </p>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
            selectedCategory === ''
              ? 'bg-brand-maroon-700 text-white shadow-md'
              : 'bg-white hover:bg-brand-cream-100 text-stone-700 border border-stone-200'
          }`}
        >
          All Dishes
        </button>

        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
              selectedCategory === cat.slug
                ? 'bg-brand-maroon-700 text-white shadow-md'
                : 'bg-white hover:bg-brand-cream-100 text-stone-700 border border-stone-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filter and Search Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search dishes (e.g. Butter Chicken, Kulcha, Dal)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-stone-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dietary Veg / Non-Veg Selector */}
          <div className="md:col-span-3 flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setVegetarianOnly(null)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                vegetarianOnly === null ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
              }`}
            >
              All Food
            </button>
            <button
              onClick={() => setVegetarianOnly(true)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                vegetarianOnly === true ? 'bg-white text-brand-veg shadow-sm' : 'text-stone-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-brand-veg" />
              Pure Veg
            </button>
            <button
              onClick={() => setVegetarianOnly(false)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                vegetarianOnly === false ? 'bg-white text-brand-nonveg shadow-sm' : 'text-stone-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-brand-nonveg" />
              Non-Veg
            </button>
          </div>

          {/* Spice Level Selector */}
          <div className="md:col-span-2">
            <select
              value={spiceLevel}
              onChange={(e) => setSpiceLevel(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-stone-50/50"
            >
              <option value="">Spice: All</option>
              <option value="mild">Mild (Subtle)</option>
              <option value="medium">Medium (Classic)</option>
              <option value="spicy">Spicy (Highway Tadka)</option>
              <option value="extra_spicy">Extra Spicy (Teekha)</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold-500 bg-stone-50/50"
            >
              <option value="popular">Most Popular</option>
              <option value="rating_desc">Top Rated ★</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Filter tags & clear */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100">
            <span className="text-stone-500 font-medium">
              Filtered by: {selectedCategory && `Category: ${selectedCategory} • `}
              {vegetarianOnly !== null && (vegetarianOnly ? 'Pure Veg • ' : 'Non-Veg • ')}
              {spiceLevel && `Spice: ${spiceLevel} • `}
              {searchQuery && `"${searchQuery}"`}
            </span>
            <button
              onClick={clearFilters}
              className="text-brand-maroon-700 hover:text-brand-maroon-900 font-bold underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Dishes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-stone-100 animate-pulse border border-stone-200" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-cream-100 mx-auto flex items-center justify-center text-brand-maroon-700">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">No dishes match your filters</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search query, spice selection, or clear dietary filters to explore our full menu.
          </p>
          <button
            onClick={clearFilters}
            className="px-6 py-2.5 rounded-full bg-brand-maroon-700 text-white font-bold text-xs hover:bg-brand-maroon-800 transition-colors"
          >
            Show All Dishes
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Showing {products.length} Authentic Punjabi Specialt{products.length === 1 ? 'y' : 'ies'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-pulse space-y-4">
          <div className="h-8 w-48 bg-stone-200 mx-auto rounded" />
          <div className="h-64 bg-stone-100 rounded-3xl" />
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
