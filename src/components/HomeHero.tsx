/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Camera,
  Car,
  ChevronRight,
  Gavel,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  ShieldCheck,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const HomeHero: React.FC = () => {
  const {
    activeVehicle,
    setActiveModal,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [localInput, setLocalInput] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localInput.trim());
    setSelectedCategory('All');
  };

  const handleQuickSearch = (term: string) => {
    setLocalInput(term);
    setSearchQuery(term);
    setSelectedCategory('All');
  };

  return (
    <div className="relative overflow-hidden bg-[#090d16] text-white border-b border-white/10 pb-8 sm:pb-12 pt-8 sm:pt-12">
      {/* Subtle Ambient Glows */}
      <div className="mesh-glow mesh-glow-indigo w-[450px] h-[450px] -top-20 -left-20" />
      <div className="mesh-glow mesh-glow-blue w-[450px] h-[450px] top-10 -right-20" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Simple Human Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
          {isArabic ? 'ما الذي تحتاجه لسيارتك اليوم؟' : 'What do you need for your car?'}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-lg mx-auto font-normal">
          {isArabic
            ? 'قطع غيار أصلية ومطابقة 100% من الوكلاء المعتمدين في العراق'
            : 'Guaranteed fitment parts from verified dealers across Iraq'}
        </p>

        {/* Large Primary Search Field */}
        <div className="mt-6 max-w-2xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center bg-[#0e1424] rounded-2xl p-1.5 shadow-2xl border border-white/15 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <div className="px-3.5 text-slate-400 shrink-0">
                <Search className="w-5 h-5 text-indigo-400" />
              </div>
              <input
                type="text"
                id="home-hero-search-input"
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                placeholder={
                  activeVehicle
                    ? (isArabic
                        ? `ابحث عن قطع تناسب ${activeVehicle.make} ${activeVehicle.model}...`
                        : `Search parts that fit your ${activeVehicle.make} ${activeVehicle.model}...`)
                    : (isArabic
                        ? 'ابحث باسم القطعة، رقم الـ OEM، أو رقم الشاصي VIN...'
                        : 'Search part name, OEM number, or VIN...')
                }
                className="w-full text-white placeholder:text-slate-500 text-sm font-medium bg-transparent focus:outline-hidden py-2 px-1"
              />
              <button
                type="submit"
                id="home-hero-search-submit-btn"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shrink-0 shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                {isArabic ? 'بحث' : 'Search'}
              </button>
            </div>
          </form>

          {/* Popular Search Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-500 text-[11px]">{isArabic ? 'شائع:' : 'Popular:'}</span>
            {[
              { label: 'Brake Pads (04465-60290)', query: '04465-60290' },
              { label: 'Oil Filter (04152-YZZA1)', query: '04152-YZZA1' },
              { label: 'Control Arm (48068-60030)', query: '48068-60030' },
              { label: 'Shock Absorbers', query: 'Shock' },
            ].map((chip) => (
              <button
                key={chip.query}
                type="button"
                onClick={() => handleQuickSearch(chip.query)}
                className="bg-white/[0.04] hover:bg-white/[0.08] hover:text-white px-2.5 py-0.5 rounded-lg text-slate-300 border border-white/5 text-[11px] transition-colors cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Core Action Cards: Search Parts | Identify with Camera | Get Offers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 max-w-2xl mx-auto">
          {/* Action 1: Search Parts */}
          <button
            id="hero-action-search"
            onClick={() => {
              const el = document.getElementById('home-hero-search-input');
              if (el) el.focus();
            }}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#0e1424] hover:bg-[#131b30] border border-white/10 hover:border-indigo-500/40 transition-all text-left rtl:text-right group cursor-pointer shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                {isArabic ? 'تصفح القطع' : 'Search Parts'}
              </div>
              <div className="text-[11px] text-slate-400">
                {isArabic ? 'بالاسم أو رقم القطعة' : 'By name or part number'}
              </div>
            </div>
          </button>

          {/* Action 2: Identify with Camera */}
          <button
            id="hero-action-camera"
            onClick={() => setActiveModal('photo_search')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#0e1424] hover:bg-[#131b30] border border-white/10 hover:border-emerald-500/40 transition-all text-left rtl:text-right group cursor-pointer shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1">
                <span>{isArabic ? 'تعرف بالصورة' : 'Identify a Part'}</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-black">AI</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {isArabic ? 'صور القطعة وسنجدها' : 'Upload or snap a photo'}
              </div>
            </div>
          </button>

          {/* Action 3: Get Offers */}
          <button
            id="hero-action-get-offers"
            onClick={() => setActiveModal('request_part')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#0e1424] hover:bg-[#131b30] border border-amber-500/30 hover:border-amber-500/60 transition-all text-left rtl:text-right group cursor-pointer shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1">
                <span>{isArabic ? 'طلب عروض أسعار' : 'Get Offers'}</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-black">Live</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {isArabic ? 'لم تجدها؟ اطلب من الوكلاء' : 'Ask 120+ verified dealers'}
              </div>
            </div>
          </button>
        </div>

        {/* My Garage Integration Card */}
        <div className="mt-6 max-w-2xl mx-auto">
          {activeVehicle ? (
            <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-left rtl:text-right">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-black text-white">
                      {activeVehicle.make} {activeVehicle.model} {activeVehicle.year}
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {isArabic ? 'توافق مضمون' : 'Fitment Active'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {activeVehicle.engine} • {isArabic ? 'يتم تصفية القطع المطابقة لسيارتك' : 'Filtering parts guaranteed to fit'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModal('vehicle_picker')}
                className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-white transition-colors cursor-pointer ml-auto rtl:ml-0 rtl:mr-auto"
              >
                {isArabic ? 'تغيير السيارة' : 'Change Vehicle'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveModal('vehicle_picker')}
              className="w-full p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-dashed border-white/20 hover:border-indigo-500/50 transition-all flex items-center justify-between gap-3 cursor-pointer group text-left rtl:text-right"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 flex items-center justify-center shrink-0 transition-colors">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {isArabic ? 'أضف سيارتك إلى المرآب' : 'Add your vehicle to My Garage'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {isArabic ? 'لتأكيد التوافق التام وتجنب طلب قطع غير مطابقة' : 'To guarantee fitment and eliminate return mistakes'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

