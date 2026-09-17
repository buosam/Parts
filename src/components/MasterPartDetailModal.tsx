/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  ShieldCheck,
  Shield,
  Truck,
  Star,
  Store,
  Clock,
  Car,
  Layers,
  ShoppingBag,
  MapPin,
  Check,
  Gavel,
  HelpCircle,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { MasterPart, SupplierOffer } from '../types';

interface MasterPartDetailModalProps {
  part: MasterPart | null;
  onClose: () => void;
}

export const MasterPartDetailModal: React.FC<MasterPartDetailModalProps> = ({ part, onClose }) => {
  const {
    activeVehicle,
    addToCart,
    setSelectedSupplierIdForStore,
    setActiveModal,
    setPrefilledPartRequest,
    formatPrice,
    language,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'offers' | 'fitment' | 'specs'>('offers');
  const isArabic = language === 'ar';

  if (!part) return null;

  const inStockOffers = part.offers.filter(
    (o) => o.stockQuantity > 0 && o.stockStatus !== 'out_of_stock'
  );
  const isEntirelyOutOfStock = part.offers.length === 0 || inStockOffers.length === 0;

  const lowestPriceUSD = part.offers.length > 0 ? Math.min(...part.offers.map((o) => o.priceUSD)) : 0;
  const lowestPriceIQD = part.offers.length > 0 ? Math.min(...part.offers.map((o) => o.priceIQD)) : 0;

  const bestOffer =
    part.offers.find((o) => o.quality === 'genuine' && o.stockQuantity > 0) ||
    inStockOffers[0] ||
    part.offers[0];

  const isFit = activeVehicle
    ? part.compatibleVehicles.some(
        (v) =>
          v.make.toLowerCase() === activeVehicle.make.toLowerCase() &&
          v.model.toLowerCase() === activeVehicle.model.toLowerCase() &&
          activeVehicle.year >= v.yearStart &&
          activeVehicle.year <= v.yearEnd
      )
    : false;

  const handleStoreClick = (supplierId: string) => {
    setSelectedSupplierIdForStore(supplierId);
    setActiveModal('supplier_store');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0e1424] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-start justify-between gap-4 bg-black/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {part.category}
              </span>
              <span className="text-xs font-mono font-bold text-slate-300">
                {part.partNumber}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {isArabic && part.partNameArabic ? part.partNameArabic : part.partName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {part.brand} {part.oemNumber ? `• OEM: ${part.oemNumber}` : ''}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fitment Status Banner */}
        {activeVehicle && (
          <div
            className={`px-5 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
              isFit
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-slate-900 border-white/5 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {isFit ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <Car className="w-4 h-4 text-slate-400" />
              )}
              <span>
                {isFit
                  ? `${isArabic ? 'توافق مضمون 100% لـ' : '100% Guaranteed Fit for'} ${activeVehicle.make} ${activeVehicle.model} (${activeVehicle.year})`
                  : `${isArabic ? 'تحقق من توافق المواصفات مع' : 'Check compatibility for'} ${activeVehicle.make} ${activeVehicle.model}`}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10">
              {isFit ? 'FIT CONFIRMED' : 'CHECK FIT'}
            </span>
          </div>
        )}

        {/* Body Section */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Top Hero: Product Image & Key Purchase Decision Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Image */}
            <div className="relative h-56 sm:h-64 rounded-2xl bg-slate-950/80 overflow-hidden border border-white/10">
              <img
                src={part.imageUrl}
                alt={part.partName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Quick Purchase & Trust Pillars */}
            <div className="flex flex-col justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold">
                  {isArabic ? 'يبدأ السعر من' : 'Starting from'}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {formatPrice(lowestPriceUSD, lowestPriceIQD)}
                </div>

                {/* 4 Essential Trust Pillars */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white text-[11px]">{isArabic ? 'أصلي 100%' : 'Genuine OEM'}</div>
                      <div className="text-[10px] text-slate-400">{isArabic ? 'مستورد معتمد' : 'Certified'}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white text-[11px]">{isArabic ? 'ضمان 12 شهراً' : '12M Warranty'}</div>
                      <div className="text-[10px] text-slate-400">{isArabic ? 'ضمان استبدال' : 'Replacement'}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white text-[11px]">{isArabic ? 'توصيل غداً' : 'Fast Delivery'}</div>
                      <div className="text-[10px] text-slate-400">{isArabic ? 'بغداد وأربيل' : 'Baghdad/Erbil'}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white text-[11px]">
                        {isEntirelyOutOfStock ? (isArabic ? 'غير متوفر' : 'Out of Stock') : (isArabic ? 'متوفر اليوم' : 'In Stock')}
                      </div>
                      <div className="text-[10px] text-slate-400">{part.offers.length} {isArabic ? 'عروض' : 'Offers'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="mt-5">
                {!isEntirelyOutOfStock && bestOffer ? (
                  <button
                    id="modal-quick-buy-btn"
                    onClick={() => {
                      addToCart(part, bestOffer);
                      onClose();
                      setActiveModal('cart');
                    }}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isArabic ? 'شراء الآن وإتمام الطلب' : 'Buy Now'}</span>
                  </button>
                ) : (
                  <button
                    id="modal-request-offers-btn"
                    onClick={() => {
                      setPrefilledPartRequest({
                        partName: part.partName,
                        partNumberHint: part.partNumber,
                        partDescription: `Need price quotes for ${part.partName} (${part.partNumber}).`,
                        qualityPreference: 'genuine_or_oem',
                      });
                      onClose();
                      setActiveModal('request_part');
                    }}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Gavel className="w-4 h-4 text-slate-950" />
                    <span>{isArabic ? 'طلب عروض أسعار من الوكلاء' : 'Get Offers from Dealers'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs for In-depth Details */}
          <div className="border-b border-white/10 flex gap-4 text-xs font-bold pt-2">
            <button
              onClick={() => setActiveTab('offers')}
              className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'offers'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <span>{isArabic ? 'عروض الوكلاء المتاحة' : 'Dealer Offers'}</span>
              <span className="bg-white/10 text-white text-[10px] px-2 py-0.2 rounded-full">
                {part.offers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('fitment')}
              className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'fitment'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>{isArabic ? 'السيارات المتوافقة' : 'Vehicle Fitment'}</span>
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'specs'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isArabic ? 'المواصفات والبدائل' : 'Specs & Details'}</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'offers' && (
            <div className="space-y-3">
              {part.offers.map((offer) => (
                <div
                  key={offer.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm hover:text-indigo-400 cursor-pointer" onClick={() => handleStoreClick(offer.supplierId)}>
                        {offer.supplierName}
                      </span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {offer.quality}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px] mt-1">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <strong className="text-white">{offer.supplierRating}</strong>
                      </span>
                      <span>• {offer.warrantyMonths} {isArabic ? 'شهر ضمان' : 'months warranty'}</span>
                      <span>• {offer.deliveryTimeEstimate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <div className="text-left sm:text-right rtl:text-right sm:rtl:text-left">
                      <div className="font-black text-white text-base">
                        {formatPrice(offer.priceUSD, offer.priceIQD)}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        addToCart(part, offer);
                        onClose();
                        setActiveModal('cart');
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
                    >
                      {isArabic ? 'شراء' : 'Buy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'fitment' && (
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400">
                {isArabic
                  ? 'هذه القطعة متوافقة ومطابقة تماماً للموديلات وسنوات الصنع التالية:'
                  : 'This part is guaranteed compatible with the following vehicle models and engines:'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {part.compatibleVehicles.map((v, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5">
                    <Car className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">
                        {v.make} {v.model} ({v.yearStart} - {v.yearEnd})
                      </div>
                      <div className="text-[11px] text-slate-400">{v.engine || 'All Standard Engines'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
                {part.description}
              </p>
              {part.alternativeNumbers && part.alternativeNumbers.length > 0 && (
                <div>
                  <span className="text-slate-400 block mb-1 font-semibold">{isArabic ? 'أرقام القطع البديلة (Cross References):' : 'Cross References & Alternatives:'}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {part.alternativeNumbers.map((num, i) => (
                      <span key={i} className="font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-[11px]">
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

