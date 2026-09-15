/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Gavel,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Clock,
  Truck,
  Store,
  Sparkles,
  Award,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { PartRequest, QualityClassification } from '../types';

interface SubmitPartBidModalProps {
  request: PartRequest | null;
  onClose: () => void;
}

export const SubmitPartBidModal: React.FC<SubmitPartBidModalProps> = ({ request, onClose }) => {
  const { suppliers, submitSupplierOffer, language } = useMarketplace();
  const isArabic = language === 'ar';

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || 'sup-1');
  const [customStoreName, setCustomStoreName] = useState<string>('');
  const [partNameOffered, setPartNameOffered] = useState<string>('');
  const [partNumberOffered, setPartNumberOffered] = useState<string>('');
  const [brandOffered, setBrandOffered] = useState<string>('');
  const [quality, setQuality] = useState<QualityClassification>('oem');
  const [priceUSD, setPriceUSD] = useState<number | ''>('');
  const [availability, setAvailability] = useState<string>('In Stock - Immediate Dispatch');
  const [deliveryTime, setDeliveryTime] = useState<string>('Same Day within 2-3 Hours');
  const [warranty, setWarranty] = useState<string>('6-Month Store Warranty');
  const [offerExpiryHours, setOfferExpiryHours] = useState<number>(24);
  const [dealerNotes, setDealerNotes] = useState<string>('');
  const [badgeChoice, setBadgeChoice] = useState<'AUTO' | 'BEST VALUE' | 'LOWEST PRICE' | 'GENUINE' | 'FASTEST'>('AUTO');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Pre-fill fields whenever the request changes
  useEffect(() => {
    if (request) {
      setPartNameOffered(request.partName);
      setPartNumberOffered(request.partNumberHint || '');
      setBrandOffered(
        request.vehicle.make === 'Toyota'
          ? 'Advics / Toyota Genuine'
          : request.vehicle.make === 'Ford'
          ? 'Motorcraft / Ford Genuine'
          : request.vehicle.make === 'BMW'
          ? 'Hella / BMW OEM'
          : request.vehicle.make === 'Hyundai'
          ? 'Hyundai Mobis'
          : `${request.vehicle.make} OEM Supplier`
      );

      // Estimate initial competitive price from lowest existing bid if any
      if (request.offers && request.offers.length > 0) {
        const lowest = Math.min(...request.offers.map((o) => o.priceUSD));
        setPriceUSD(Math.max(25, Math.round(lowest * 0.95)));
      } else {
        setPriceUSD(180);
      }

      setQuality(request.qualityPreference === 'genuine_only' ? 'genuine' : 'oem');
      setIsSuccess(false);
    }
  }, [request]);

  if (!request) return null;

  const currentLowestBid =
    request.offers && request.offers.length > 0
      ? Math.min(...request.offers.map((o) => o.priceUSD))
      : null;

  const selectedSupplierObj = suppliers.find((s) => s.id === selectedSupplierId);
  const finalSupplierName =
    selectedSupplierId === 'custom'
      ? customStoreName || 'Independent Authorized Dealer'
      : selectedSupplierObj?.name || 'Verified Auto Parts Store';

  const finalSupplierRating = selectedSupplierObj?.rating || 4.8;
  const finalInteractionsCount = selectedSupplierObj?.verifiedTransactions || 500;

  const numericPrice = typeof priceUSD === 'number' ? priceUSD : 0;
  const calculatedIQD = Math.round(numericPrice * 1320);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numericPrice || numericPrice <= 0) return;

    let computedBadge: 'BEST VALUE' | 'LOWEST PRICE' | 'GENUINE' | 'FASTEST' | undefined = undefined;
    if (badgeChoice !== 'AUTO') {
      computedBadge = badgeChoice;
    } else {
      if (currentLowestBid && numericPrice < currentLowestBid) {
        computedBadge = 'LOWEST PRICE';
      } else if (quality === 'genuine') {
        computedBadge = 'GENUINE';
      } else if (deliveryTime.toLowerCase().includes('same day') || deliveryTime.toLowerCase().includes('hour')) {
        computedBadge = 'FASTEST';
      } else {
        computedBadge = 'BEST VALUE';
      }
    }

    submitSupplierOffer(request.id, {
      supplierId: selectedSupplierId,
      supplierName: finalSupplierName,
      supplierRating: finalSupplierRating,
      verifiedInteractionsCount: finalInteractionsCount,
      partName: partNameOffered || request.partName,
      partNumber: partNumberOffered || request.partNumberHint || 'OE-SPEC-MATCH',
      brand: brandOffered || `${request.vehicle.make} OEM`,
      quality,
      priceUSD: numericPrice,
      priceIQD: calculatedIQD,
      availability,
      deliveryTime,
      warranty,
      offerExpiryHours,
      badge: computedBadge,
      notes: dealerNotes || `Guaranteed fitment for ${request.vehicle.year} ${request.vehicle.make} ${request.vehicle.model}. Contact us via platform for fast dispatch.`,
    });

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="bg-neutral-900 text-white p-5 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 px-2 py-0.5 rounded-sm bg-amber-500/10 border border-amber-500/20">
                  {isArabic ? 'تقديم عرض سعر متجر' : 'Store Dealer Bidding'}
                </span>
                <span className="text-xs text-neutral-400 font-mono">#{request.requestNumber}</span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {isArabic ? 'تقديم عرض أسعار ومنافسة على القطعة' : 'Place Competitive Bid to Supply Part'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Request Info Summary Card */}
        <div className="bg-neutral-50 p-4 border-b border-neutral-200 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">
                {isArabic ? 'المركبة المستهدفة:' : 'Target Vehicle:'}
              </span>
              <p className="text-sm font-black text-neutral-900">
                {request.vehicle.year} {request.vehicle.make} {request.vehicle.model}
                {request.vehicle.engine && ` (${request.vehicle.engine})`}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">
                {isArabic ? 'القطعة المطلوبة:' : 'Requested Part:'}
              </span>
              <p className="text-xs font-bold text-neutral-800">{request.partName}</p>
            </div>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-neutral-200/80 flex flex-wrap items-center justify-between text-[11px] text-neutral-600 gap-3">
            <div>
              <span className="font-semibold text-neutral-700">{isArabic ? 'المدينة:' : 'City:'}</span> {request.preferredCity}
              <span className="mx-1.5">•</span>
              <span className="font-semibold text-neutral-700">{isArabic ? 'الوقت المطلوب:' : 'Urgency:'}</span> {request.requiredDate}
            </div>

            {currentLowestBid !== null && (
              <div className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 border border-emerald-300/60">
                <Tag className="w-3 h-3 text-emerald-700" />
                <span>
                  {isArabic ? 'أقل سعر حالي:' : 'Current Lowest Bid:'} ${currentLowestBid} USD
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">
              {isArabic ? 'تم تقديم عرضك بنجاح!' : 'Your Bid Was Placed Successfully!'}
            </h3>
            <p className="text-xs text-neutral-600 max-w-md mx-auto">
              {isArabic
                ? `تم إرسال عرضك بقيمة $${numericPrice} للعميل مباشرة. سيتم إشعارك فور قبول العرض لترتيب التسليم.`
                : `Your bid of $${numericPrice} USD has been delivered to the customer. You will be notified instantly when accepted.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Store Identification */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-neutral-500" />
                <span>{isArabic ? 'المتجر / الحساب العارض' : 'Select Bidding Store / Dealer Profile'}</span>
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city}) — Rating {s.rating} ★ ({s.verifiedTransactions} sales)
                  </option>
                ))}
                <option value="custom">+ {isArabic ? 'إدخال اسم متجر آخر...' : 'Enter Another Store / Custom Dealer...'}</option>
              </select>

              {selectedSupplierId === 'custom' && (
                <input
                  type="text"
                  placeholder={isArabic ? 'اسم متجرك أو ورشتك...' : 'Enter your auto store or dealership name...'}
                  value={customStoreName}
                  onChange={(e) => setCustomStoreName(e.target.value)}
                  className="mt-2 w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl font-medium text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  required
                />
              )}
            </div>

            {/* Price & Currency */}
            <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-neutral-900 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isArabic ? 'سعر العرض ($ USD) *' : 'Offered Price ($ USD) *'}</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-neutral-500">$</span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      placeholder="e.g. 175"
                      value={priceUSD}
                      onChange={(e) => setPriceUSD(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 bg-white border border-neutral-300 rounded-xl font-black text-neutral-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-2.5 border border-amber-200">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase">
                    {isArabic ? 'المقابل بالدينار العراقي (IQD تقريبي):' : 'Equivalent in Iraqi Dinars:'}
                  </span>
                  <p className="text-base font-black text-amber-900 font-mono">
                    {calculatedIQD.toLocaleString()} <span className="text-xs font-bold">IQD</span>
                  </p>
                  <span className="text-[10px] text-neutral-500">
                    {isArabic ? 'بسعر صرف المنصة الموحد' : 'Standard 1,320 IQD platform rate'}
                  </span>
                </div>
              </div>
            </div>

            {/* Part Offered & Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  {isArabic ? 'القطعة والوصف' : 'Part Title / Scope'}
                </label>
                <input
                  type="text"
                  required
                  value={partNameOffered}
                  onChange={(e) => setPartNameOffered(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  {isArabic ? 'رقم القطعة الدقيق (OEM Part #)' : 'Exact Part Number (OEM)'}
                </label>
                <input
                  type="text"
                  value={partNumberOffered}
                  onChange={(e) => setPartNumberOffered(e.target.value)}
                  placeholder="e.g. 04465-60290"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Quality & Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  {isArabic ? 'الشركة المصنعة / الماركة' : 'Brand / Manufacturer'}
                </label>
                <input
                  type="text"
                  required
                  value={brandOffered}
                  onChange={(e) => setBrandOffered(e.target.value)}
                  placeholder="e.g. Toyota Genuine, Denso, Brembo, Motorcraft"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  {isArabic ? 'مستوى جودة القطعة' : 'Quality Classification'}
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as QualityClassification)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="genuine">{isArabic ? 'أصلي وكالة (Genuine OEM Japan/USA)' : 'Genuine OEM (Agency Factory Packaging)'}</option>
                  <option value="oem">{isArabic ? 'معتمد خط تجميع (OEM Tier-1 / Aisin, Denso)' : 'OEM Tier-1 Direct (Factory Supplier)'}</option>
                  <option value="aftermarket">{isArabic ? 'تجاري عالي الجودة (Certified Aftermarket)' : 'Certified Premium Aftermarket'}</option>
                  <option value="used">{isArabic ? 'مستعمل فحص وضمان (Inspected Clean Tested)' : 'Tested Clean Dismantled'}</option>
                </select>
              </div>
            </div>

            {/* Delivery Time & Warranty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{isArabic ? 'سرعة التوصيل / الجاهزية' : 'Availability & Delivery Time'}</span>
                </label>
                <select
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="Immediate Counter Pickup">{isArabic ? 'جاهز للاستلام الفوري من المعرض' : 'Ready for Counter Pickup Now'}</option>
                  <option value="Same Day within 1-2 Hours">{isArabic ? 'توصيل فوري خلال 1-2 ساعة' : 'Same Day Express (Within 1-2 Hours)'}</option>
                  <option value="Today within 3-4 Hours">{isArabic ? 'اليوم خلال 3-4 ساعات' : 'Today within 3-4 Hours'}</option>
                  <option value="Tomorrow Morning by 9:00 AM">{isArabic ? 'صباح الغد الساعة 9:00 ص' : 'Tomorrow Morning (Next-day dispatch)'}</option>
                  <option value="Within 2-3 Days (Inter-city Express)">{isArabic ? 'خلال 2-3 أيام (شحن بين المحافظات)' : 'Within 2-3 Days'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{isArabic ? 'فترة الضمان' : 'Warranty Coverage'}</span>
                </label>
                <select
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="12-Month Official Agency Warranty">{isArabic ? 'ضمان رسمي 12 شهر (سنة كاملة)' : '12-Month Official Agency Warranty'}</option>
                  <option value="6-Month Store Warranty">{isArabic ? 'ضمان المتجر 6 أشهر' : '6-Month Store Warranty'}</option>
                  <option value="3-Month Replacement Guarantee">{isArabic ? 'ضمان استبدال 3 أشهر' : '3-Month Replacement Guarantee'}</option>
                  <option value="30-Day Testing Period">{isArabic ? 'ضمان تجربة وفحص 30 يوماً' : '30-Day Testing Period'}</option>
                </select>
              </div>
            </div>

            {/* Note to customer */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                {isArabic ? 'ملاحظة أو تفاصيل خاصة للعميل' : 'Dealer Note / Vehicle Fitment Confirmation'}
              </label>
              <textarea
                rows={2}
                value={dealerNotes}
                onChange={(e) => setDealerNotes(e.target.value)}
                placeholder={
                  isArabic
                    ? 'مثال: القطعة جديدة بالكرتون الأصلي مع سيل الوكالة. متوفر التوصيل لورشتك مباشرة مع فحص الفيتنس.'
                    : 'e.g. Brand new in sealed factory carton with hologram seal. Fast delivery straight to your garage or home.'
                }
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Submit Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Gavel className="w-4 h-4 text-amber-400" />
                <span>
                  {isArabic ? `تقديم العرض ($${numericPrice || 0})` : `Submit Dealer Bid ($${numericPrice || 0} USD)`}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
