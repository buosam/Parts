/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Camera,
  FileText,
  Sparkles,
  Car,
  Disc,
  Filter,
  Activity,
  Layers,
  Zap,
  ShieldCheck,
  ChevronRight,
  Gavel,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const HomeHero: React.FC = () => {
  const {
    activeVehicle,
    setActiveModal,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [localInput, setLocalInput] = useState(searchQuery);

  const categories = [
    { id: 'All', name: 'All Parts', nameAr: 'جميع القطع', icon: Layers },
    { id: 'Brake', name: 'Brake & Rotors', nameAr: 'الفرامل والسفايف', icon: Disc },
    { id: 'Engine', name: 'Engine & Ignition', nameAr: 'المحرك والاشتعال', icon: Activity },
    { id: 'Suspension', name: 'Suspension & Shocks', nameAr: 'المساعدات والمقصات', icon: Layers },
    { id: 'Filters', name: 'Oil & Air Filters', nameAr: 'الفلاتر والزيوت', icon: Filter },
    { id: 'Cooling', name: 'Cooling & Radiators', nameAr: 'التبريد ومضخات الماء', icon: Zap },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localInput.trim());
  };

  const handleQuickSearch = (term: string) => {
    setLocalInput(term);
    setSearchQuery(term);
  };

  return (
    <div className="relative overflow-hidden bg-[#0a0e1a] text-white border-b border-white/10">
      {/* Ambient Lighting & Mesh Gradients */}
      <div className="mesh-glow mesh-glow-blue w-[500px] h-[500px] -top-32 -left-32" />
      <div className="mesh-glow mesh-glow-indigo w-[600px] h-[600px] top-10 -right-40" />
      <div className="mesh-glow mesh-glow-amber w-[400px] h-[400px] bottom-0 left-1/3 opacity-15" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-14 sm:pt-16 sm:pb-20 text-center">
        {/* Sleek Minimalist Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md text-xs font-semibold mb-6 shadow-inner">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-slate-300">
            {isArabic ? 'مخزون الوكلاء والربط المباشر' : 'Live Dealer Inventory Network'}
          </span>
          <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            VERIFIED
          </span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          {isArabic ? (
            <>
              ابحث عن القطعة بدقة.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
                أو دع الوكلاء المعتمدين يتنافسون
              </span>{' '}
              لتوفيرها لك.
            </>
          ) : (
            <>
              Search for genuine parts.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
                Or let verified dealers compete
              </span>{' '}
              to supply them.
            </>
          )}
        </h1>

        <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-300/80 max-w-2xl mx-auto font-normal leading-relaxed">
          {isArabic
            ? 'شراء مباشر من مخازن الوكلاء المتصلة فورياً (Erbil, Baghdad, Sulaymaniyah, Basra) أو إرسال طلب للمناقصة الفورية.'
            : 'Direct purchase with live dealer ERP/DMS inventory synchronization across Iraq, plus reverse RFQ bidding for hard-to-find components.'}
        </p>

        {/* Guaranteed Fitment Selector Pill */}
        <div className="mt-7 flex justify-center">
          <button
            id="hero-change-vehicle-btn"
            onClick={() => setActiveModal('vehicle_picker')}
            className="group flex items-center gap-3.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-500/40 rounded-2xl px-4 py-2.5 backdrop-blur-xl shadow-2xl transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Car className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>{isArabic ? 'المركبة المحددة للتوافق' : 'GUARANTEED FITMENT'}</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">
                  100% FIT
                </span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
                {activeVehicle ? (
                  <span>
                    {activeVehicle.make} {activeVehicle.model} {activeVehicle.year} • <span className="text-slate-400">{activeVehicle.engine}</span>
                  </span>
                ) : (
                  <span className="text-amber-300 font-medium">
                    {isArabic ? 'اضغط لاختيار سيارتك وتأكيد التوافق' : 'Select vehicle to filter matching inventory'}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>
        </div>

        {/* Main Search Experience */}
        <div className="mt-8 max-w-3xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center bg-slate-900/90 rounded-2xl p-2 shadow-2xl border border-white/15 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <div className="pl-3 pr-2 text-slate-400">
                <Search className="w-5 h-5 text-indigo-400" />
              </div>
              <input
                type="text"
                id="main-search-input"
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                placeholder={
                  isArabic
                    ? 'ابحث برقم القطعة (04465-60290)، اسم القطعة، أو مواصفات سيارتك...'
                    : 'Search part name, OEM number (e.g. 04465-60290), or description...'
                }
                className="w-full text-white placeholder:text-slate-500 text-sm sm:text-base font-medium bg-transparent focus:outline-hidden py-2 px-1"
              />
              <button
                type="submit"
                id="main-search-submit-btn"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shrink-0 shadow-lg shadow-indigo-600/25 cursor-pointer"
              >
                {isArabic ? 'بحث مباشر' : 'Search Parts'}
              </button>
            </div>
          </form>

          {/* Popular Search Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-500 text-[11px]">Popular:</span>
            {[
              { label: '04465-60290 (Prado Brake Pads)', query: '04465-60290' },
              { label: 'Oil Filter 04152-YZZA1', query: '04152-YZZA1' },
              { label: 'Control Arm 48068-60030', query: '48068-60030' },
              { label: 'Nissan Patrol Y62 Shocks', query: 'Nissan Patrol' },
            ].map((chip) => (
              <button
                key={chip.query}
                type="button"
                onClick={() => handleQuickSearch(chip.query)}
                className="bg-white/[0.04] hover:bg-white/[0.09] hover:text-white px-2.5 py-1 rounded-lg text-slate-300 border border-white/5 text-[11px] transition-colors cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Secondary Action Cards (Photo Search, RFQ Bidding, Quote Upload) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7 max-w-2xl mx-auto">
            <button
              id="hero-search-by-photo-btn"
              onClick={() => setActiveModal('photo_search')}
              className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all group cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>{isArabic ? 'البحث بالصورة (AI)' : 'AI Photo Search'}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                VISION
              </span>
            </button>

            <button
              id="hero-upload-quote-btn"
              onClick={() => setActiveModal('quote_upload')}
              className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all group cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>{isArabic ? 'رفع تسعيرة كراج' : 'Scan Garage Quote'}</span>
            </button>

            <button
              id="hero-request-part-btn"
              onClick={() => setActiveModal('request_part')}
              className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all group cursor-pointer"
            >
              <Gavel className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
              <span>{isArabic ? 'طلب قطعة للمزايدة' : 'Request RFQ Bidding'}</span>
            </button>
          </div>
        </div>

        {/* Clean Category Selector Row */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-chip-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                      : 'bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 hover:text-white border border-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isArabic ? cat.nameAr : cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
