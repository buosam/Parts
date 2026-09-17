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
  Truck,
  Store,
  Tag,
  Sparkles,
  Clock,
  Car,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { PartRequest, QualityClassification } from '../types';

interface SubmitPartBidModalProps {
  request: PartRequest | null;
  onClose: () => void;
}

export const SubmitPartBidModal: React.FC<SubmitPartBidModalProps> = ({ request, onClose }) => {
  const { suppliers, submitSupplierOffer, language, formatPrice } = useMarketplace();
  const isArabic = language === 'ar';

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || 'sup-1');
  const [partNameOffered, setPartNameOffered] = useState<string>('');
  const [brandOffered, setBrandOffered] = useState<string>('');
  const [quality, setQuality] = useState<QualityClassification>('oem');
  const [priceUSD, setPriceUSD] = useState<number | ''>('');
  const [deliveryTime, setDeliveryTime] = useState<string>('Delivery Tomorrow');
  const [warranty, setWarranty] = useState<string>('12-Month Warranty');
  const [dealerNotes, setDealerNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (request) {
      setPartNameOffered(request.partName);
      setBrandOffered(
        request.vehicle.make === 'Toyota'
          ? 'Toyota Genuine'
          : request.vehicle.make === 'Ford'
          ? 'Motorcraft / Ford Genuine'
          : request.vehicle.make === 'BMW'
          ? 'BMW OEM'
          : `${request.vehicle.make} OEM`
      );

      if (request.offers && request.offers.length > 0) {
        const lowest = Math.min(...request.offers.map((o) => o.priceUSD));
        setPriceUSD(Math.max(20, Math.round(lowest * 0.95)));
      } else {
        setPriceUSD(120);
      }

      setQuality(request.qualityPreference === 'genuine_only' ? 'genuine' : 'oem');
      setIsSuccess(false);
    }
  }, [request]);

  if (!request) return null;

  const selectedSupplierObj = suppliers.find((s) => s.id === selectedSupplierId);
  const supplierName = selectedSupplierObj?.name || selectedSupplierObj?.companyName || 'Verified Dealer';
  const numericPrice = typeof priceUSD === 'number' ? priceUSD : 0;
  const calculatedIQD = Math.round(numericPrice * 1500);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numericPrice || numericPrice <= 0) return;

    submitSupplierOffer(request.id, {
      supplierId: selectedSupplierId,
      supplierName,
      supplierRating: selectedSupplierObj?.rating || 4.9,
      verifiedInteractionsCount: selectedSupplierObj?.verifiedTransactions || 480,
      partName: partNameOffered || request.partName,
      partNumber: request.partNumberHint || 'OE-SPEC-MATCH',
      brand: brandOffered || `${request.vehicle.make} OEM`,
      quality,
      priceUSD: numericPrice,
      priceIQD: calculatedIQD,
      availability: 'In Stock',
      deliveryTime,
      warranty,
      offerExpiryHours: 24,
      notes: dealerNotes || `Guaranteed fitment for ${request.vehicle.year} ${request.vehicle.make} ${request.vehicle.model}.`,
    });

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="bg-[#0e1424] text-white border border-white/10 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="bg-[#090d16] p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {isArabic ? 'تقديم عرض سعر' : 'Send Offer'}
              </h3>
              <p className="text-xs text-slate-400">
                {request.vehicle.make} {request.vehicle.model} ({request.vehicle.year}) • {request.city || 'Erbil'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">
              {isArabic ? 'تم إرسال العرض بنجاح!' : 'Offer Submitted!'}
            </h4>
            <p className="text-xs text-slate-300">
              {isArabic ? 'تم إخطار العميل بعرضك التنافسي.' : 'The customer has been notified of your offer.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Target Request Summary */}
            <div className="p-3.5 bg-black/30 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {isArabic ? 'القطعة المطلوبة' : 'Requested Part'}
              </span>
              <p className="text-sm font-bold text-white">{request.partName}</p>
              {request.partNumberHint && (
                <p className="text-xs font-mono text-indigo-300">OEM: {request.partNumberHint}</p>
              )}
            </div>

            {/* Price Inputs */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isArabic ? 'السعر المقترح ($ USD / د.ع IQD)' : 'Your Offer Price ($ USD / IQD)'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute start-3 top-3 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="120"
                    value={priceUSD}
                    onChange={(e) => setPriceUSD(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full ps-8 pe-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm font-black text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden min-h-[44px]"
                  />
                </div>
                <div className="flex items-center px-3 py-2.5 bg-black/20 border border-white/5 rounded-xl text-xs font-bold text-slate-300 min-h-[44px]">
                  د.ع {calculatedIQD.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Brand & Quality */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isArabic ? 'الماركة المصنعة' : 'Brand'}
                </label>
                <input
                  type="text"
                  value={brandOffered}
                  onChange={(e) => setBrandOffered(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isArabic ? 'نوع القطعة' : 'Condition / Quality'}
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden min-h-[44px]"
                >
                  <option value="genuine" className="bg-slate-900">{isArabic ? 'أصلي وكالة (Genuine OEM)' : 'Genuine OEM'}</option>
                  <option value="oem" className="bg-slate-900">{isArabic ? 'تطابق معتمد (Tier 1 OEM)' : 'Tier 1 OEM'}</option>
                  <option value="aftermarket" className="bg-slate-900">{isArabic ? 'تجاري ممتاز (Aftermarket)' : 'Certified Aftermarket'}</option>
                </select>
              </div>
            </div>

            {/* Warranty & Delivery */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isArabic ? 'مدة الضمان' : 'Warranty'}
                </label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isArabic ? 'وقت التوصيل' : 'Delivery'}
                </label>
                <input
                  type="text"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden min-h-[44px]"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isArabic ? 'ملاحظة للعميل (اختياري)' : 'Optional Note to Customer'}
              </label>
              <input
                type="text"
                placeholder={isArabic ? 'مثال: علبة أصلية مع ختم الضمان' : 'e.g. Original sealed packaging'}
                value={dealerNotes}
                onChange={(e) => setDealerNotes(e.target.value)}
                className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden min-h-[44px]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                <Gavel className="w-4 h-4" />
                <span>{isArabic ? 'إرسال العرض للعميل' : 'Submit Offer'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
