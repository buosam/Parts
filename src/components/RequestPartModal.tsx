/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Sparkles, Car, ShieldCheck, MapPin, Calendar, Check, Gavel } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const RequestPartModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    activeVehicle,
    createPartRequest,
    prefilledPartRequest,
    setPrefilledPartRequest,
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';

  const [partName, setPartName] = useState('');
  const [partNumberHint, setPartNumberHint] = useState('');
  const [partDescription, setPartDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [qualityPreference, setQualityPreference] = useState<
    'genuine_only' | 'genuine_or_oem' | 'any_new' | 'used_acceptable'
  >('genuine_or_oem');
  const [preferredCity, setPreferredCity] = useState('Erbil');
  const [requiredDate, setRequiredDate] = useState('Within 24 Hours / Urgent');
  const [customerName, setCustomerName] = useState('Ahmed Al-Tikriti');
  const [customerPhone, setCustomerPhone] = useState('+964 770 551 2299');
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync prefilled data if launched from an out-of-stock item or search result
  React.useEffect(() => {
    if (prefilledPartRequest) {
      if (prefilledPartRequest.partName) setPartName(prefilledPartRequest.partName);
      if (prefilledPartRequest.partNumberHint) setPartNumberHint(prefilledPartRequest.partNumberHint);
      if (prefilledPartRequest.partDescription) setPartDescription(prefilledPartRequest.partDescription);
      if (prefilledPartRequest.qualityPreference) setQualityPreference(prefilledPartRequest.qualityPreference);
    }
  }, [prefilledPartRequest]);

  if (activeModal !== 'request_part') return null;

  const handleClose = () => {
    setPrefilledPartRequest(null);
    setActiveModal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehicle) return;

    createPartRequest({
      customerId: 'cust-1',
      customerName,
      customerPhone,
      vehicle: activeVehicle,
      partName,
      partNumberHint,
      partDescription,
      quantity: Number(quantity),
      qualityPreference,
      preferredCity,
      requiredDate,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setPrefilledPartRequest(null);
      setActiveModal(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden shadow-2xl border border-white/15 flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base sm:text-lg">
                {isArabic ? 'طلب قطعة غير معروضة لمزايدة المتاجر' : 'Request RFQ & Receive Dealer Bids'}
              </h2>
              <p className="text-xs text-slate-400">
                {isArabic
                  ? 'يتلقى الموردون المعتمدون طلبك ويقدمون عروض أسعار متنافسة'
                  : 'Verified dealers receive notification & submit competing offers'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-white text-base">
                {isArabic ? 'تم إرسال الطلب للموردين بنجاح!' : 'Part Request Dispatched Successfully!'}
              </h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                {isArabic
                  ? 'ستتلقى عروض الأسعار في لوحة طلباتي للمقارنة والاختيار.'
                  : 'Relevant suppliers have been notified. Check your Requests Board to compare incoming offers.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Vehicle Pill */}
              <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Car className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Target Vehicle</div>
                    <div className="font-extrabold text-white text-xs">
                      {activeVehicle
                        ? `${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year} (${activeVehicle.engine})`
                        : 'No vehicle selected'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal('vehicle_picker')}
                  className="text-indigo-400 hover:text-indigo-300 font-bold text-[11px] cursor-pointer"
                >
                  {isArabic ? 'تغيير' : 'Change'}
                </button>
              </div>

              {/* Part Name & OEM Hint */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isArabic ? 'اسم القطعة المطلوبة *' : 'Part Name *'}</label>
                  <input
                    type="text"
                    required
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    placeholder="e.g. Front Shock Absorber"
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isArabic ? 'رقم القطعة OEM (اختياري)' : 'OEM Part # Hint'}</label>
                  <input
                    type="text"
                    value={partNumberHint}
                    onChange={(e) => setPartNumberHint(e.target.value)}
                    placeholder="e.g. 48068-60030"
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Quantity & Quality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isArabic ? 'الكمية المطلوبة' : 'Quantity'}</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isArabic ? 'تفضيل الجودة' : 'Quality Preference'}</label>
                  <select
                    value={qualityPreference}
                    onChange={(e) => setQualityPreference(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="genuine_or_oem" className="bg-slate-900 text-white">{isArabic ? 'أصلي أو خط تجميع OEM' : 'Genuine or Tier-1 OEM'}</option>
                    <option value="genuine_only" className="bg-slate-900 text-white">{isArabic ? 'أصلي وكالة فقط' : 'Genuine (Original Only)'}</option>
                    <option value="any_new" className="bg-slate-900 text-white">{isArabic ? 'أي نوع جديد معتمد' : 'Any Quality Brand New'}</option>
                    <option value="used_acceptable" className="bg-slate-900 text-white">{isArabic ? 'مستعمل فحص وضمان' : 'Used / Clean Tested'}</option>
                  </select>
                </div>
              </div>

              {/* City & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isArabic ? 'المدينة المستهدفة' : 'Target City'}</label>
                  <select
                    value={preferredCity}
                    onChange={(e) => setPreferredCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="Baghdad" className="bg-slate-900 text-white">Baghdad (بغداد)</option>
                    <option value="Erbil" className="bg-slate-900 text-white">Erbil (أربيل)</option>
                    <option value="Sulaymaniyah" className="bg-slate-900 text-white">Sulaymaniyah (السليمانية)</option>
                    <option value="Basra" className="bg-slate-900 text-white">Basra (البصرة)</option>
                    <option value="Duhok" className="bg-slate-900 text-white">Duhok (دهوك)</option>
                    <option value="Kirkuk" className="bg-slate-900 text-white">Kirkuk (كركوك)</option>
                    <option value="Mosul" className="bg-slate-900 text-white">Mosul (الموصل)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isArabic ? 'درجة الاستعجال' : 'Urgency'}</label>
                  <select
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="Within 24 Hours / Urgent" className="bg-slate-900 text-white">{isArabic ? 'خلال 24 ساعة (عاجل)' : 'Within 24 Hours (Urgent)'}</option>
                    <option value="Within 2-3 Days" className="bg-slate-900 text-white">{isArabic ? 'خلال 2-3 أيام' : 'Within 2-3 Days'}</option>
                    <option value="Within a Week" className="bg-slate-900 text-white">{isArabic ? 'خلال أسبوع' : 'Within a Week'}</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">{isArabic ? 'وصف إضافي أو ملاحظات' : 'Detailed Notes / Problem Description'}</label>
                <textarea
                  value={partDescription}
                  onChange={(e) => setPartDescription(e.target.value)}
                  rows={3}
                  placeholder={
                    isArabic
                      ? 'اذكر أية تفاصيل أخرى لمساعدة الموردين في إيجاد القطعة المناسبة...'
                      : 'Specify position (left/right/front/rear), symptoms, or chassis notes...'
                  }
                  className="w-full p-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                {isArabic ? 'إرسال طلب القطعة وبدء مزايدة الموردين' : 'Broadcast RFQ to 120+ Verified Suppliers'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
