/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  ShieldCheck,
  Truck,
  Star,
  Store,
  Clock,
  Car,
  Layers,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  MapPin,
  FileCheck,
  Mail,
  Bell,
  BellRing,
  Check,
  AlertCircle,
  Info,
  Trash2,
  Send,
  Sparkles,
  Gavel,
  Zap,
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
    stockAlerts,
    addStockAlert,
    removeStockAlert,
    isPartAlerted,
    getPartAlert,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'offers' | 'fitment' | 'specs'>('offers');
  const isArabic = language === 'ar';

  // Stock alert state
  const [showAlertSection, setShowAlertSection] = useState<boolean>(false);
  const [alertTargetOffer, setAlertTargetOffer] = useState<SupplierOffer | null>(null);
  const [emailInput, setEmailInput] = useState<string>('ops.masoud@gmail.com');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [notifyAnySupplier, setNotifyAnySupplier] = useState<boolean>(true);
  const [qualityPreference, setQualityPreference] = useState<string>('all');
  const [submittingAlert, setSubmittingAlert] = useState<boolean>(false);
  const [alertSuccessBanner, setAlertSuccessBanner] = useState<string | null>(null);

  if (!part) return null;

  const inStockOffers = part.offers.filter(
    (o) => o.stockQuantity > 0 && o.stockStatus !== 'out_of_stock'
  );
  const isEntirelyOutOfStock = part.offers.length === 0 || inStockOffers.length === 0;

  const masterAlert = getPartAlert(part.id);
  const targetedAlert = alertTargetOffer ? getPartAlert(part.id, alertTargetOffer.supplierId) : null;
  const currentActiveAlert = targetedAlert || masterAlert;

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

  const handleRegisterAlert = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) return;

    setSubmittingAlert(true);
    setTimeout(() => {
      addStockAlert({
        partId: part.id,
        partNumber: part.partNumber,
        partName: part.partName,
        supplierId: alertTargetOffer?.supplierId,
        supplierName: alertTargetOffer?.supplierName,
        email: emailInput.trim(),
        phone: phoneInput.trim() || undefined,
        preferredQuality: qualityPreference !== 'all' ? qualityPreference : undefined,
        notifyAnySupplier: alertTargetOffer ? notifyAnySupplier : true,
      });
      setSubmittingAlert(false);
      setAlertSuccessBanner(
        isArabic
          ? `تم تفعيل التنبيه بنجاح! سنرسل بريداً إلكترونياً إلى ${emailInput} بمجرد توفر القطعة لدى الموردين.`
          : `Stock alert active! We will email ${emailInput} immediately when ${part.partNumber} is restocked.`
      );
    }, 350);
  };

  const handleOpenAlertForOffer = (offer: SupplierOffer) => {
    setAlertTargetOffer(offer);
    setShowAlertSection(true);
    setAlertSuccessBanner(null);
  };

  const handleCancelAlert = (alertId: string) => {
    removeStockAlert(alertId);
    setAlertSuccessBanner(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-white/15 flex flex-col animate-in zoom-in-95">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-mono font-bold text-xs p-1 text-center shadow-lg">
              {part.brand.slice(0, 6)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-md">
                  {part.partNumber}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {part.category}
                </span>
                {isEntirelyOutOfStock && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{isArabic ? 'نفذت الكمية' : 'Out of Stock'}</span>
                  </span>
                )}
              </div>
              <h2 className="font-extrabold text-white text-base sm:text-lg mt-1 leading-snug">
                {isArabic && part.partNameArabic ? part.partNameArabic : part.partName}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Out-of-Stock Alert Headline Notice */}
        {isEntirelyOutOfStock && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-3 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-amber-300">
                  {isArabic
                    ? 'هذه القطعة غير متوفرة حالياً في المخازن المركزية'
                    : 'Currently Out of Stock Across All Local Distributors'}
                </div>
                <div className="text-amber-200/80 text-[11px] mt-0.5">
                  {isArabic
                    ? 'يمكنك تسجيل بريدك الإلكتروني لإعلامك فور وصول شحنات جديدة من الوكلاء المعتمدين.'
                    : 'Subscribe below to receive an automated notification as soon as verified suppliers list new stock.'}
                </div>
              </div>
            </div>

            {!showAlertSection && !currentActiveAlert && (
              <button
                id="out-of-stock-quick-notify-btn"
                onClick={() => setShowAlertSection(true)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto shrink-0 shadow-md cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{isArabic ? 'أعلمني عند التوفر' : 'Email Me When Available'}</span>
              </button>
            )}
          </div>
        )}

        {/* Fitment Banner */}
        {activeVehicle && (
          <div
            className={`px-5 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
              isFit
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {isFit ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              )}
              <span>
                {isFit
                  ? `${isArabic ? 'متوافق تماماً ومطابق لـ' : '100% Guaranteed Fit for'} ${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year} (${activeVehicle.engine})`
                  : `${isArabic ? 'تنبيه: غير مسجل في كتالوج' : 'Verify compatibility for'} ${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year}`}
              </span>
            </div>
            <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-white/10">
              {isFit ? 'FITMENT CONFIRMED' : 'CHECK SPECS'}
            </span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 px-5 pt-2 gap-4 text-xs font-bold bg-white/[0.02]">
          <button
            onClick={() => setActiveTab('offers')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'offers'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>{isArabic ? 'عروض الموردين المتاحة' : 'Available Supplier Offers'}</span>
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
            <span>{isArabic ? 'المركبات المتوافقة' : 'Vehicle Fitment'}</span>
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
            <span>{isArabic ? 'المواصفات والبدائل' : 'Specs & Cross References'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Active Alert Success Banner */}
          {alertSuccessBanner && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{alertSuccessBanner}</span>
              </div>
              <button
                onClick={() => setAlertSuccessBanner(null)}
                className="text-emerald-400 hover:text-emerald-300 text-xs font-bold shrink-0 cursor-pointer"
              >
                {isArabic ? 'إغلاق' : 'Dismiss'}
              </button>
            </div>
          )}

          {/* Sourcing & Dealer Bidding Card for Out-of-Stock Parts */}
          {isEntirelyOutOfStock && (
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-amber-500/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Gavel className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                      {isArabic ? 'طلب استيراد ومزايدة خاصة' : 'Dealer Bidding Available'}
                    </span>
                    <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded">
                      {isArabic ? '120+ متجر معتمد' : '120+ Stores'}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white mt-1">
                    {isArabic ? 'القطعة غير متوفرة؟ اطلب من أصحاب المتاجر المزايدة عليها' : 'Need this item urgently? Request Dealer Bids'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
                    {isArabic
                      ? 'يمكنك إنشاء طلب فوري لتقوم محلات قطع الغيار وتجار الجملة بتقديم عروض أسعار متنافسة لتوفير هذه القطعة مع الضمان وسرعة التوصيل.'
                      : 'Post this part to our live exchange. Authorized store owners and dealers across Baghdad, Erbil, and Basra will submit competitive bids.'}
                  </p>
                </div>
              </div>

              <button
                id="modal-request-dealer-bids-btn"
                onClick={() => {
                  setPrefilledPartRequest({
                    partName: part.partName,
                    partNumberHint: part.partNumber,
                    partDescription: `Looking for ${part.partName} (${part.partNumber}). Out of stock in catalog, requesting quotes from store owners.`,
                    qualityPreference: 'genuine_or_oem',
                  });
                  onClose();
                  setActiveModal('request_part');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto hover:scale-[1.02] cursor-pointer"
              >
                <Gavel className="w-4 h-4" />
                <span>{isArabic ? 'طلب مزايدة المتاجر الآن' : 'Request Dealer Bids'}</span>
              </button>
            </div>
          )}

          {/* TAB 1: Multi-Supplier Offers */}
          {activeTab === 'offers' && (
            <div className="space-y-3.5">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>
                  {isArabic
                    ? 'يقوم الموردون المعتمدون بإرفاق عروضهم لنفس القطعة الرئيسية لتسهيل المقارنة:'
                    : 'Compare verified supplier offers for this exact master part:'}
                </span>
                <span className="font-bold text-slate-200">
                  {part.offers.length} {isArabic ? 'عروض متاحة' : 'Offers Available'}
                </span>
              </div>

              {part.offers.length === 0 ? (
                <div className="p-8 text-center bg-white/[0.02] rounded-2xl border border-white/10 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-sm">
                    {isArabic ? 'لا توجد عروض حالية لهذه القطعة' : 'No active supplier offers currently'}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    {isArabic
                      ? 'تم تسجيل القطعة في الكتالوج الرئيسي. سجل بريدك الإلكتروني لتصلك عروض الموردين فور طرحها.'
                      : 'This part is registered in our master database. Register your email above to receive notifications when suppliers stock it.'}
                  </p>
                </div>
              ) : (
                part.offers.map((offer) => {
                  const isGenuine = offer.quality === 'genuine';
                  const isOEM = offer.quality === 'oem';
                  const isOfferInStock = offer.stockQuantity > 0 && offer.stockStatus !== 'out_of_stock';
                  const isOfferAlerted = isPartAlerted(part.id, offer.supplierId);

                  return (
                    <div
                      key={offer.id}
                      id={`supplier-offer-row-${offer.id}`}
                      className={`p-4 sm:p-5 rounded-2xl border ${
                        !isOfferInStock
                          ? 'border-amber-500/30 bg-amber-500/[0.03]'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                      } transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                    >
                      {/* Supplier info & Quality badge */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                              isGenuine
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : isOEM
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-slate-800 text-slate-300 border border-white/10'
                            }`}
                          >
                            {offer.quality}
                          </span>

                          <div
                            onClick={() => handleStoreClick(offer.supplierId)}
                            className="font-bold text-white hover:text-indigo-400 cursor-pointer flex items-center gap-1.5 text-sm transition-colors"
                          >
                            <Store className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{offer.supplierName}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </div>

                          <div className="flex items-center gap-1 text-xs text-slate-300 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/10">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="font-bold">{offer.supplierRating}</span>
                            <span className="text-[10px] text-slate-400">
                              ({offer.verifiedInteractionsCount})
                            </span>
                          </div>

                          {!isOfferInStock && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{isArabic ? 'نفذت الكمية' : 'Out of Stock'}</span>
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-300 font-medium">
                          Brand: <span className="font-bold text-white">{offer.brand}</span> • Warranty:{' '}
                          <span className="text-slate-200 font-semibold">{offer.warranty}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span
                            className={`flex items-center gap-1 ${
                              isOfferInStock ? 'text-emerald-400' : 'text-slate-400'
                            } font-medium`}
                          >
                            <Truck className="w-3.5 h-3.5" />
                            {offer.deliveryTime}
                          </span>
                          <span className="flex items-center gap-1 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                            {offer.supplierCity} ({offer.supplierLocationDetail})
                          </span>
                          {offer.syncSource && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">
                              <Zap className="w-3 h-3 text-indigo-400" />
                              <span>{offer.syncSource.toUpperCase()} Sync</span>
                            </span>
                          )}
                        </div>

                        {/* Multi-Branch Availability */}
                        {offer.branches && offer.branches.length > 0 && (
                          <div className="pt-2">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              {isArabic ? 'المخزون المتوفر بحسب الفروع:' : 'Branch Stock Availability:'}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {offer.branches.map((b) => (
                                <span
                                  key={b.branchId}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-white/[0.04] border border-white/10 px-2.5 py-0.5 rounded-lg text-slate-300"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                  <span className="font-bold text-white">{b.city}:</span>
                                  <span>{b.availableQty} units</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Price & Action */}
                      <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                        <div>
                          <div className="text-xl font-black text-emerald-400 tracking-tight">
                            {formatPrice(offer.priceUSD, offer.priceIQD)}
                          </div>
                          <div
                            className={`text-[10px] font-semibold mt-0.5 ${
                              isOfferInStock ? 'text-emerald-300' : 'text-amber-300'
                            }`}
                          >
                            {isOfferInStock
                              ? `${offer.stockQuantity} units available`
                              : (isArabic ? '0 وحدات (نفذ المخزون)' : '0 units available')}
                          </div>
                        </div>

                        {isOfferInStock ? (
                          <button
                            id={`offer-add-cart-btn-${offer.id}`}
                            onClick={() => {
                              addToCart(part, offer);
                              onClose();
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'إضافة للسلة' : 'Add to Order'}</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {isOfferAlerted ? (
                              <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{isArabic ? 'تنبيه مسجل' : 'Alert Active'}</span>
                              </span>
                            ) : (
                              <button
                                id={`offer-email-alert-btn-${offer.id}`}
                                onClick={() => handleOpenAlertForOffer(offer)}
                                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>{isArabic ? 'أعلمني عند التوفر' : 'Email me when available'}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: Vehicle Fitment Database */}
          {activeTab === 'fitment' && (
            <div className="space-y-3 text-xs">
              <div className="text-slate-400">
                {isArabic
                  ? 'قاعدة بيانات التوافق المعتمدة تمنع شراء قطع غير متطابقة:'
                  : 'Official fitment database ensuring 100% vehicle compatibility:'}
              </div>

              <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.04] text-slate-300 font-bold border-b border-white/10">
                    <tr>
                      <th className="p-3">Make</th>
                      <th className="p-3">Model</th>
                      <th className="p-3">Generation / Years</th>
                      <th className="p-3">Engine Variant</th>
                      <th className="p-3">Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium text-slate-200">
                    {part.compatibleVehicles.map((v, i) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-bold text-white">{v.make}</td>
                        <td className="p-3">{v.model}</td>
                        <td className="p-3 text-slate-300">
                          {v.generation || 'Standard'} ({v.yearStart} - {v.yearEnd})
                        </td>
                        <td className="p-3 text-indigo-300">{v.engine}</td>
                        <td className="p-3 text-slate-400">{v.position || 'Front'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Specs & Cross References */}
          {activeTab === 'specs' && (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-white mb-2 text-sm">Technical Specifications</h4>
                <div className="grid grid-cols-2 gap-2 bg-white/[0.02] p-4 rounded-2xl border border-white/10">
                  {Object.entries(part.specifications).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1.5 border-b border-white/5 last:border-b-0">
                      <span className="text-slate-400 font-medium">{key}:</span>
                      <span className="font-bold text-white">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {part.crossReferences && part.crossReferences.length > 0 && (
                <div>
                  <h4 className="font-bold text-white mb-2 text-sm">OEM & Aftermarket Cross References</h4>
                  <div className="flex flex-wrap gap-2">
                    {part.crossReferences.map((cr, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-xl text-slate-200 font-mono text-xs flex items-center gap-2"
                      >
                        <span className="font-bold text-slate-400">{cr.brand}:</span>
                        <span className="font-black text-indigo-300">{cr.code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-bold text-white mb-1 text-sm">Part Description</h4>
                <p className="text-slate-300 leading-relaxed p-4 bg-white/[0.02] rounded-2xl border border-white/10">
                  {part.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
