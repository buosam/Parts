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
    <div className="flex items-center justify-between py-1.5 border-b border-neutral-100 last:border-b-0 text-xs">
      <span className="font-semibold text-neutral-700">{label}</span>
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
                star <= value ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
              }`}
            />
          </button>
        ))}
        <span className="font-bold text-neutral-900 ml-1.5 w-6 text-right">
          {value}.0
        </span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-neutral-200 flex flex-col text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="font-bold text-neutral-900 text-base">
              {isArabic ? 'تقييم المورد وجودة القطع' : 'Rate Dealer & Part Authenticity'}
            </h3>
            <p className="text-neutral-500 text-[11px]">
              Order #{selectedOrderForRating.orderNumber} • {selectedOrderForRating.supplierName}
            </p>
          </div>
          <button
            onClick={() => setActiveModal('cart')}
            className="text-neutral-400 hover:text-neutral-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <div className="font-bold text-neutral-900 text-sm">Thank You for Your Feedback!</div>
            <p className="text-neutral-500 text-xs">
              Your verified review helps ensure authentic spare parts across Iraq.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-3">
            {/* Category Breakdown (PRD Section 31) */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <StarRatingSelector
                label="Part Accuracy & OEM Match"
                value={partAccuracy}
                onChange={setPartAccuracy}
              />
              <StarRatingSelector
                label="Delivery & Dispatch Speed"
                value={deliverySpeed}
                onChange={setDeliverySpeed}
              />
              <StarRatingSelector
                label="Packaging & Tamper Seal"
                value={communication}
                onChange={setCommunication}
              />
            </div>

            {/* Binary Would Deal Again */}
            <div>
              <label className="block font-semibold text-neutral-700 mb-1.5">
                Would you deal with this supplier again?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWouldDealAgain(true)}
                  className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all ${
                    wouldDealAgain
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Yes, absolutely</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWouldDealAgain(false)}
                  className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all ${
                    !wouldDealAgain
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>No, had issues</span>
                </button>
              </div>
            </div>

            {/* Written Review */}
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Written Review (Optional)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience regarding part packaging, authenticity markings, and delivery punctuality..."
                className="w-full p-2.5 border border-neutral-300 rounded-xl focus:outline-emerald-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
            >
              Publish Verified Review
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
