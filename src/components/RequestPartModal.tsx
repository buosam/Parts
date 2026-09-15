/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Sparkles, Car, ShieldCheck, MapPin, Calendar, Check } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-hidden shadow-2xl border border-neutral-200 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900 text-base">
                {isArabic ? 'طلب قطعة غير معروضة (Request & Receive Offers)' : 'Request a Part & Receive Offers'}
              </h2>
              <p className="text-xs text-neutral-500">
                {isArabic
                  ? 'يتلقى الموردون المعتمدون طلبك ويقدمون عروض أسعار متنافسة'
                  : 'Verified suppliers receive notification & submit competing offers'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-neutral-900 text-base">
                {isArabic ? 'تم إرسال الطلب للموردين بنجاح!' : 'Part Request Dispatched Successfully!'}
              </h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                {isArabic
                  ? 'ستتلقى عروض الأسعار في لوحة طلباتي للمقارنة والاختيار.'
                  : 'Relevant suppliers have been notified. Check your Requests Board to compare incoming offers.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Vehicle Pill */}
              <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-neutral-500" />
                  <div>
                    <div className="text-[10px] text-neutral-400 font-semibold uppercase">Target Vehicle</div>
                    <div className="font-bold text-neutral-900">
                      {activeVehicle
                        ? `${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year} (${activeVehicle.engine})`
                        : 'No vehicle selected'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal('vehicle_picker')}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Change
                </button>
              </div>

              {/* Part Name & Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    {isArabic ? 'اسم القطعة المطلوبة *' : 'Part Requirement Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    placeholder="e.g. Front Brake Pad Set / Alternator"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-emerald-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    {isArabic ? 'رقم القطعة التقريبي (اختياري)' : 'Part Number (If known)'}
                  </label>
                  <input
                    type="text"
                    value={partNumberHint}
                    onChange={(e) => setPartNumberHint(e.target.value)}
                    placeholder="e.g. 04465-60290"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-emerald-600 font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  {isArabic ? 'وصف المشكلة أو القطعة بالتفصيل' : 'Detailed Description & Requirements'}
                </label>
                <textarea
                  rows={3}
                  value={partDescription}
                  onChange={(e) => setPartDescription(e.target.value)}
                  placeholder="e.g. Need original pads with wear sensor clips. Must fit 2021 Prado 4.0L TX-L."
                  className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              {/* Quality Preference (PRD Section 22) */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  {isArabic ? 'تفضيل الجودة' : 'Quality Preference'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'genuine_only', label: 'Genuine Only', labelAr: 'أصلي وكالة فقط' },
                    { id: 'genuine_or_oem', label: 'Genuine or OEM', labelAr: 'أصلي أو OEM معتمد' },
                    { id: 'any_new', label: 'Any New Part', labelAr: 'أي قطعة جديدة' },
                    { id: 'used_acceptable', label: 'Used Acceptable', labelAr: 'مستعمل بحالة ممتازة' },
                  ].map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setQualityPreference(q.id as any)}
                      className={`p-2 rounded-lg border text-left font-medium transition-all ${
                        qualityPreference === q.id
                          ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 font-bold'
                          : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {isArabic ? q.labelAr : q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location & Delivery Timing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    {isArabic ? 'المدينة المفضلة' : 'Preferred City'}
                  </label>
                  <select
                    value={preferredCity}
                    onChange={(e) => setPreferredCity(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-emerald-600 font-medium bg-white"
                  >
                    <option value="Erbil">Erbil (أربيل)</option>
                    <option value="Baghdad">Baghdad (بغداد)</option>
                    <option value="Basra">Basra (البصرة)</option>
                    <option value="Sulaymaniyah">Sulaymaniyah (السليمانية)</option>
                    <option value="Duhok">Duhok (دهوك)</option>
                    <option value="Kirkuk">Kirkuk (كركوك)</option>
                    <option value="Najaf">Najaf (النجف)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    {isArabic ? 'المهلة المطلوبة' : 'Required Date'}
                  </label>
                  <select
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-emerald-600 font-medium bg-white"
                  >
                    <option value="Immediate / Today">Today (Urgent)</option>
                    <option value="Within 24 Hours">Within 24 Hours</option>
                    <option value="2-3 Days">2 - 3 Days</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                id="submit-part-request-btn"
                className="w-full mt-2 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{isArabic ? 'إرسال الطلب لشبكة الموردين' : 'Dispatch Request to Verified Suppliers'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
