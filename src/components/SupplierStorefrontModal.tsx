/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Store,
  ShieldCheck,
  Star,
  MapPin,
  Phone,
  Clock,
  ThumbsUp,
  Package,
  CheckCircle,
  Truck,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const SupplierStorefrontModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    selectedSupplierIdForStore,
    suppliers,
    masterParts,
    reviews,
    addToCart,
    language,
    formatPrice,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [activeTab, setActiveTab] = useState<'inventory' | 'reviews'>('inventory');

  if (activeModal !== 'supplier_store' || !selectedSupplierIdForStore) return null;

  const supplier = suppliers.find((s) => s.id === selectedSupplierIdForStore) || suppliers[0];

  // Dealer inventory items
  const supplierOffers = masterParts.flatMap((part) =>
    part.offers
      .filter((o) => o.supplierId === supplier.id)
      .map((offer) => ({ masterPart: part, offer }))
  );

  const supplierReviews = reviews.filter((r) => r.supplierId === supplier.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="glass-panel border border-white/10 bg-slate-900/95 text-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="relative bg-slate-950/90 text-white p-6 border-b border-white/10">
          <button
            onClick={() => setActiveModal(null)}
            className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
                {(supplier?.companyName || 'SP').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">{supplier.companyName}</h2>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {isArabic ? 'مورد معتمد' : 'Verified Dealer'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {supplier.city} • {supplier.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    {supplier.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Score pill */}
            <div className="bg-slate-900/90 border border-white/10 p-3 rounded-2xl text-center self-start sm:self-auto shadow-inner">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 font-black text-xl">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{supplier.rating}</span>
              </div>
              <span className="text-[10px] text-slate-400 block font-medium mt-0.5">
                {supplier.repeatCustomerPercentage}% {isArabic ? 'عملاء مكررون' : 'repeat buyers'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 px-6 pt-3 gap-5 text-xs font-bold bg-slate-950/40">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{isArabic ? 'كتالوج ومخزون المتجر' : 'Storefront Catalogue'} ({supplierOffers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>{isArabic ? 'تقييمات العملاء الموثقة' : 'Verified Reviews'} ({supplierReviews.length})</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'inventory' && (
            <div className="space-y-3">
              {supplierOffers.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  {isArabic ? 'لا توجد عروض نشطة حالياً لهذا المورد.' : 'No active listings currently displayed for this supplier.'}
                </div>
              ) : (
                supplierOffers.map(({ masterPart, offer }) => (
                  <div
                    key={offer.id}
                    className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 hover:border-white/20 transition-all flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={masterPart.imageUrl}
                        alt={masterPart.partName}
                        className="w-14 h-14 rounded-xl object-cover bg-slate-900 border border-white/10"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-[11px]">
                            {masterPart.partNumber}
                          </span>
                          <span className="font-bold text-white text-sm">{masterPart.partName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>{isArabic ? 'الدرجة:' : 'Grade:'} <strong className="uppercase text-emerald-400">{offer.quality}</strong> ({offer.brand})</span>
                          <span>•</span>
                          <span>{isArabic ? 'الضمان:' : 'Warranty:'} {offer.warranty}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="font-black text-white text-base">
                          {formatPrice(offer.priceUSD, offer.priceIQD)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {offer.availability}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          addToCart(masterPart, offer);
                          setActiveModal('cart');
                        }}
                        className="px-4 py-2 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all"
                      >
                        {isArabic ? 'شراء القطعة' : 'Order Part'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4 text-xs">
              {/* Review summary stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-white/5 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">{isArabic ? 'التقييم العام' : 'Overall Rating'}</span>
                  <span className="text-lg font-black text-white">{supplier.rating} / 5.0</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">{isArabic ? 'أصالة القطع' : 'Part Authenticity'}</span>
                  <span className="text-lg font-black text-emerald-400">4.9 ★</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">{isArabic ? 'سرعة التوصيل' : 'Delivery Speed'}</span>
                  <span className="text-lg font-black text-blue-400">4.8 ★</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">{isArabic ? 'تكرار التعامل' : 'Repeat Rate'}</span>
                  <span className="text-lg font-black text-white">
                    {supplier.repeatCustomerPercentage}%
                  </span>
                </div>
              </div>

              {/* Review cards */}
              <div className="space-y-3">
                {supplierReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{rev.reviewerName}</span>
                        <span className="text-[10px] font-semibold bg-white/5 text-slate-300 px-2 py-0.5 rounded-full capitalize border border-white/10">
                          {rev.reviewerType}
                        </span>
                        {rev.isVerifiedBuyer && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20">
                            <CheckCircle className="w-3 h-3" />
                            {isArabic ? 'مشتري موثق' : 'Verified Buyer'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rev.overallRating}</span>
                      </div>
                    </div>

                    <p className="text-slate-300 leading-relaxed">"{rev.comment}"</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] text-slate-400">
                      <div>{isArabic ? 'القطعة:' : 'Part:'} {rev.partPurchased}</div>
                      {rev.wouldDealAgain && (
                        <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <ThumbsUp className="w-3 h-3" />
                          {isArabic ? 'ينصح بالتعامل مع المورد' : 'Would buy from this dealer again'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
