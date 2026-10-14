'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  ShieldCheck,
  MessageSquarePlus,
  X,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { IReview } from '@sai-punjabi/shared';
import { formatDate } from '../../lib/utils';
import { api } from '../../lib/api';

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [ratingBreakdown, setRatingBreakdown] = useState<Array<{ _id: number; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchReviews = async () => {
    try {
      const data = await api.get<{ reviews: IReview[]; ratingBreakdown: Array<{ _id: number; count: number }> }>(
        '/reviews'
      );
      setReviews(data.reviews || []);
      setRatingBreakdown(data.ratingBreakdown || []);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg('');
    setSubmitting(true);

    try {
      await api.post('/reviews', {
        rating,
        title,
        comment,
      });

      setSuccessMsg('Thank you! Your verified dining review has been posted.');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg('');
        setTitle('');
        setComment('');
        fetchReviews();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : '4.9';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-700">
          Authentic Guest Impressions
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-black text-brand-maroon-950">
          Customer Reviews & Ratings
        </h1>
        <p className="text-sm text-stone-600">
          Every review represents a real diner’s experience with our authentic clay-oven tandoor,
          slow-simmered gravies, and prompt home delivery.
        </p>
      </div>

      {/* Ratings Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-warm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="text-center border-r border-stone-200 pr-6">
            <span className="font-serif text-5xl font-black text-brand-maroon-950">{averageRating}</span>
            <div className="flex items-center gap-1 justify-center text-brand-gold-500 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-brand-gold-500 text-brand-gold-500" />
              ))}
            </div>
            <span className="text-xs text-stone-500 mt-1 block font-medium">Based on {totalReviews} reviews</span>
          </div>

          <div className="space-y-1.5 min-w-[200px]">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingBreakdown.find((r) => r._id === star)?.count || 0;
              const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs text-stone-600">
                  <span className="w-4 font-bold">{star}★</span>
                  <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full bg-brand-gold-500 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-6 text-right font-medium text-stone-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write Review CTA */}
        <div>
          {user ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-warm hover:scale-105 active:scale-95 transition-all"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="px-6 py-3.5 rounded-2xl bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-warm"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Sign In to Review</span>
            </Link>
          )}
        </div>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-stone-200 text-center space-y-3">
          <p className="text-sm font-semibold text-stone-800">No public reviews yet</p>
          <p className="text-xs text-stone-500">Order from our menu and be the first to share your experience!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/90 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-brand-gold-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-brand-gold-500 text-brand-gold-500" />
                    ))}
                  </div>
                  {rev.isVerifiedPurchase && (
                    <span className="text-[10px] text-green-700 font-bold flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Purchase
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-base text-stone-900">{rev.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>
              </div>

              {rev.adminResponse && (
                <div className="p-3 rounded-xl bg-brand-cream-50 border border-brand-cream-200 text-xs space-y-1">
                  <span className="font-bold text-brand-maroon-900 block">Response from Sai Punjabi Chef:</span>
                  <p className="text-stone-700">{rev.adminResponse}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-400">
                <span className="font-bold text-stone-800">{rev.customerName}</span>
                <span>{formatDate(rev.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-serif text-xl font-bold text-brand-maroon-950">Share Your Experience</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {successMsg ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                  <p className="text-sm font-bold text-green-800">{successMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Your Star Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              s <= rating
                                ? 'fill-brand-gold-500 text-brand-gold-500'
                                : 'text-stone-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Review Headline</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Crisp tandoori chur chur naan!"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Detailed Feedback</label>
                    <textarea
                      required
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell fellow diners about the taste, texture, delivery packaging, and spices..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-bold text-xs shadow-md transition-all"
                  >
                    {submitting ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
