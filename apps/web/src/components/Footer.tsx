import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, Award, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-brand-maroon-950 text-stone-300 border-t-4 border-brand-gold-500 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-brand-maroon-800">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-gold-500 text-brand-maroon-950 font-serif font-black text-xl flex items-center justify-center">
                ਸ
              </div>
              <span className="font-serif text-2xl font-black tracking-tight text-white">
                Sai Punjabi
              </span>
            </div>
            <p className="text-sm text-stone-300 leading-relaxed">
              Bringing the authentic royal flavors of Punjab to your table. From smoky clay-oven
              tandoor kebabs to velvety Dal Bukhara, every dish is prepared with 100% pure desi ghee
              and traditional time-honored recipes.
            </p>
            <div className="flex items-center gap-3 text-xs text-brand-gold-400 font-semibold">
              <Award className="w-4 h-4 text-brand-gold-400" />
              <span>Certified Amritsari Culinary Heritage</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-bold text-white mb-4 border-b border-brand-maroon-800 pb-2">
              Explore Our Rasoi
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/menu" className="hover:text-brand-gold-400 transition-colors">
                  Full Restaurant Menu
                </Link>
              </li>
              <li>
                <Link href="/menu?category=tandoori-starters" className="hover:text-brand-gold-400 transition-colors">
                  Tandoori Starters & Tikkas
                </Link>
              </li>
              <li>
                <Link href="/menu?category=punjabi-curries" className="hover:text-brand-gold-400 transition-colors">
                  Rich Punjabi Curries
                </Link>
              </li>
              <li>
                <Link href="/menu?category=amritsari-breads-kulchas" className="hover:text-brand-gold-400 transition-colors">
                  Amritsari Chur Chur Naan
                </Link>
              </li>
              <li>
                <Link href="/festivals" className="hover:text-brand-gold-400 transition-colors">
                  Festival Deals & Coupons
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-brand-gold-400 transition-colors">
                  Customer Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Timings */}
          <div>
            <h4 className="font-serif text-lg font-bold text-white mb-4 border-b border-brand-maroon-800 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-gold-400" />
              Kitchen Hours
            </h4>
            <div className="space-y-2 text-sm text-stone-300">
              <div className="flex justify-between">
                <span>Mon – Thu:</span>
                <span className="font-semibold text-white">11:00 AM – 11:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Fri – Sun:</span>
                <span className="font-semibold text-white">11:00 AM – 11:30 PM</span>
              </div>
              <div className="pt-2 text-xs text-brand-gold-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-gold-400" />
                <span>Hot & Fresh contactless home delivery</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-bold text-white mb-4 border-b border-brand-maroon-800 pb-2">
              Visit & Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-brand-gold-400 shrink-0 mt-0.5" />
                <span>Plot 42, Punjabi Bagh Main Market, New Delhi, 110026, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-gold-400 shrink-0" />
                <a href="tel:+919876543210" className="hover:text-brand-gold-400 transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-gold-400 shrink-0" />
                <a href="mailto:hello@saipunjabifoods.com" className="hover:text-brand-gold-400 transition-colors">
                  hello@saipunjabifoods.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} Sai Punjabi Foods. All rights reserved.</p>
          <p className="flex items-center gap-1 text-stone-300">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for the love of pure Punjabi food.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/admin" className="text-brand-gold-400 hover:underline">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
