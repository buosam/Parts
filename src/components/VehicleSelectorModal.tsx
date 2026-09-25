/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket - Progressive Vehicle Selection Flow (Section 7)
 */

import React, { useState } from 'react';
import {
  X,
  Car,
  Check,
  Plus,
  Camera,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  Sparkles,
  Trash2,
  ArrowRight,
  Search,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Vehicle } from '../types';

// Structured Iraqi Automotive Fleet Database
const VEHICLE_DATA: Record<
  string,
  {
    models: Record<
      string,
      {
        years: number[];
        engines: string[];
      }
    >;
  }
> = {
  Toyota: {
    models: {
      'Prado': {
        years: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2012, 2010],
        engines: ['4.0L V6 (1GR-FE)', '2.7L 4-Cyl (2TR-FE)', '2.8L Turbo Diesel (1GD-FTV)'],
      },
      'Land Cruiser': {
        years: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2016, 2015, 2012, 2010],
        engines: ['3.5L Twin Turbo V6 (V35A-FTS)', '4.6L V8 (1UR-FE)', '4.0L V6 (1GR-FE)', '3.3L Twin Turbo Diesel'],
      },
      'Camry': {
        years: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015],
        engines: ['2.5L 4-Cyl (A25A-FKS)', '2.5L Hybrid (A25A-FXS)', '3.5L V6 (2GR-FKS)'],
      },
      'Corolla': {
        years: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2015],
        engines: ['1.8L 4-Cyl (2ZR-FE)', '2.0L Dynamic Force', '1.6L 4-Cyl'],
      },
      'Hilux': {
        years: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017],
        engines: ['2.7L Petrol (2TR-FE)', '2.4L Diesel (2GD-FTV)', '2.8L Diesel (1GD-FTV)'],
      },
    },
  },
  Nissan: {
    models: {
      'Patrol': {
        years: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016],
        engines: ['5.6L V8 Platinum (VK56VD)', '4.0L V6 (VQ40DE)'],
      },
      'Altima': {
        years: [2024, 2023, 2022, 2021, 2020, 2019, 2018],
        engines: ['2.5L 4-Cyl (PR25DD)', '2.0L VC-Turbo'],
      },
      'Sunny': {
        years: [2024, 2023, 2022, 2021, 2020, 2019],
        engines: ['1.6L 4-Cyl (HR16DE)', '1.5L 4-Cyl'],
      },
      'X-Trail': {
        years: [2024, 2023, 2022, 2021, 2020],
        engines: ['2.5L 4-Cyl', '1.5L VC-Turbo e-Power'],
      },
    },
  },
  Hyundai: {
    models: {
      'Tucson': {
        years: [2024, 2023, 2022, 2021, 2020, 2019, 2018],
        engines: ['2.0L 4-Cyl (Nu MPi)', '1.6L Turbo (Smartstream)', '2.5L 4-Cyl'],
      },
      'Elantra': {
        years: [2024, 2023, 2022, 2021, 2020, 2019, 2018],
        engines: ['2.0L 4-Cyl (Nu MPi)', '1.6L 4-Cyl (Gamma)'],
      },
      'Santa Fe': {
        years: [2024, 2023, 2022, 2021, 2020],
        engines: ['2.5L Turbo', '3.5L V6 (Lambda II)'],
      },
      'Sonata': {
        years: [2024, 2023, 2022, 2021, 2020],
        engines: ['2.5L Smartstream', '2.0L Hybrid'],
      },
    },
  },
  Kia: {
    models: {
      'Sorento': {
        years: [2024, 2023, 2022, 2021, 2020],
        engines: ['3.5L V6 (Smartstream G3.5)', '2.5L Turbo', '2.2L Diesel'],
      },
      'Sportage': {
        years: [2024, 2023, 2022, 2021, 2020],
        engines: ['2.0L MPi', '1.6L Turbo T-GDi', '2.5L GDi'],
      },
      'Cerato': {
        years: [2024, 2023, 2022, 2021, 2020],
        engines: ['1.6L MPi', '2.0L Nu MPi'],
      },
    },
  },
  Lexus: {
    models: {
      'LX600': {
        years: [2024, 2023, 2022],
        engines: ['3.5L Twin Turbo V6 (V35A-FTS)'],
      },
      'LX570': {
        years: [2021, 2020, 2019, 2018, 2017, 2016],
        engines: ['5.7L V8 (3UR-FE)'],
      },
      'RX350': {
        years: [2024, 2023, 2022, 2021, 2020],
        engines: ['2.4L Turbo (T24A-FTS)', '3.5L V6 (2GR-FKS)'],
      },
      'ES350': {
        years: [2024, 2023, 2022, 2021, 2020],
        engines: ['3.5L V6 (2GR-FKS)', '2.5L Hybrid (A25A-FXS)'],
      },
    },
  },
  Chevrolet: {
    models: {
      'Tahoe': {
        years: [2024, 2023, 2022, 2021, 2020, 2019, 2018],
        engines: ['5.3L EcoTec3 V8 (L84)', '6.2L EcoTec3 V8 (L87)'],
      },
      'Suburban': {
        years: [2024, 2023, 2022, 2021, 2020],
        engines: ['5.3L V8', '6.2L V8'],
      },
      'Malibu': {
        years: [2024, 2023, 2022, 2021, 2020],
        engines: ['1.5L Turbo (LFV)', '2.0L Turbo'],
      },
    },
  },
  'Mercedes-Benz': {
    models: {
      'G-Class': {
        years: [2024, 2023, 2022, 2021, 2020],
        engines: ['4.0L Bi-Turbo V8 (G63 AMG)', '4.0L V8 (G500)'],
      },
      'S-Class': {
        years: [2024, 2023, 2022, 2021],
        engines: ['3.0L Turbo Inline-6 (S500)', '4.0L Bi-Turbo V8 (S580)'],
      },
      'C-Class': {
        years: [2024, 2023, 2022, 2021],
        engines: ['1.5L Turbo (C200)', '2.0L Turbo (C300)'],
      },
    },
  },
  BMW: {
    models: {
      'X5': {
        years: [2024, 2023, 2022, 2021, 2020],
        engines: ['3.0L TwinPower Turbo I6 (B58)', '4.4L TwinPower V8 (N63)'],
      },
      '7 Series': {
        years: [2024, 2023, 2022, 2021],
        engines: ['3.0L I6 (740i)', '4.4L V8 (760i)'],
      },
      '5 Series': {
        years: [2024, 2023, 2022, 2021],
        engines: ['2.0L Turbo (530i)', '3.0L Turbo (540i)'],
      },
    },
  },
};

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
  const [activeTab, setActiveTab] = useState<'progressive' | 'garage' | 'ocr'>('progressive');

  // Progressive Selection State: Make -> Model -> Year -> Engine
  const [selectedMake, setSelectedMake] = useState<string | null>('Toyota');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedEngine, setSelectedEngine] = useState<string | null>(null);

  // Search filter inside step
  const [filterQuery, setFilterQuery] = useState('');

  if (activeModal !== 'vehicle_picker') return null;

  const makes = Object.keys(VEHICLE_DATA);
  const models = selectedMake ? Object.keys(VEHICLE_DATA[selectedMake]?.models || {}) : [];
  const years = selectedMake && selectedModel ? VEHICLE_DATA[selectedMake]?.models[selectedModel]?.years || [] : [];
  const engines =
    selectedMake && selectedModel ? VEHICLE_DATA[selectedMake]?.models[selectedModel]?.engines || [] : [];

  // Determine current active progressive step: 1 (Make), 2 (Model), 3 (Year), 4 (Engine)
  let currentStep = 1;
  if (selectedMake && !selectedModel) currentStep = 2;
  else if (selectedMake && selectedModel && !selectedYear) currentStep = 3;
  else if (selectedMake && selectedModel && selectedYear) currentStep = 4;

  const handleSelectMake = (make: string) => {
    setSelectedMake(make);
    setSelectedModel(null);
    setSelectedYear(null);
    setSelectedEngine(null);
    setFilterQuery('');
  };

  const handleSelectModel = (model: string) => {
    setSelectedModel(model);
    setSelectedYear(null);
    setSelectedEngine(null);
    setFilterQuery('');
  };

  const handleSelectYear = (year: number) => {
    setSelectedYear(year);
    // If only 1 engine available, pre-select it
    const availableEngines = selectedMake && selectedModel ? VEHICLE_DATA[selectedMake]?.models[selectedModel]?.engines || [] : [];
    if (availableEngines.length === 1) {
      setSelectedEngine(availableEngines[0]);
    } else {
      setSelectedEngine(null);
    }
  };

  const handleSelectEngine = (engine: string) => {
    setSelectedEngine(engine);
  };

  const handleConfirmProgressiveVehicle = () => {
    if (!selectedMake || !selectedModel || !selectedYear) return;

    const engineStr = selectedEngine || engines[0] || 'Standard Engine';
    const newVeh: Vehicle = {
      id: `veh_${Date.now()}`,
      make: selectedMake,
      model: selectedModel,
      year: selectedYear,
      engine: engineStr,
      nickname: `${selectedMake} ${selectedModel} ${selectedYear}`,
    };

    addUserVehicle(newVeh);
    setActiveVehicle(newVeh);
    setActiveModal(null);
  };

  const handleSelectSavedVehicle = (veh: Vehicle) => {
    setActiveVehicle(veh);
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        dir={isArabic ? 'rtl' : 'ltr'}
        className="relative w-full max-w-xl bg-[#0e1424] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#335aff]/15 text-[#335aff] flex items-center justify-center shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base sm:text-lg">
                {isArabic ? 'تحديد سيارتك لتأكيد التوافق' : 'Select Vehicle to Guarantee Fit'}
              </h2>
              <p className="text-xs text-slate-400">
                {isArabic
                  ? 'اختر سيارتك خطوة بخطوة لمنع طلب أي قطعة غير مطابقة'
                  : 'Progressive vehicle selector • 100% fitment verified'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs: Progressive Flow vs My Garage vs Scan */}
        <div className="flex border-b border-white/[0.08] px-4 pt-2 gap-3 text-xs font-semibold bg-white/[0.02]">
          <button
            onClick={() => setActiveTab('progressive')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'progressive'
                ? 'border-[#335aff] text-[#335aff] font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>{isArabic ? 'اختيار تدريجي' : 'Select Vehicle'}</span>
          </button>

          <button
            onClick={() => setActiveTab('garage')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'garage'
                ? 'border-[#335aff] text-[#335aff] font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>{isArabic ? 'المرآب المحفوظ' : 'My Garage'}</span>
            <span className="bg-white/10 text-white text-[10px] px-1.5 py-0.2 rounded-full">
              {userVehicles.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveModal('sanawia_ocr');
            }}
            className="pb-2.5 border-b-2 border-transparent text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto rtl:ml-0 rtl:mr-auto"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isArabic ? 'مسح السنوية (AI)' : 'Scan Registration'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: Progressive Flow (Make -> Model -> Year -> Engine) */}
          {activeTab === 'progressive' && (
            <div className="space-y-4">
              {/* Progressive Breadcrumb Trail */}
              <div className="flex items-center gap-1.5 text-xs bg-white/[0.03] p-2 rounded-xl border border-white/[0.06] overflow-x-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModel(null);
                    setSelectedYear(null);
                    setSelectedEngine(null);
                  }}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    currentStep === 1
                      ? 'bg-[#335aff] text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  1. {selectedMake || (isArabic ? 'الشركة المصنعة' : 'Make')}
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-slate-500 rtl:rotate-180 shrink-0" />

                <button
                  type="button"
                  disabled={!selectedMake}
                  onClick={() => {
                    setSelectedYear(null);
                    setSelectedEngine(null);
                  }}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    currentStep === 2
                      ? 'bg-[#335aff] text-white font-bold'
                      : selectedModel
                      ? 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                      : 'text-slate-600 cursor-not-allowed'
                  }`}
                >
                  2. {selectedModel || (isArabic ? 'الموديل' : 'Model')}
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-slate-500 rtl:rotate-180 shrink-0" />

                <button
                  type="button"
                  disabled={!selectedModel}
                  onClick={() => {
                    setSelectedEngine(null);
                  }}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    currentStep === 3
                      ? 'bg-[#335aff] text-white font-bold'
                      : selectedYear
                      ? 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                      : 'text-slate-600 cursor-not-allowed'
                  }`}
                >
                  3. {selectedYear || (isArabic ? 'السنة' : 'Year')}
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-slate-500 rtl:rotate-180 shrink-0" />

                <span
                  className={`px-2 py-1 rounded-lg ${
                    currentStep === 4
                      ? 'bg-[#335aff] text-white font-bold'
                      : 'text-slate-600'
                  }`}
                >
                  4. {selectedEngine ? selectedEngine.split(' ')[0] : (isArabic ? 'المحرك' : 'Engine')}
                </span>
              </div>

              {/* STEP 1: SELECT MAKE */}
              {currentStep === 1 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2.5">
                    {isArabic ? 'اختر الشركة المصنعة للمركبة:' : 'Select Vehicle Make:'}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {makes.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleSelectMake(m)}
                        className={`p-3 rounded-2xl border text-left rtl:text-right font-bold text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer micro-press ${
                          selectedMake === m
                            ? 'bg-[#335aff]/20 border-[#335aff] text-white shadow-md'
                            : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-200 hover:bg-white/[0.06]'
                        }`}
                      >
                        <span>{m}</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 rtl:rotate-180" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: SELECT MODEL */}
              {currentStep === 2 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2.5">
                    <span>{isArabic ? `اختر طراز ${selectedMake}:` : `Select ${selectedMake} Model:`}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedMake(null)}
                      className="text-xs text-[#335aff] hover:underline cursor-pointer"
                    >
                      {isArabic ? 'تغيير الشركة' : 'Back to Makes'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {models.map((mod) => (
                      <button
                        key={mod}
                        type="button"
                        data-testid={`model-btn-${mod}`}
                        onClick={() => handleSelectModel(mod)}
                        className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#335aff]/50 hover:bg-white/[0.06] text-white text-left rtl:text-right font-bold text-sm flex items-center justify-between transition-all cursor-pointer micro-press"
                      >
                        <div className="flex items-center gap-2.5">
                          <Car className="w-4 h-4 text-slate-400" />
                          <span>{selectedMake} {mod}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 rtl:rotate-180" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: SELECT YEAR */}
              {currentStep === 3 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2.5">
                    <span>{isArabic ? `اختر سنة صنع ${selectedMake} ${selectedModel}:` : `Select ${selectedMake} ${selectedModel} Model Year:`}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedModel(null)}
                      className="text-xs text-[#335aff] hover:underline cursor-pointer"
                    >
                      {isArabic ? 'تغيير الموديل' : 'Back to Models'}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {years.map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        data-testid={`year-btn-${yr}`}
                        onClick={() => handleSelectYear(yr)}
                        className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#335aff]/60 hover:bg-white/[0.06] text-white text-center font-bold text-sm transition-all cursor-pointer micro-press"
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: SELECT ENGINE & CONFIRM */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>{isArabic ? 'اختر مواصفة المحرك للتأكيد التام:' : 'Select Engine Specification:'}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedYear(null)}
                      className="text-xs text-[#335aff] hover:underline cursor-pointer"
                    >
                      {isArabic ? 'تغيير السنة' : 'Change Year'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {engines.map((eng) => {
                      const isSelected = selectedEngine === eng;
                      return (
                        <div
                          key={eng}
                          onClick={() => handleSelectEngine(eng)}
                          className={`p-3.5 rounded-2xl border text-left rtl:text-right cursor-pointer flex items-center justify-between transition-all micro-press ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md'
                              : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-400'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-bold text-white text-xs sm:text-sm">{eng}</div>
                              <div className="text-[11px] text-slate-400">
                                {selectedMake} {selectedModel} ({selectedYear})
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary & Confirm Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      id="btn-confirm-vehicle"
                      onClick={handleConfirmProgressiveVehicle}
                      className="w-full py-3 rounded-2xl bg-[#335aff] hover:bg-[#2647e6] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#335aff]/25 transition-all cursor-pointer micro-press"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {isArabic
                          ? `تأكيد ${selectedMake} ${selectedModel} ${selectedYear}`
                          : `Confirm ${selectedMake} ${selectedModel} ${selectedYear}`}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: My Garage Saved Vehicles */}
          {activeTab === 'garage' && (
            <div className="space-y-3">
              {userVehicles.map((veh) => {
                const isCurrentActive = activeVehicle?.id === veh.id;
                return (
                  <div
                    key={veh.id}
                    onClick={() => handleSelectSavedVehicle(veh)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 micro-press ${
                      isCurrentActive
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isCurrentActive ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">
                          {veh.make} {veh.model} {veh.year}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {veh.engine}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isCurrentActive ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold flex items-center gap-1 border border-emerald-500/30">
                          <Check className="w-3 h-3" />
                          <span>{isArabic ? 'مفعل' : 'Active'}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#335aff] font-semibold flex items-center gap-1">
                          <span>{isArabic ? 'تفعيل' : 'Use'}</span>
                          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setActiveTab('progressive')}
                className="w-full py-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-dashed border-white/20 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#335aff]" />
                <span>{isArabic ? 'إضافة سيارة جديدة للمرآب' : 'Add Another Vehicle'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
