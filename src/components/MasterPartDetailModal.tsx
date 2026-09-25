/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket - Part Detail View (Section 10)
 */

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
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
  AlertTriangle,
  RotateCcw,
  FileText,
  ShieldAlert,
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
    : null;

  const handleStoreClick = (supplierId: string) => {
    setSelectedSupplierIdForStore(supplierId);
    setActiveModal('supplier_store');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        dir={isArabic ? 'rtl' : 'ltr'}
        className="relative w-full max-w-3xl bg-[#0e1424] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-start justify-between gap-4 bg-black/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25">
                {part.category}
              </span>
              <span className="text-xs font-mono font-bold text-slate-300">
                OEM #{part.partNumber}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              {isArabic && part.partNameArabic ? part.partNameArabic : part.partName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {part.brand} {part.oemNumber ? `• Ref: ${part.oemNumber}` : ''}
            </p>
          </div>

          <button
            id="close-part-detail-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Fitment Assurance Banner (Immediate Answer to "Is this the right part?") */}
        {activeVehicle && (
          <div
            className={`px-5 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
              isFit
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/25 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {isFit ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>
                {isFit
                  ? `${isArabic ? 'توافق مضمون 100% لـ' : '100% Guaranteed Fit for'} ${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year} (${activeVehicle.engine})`
                  : `${isArabic ? 'يرجى التحقق من توافق المواصفات لـ' : 'Please verify fitment specifications for'} ${activeVehicle.make} ${activeVehicle.model}`}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/40">
              {isFit ? 'FIT CONFIRMED' : 'CHECK FIT'}
            </span>
          </div>
        )}

        {/* Main Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
          {/* Top Hero: Product Image & Key Purchase Decision Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Product Imagery */}
            <div className="relative aspect-[4/3] rounded-2xl bg-slate-950 overflow-hidden border border-white/10">
              <img
                src={part.imageUrl}
                alt={part.partName}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/15">
                  {part.brand} Certified
                </span>
              </div>
            </div>

            {/* Quick Purchase & Trust Box */}
            <div className="flex flex-col justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">
                  {isArabic ? 'أفضل سعر متوفر' : 'Best Available Price'}
                </div>
                <div className="text-2xl font-black text-white tracking-tight mt-0.5">
                  {formatPrice(lowestPriceUSD, lowestPriceIQD)}
                </div>

                {/* Stock & Delivery Answer */}
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>
                      {isArabic
                        ? 'متوفر بالمخزن المركزي (شحن خلال 24 ساعة)'
                        : 'In Stock • Dispatched within 24h'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {isArabic
                        ? 'توصيل لبغداد وأربيل والبصرة مع فحص فيزيائي'
                        : 'Direct delivery across Baghdad, Erbil & Basra'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>
                      {isArabic
                        ? 'ضمان سنة أو 20,000 كم ضد عيوب الصناعة'
                        : '12-Month / 20,000 KM Warranty'}
                    </span>
                  </div>
                </div>

                {/* Seller Quick Info */}
                {bestOffer && (
                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-medium">
                        {isArabic ? 'الوكيل المورد' : 'Supplied By'}
                      </div>
                      <div
                        onClick={() => handleStoreClick(bestOffer.supplierId)}
                        className="font-bold text-white hover:text-[#335aff] transition-colors cursor-pointer"
                      >
                        {bestOffer.supplierName}
                      </div>
                    </div>
                    <div className="text-right rtl:text-left">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{bestOffer.supplierRating}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{bestOffer.locationCity}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 space-y-2">
                {bestOffer && !isEntirelyOutOfStock ? (
                  <button
                    type="button"
                    id="add-part-to-cart-cta"
                    onClick={() => {
                      addToCart(part, bestOffer);
                      onClose();
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#335aff] hover:bg-[#2647e6] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer micro-press"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isArabic ? 'إضافة إلى السلة والطلب' : 'Add to Cart & Order'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setPrefilledPartRequest({
                        partName: part.partName,
                        partNumberHint: part.partNumber,
                        partDescription: `Need price quotes for ${part.partName} (${part.partNumber}).`,
                      });
                      onClose();
                      setActiveModal('request_part');
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer micro-press"
                  >
                    <Gavel className="w-4 h-4" />
                    <span>{isArabic ? 'طلب عروض أسعار للقطعة' : 'Request Quotes from Dealers'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setPrefilledPartRequest({
                      partName: part.partName,
                      partNumberHint: part.partNumber,
                      partDescription: `Inquiring about alternate brand or wholesale price for ${part.partName}.`,
                    });
                    onClose();
                    setActiveModal('request_part');
                  }}
                  className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-white/10"
                >
                  {isArabic ? 'طلب سعر جملة أو بديل تجاري' : 'Request Alternate Brand or Bulk Price'}
                </button>
              </div>
            </div>
          </div>

          {/* Progressive Disclosure Tabs: Dealer Offers vs Compatibility vs Technical Specs */}
          <div className="pt-2">
            <div className="flex border-b border-white/[0.08] gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('offers')}
                className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'offers'
                    ? 'border-[#335aff] text-[#335aff] font-bold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <span>{isArabic ? 'عروض الوكلاء المتاحة' : 'Dealer Offers'}</span>
                <span className="bg-white/10 text-white text-[10px] px-1.5 py-0.2 rounded-full ml-1.5 rtl:ml-0 rtl:mr-1.5">
                  {part.offers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('fitment')}
                className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'fitment'
                    ? 'border-[#335aff] text-[#335aff] font-bold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <span>{isArabic ? 'السيارات المتوافقة' : 'Vehicle Fitment'}</span>
                <span className="bg-white/10 text-white text-[10px] px-1.5 py-0.2 rounded-full ml-1.5 rtl:ml-0 rtl:mr-1.5">
                  {part.compatibleVehicles.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'specs'
                    ? 'border-[#335aff] text-[#335aff] font-bold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <span>{isArabic ? 'المواصفات الفنية' : 'Technical Specs'}</span>
              </button>
            </div>

            {/* TAB 1: DEALER OFFERS TABLE */}
            {activeTab === 'offers' && (
              <div className="mt-4 space-y-2.5">
                {part.offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15] flex flex-wrap items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => handleStoreClick(offer.supplierId)}
                          className="font-bold text-white hover:text-[#335aff] transition-colors cursor-pointer"
                        >
                          {offer.supplierName}
                        </span>
                        <span className="text-amber-400 text-[11px] font-bold flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {offer.supplierRating}
                        </span>
                        <span className="text-[10px] text-slate-400">{offer.locationCity}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {offer.quality === 'genuine' ? 'OEM Genuine' : 'OEM Tier-1'} • Warranty: {offer.warrantyPeriod} • Delivery: {offer.deliveryEstimate}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right rtl:text-left">
                        <div className="font-extrabold text-white text-sm">
                          {formatPrice(offer.priceUSD, offer.priceIQD)}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-medium">
                          {offer.stockQuantity} {isArabic ? 'قطع متوفرة' : 'in stock'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          addToCart(part, offer);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-[#335aff] hover:text-white text-slate-200 text-xs font-bold transition-all cursor-pointer micro-press border border-white/10"
                      >
                        {isArabic ? 'طلب' : 'Order'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: COMPATIBLE VEHICLES */}
            {activeTab === 'fitment' && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {part.compatibleVehicles.map((veh, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5"
                  >
                    <Car className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">
                        {veh.make} {veh.model}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {veh.yearStart} - {veh.yearEnd} • {veh.generation || 'All Trims'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: TECHNICAL SPECIFICATIONS */}
            {activeTab === 'specs' && (
              <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">{isArabic ? 'رقم القطعة الأصلي (OEM):' : 'OEM Part Number:'}</span>
                  <span className="font-mono font-bold text-white">{part.partNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">{isArabic ? 'الشركة المصنعة:' : 'Brand / Manufacturer:'}</span>
                  <span className="font-bold text-white">{part.brand}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">{isArabic ? 'التصنيف الرئيسي:' : 'System Category:'}</span>
                  <span className="text-white">{part.category}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">{isArabic ? 'بلد المنشأ المعتمد:' : 'Manufacturing Origin:'}</span>
                  <span className="text-white">Japan / OEM Certified</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">{isArabic ? 'الوصف الفني:' : 'Description:'}</span>
                  <span className="text-slate-300 max-w-sm text-right rtl:text-left">{part.description}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
