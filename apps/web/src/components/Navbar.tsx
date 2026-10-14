'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Menu as MenuIcon, X, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, setIsDrawerOpen } = useCart();
  const pathname = usePathname();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu' },
    { label: 'Festival Offers', href: '/festivals' },
    { label: 'Our Story', href: '/about' },
    { label: 'Reviews', href: '/reviews' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-brand-maroon-900 text-brand-gold-300 text-xs py-2 px-4 text-center font-medium tracking-wide border-b border-brand-maroon-800">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-gold-400 animate-pulse" />
          <span>
            Festive Delight: Flat 20% OFF on all Tandoori & Biryani feasts with code{' '}
            <strong className="text-white font-bold bg-brand-maroon-800 px-1.5 py-0.5 rounded">
              DIWALI20
            </strong>
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-brand-cream-50/95 backdrop-blur-md border-b border-brand-cream-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-maroon-800 to-brand-maroon-600 flex items-center justify-center text-brand-gold-400 font-serif font-black text-2xl shadow-md border-2 border-brand-gold-400/60 group-hover:scale-105 transition-transform">
              ਸ
            </div>
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-maroon-900 block leading-tight">
                Sai Punjabi
              </span>
              <span className="text-[10px] sm:text-xs tracking-widest text-brand-gold-700 font-bold uppercase block -mt-1">
                Authentic Amritsari Rasoi
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors relative py-1 ${
                  isActive(link.href)
                    ? 'text-brand-maroon-700 font-bold'
                    : 'text-stone-700 hover:text-brand-maroon-700'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold-500 rounded-full" />
                )}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-brand-maroon-100 text-brand-maroon-800 rounded-full border border-brand-maroon-300 flex items-center gap-1 hover:bg-brand-maroon-200"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4">
            {/* User Account Button */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-2 rounded-full hover:bg-brand-cream-100 text-brand-maroon-800 transition-colors"
                    aria-label="Account options"
                  >
                    <div className="w-9 h-9 rounded-full bg-brand-maroon-700 text-white flex items-center justify-center font-bold text-sm shadow">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="text-sm font-bold text-stone-900 truncate">{user.name}</p>
                        <p className="text-xs text-stone-500 truncate">{user.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2.5 text-sm font-semibold text-brand-maroon-700 hover:bg-brand-maroon-50"
                        >
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        href="/account"
                        className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                      >
                        My Account & Addresses
                      </Link>

                      <Link
                        href="/account#orders"
                        className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                      >
                        Order History
                      </Link>

                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full text-brand-maroon-800 bg-brand-cream-100 hover:bg-brand-cream-200 border border-brand-cream-300 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2.5 rounded-full bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white shadow-md transition-transform hover:scale-105 active:scale-95"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-gold-500 text-brand-maroon-950 font-black text-xs w-5 h-5 rounded-full flex items-center justify-center shadow border-2 border-white">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-700 hover:text-brand-maroon-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-brand-cream-50 border-b border-brand-cream-200 px-4 pt-2 pb-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-base font-semibold py-2 px-3 rounded-lg ${
                  isActive(link.href)
                    ? 'bg-brand-maroon-700 text-white'
                    : 'text-stone-800 hover:bg-brand-cream-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-bold py-2 px-3 rounded-lg bg-brand-maroon-100 text-brand-maroon-900 border border-brand-maroon-300"
              >
                Admin Panel
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
};
