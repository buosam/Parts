/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Car, ShieldCheck, MapPin, Check, Gavel, Camera, Sparkles, Upload } from 'lucide-react';
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
  const [preferredCity, setPreferredCity] = useState('Baghdad');
  const [requiredDate, setRequiredDate] = useState('Within 24 Hours / Urgent');
  const [customerName, setCustomerName] = useState('Ahmed Al-Iraqi');
  const [customerPhone, setCustomerPhone] = useState('+964 770 551 2299');
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync prefilled data
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

    const fallbackVehicle = activeVehicle || {
      id: 'default-veh',
      make: 'Toyota',
      model: 'Land Cruiser',
      year: 2023,
      engine: '3.5L Twin Turbo',
    };

    createPartRequest({
      customerId: 'cust-1',
      customerName,
      customerPhone,
      vehicle: fallbackVehicle,
      partName: partName.trim() || 'Automotive Spare Part',
      partNumberHint: partNumberHint.trim() || undefined,
      partDescription: partDescription.trim(),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e1424] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base sm:text-lg">
                {isArabic ? 'طلب عروض أسعار من الوكلاء' : 'Get Offers from Verified Dealers'}
              </h2>
              <p className="text-xs text-slate-400">
                {isArabic ? 'لم تجد القطعة؟ اطلبها وسيتنافس الوكلاء بتقديم العروض' : 'Can\'t find it? 120+ verified dealers will send quotes'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                {isArabic ? 'تم إرسال طلبك للوكلاء بنجاح!' : 'Request Sent Successfully!'}
              </h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                {isArabic
                  ? 'ستصلك عروض الأسعار مع فترات الضمان والتوصيل لمقارنتها واختيار الأنسب.'
                  : 'We are finding matching parts for you. Compare incoming offers directly in your requests tab.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Vehicle Context Pill */}
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{isArabic ? 'السيارة المطلوبة:' : 'Target Vehicle:'}</span>
                    <span className="font-bold text-white">
                      {activeVehicle ? `${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year}` : 'Toyota Land Cruiser (2023)'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                  {isArabic ? 'توافق مضمون' : 'Fitment Linked'}
                </span>
              </div>

              {/* What do you need? */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isArabic ? 'ما هي القطعة المطلوبة؟ (اسم القطعة أو رقمها)' : 'What part do you need?'}
                </label>
                <input
                  type="text"
                  required
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  placeholder={isArabic ? 'مثال: فحمات بريك أمامي، مساعدات خلفية...' : 'e.g. Front Right Headlight, Brake Rotors...'}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white font-bold placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* City / Location & Quality */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">{isArabic ? 'المدينة / المحافظة' : 'Delivery City'}</label>
                  <select
                    value={preferredCity}
                    onChange={(e) => setPreferredCity(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-hidden"
                  >
                    <option value="Baghdad">Baghdad (بغداد)</option>
                    <option value="Erbil">Erbil (أربيل)</option>
                    <option value="Basra">Basra (البصرة)</option>
                    <option value="Sulaymaniyah">Sulaymaniyah (السليمانية)</option>
                    <option value="Mosul">Mosul (الموصل)</option>
                    <option value="Najaf">Najaf (النجف)</option>
                    <option value="Karbala">Karbala (كربلاء)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">{isArabic ? 'درجة الجودة المفضلة' : 'Quality Preference'}</label>
                  <select
                    value={qualityPreference}
                    onChange={(e) => setQualityPreference(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-hidden"
                  >
                    <option value="genuine_or_oem">{isArabic ? 'أصلي أو وكالة (OEM)' : 'Genuine or OEM'}</option>
                    <option value="genuine_only">{isArabic ? 'أصلي فقط (Genuine Only)' : 'Genuine Only'}</option>
                    <option value="any_new">{isArabic ? 'أي نوع جديد معتمد' : 'Any Quality (New)'}</option>
                  </select>
                </div>
              </div>

              {/* Additional notes / Photo */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">{isArabic ? 'ملاحظات إضافية أو صورة القطعة (اختياري)' : 'Details or Photo (Optional)'}</label>
                <textarea
                  rows={2}
                  value={partDescription}
                  onChange={(e) => setPartDescription(e.target.value)}
                  placeholder={isArabic ? 'اكتب أي تفاصيل إضافية مثل رقم الشاصي أو جانب القطعة (يمين/يسار)...' : 'Add side (L/R), trim details, or photo notes...'}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white placeholder:text-slate-500 focus:outline-hidden"
                />
              </div>

              {/* Dominant Primary Action CTA */}
              <button
                type="submit"
                id="submit-request-offers-btn"
                className="w-full mt-3 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                <Gavel className="w-4 h-4 text-slate-950" />
                <span>{isArabic ? 'طلب عروض الأسعار الآن' : 'Get Offers'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
