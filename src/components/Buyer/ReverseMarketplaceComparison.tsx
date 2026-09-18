/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket - Transparent Reverse Marketplace Offer Comparison Matrix (Section 26)
 */

import React, { useState } from 'react';
import {
  Gavel,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Star,
  ArrowRight,
  Sparkles,
  DollarSign,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

export interface ComparisonOffer {
  id: string;
  dealerId: string;
  dealerName: string;
  dealerCity: string;
  dealerRating: number;
  dealerVerified: boolean;
  priceUSD: number;
  priceIQD: number;
  condition: 'genuine' | 'oem' | 'aftermarket' | 'used';
  warranty: string;
  deliveryEstimate: string;
  deliveryCostUSD: number;
  availability: 'in_stock_today' | 'in_stock_2days' | 'on_order';
  notes?: string;
}

interface ReverseMarketplaceComparisonProps {
  requestId: string;
  requestTitle: string;
  vehicleName: string;
  offers: ComparisonOffer[];
  onSelectOffer: (offer: ComparisonOffer) => void;
}

export const ReverseMarketplaceComparison: React.FC<ReverseMarketplaceComparisonProps> = ({
  requestId,
  requestTitle,
  vehicleName,
  offers,
  onSelectOffer,
}) => {
  const { language, formatPrice, currency } = useMarketplace();
  const isArabic = language === 'ar';

  const [sortBy, setSortBy] = useState<'price' | 'delivery' | 'rating'>('price');

  const sortedOffers = [...offers].sort((a, b) => {
    if (sortBy === 'price') return a.priceUSD - b.priceUSD;
    if (sortBy === 'rating') return b.dealerRating - a.dealerRating;
    return 0;
  });

  const conditionLabels: Record<string, { en: string; ar: string; color: string }> = {
    genuine: { en: 'Genuine OEM', ar: 'أصلي وكالة', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    oem: { en: 'OEM Spec', ar: 'مواصفة وكالة OEM', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    aftermarket: { en: 'Aftermarket', ar: 'تجاري معتمد', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    used: { en: 'Tested Used', ar: 'مستعمل مفحوص', color: 'text-slate-400 bg-white/5 border-white/10' },
  };

  return (
    <div className="space-y-4" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header with Transparent Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0e1424] p-4 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {isArabic ? 'مقارنة شفافة' : 'TRANSPARENT COMPARISON'}
            </span>
            <span className="text-xs text-slate-400">
              {offers.length} {isArabic ? 'عروض أسعار حقيقية' : 'live dealer offers'}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-black text-white mt-1">
            {requestTitle} • <span className="text-indigo-400 font-semibold text-xs sm:text-sm">{vehicleName}</span>
          </h3>
        </div>

        {/* Sort Criteria */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px]">{isArabic ? 'الترتيب حسب:' : 'Sort by:'}</span>
          <button
            onClick={() => setSortBy('price')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              sortBy === 'price'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 bg-white/[0.04] hover:bg-white/[0.08]'
            }`}
          >
            {isArabic ? 'الأقل سعراً' : 'Lowest Price'}
          </button>
          <button
            onClick={() => setSortBy('rating')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              sortBy === 'rating'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 bg-white/[0.04] hover:bg-white/[0.08]'
            }`}
          >
            {isArabic ? 'تقييم الوكيل' : 'Dealer Rating'}
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-white/10 bg-[#0e1424] shadow-xl">
        <table className="w-full text-xs text-left rtl:text-right">
          <thead className="bg-black/40 text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
            <tr>
              <th className="p-4">{isArabic ? 'الوكيل والمتجر' : 'Dealer / Store'}</th>
              <th className="p-4">{isArabic ? 'الجودة والمواصفة' : 'Condition'}</th>
              <th className="p-4">{isArabic ? 'الضمان المعتمد' : 'Warranty'}</th>
              <th className="p-4">{isArabic ? 'مدة التوصيل' : 'Delivery'}</th>
              <th className="p-4">{isArabic ? 'السعر الشفاف' : 'Price'}</th>
              <th className="p-4 text-center">{isArabic ? 'الإجراء الأساسي' : 'Primary Action'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedOffers.map((off, idx) => {
              const cond = conditionLabels[off.condition] || conditionLabels.genuine;
              return (
                <tr key={off.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Dealer */}
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center font-black text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{off.dealerName}</span>
                          {off.dealerVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{off.dealerCity}</span>
                          <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {off.dealerRating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Condition */}
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold border ${cond.color}`}>
                      {isArabic ? cond.ar : cond.en}
                    </span>
                  </td>

                  {/* Warranty */}
                  <td className="p-4">
                    <div className="font-semibold text-slate-200">{off.warranty}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {isArabic ? 'استبدال فوري أو استرجاع' : 'Direct replacement guarantee'}
                    </div>
                  </td>

                  {/* Delivery */}
                  <td className="p-4">
                    <div className="font-semibold text-emerald-300 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>{off.deliveryEstimate}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {off.deliveryCostUSD === 0 ? (isArabic ? 'توصيل مجاني' : 'Free Delivery') : `+$${off.deliveryCostUSD}`}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="p-4">
                    <div className="font-black text-base text-white">
                      {formatPrice(off.priceUSD, off.priceIQD)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {currency === 'USD'
                        ? `${off.priceIQD.toLocaleString()} د.ع`
                        : `$${off.priceUSD} USD`}
                    </div>
                  </td>

                  {/* Primary Action (Section 3: ONE PRIMARY ACTION) */}
                  <td className="p-4 text-center">
                    <button
                      id={`btn-choose-offer-${off.id}`}
                      onClick={() => onSelectOffer(off)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer min-h-[44px]"
                    >
                      {isArabic ? 'اختيار هذا العرض' : 'Choose Offer'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile-First Stacked Cards View */}
      <div className="lg:hidden space-y-3">
        {sortedOffers.map((off, idx) => {
          const cond = conditionLabels[off.condition] || conditionLabels.genuine;
          return (
            <div
              key={off.id}
              className="p-4 rounded-2xl bg-[#0e1424] border border-white/10 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1">
                      {off.dealerName}
                      {off.dealerVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    </h4>
                    <span className="text-[10px] text-slate-400">{off.dealerCity} • ⭐ {off.dealerRating}</span>
                  </div>
                </div>

                <div className="text-right rtl:text-left">
                  <div className="text-sm font-black text-white">{formatPrice(off.priceUSD, off.priceIQD)}</div>
                  <span className="text-[9px] text-slate-400">{off.warranty}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${cond.color}`}>
                  {isArabic ? cond.ar : cond.en}
                </span>
                <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  {off.deliveryEstimate}
                </span>
              </div>

              {/* Dominant Primary Action CTA */}
              <button
                id={`btn-mobile-choose-${off.id}`}
                onClick={() => onSelectOffer(off)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
              >
                <span>{isArabic ? 'اختيار هذا العرض وإتمام الشراء' : 'Choose Offer & Order'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
