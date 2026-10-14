'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setSent(false);
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-700">
          Get in Touch
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-black text-brand-maroon-950">
          Contact Sai Punjabi
        </h1>
        <p className="text-sm text-stone-600">
          Have an inquiry for bulk festival catering, party orders, or feedback for our chefs?
          We are always delighted to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Information Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6">
            <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              Restaurant Information
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-maroon-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900 uppercase">Our Kitchen Location</h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Plot 42, Punjabi Bagh Main Market, New Delhi, Delhi, 110026, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand-maroon-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900 uppercase">Telephone & WhatsApp</h4>
                  <a href="tel:+919876543210" className="text-xs text-brand-maroon-800 font-bold hover:underline block mt-0.5">
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand-maroon-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900 uppercase">Customer Support Email</h4>
                  <a href="mailto:hello@saipunjabifoods.com" className="text-xs text-brand-maroon-800 font-bold hover:underline block mt-0.5">
                    hello@saipunjabifoods.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand-maroon-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900 uppercase">Operational Hours</h4>
                  <p className="text-xs text-stone-600 mt-0.5">Monday – Thursday: 11:00 AM – 11:00 PM</p>
                  <p className="text-xs text-stone-600">Friday – Sunday: 11:00 AM – 11:30 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Inquiry Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-warm space-y-6">
            <h3 className="font-serif text-xl font-bold text-brand-maroon-950">
              Send Us a Message
            </h3>

            {sent ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                <h4 className="font-bold text-base text-stone-900">Message Received!</h4>
                <p className="text-xs text-stone-600 max-w-sm mx-auto">
                  Thank you for reaching out to Sai Punjabi. Our manager will connect with you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jasleen Kaur"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Message / Event Details</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your catering query, event size, or dining inquiry..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-warm hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
