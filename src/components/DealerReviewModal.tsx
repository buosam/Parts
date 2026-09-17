/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Star, ThumbsUp, ThumbsDown, CheckCircle, ShieldCheck } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const DealerReviewModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    selectedOrderForRating,
    addDealerReview,
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';

  const [partAccuracy, setPartAccuracy] = useState(5);
  const [deliverySpeed, setDeliverySpeed] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [wouldDealAgain, setWouldDealAgain] = useState(true);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (activeModal !== 'rate_dealer' || !selectedOrderForRating) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const overallRating = Number(
      ((partAccuracy + deliverySpeed + communication) / 3).toFixed(1)
    );

    addDealerReview({
      supplierId: selectedOrderForRating.supplierId,
      orderId: selectedOrderForRating.id,
      reviewerName: selectedOrderForRating.customerName || 'Ahmed Al-Tikriti',
      reviewerType: 'individual',
      partPurchased: selectedOrderForRating.items[0]?.partName || 'Spare Part',
      overallRating,
      categoryRatings: {
        partAccuracy,
        deliverySpeed,
        communication,
      },
      wouldDealAgain,
      comment: comment || 'Genuine part arrived sealed as advertised. Great dealer to work with in Baghdad.',
      isVerifiedBuyer: true,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setActiveModal('cart');
    }, 1200);
  };

  const StarRatingSelector = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
  }) => (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0 text-xs">
      <span className="font-semibold text-slate-300">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 text-amber-400 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-4 h-4 ${
                star <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
              }`}
            />
          </button>
        ))}
        <span className="font-bold text-white ml-2 w-6 text-right font-mono">
          {value}.0
        </span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="glass-panel border border-white/10 bg-slate-900/95 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col text-xs"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="font-bold text-white text-base">
              {isArabic ? 'تقييم المورد وجودة القطع' : 'Rate Dealer & Part Authenticity'}
            </h3>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Order #{selectedOrderForRating.orderNumber} • {selectedOrderForRating.supplierName}
            </p>
          </div>
          <button
            onClick={() => setActiveModal('cart')}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <div className="font-bold text-white text-sm">
              {isArabic ? 'شكراً لتقييمك ومشاركتك!' : 'Thank You for Your Feedback!'}
            </div>
            <p className="text-slate-400 text-xs">
              {isArabic
                ? 'تقييمك الموثق يساهم في ضمان جودة وأصالة قطع الغيار في العراق.'
                : 'Your verified review helps ensure authentic spare parts across Iraq.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-3">
            {/* Category Breakdown */}
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-white/5 space-y-1">
              <StarRatingSelector
                label={isArabic ? 'مطابقة القطعة ورقم الـ OEM' : 'Part Accuracy & OEM Match'}
                value={partAccuracy}
                onChange={setPartAccuracy}
              />
              <StarRatingSelector
                label={isArabic ? 'سرعة التجهيز والتوصيل' : 'Delivery & Dispatch Speed'}
                value={deliverySpeed}
                onChange={setDeliverySpeed}
              />
              <StarRatingSelector
                label={isArabic ? 'جودة التغليف وسيل الوكالة' : 'Packaging & Tamper Seal'}
                value={communication}
                onChange={setCommunication}
              />
            </div>

            {/* Binary Would Deal Again */}
            <div>
              <label className="block font-semibold text-slate-300 mb-2">
                {isArabic ? 'هل تنصح بالتعامل مع هذا المورد مجدداً؟' : 'Would you deal with this supplier again?'}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setWouldDealAgain(true)}
                  className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all ${
                    wouldDealAgain
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'نعم، بالتأكيد' : 'Yes, absolutely'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWouldDealAgain(false)}
                  className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all ${
                    !wouldDealAgain
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                      : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'لا، واجهت مشاكل' : 'No, had issues'}</span>
                </button>
              </div>
            </div>

            {/* Written Review */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                {isArabic ? 'مراجعة نصية (اختياري)' : 'Written Review (Optional)'}
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  isArabic
                    ? 'شارك تجربتك بخصوص سلامة الغلاف، مطابقة الماركة، وسرعة الشحن...'
                    : 'Share your experience regarding part packaging, authenticity markings, and delivery punctuality...'
                }
                className="w-full p-3 bg-slate-950/70 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-xs uppercase tracking-wide"
            >
              {isArabic ? 'نشر التقييم الموثق' : 'Publish Verified Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
