/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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

  // Existing alerts for this master part or specific supplier
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-neutral-200 flex flex-col">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-mono font-bold text-xs p-1 text-center">
              {part.brand.slice(0, 6)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black bg-neutral-200/80 text-neutral-900 px-2 py-0.5 rounded">
                  {part.partNumber}
                </span>
                <span className="text-xs font-semibold text-neutral-500">
                  {part.category}
                </span>
                {isEntirelyOutOfStock && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{isArabic ? 'نفذت الكمية' : 'Out of Stock'}</span>
                  </span>
                )}
              </div>
              <h2 className="font-bold text-neutral-900 text-base sm:text-lg mt-0.5 leading-snug">
                {isArabic && part.partNameArabic ? part.partNameArabic : part.partName}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Out-of-Stock Alert Headline Notice (If entire part has 0 stock) */}
        {isEntirelyOutOfStock && (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold">
                  {isArabic
                    ? 'هذه القطعة غير متوفرة حالياً في المخازن المركزية'
                    : 'Currently Out of Stock Across All Local Distributors'}
                </div>
                <div className="text-amber-800 text-[11px] mt-0.5">
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
                className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0 shadow-xs"
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
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {isFit ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-amber-600" />
              )}
              <span>
                {isFit
                  ? `${isArabic ? 'متوافق تماماً ومطابق لـ' : '100% Guaranteed Fit for'} ${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year} (${activeVehicle.engine})`
                  : `${isArabic ? 'تنبيه: غير مسجل في كتالوج' : 'Verify compatibility for'} ${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year}`}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/70">
              {isFit ? 'FITMENT CONFIRMED' : 'CHECK SPECS'}
            </span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 px-5 pt-2 gap-4 text-xs font-bold bg-white">
          <button
            onClick={() => setActiveTab('offers')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'offers'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <span>{isArabic ? 'عروض الموردين المتاحة' : 'Available Supplier Offers'}</span>
            <span className="bg-neutral-100 text-neutral-800 text-[10px] px-1.5 py-0.2 rounded-full">
              {part.offers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('fitment')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'fitment'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>{isArabic ? 'المركبات المتوافقة' : 'Vehicle Fitment'}</span>
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'specs'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
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
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-800" />
                </div>
                <span className="font-medium">{alertSuccessBanner}</span>
              </div>
              <button
                onClick={() => setAlertSuccessBanner(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-bold shrink-0"
              >
                {isArabic ? 'إغلاق' : 'Dismiss'}
              </button>
            </div>
          )}

          {/* Active Stock Notification Status Box (if already registered) */}
          {currentActiveAlert && (
            <div className="p-4 rounded-xl bg-neutral-900 text-white border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">
                      {isArabic ? 'تنبيه التوفر نشط' : 'Stock Alert Active'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.2 bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 rounded">
                      {currentActiveAlert.email}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    {isArabic
                      ? `سنقوم بإعلامك تلقائياً عبر البريد ${currentActiveAlert.email} بمجرد وصول شحنة جديدة للقطعة ${part.partNumber}.`
                      : `You will receive an instant automated email alert at ${currentActiveAlert.email} the moment stock arrives.`}
                    {currentActiveAlert.supplierName && ` (Target: ${currentActiveAlert.supplierName})`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  id="cancel-stock-alert-btn"
                  onClick={() => handleCancelAlert(currentActiveAlert.id)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-300 hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title={isArabic ? 'إلغاء التنبيه' : 'Cancel Alert'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'إلغاء التنبيه' : 'Cancel'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Sourcing & Dealer Bidding Card for Out-of-Stock Parts */}
          {isEntirelyOutOfStock && (
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 text-white border border-neutral-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Gavel className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                      {isArabic ? 'طلب استيراد ومزايدة خاصة' : 'Dealer Bidding Available'}
                    </span>
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
                      {isArabic ? '120+ متجر معتمد' : '120+ Stores'}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white mt-0.5">
                    {isArabic ? 'القطعة غير متوفرة؟ اطلب من أصحاب المتاجر المزايدة عليها' : 'Need this item urgently? Request Dealer Bids'}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 max-w-lg">
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
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto hover:scale-[1.02]"
              >
                <Gavel className="w-4 h-4" />
                <span>{isArabic ? 'طلب مزايدة المتاجر الآن' : 'Request Dealer Bids'}</span>
              </button>
            </div>
          )}

          {/* Email Me When Available Registration Drawer / Card */}
          {(showAlertSection || isEntirelyOutOfStock) && !currentActiveAlert && (
            <div
              id="email-me-when-available-card"
              className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                      <span>{isArabic ? 'أعلمني عند توفر هذه القطعة' : 'Email me when available'}</span>
                      {alertTargetOffer && (
                        <span className="text-[10px] font-semibold bg-white border border-amber-200 text-amber-800 px-2 py-0.5 rounded-md">
                          {alertTargetOffer.supplierName}
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      {isArabic
                        ? 'أدخل بريدك الإلكتروني ليتم إشعارك فور قيام الموردين بتحديث كميات المخزون.'
                        : 'Register your email to receive an instant alert when authorized suppliers restock.'}
                    </p>
                  </div>
                </div>

                {!isEntirelyOutOfStock && (
                  <button
                    onClick={() => {
                      setShowAlertSection(false);
                      setAlertTargetOffer(null);
                    }}
                    className="text-neutral-400 hover:text-neutral-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <form onSubmit={handleRegisterAlert} className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Email Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      {isArabic ? 'البريد الإلكتروني للإشعار *' : 'Notification Email *'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                      <input
                        id="stock-alert-email-input"
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Optional WhatsApp/Phone */}
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      {isArabic ? 'رقم الهاتف / واتساب (اختياري)' : 'WhatsApp / Mobile (Optional)'}
                    </label>
                    <div className="relative">
                      <Send className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
                      <input
                        id="stock-alert-phone-input"
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="+964 770 000 0000"
                        className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Quality / Scope Preference */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="notify-any-supplier-check"
                      checked={notifyAnySupplier}
                      onChange={(e) => setNotifyAnySupplier(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-neutral-300 focus:ring-amber-500"
                    />
                    <label
                      htmlFor="notify-any-supplier-check"
                      className="text-xs text-neutral-700 font-medium cursor-pointer select-none"
                    >
                      {isArabic
                        ? 'إعلامي عند توفر القطعة لدى أي مورد معتمد'
                        : 'Notify me if ANY verified supplier adds new inventory'}
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="stock-alert-submit-btn"
                      type="submit"
                      disabled={submittingAlert || !emailInput}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      {submittingAlert ? (
                        <>
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>{isArabic ? 'جارِ التفعيل...' : 'Registering Alert...'}</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-3.5 h-3.5" />
                          <span>{isArabic ? 'تفعيل تنبيه البريد' : 'Email Me When Available'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 1: Multi-Supplier Offers (PRD Section 10) */}
          {activeTab === 'offers' && (
            <div className="space-y-3">
              <div className="text-xs text-neutral-500 flex items-center justify-between">
                <span>
                  {isArabic
                    ? 'يقوم الموردون المعتمدون بإرفاق عروضهم لنفس القطعة الرئيسية لتسهيل المقارنة:'
                    : 'Compare verified supplier offers for this exact master part:'}
                </span>
                <span className="font-semibold text-neutral-700">
                  {part.offers.length} {isArabic ? 'عروض' : 'Offers Available'}
                </span>
              </div>

              {part.offers.length === 0 ? (
                <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-neutral-900 text-sm">
                    {isArabic ? 'لا توجد عروض حالية لهذه القطعة' : 'No active supplier offers currently'}
                  </h4>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto">
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
                      className={`p-4 rounded-xl border ${
                        !isOfferInStock
                          ? 'border-amber-200 bg-amber-50/20'
                          : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50'
                      } transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                    >
                      {/* Supplier info & Quality badge */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isGenuine
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : isOEM
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : 'bg-neutral-200 text-neutral-800'
                            }`}
                          >
                            {offer.quality}
                          </span>

                          <div
                            onClick={() => handleStoreClick(offer.supplierId)}
                            className="font-bold text-neutral-900 hover:text-emerald-700 cursor-pointer flex items-center gap-1 text-sm"
                          >
                            <Store className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{offer.supplierName}</span>
                            <ExternalLink className="w-3 h-3 text-neutral-400" />
                          </div>

                          <div className="flex items-center gap-1 text-xs text-neutral-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="font-bold">{offer.supplierRating}</span>
                            <span className="text-[10px] text-neutral-500">
                              ({offer.verifiedInteractionsCount} reviews)
                            </span>
                          </div>

                          {!isOfferInStock && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{isArabic ? 'نفذت الكمية' : 'Out of Stock'}</span>
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-neutral-600 font-medium">
                          Brand: <span className="font-semibold text-neutral-900">{offer.brand}</span> • Warranty:{' '}
                          <span className="text-neutral-800 font-semibold">{offer.warranty}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                          <span
                            className={`flex items-center gap-1 ${
                              isOfferInStock ? 'text-emerald-700' : 'text-neutral-500'
                            } font-medium`}
                          >
                            <Truck className="w-3 h-3" />
                            {offer.deliveryTime}
                          </span>
                          <span className="flex items-center gap-1 text-neutral-600">
                            <MapPin className="w-3 h-3" />
                            {offer.supplierCity} ({offer.supplierLocationDetail})
                          </span>
                        </div>

                        {offer.notes && (
                          <p className="text-[11px] text-neutral-500 italic bg-white p-1.5 rounded border border-neutral-100">
                            "{offer.notes}"
                          </p>
                        )}
                      </div>

                      {/* Price & Action */}
                      <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                        <div>
                          <div className="text-lg font-black text-neutral-900 tracking-tight">
                            ${offer.priceUSD}
                          </div>
                          <div className="text-xs text-neutral-500 font-medium">
                            {offer.priceIQD.toLocaleString()} IQD
                          </div>
                          <div
                            className={`text-[10px] font-semibold ${
                              isOfferInStock ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {isOfferInStock
                              ? `${offer.stockQuantity} units available`
                              : isArabic
                              ? '0 وحدات متاحة (نفذ المخزون)'
                              : '0 units available (Out of stock)'}
                          </div>
                        </div>

                        {isOfferInStock ? (
                          <button
                            id={`offer-add-cart-btn-${offer.id}`}
                            onClick={() => {
                              addToCart(part, offer);
                              onClose();
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'إضافة للسلة' : 'Add to Order'}</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {isOfferAlerted ? (
                              <div className="flex items-center gap-1">
                                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{isArabic ? 'تنبيه مسجل' : 'Alert Active'}</span>
                                </span>
                                <button
                                  onClick={() => {
                                    const alert = getPartAlert(part.id, offer.supplierId);
                                    if (alert) handleCancelAlert(alert.id);
                                  }}
                                  className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg"
                                  title={isArabic ? 'إلغاء التنبيه' : 'Cancel Alert'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                id={`offer-email-alert-btn-${offer.id}`}
                                onClick={() => handleOpenAlertForOffer(offer)}
                                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
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

              {/* Bottom stock notification prompt for in-stock parts */}
              {!isEntirelyOutOfStock && !showAlertSection && !currentActiveAlert && (
                <div className="pt-2 text-center">
                  <button
                    onClick={() => {
                      setAlertTargetOffer(null);
                      setShowAlertSection(true);
                    }}
                    className="text-xs text-neutral-500 hover:text-amber-700 font-medium inline-flex items-center gap-1 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>
                      {isArabic
                        ? 'هل تبحث عن مورد معين أو تريد تنبيهاً بانخفاض الأسعار؟ اضغط هنا لتسجيل بريدك.'
                        : 'Waiting for a specific brand or supplier restock? Set up an email alert'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Vehicle Fitment Database (PRD Section 11) */}
          {activeTab === 'fitment' && (
            <div className="space-y-3">
              <div className="text-xs text-neutral-500">
                {isArabic
                  ? 'قاعدة بيانات التوافق المعتمدة تمنع شراء قطع غير متطابقة:'
                  : 'Official fitment database ensuring 100% vehicle compatibility:'}
              </div>

              <div className="border border-neutral-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-200">
                    <tr>
                      <th className="p-2.5">Make</th>
                      <th className="p-2.5">Model</th>
                      <th className="p-2.5">Generation / Years</th>
                      <th className="p-2.5">Engine Variant</th>
                      <th className="p-2.5">Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 font-medium text-neutral-800">
                    {part.compatibleVehicles.map((v, i) => (
                      <tr key={i} className="hover:bg-neutral-50">
                        <td className="p-2.5 font-bold">{v.make}</td>
                        <td className="p-2.5">{v.model}</td>
                        <td className="p-2.5">
                          {v.generation || 'Standard'} ({v.yearStart} - {v.yearEnd})
                        </td>
                        <td className="p-2.5 text-neutral-600">{v.engine}</td>
                        <td className="p-2.5">{v.position || 'Front'}</td>
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
                <h4 className="font-bold text-neutral-900 mb-2">Technical Specifications</h4>
                <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  {Object.entries(part.specifications).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-neutral-200/60 last:border-b-0">
                      <span className="text-neutral-500 font-medium">{key}:</span>
                      <span className="font-bold text-neutral-900">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {part.crossReferences && part.crossReferences.length > 0 && (
                <div>
                  <h4 className="font-bold text-neutral-900 mb-2">OEM & Aftermarket Cross References</h4>
                  <div className="flex flex-wrap gap-2">
                    {part.crossReferences.map((cr, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-neutral-800 font-mono text-xs flex items-center gap-2"
                      >
                        <span className="font-bold text-neutral-500">{cr.brand}:</span>
                        <span className="font-black text-neutral-900">{cr.code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-bold text-neutral-900 mb-1">Part Description</h4>
                <p className="text-neutral-600 leading-relaxed">{part.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
