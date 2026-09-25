/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket - Hero Search & Compatibility Engine
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Camera,
  Car,
  ChevronDown,
  Gavel,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Truck,
  ArrowRight,
  X,
  Clock,
  Wrench,
  Check,
  Layers,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const HomeHero: React.FC = () => {
  const {
    activeVehicle,
    setActiveVehicle,
    setActiveModal,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    language,
    masterParts,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [localInput, setLocalInput] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync with context search query
  useEffect(() => {
    setLocalInput(searchQuery);
  }, [searchQuery]);

  // Click outside listener for suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchQuery(localInput.trim());
    setSelectedCategory('All');
    setIsFocused(false);
  };

  const handleSelectSuggestion = (term: string) => {
    setLocalInput(term);
    setSearchQuery(term);
    setSelectedCategory('All');
    setIsFocused(false);
  };

  // Compute smart suggestions based on input
  const suggestions = React.useMemo(() => {
    const q = localInput.trim().toLowerCase();
    if (!q) {
      return [
        { type: 'popular', label: isArabic ? 'أقمشة فرامل أمامية' : 'Front Brake Pads', query: 'Brake Pads' },
        { type: 'popular', label: isArabic ? 'فلتر زيت المحرك' : 'Engine Oil Filter', query: 'Oil Filter' },
        { type: 'oem', label: '04465-60290 (Toyota OEM)', query: '04465-60290' },
        { type: 'popular', label: isArabic ? 'مساعدات وتعليق' : 'Control Arm / Suspension', query: 'Control Arm' },
        { type: 'popular', label: isArabic ? 'بواجي ليزر إيريديوم' : 'Spark Plugs (Iridium)', query: 'Spark Plugs' },
      ];
    }

    const matches = masterParts.filter(
      (p) =>
        p.partName.toLowerCase().includes(q) ||
        (p.partNameArabic && p.partNameArabic.includes(q)) ||
        p.partNumber.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    );

    return matches.slice(0, 5).map((p) => ({
      type: 'part',
      label: isArabic && p.partNameArabic ? p.partNameArabic : p.partName,
      query: p.partNumber,
      sublabel: `${p.brand} • ${p.partNumber}`,
    }));
  }, [localInput, masterParts, isArabic]);

  return (
    <section className="relative overflow-hidden bg-[#090d16] text-white border-b border-white/[0.08] pt-8 pb-10 sm:pt-12 sm:pb-12">
      {/* Subtle Restrained Ambient Glow */}
      <div className="mesh-glow mesh-glow-blue w-[400px] h-[250px] -top-24 -left-20" />
      <div className="mesh-glow mesh-glow-orange w-[300px] h-[200px] -bottom-20 -right-20" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Confident Human Headline (Section 6) */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          {isArabic ? 'اعثر على القطعة المطابقة لسيارتك' : 'Find the right part for your car.'}
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto font-normal">
          {isArabic
            ? 'مخزون حقيقي متزامن مباشرة من الوكلاء المعتمدين في العراق'
            : 'Guaranteed fitment from verified dealers across Iraq.'}
        </p>

        {/* Unified Search & Vehicle Selection Console */}
        <div className="mt-7 max-w-2xl mx-auto" ref={searchContainerRef}>
          <div className="relative bg-[#0e1424] rounded-2xl border border-white/[0.12] shadow-2xl focus-within:border-[#335aff] focus-within:ring-2 focus-within:ring-[#335aff]/25 transition-all">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x sm:rtl:divide-x-reverse divide-white/[0.08]">
              
              {/* Zone 1: Vehicle Selector Context */}
              <button
                type="button"
                id="hero-vehicle-selector-trigger"
                onClick={() => setActiveModal('vehicle_picker')}
                className="flex items-center gap-2.5 px-3.5 py-3 sm:py-2.5 text-left rtl:text-right hover:bg-white/[0.03] transition-colors cursor-pointer sm:w-5/12 shrink-0 group"
                title={isArabic ? 'اختيار أو تغيير السيارة' : 'Select or change vehicle'}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    activeVehicle
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-white/10 text-slate-400 group-hover:text-white'
                  }`}
                >
                  <Car className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                    <span>{isArabic ? 'المركبة' : 'Your Vehicle'}</span>
                    {activeVehicle && (
                      <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/20 px-1 rounded">
                        {isArabic ? '✓ مطابق' : '✓ Fits'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-white truncate">
                    {activeVehicle ? (
                      `${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year}`
                    ) : (
                      <span className="text-slate-300 font-normal">
                        {isArabic ? 'اختر سيارتك...' : 'Select vehicle...'}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-white shrink-0" />
              </button>

              {/* Zone 2: Search Input & Submit Action */}
              <div className="flex items-center flex-1 min-w-0 px-2.5 py-1.5 sm:py-0">
                <div className="pl-1.5 pr-2 text-slate-400 shrink-0">
                  <Search className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="home-hero-search-input"
                  value={localInput}
                  onChange={(e) => {
                    setLocalInput(e.target.value);
                    if (!isFocused) setIsFocused(true);
                  }}
                  onFocus={() => setIsFocused(true)}
                  placeholder={
                    activeVehicle
                      ? (isArabic
                          ? `ابحث عن قطع تناسب ${activeVehicle.model}...`
                          : `Search parts that fit ${activeVehicle.model}...`)
                      : (isArabic
                          ? 'ابحث باسم القطعة، رقم الـ OEM، أو الماركة...'
                          : 'Search part name, OEM number, or brand...')
                  }
                  className="w-full text-white placeholder:text-slate-500 text-xs sm:text-sm font-medium bg-transparent focus:outline-none py-2.5 px-1 truncate"
                  autoComplete="off"
                />

                {localInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocalInput('');
                      setSearchQuery('');
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer mr-1.5 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="submit"
                  id="home-hero-search-submit-btn"
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#335aff] hover:bg-[#2647e6] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shrink-0 cursor-pointer shadow-md micro-press"
                >
                  {isArabic ? 'بحث' : 'Find Parts'}
                </button>
              </div>
            </form>

            {/* Live Auto-Complete Suggestions Dropdown */}
            {isFocused && suggestions.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-[#0e1424] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/80 z-50 p-2 text-left rtl:text-right overflow-hidden animate-in fade-in duration-100"
              >
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1.5 border-b border-white/[0.06] flex items-center justify-between">
                  <span>{isArabic ? 'اقتراحات البحث المباشرة' : 'Search Suggestions'}</span>
                  <span className="font-mono text-[9px] text-slate-500">
                    {localInput ? 'Filtered' : 'Popular'}
                  </span>
                </div>

                <div className="divide-y divide-white/[0.04]">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectSuggestion(item.query);
                      }}
                      className="w-full px-3 py-2 text-left rtl:text-right hover:bg-white/[0.05] rounded-xl flex items-center justify-between transition-colors cursor-pointer text-xs group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#335aff]" />
                        <span className="font-semibold text-white group-hover:text-[#335aff] transition-colors truncate">
                          {item.label}
                        </span>
                      </div>
                      {item.sublabel && (
                        <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-2">
                          {item.sublabel}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions (Quiet, Refined) */}
          <div className="flex items-center justify-center gap-4 mt-3.5 text-xs">
            <button
              type="button"
              id="hero-scan-sanawia-btn"
              onClick={() => setActiveModal('sanawia_ocr')}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer text-xs"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isArabic ? 'مسح السنوية (AI)' : 'Upload Registration'}</span>
            </button>

            <span className="text-slate-600">•</span>

            <button
              type="button"
              id="hero-cant-find-part-btn"
              onClick={() => setActiveModal('request_part')}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
            >
              <Gavel className="w-3.5 h-3.5 text-amber-400" />
              <span>{isArabic ? 'لم تجد القطعة؟ اطلبها' : "Can't find a part? Request Quote"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
