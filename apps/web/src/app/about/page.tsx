import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Flame, Heart, Sparkles, Utensils, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-16 py-10 pb-20">
      {/* Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-brand-maroon-950 text-white p-8 sm:p-16 border-2 border-brand-gold-500/50 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-400">
              Generational Amritsari Heritage
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-black leading-tight">
              The Soul of Punjab, The Fire of the Tandoor.
            </h1>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              Sai Punjabi was born out of a single uncompromised promise: to serve food that tastes
              exactly like the dhabas along the Grand Trunk Road and the bustling food lanes of
              Amritsar—steeped in pure desi cow ghee, fragrant roasted spices, and slow charcoal fire.
            </p>
          </div>
        </div>
      </section>

      {/* Culinary Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-700">
            Our Kitchen Pillars
          </span>
          <h2 className="font-serif text-3xl font-extrabold text-brand-maroon-950">
            How We Honor Punjabi Tradition
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-brand-cream-100 text-brand-maroon-700 flex items-center justify-center font-bold">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900">Charcoal Clay Tandoor</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We never use gas ovens for our breads or tikkas. Live coals and wet clay impart that authentic
              earthy char and smoky essence that defines real Punjabi barbecue.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-brand-cream-100 text-brand-maroon-700 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900">100% Pure Desi Ghee</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Our gravies, dal makhani, and chur chur kulchas are cooked exclusively in genuine cow ghee.
              No artificial colors, MSG, or chemical stabilizers—ever.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-brand-cream-100 text-brand-maroon-700 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900">Slow Degh Cooking</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Our Bukhara Dal Makhani simmers gently for sixteen hours overnight, breaking down whole black
              lentils into a velvety, creamy masterpiece.
            </p>
          </div>
        </div>
      </section>

      {/* Visual Kitchen Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-brand-cream-50 p-8 sm:p-12 rounded-3xl border border-brand-cream-200">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-700">
              The Chef's Craft
            </span>
            <h2 className="font-serif text-3xl font-extrabold text-brand-maroon-950">
              Fresh Daily Masalas & Hand-Churned Malai Lassi
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Our kitchen wakes up before sunrise. We hand-roast whole cumin, green cardamom, cloves, and
              Kashmiri chilies before pounding them in traditional stone mortars. Fresh curds are churned
              in tall earthen vessels to create our signature Patiala Shahi Sweet Malai Lassi.
            </p>
            <div className="pt-2">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-maroon-700 text-white font-bold text-xs uppercase tracking-wider shadow-warm hover:bg-brand-maroon-800 transition-all"
              >
                <span>Taste Our Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden border border-brand-cream-300 shadow-md">
            <Image
              src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80"
              alt="Slow cooked Dal Makhani and Punjabi Breads"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
