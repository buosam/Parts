/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Car, Check, Plus, Camera, CheckCircle2, ChevronRight, Upload, Sparkles, Trash2 } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Vehicle } from '../types';

export const VehicleSelectorModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    activeVehicle,
    setActiveVehicle,
    userVehicles,
    addUserVehicle,
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [activeTab, setActiveTab] = useState<'garage' | 'ocr' | 'manual'>('garage');

  // Manual vehicle form
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('Land Cruiser');
  const [year, setYear] = useState(2023);
  const [engine, setEngine] = useState('3.5L Twin Turbo (V35A-FTS)');

  // OCR / Registration upload state
  const [ocrStatus, setOcrStatus] = useState<'idle' | 'scanning' | 'found'>('idle');
  const [detectedVehicle, setDetectedVehicle] = useState<Vehicle | null>(null);

  if (activeModal !== 'vehicle_picker') return null;

  const handleSelectVehicle = (veh: Vehicle) => {
    setActiveVehicle(veh);
    setActiveModal(null);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newVeh: Vehicle = {
      id: `veh-${Date.now()}`,
      make,
      model,
      year: Number(year),
      engine,
      nickname: `${make} ${model}`,
    };
    addUserVehicle(newVeh);
    setActiveVehicle(newVeh);
    setActiveModal(null);
  };

  const handleSimulateOcr = () => {
    setOcrStatus('scanning');
    setTimeout(() => {
      const found: Vehicle = {
        id: `veh-${Date.now()}`,
        make: 'Toyota',
        model: 'Land Cruiser LC300',
        year: 2023,
        engine: '3.5L Twin Turbo V6',
        vin: 'JTJHY7AX8N418902',
        nickname: 'My Land Cruiser',
      };
      setDetectedVehicle(found);
      setOcrStatus('found');
    }, 800);
  };

  const handleConfirmDetectedVehicle = () => {
    if (detectedVehicle) {
      addUserVehicle(detectedVehicle);
      setActiveVehicle(detectedVehicle);
      setActiveModal(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e1424] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base sm:text-lg">
                {isArabic ? 'المرآب وتحديد السيارة' : 'My Garage & Vehicle Fitment'}
              </h2>
              <p className="text-xs text-slate-400">
                {isArabic ? 'اختر سيارتك لتصفية القطع المطابقة 100%' : 'Guarantee 100% fitment on all searches'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-4 pt-2 gap-3 text-xs font-bold bg-white/[0.02]">
          <button
            onClick={() => setActiveTab('garage')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'garage'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>{isArabic ? 'سياراتي المحفوظة' : 'My Garage'}</span>
            <span className="bg-white/10 text-white text-[10px] px-1.5 py-0.2 rounded-full">
              {userVehicles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ocr')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ocr'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isArabic ? 'مسح السنوية / الشاصي' : 'Scan Registration'}</span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">AI</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'manual'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isArabic ? 'إضافة يدوية' : 'Add Vehicle'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: My Garage List */}
          {activeTab === 'garage' && (
            <div className="space-y-3">
              {userVehicles.map((veh) => {
                const isCurrentActive = activeVehicle?.id === veh.id;
                return (
                  <div
                    key={veh.id}
                    onClick={() => handleSelectVehicle(veh)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isCurrentActive
                        ? 'bg-indigo-600/20 border-indigo-500/50 shadow-md'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCurrentActive ? 'bg-indigo-600 text-white' : 'bg-white/[0.05] text-slate-300'}`}>
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm sm:text-base">
                          {veh.make} {veh.model} {veh.year}
                        </div>
                        <div className="text-xs text-slate-400">
                          {veh.engine} {veh.vin ? `• VIN: ${veh.vin.slice(0, 10)}...` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrentActive ? (
                        <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1 border border-emerald-500/30">
                          <Check className="w-3.5 h-3.5" />
                          <span>{isArabic ? 'مفعل' : 'Active'}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
                          <span>{isArabic ? 'اختيار' : 'Select'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => setActiveTab('ocr')}
                className="w-full py-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-dashed border-white/20 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>{isArabic ? 'إضافة سيارة جديدة' : 'Add Another Vehicle'}</span>
              </button>
            </div>
          )}

          {/* TAB 2: Scan Registration / VIN OCR */}
          {activeTab === 'ocr' && (
            <div className="space-y-4 text-xs text-slate-300">
              <p className="text-slate-400">
                {isArabic
                  ? 'قم بتصوير كارت السنوية أو رقم الشاصي (VIN) وسيتعرف النظام فوراً على طراز وسنة سيارتك:'
                  : 'Upload or snap a photo of your Iraqi vehicle registration card or VIN plate:'}
              </p>

              {ocrStatus === 'idle' && (
                <div
                  onClick={handleSimulateOcr}
                  className="p-8 rounded-2xl bg-white/[0.02] border-2 border-dashed border-white/20 hover:border-indigo-500/50 transition-all text-center cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-white text-sm">
                    {isArabic ? 'اضغط لرفع صورة السنوية أو الشاصي' : 'Click to Upload Registration Photo'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {isArabic ? 'يدعم صور الهاتف والوثائق الرسمية' : 'Supports mobile camera photos and documents'}
                  </div>
                </div>
              )}

              {ocrStatus === 'scanning' && (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                  <div className="font-bold text-white text-sm">
                    {isArabic ? 'جاري التعرف على بيانات المركبة...' : 'Reading vehicle registration details...'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {isArabic ? 'التحقق من الطراز، سنة الصنع، والمحرك' : 'Extracting make, model, year, and engine specifications'}
                  </div>
                </div>
              )}

              {ocrStatus === 'found' && detectedVehicle && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left rtl:text-right space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isArabic ? 'تم التعرف على السيارة بنجاح' : 'Vehicle Identified'}</span>
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl space-y-1">
                    <div className="font-black text-white text-base">
                      {detectedVehicle.make} {detectedVehicle.model} {detectedVehicle.year}
                    </div>
                    <div className="text-xs text-slate-300">{detectedVehicle.engine}</div>
                    <div className="font-mono text-[11px] text-indigo-300">VIN: {detectedVehicle.vin}</div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleConfirmDetectedVehicle}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
                    >
                      {isArabic ? 'تأكيد وحفظ في المرآب' : 'Confirm & Save to Garage'}
                    </button>
                    <button
                      onClick={() => setOcrStatus('idle')}
                      className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      {isArabic ? 'إعادة' : 'Retry'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Manual Selection */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">{isArabic ? 'الشركة المصنعة (Make)' : 'Vehicle Make'}</label>
                <select
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 text-white rounded-xl p-2.5 focus:outline-hidden"
                >
                  <option value="Toyota">Toyota (تويوتا)</option>
                  <option value="Nissan">Nissan (نيسان)</option>
                  <option value="Hyundai">Hyundai (هيونداي)</option>
                  <option value="Kia">Kia (كيا)</option>
                  <option value="Chevrolet">Chevrolet (شفروليه)</option>
                  <option value="BMW">BMW (بي ام دبليو)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">{isArabic ? 'الموديل (Model)' : 'Vehicle Model'}</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 text-white rounded-xl p-2.5 focus:outline-hidden font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">{isArabic ? 'سنة الصنع (Year)' : 'Year'}</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 text-white rounded-xl p-2.5 focus:outline-hidden font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">{isArabic ? 'حجم المحرك (Engine)' : 'Engine'}</label>
                  <input
                    type="text"
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 text-white rounded-xl p-2.5 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {isArabic ? 'حفظ وتفعيل السيارة' : 'Save & Guarantee Fitment'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
