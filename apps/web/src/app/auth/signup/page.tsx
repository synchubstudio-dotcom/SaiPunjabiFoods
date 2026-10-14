'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await signup({ name, email, phone, password });
      router.push('/menu');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-brand-maroon-700 text-brand-gold-400 font-serif font-black text-2xl flex items-center justify-center mx-auto shadow-md">
          ਸ
        </div>
        <h1 className="font-serif text-3xl font-black text-brand-maroon-950">
          Join Sai Punjabi
        </h1>
        <p className="text-xs text-stone-500">Sign up to save delivery addresses & access festival offers</p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-warm space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jaspreet Singh"
              className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
            Phone Number (10 Digits)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
            <input
              type="tel"
              required
              pattern="^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
            Create Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, 1 uppercase & 1 number"
              className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
            loading
              ? 'bg-stone-300 text-stone-500 cursor-wait'
              : 'bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {loading ? (
            <span>Creating account...</span>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <p className="text-xs text-stone-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-bold text-brand-maroon-700 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
