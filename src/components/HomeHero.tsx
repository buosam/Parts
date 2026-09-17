/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Camera,
  FileText,
  Car,
  ChevronRight,
  Gavel,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const HomeHero: React.FC = () => {
  const {
    activeVehicle,
    setActiveModal,
    searchQuery,
    setSearchQuery,
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [localInput, setLocalInput] = useState(searchQuery);

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

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-10 pb-12 sm:pt-14 sm:pb-16 text-center">
        {/* Primary Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-[1.2]">
          {isArabic ? (
            <>
              سوق قطع الغيار المعتمد.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
                شراء مباشر أو مزايدة فورية.
              </span>
            </>
          ) : (
            <>
              Authentic Auto Parts.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
                Direct Purchase or Live Bidding.
              </span>
            </>
          )}
        </h1>

        <p className="mt-3 text-xs sm:text-sm md:text-base text-slate-300/80 max-w-xl mx-auto font-normal leading-relaxed">
          {isArabic
            ? 'مخزون موثق ومربوط فورياً مع كبرى وكالات وتجار قطع الغيار في العراق.'
            : 'Live ERP-synchronized inventory and reverse RFQ auctions with verified dealers across Iraq.'}
        </p>

        {/* Guaranteed Fitment Selector Pill */}
        <div className="mt-6 flex justify-center">
          <button
            id="hero-change-vehicle-btn"
            onClick={() => setActiveModal('vehicle_picker')}
            className="group flex items-center gap-3.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-500/40 rounded-2xl px-4 py-2 backdrop-blur-xl shadow-xl transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Car className="w-4 h-4" />
            </div>
            <div className="text-left rtl:text-right">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>{isArabic ? 'المركبة المحددة' : 'MY VEHICLE'}</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">
                  FITMENT
                </span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
                {activeVehicle ? (
                  <span>
                    {activeVehicle.make} {activeVehicle.model} {activeVehicle.year} • <span className="text-slate-400">{activeVehicle.engine}</span>
                  </span>
                ) : (
                  <span className="text-amber-300 font-medium text-xs">
                    {isArabic ? 'اختر سيارتك لتصفية القطع المطابقة' : 'Select vehicle to guarantee fitment'}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>
        </div>

        {/* Main Search Experience */}
        <div className="mt-6 max-w-2xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center bg-slate-900/95 rounded-2xl p-1.5 shadow-2xl border border-white/15 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <div className="px-3 text-slate-400 shrink-0">
                <Search className="w-5 h-5 text-indigo-400" />
              </div>
              <input
                type="text"
                id="main-search-input"
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                placeholder={
                  isArabic
                    ? 'ابحث باسم القطعة، رقم الـ OEM (مثال: 04465-60290)...'
                    : 'Search part name, OEM number (e.g. 04465-60290)...'
                }
                className="w-full text-white placeholder:text-slate-500 text-xs sm:text-sm font-medium bg-transparent focus:outline-hidden py-2 px-1"
              />
              <button
                type="submit"
                id="main-search-submit-btn"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shrink-0 shadow-lg shadow-indigo-600/25 cursor-pointer"
              >
                {isArabic ? 'بحث' : 'Search'}
              </button>
            </div>
          </form>

          {/* Popular Search Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs text-slate-400">
            <span className="font-semibold text-slate-500 text-[11px]">{isArabic ? 'شائع:' : 'Popular:'}</span>
            {[
              { label: '04465-60290 (Prado Brake)', query: '04465-60290' },
              { label: 'Oil Filter 04152-YZZA1', query: '04152-YZZA1' },
              { label: 'Control Arm 48068-60030', query: '48068-60030' },
              { label: 'Nissan Patrol Shocks', query: 'Nissan Patrol' },
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-6 max-w-xl mx-auto">
            <button
              id="hero-search-by-photo-btn"
              onClick={() => setActiveModal('photo_search')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all group cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>{isArabic ? 'بحث بالصورة' : 'AI Photo Search'}</span>
            </button>

            <button
              id="hero-upload-quote-btn"
              onClick={() => setActiveModal('quote_upload')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all group cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>{isArabic ? 'فحص تسعيرة كراج' : 'Scan Garage Quote'}</span>
            </button>

            <button
              id="hero-request-part-btn"
              onClick={() => setActiveModal('request_part')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all group cursor-pointer"
            >
              <Gavel className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
              <span>{isArabic ? 'طلب مناقصة' : 'Request RFQ Bid'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
