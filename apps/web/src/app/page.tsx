import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Flame,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Utensils,
  ChevronRight,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { FestivalBanner } from '../components/FestivalBanner';
import { IProduct, ICategory, IPromotion } from '@sai-punjabi/shared';

// Server-side fetching helper with safe fallback
async function getHomeData() {
  const API_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';

  let categories: ICategory[] = [];
  let featuredProducts: IProduct[] = [];
  let promotions: IPromotion[] = [];

  try {
    const [catRes, prodRes, promoRes] = await Promise.all([
      fetch(`${API_URL}/categories`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/products/featured`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/promotions/active`, { next: { revalidate: 60 } }),
    ]);

    if (catRes.ok) {
      const data = await catRes.json();
      categories = data.data?.categories || [];
    }
    if (prodRes.ok) {
      const data = await prodRes.json();
      featuredProducts = data.data?.products || [];
    }
    if (promoRes.ok) {
      const data = await promoRes.json();
      promotions = data.data?.promotions || [];
    }
  } catch (error) {
    console.warn('Could not fetch remote data during build, using defaults.');
  }

  return { categories, featuredProducts, promotions };
}

export default async function HomePage() {
  const { categories, featuredProducts, promotions } = await getHomeData();

  // Structured Data (JSON-LD) for LocalBusiness & Restaurant
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Sai Punjabi',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=1200&q=80',
    description: 'Authentic Amritsari and Punjabi cuisine prepared with clay-oven tandoor and pure desi ghee.',
    servesCuisine: ['Punjabi', 'North Indian', 'Tandoori'],
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Plot 42, Punjabi Bagh Main Market',
      addressLocality: 'New Delhi',
      addressRegion: 'Delhi',
      postalCode: '110026',
      addressCountry: 'IN',
    },
    telephone: '+919876543210',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '11:00',
        closes: '23:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Friday', 'Saturday', 'Sunday'],
        opens: '11:00',
        closes: '23:30',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-16 sm:space-y-24 pb-20">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-cream-100 via-brand-cream-50 to-white pt-10 sm:pt-16 pb-16 border-b border-brand-cream-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-maroon-100 border border-brand-maroon-300 text-brand-maroon-800 text-xs font-bold uppercase tracking-wider shadow-sm">
                  <Flame className="w-4 h-4 text-brand-maroon-700 animate-bounce" />
                  <span>The Pride of Punjab in Every Bite</span>
                </div>

                <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black text-brand-maroon-950 tracking-tight leading-[1.1]">
                  Flavors of Punjab, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-maroon-700 to-brand-gold-600">
                    Royal Heritage.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-stone-700 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Slow-simmered over charcoal embers, tossed in golden desi ghee, and charred in authentic clay tandoors. Relish velvety Dal Makhani, crisp Amritsari Chur Chur Kulchas, and smoky melt-in-mouth kebabs.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    href="/menu"
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-bold text-base shadow-warm hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <Utensils className="w-5 h-5" />
                    <span>Order Food Online</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/festivals"
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-brand-cream-100 text-brand-maroon-900 font-bold text-base border-2 border-brand-gold-400/80 shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-brand-gold-600" />
                    <span>Festival Deals</span>
                  </Link>
                </div>

                {/* Highlights bar */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-cream-200">
                  <div className="text-center lg:text-left">
                    <span className="font-serif text-xl sm:text-2xl font-black text-brand-maroon-900 block">
                      100% Pure
                    </span>
                    <span className="text-xs text-stone-500 font-medium">Desi Cow Ghee</span>
                  </div>
                  <div className="text-center lg:text-left">
                    <span className="font-serif text-xl sm:text-2xl font-black text-brand-maroon-900 block">
                      35 Mins
                    </span>
                    <span className="text-xs text-stone-500 font-medium">Average Delivery</span>
                  </div>
                  <div className="text-center lg:text-left">
                    <span className="font-serif text-xl sm:text-2xl font-black text-brand-maroon-900 block">
                      4.9 ★
                    </span>
                    <span className="text-xs text-stone-500 font-medium">Over 2,400+ Reviews</span>
                  </div>
                </div>
              </div>

              {/* Right Hero Visual */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto w-72 h-72 sm:w-96 sm:h-96 lg:w-[440px] lg:h-[440px] rounded-full p-3 bg-gradient-to-tr from-brand-gold-500 via-brand-maroon-700 to-brand-gold-400 shadow-2xl">
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-inner">
                    <Image
                      src="https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=1000&q=80"
                      alt="Authentic Punjabi Butter Chicken and Dal Makhani"
                      fill
                      priority
                      className="object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>

                {/* Floating highlight badge */}
                <div className="absolute -bottom-4 left-4 sm:left-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-brand-gold-300 flex items-center gap-3.5 animate-in fade-in slide-in-from-bottom-4">
                  <div className="w-10 h-10 rounded-full bg-brand-gold-100 flex items-center justify-center text-brand-gold-700 font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Award-Winning Dal Makhani</h4>
                    <p className="text-[11px] text-stone-500">16-hour slow cooked charcoal degh</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FESTIVAL PROMOTION BANNER */}
        {promotions.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FestivalBanner promotions={promotions} />
          </div>
        )}

        {/* CATEGORY SHOWCASE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-700 block mb-1">
                Explore The Rasoi
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-maroon-950">
                Authentic Food Categories
              </h2>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-maroon-700 hover:text-brand-maroon-900 transition-colors"
            >
              <span>View Complete Menu</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/menu?category=${cat.slug}`}
                className="group flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:shadow-warm hover:-translate-y-1 transition-all"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 border-2 border-brand-cream-300 group-hover:border-brand-gold-500 transition-colors">
                  <Image
                    src={cat.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80'}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif font-bold text-sm text-stone-900 group-hover:text-brand-maroon-700 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        {/* CHEF's FEATURED DISHES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-700 block mb-1">
                Handpicked Specialties
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-maroon-950">
                Chef’s Signature Dishes
              </h2>
            </div>
            <Link
              href="/menu?featured=true"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-maroon-700 hover:text-brand-maroon-900 transition-colors"
            >
              <span>Explore All Signatures</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>

        {/* RESTAURANT HERITAGE STORY BANNER */}
        <section className="bg-brand-maroon-950 text-white py-16 sm:py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E59E2B_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-400">
                  The Sai Punjabi Legacy
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-black leading-tight">
                  Clay Tandoors & Generational Amritsari Recipes
                </h2>
                <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
                  In Punjab, food is not merely nourishment—it is hospitality, laughter, and celebration.
                  At Sai Punjabi, we grind our secret garam masalas weekly, churn our dahi fresh every morning,
                  and bake our kulchas inside traditional mud ovens stoked with glowing charcoal.
                </p>
                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="space-y-1">
                    <span className="font-serif text-3xl font-extrabold text-brand-gold-400">100%</span>
                    <h4 className="text-sm font-bold text-white">Pure Desi Ghee</h4>
                    <p className="text-xs text-stone-400">No palm oils, only authentic cow ghee goodness.</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-serif text-3xl font-extrabold text-brand-gold-400">Fresh</span>
                    <h4 className="text-sm font-bold text-white">Hand-Pounded Spices</h4>
                    <p className="text-xs text-stone-400">Coriander, anardana, and kasuri methi from Punjab farms.</p>
                  </div>
                </div>
                <div className="pt-2">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-gold-500 hover:bg-brand-gold-600 text-brand-maroon-950 font-bold text-sm transition-transform hover:scale-105"
                  >
                    <span>Read Our Journey</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden border-2 border-brand-gold-500/40 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1000&q=80"
                  alt="Traditional Clay Oven Tandoori Cooking"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CUSTOMER REVIEWS TEASER */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-700">
              Verified Dining Experiences
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-maroon-950">
              Loved by Foodies Across the City
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center gap-1 text-brand-gold-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-brand-gold-500 text-brand-gold-500" />
                ))}
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                “Hands down the most authentic Amritsari Kulcha!”
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                The chur chur naan was piping hot, layered with butter, and the pindi chole had that dark, tangy anardana flavor you only get in Amritsar. Truly exceptional!
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                <span className="font-bold text-stone-900">Jaspreet Kaur</span>
                <span className="text-green-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Purchase
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center gap-1 text-brand-gold-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-brand-gold-500 text-brand-gold-500" />
                ))}
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                “Bukhara-level Dal Makhani at half the price”
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                The 16-hour slow cooking is unmistakable. The texture is creamy and velvety without being overpowering. Butter chicken was equally sublime with smoky charcoal pieces.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                <span className="font-bold text-stone-900">Rohit Malhotra</span>
                <span className="text-green-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Purchase
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center gap-1 text-brand-gold-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-brand-gold-500 text-brand-gold-500" />
                ))}
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                “Lightning fast delivery & piping hot food!”
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Ordered family dinner on a Sunday evening. Arrived in 28 minutes flat with leakproof eco containers. The Patiala Shahi Lassi was thick with malai!
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                <span className="font-bold text-stone-900">Amanpreet Singh</span>
                <span className="text-green-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Purchase
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
