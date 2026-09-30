/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket - Diagnostic Bay Hero & Fitment Engine
 * Aesthetic: Machined Chassis Slate, Space Grotesk + IBM Plex Sans Arabic, Technical Clearance Envelopes.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Camera,
  Car,
  ChevronDown,
  Gavel,
  ShieldCheck,
  X,
  FileCheck2,
  CheckCircle2,
  SlidersHorizontal,
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
    masterParts,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [localInput, setLocalInput] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [filterInStockOnly, setFilterInStockOnly] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalInput(searchQuery);
  }, [searchQuery]);

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

  const suggestions = React.useMemo(() => {
    const q = localInput.trim().toLowerCase();
    if (!q) {
      return [
        { label: isArabic ? 'أقمشة فرامل أمامية' : 'Front Brake Pads', query: 'Brake Pads', code: '04465-60290' },
        { label: isArabic ? 'فلتر زيت المحرك' : 'Engine Oil Filter', query: 'Oil Filter', code: '90915-YZZD4' },
        { label: isArabic ? 'بواجي ليزر إيريديوم' : 'Spark Plugs (Iridium)', query: 'Spark Plugs', code: 'SK20HR11' },
        { label: isArabic ? 'مساعدات وتعليق أمامي' : 'Front Shock Absorber', query: 'Control Arm', code: '48510-69415' },
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
      label: isArabic && p.partNameArabic ? p.partNameArabic : p.partName,
      query: p.partNumber,
      code: `${p.brand} ${p.partNumber}`,
    }));
  }, [localInput, masterParts, isArabic]);

  return (
    <section className="bg-[#0d111a] text-[#f3f6fa] border-b border-white/[0.08] pt-8 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Confident Technical Headline */}
        <div className="max-w-3xl mb-7">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#f3f6fa] leading-tight">
            {isArabic
              ? 'قطع غيار سيارات مضمونة المطابقة في العراق'
              : 'Guaranteed automotive parts fitment for Iraq.'}
          </h1>
          <p className="mt-2 text-sm text-[#94a3b8] leading-relaxed max-w-2xl">
            {isArabic
              ? 'مخزون حقيقي متزامن مع مستودعات السنك في بغداد والمنطقة الصناعية في أربيل، مع ضمان المطابقة على رقم الشاصي والمحرك.'
              : 'Direct inventory synchronized with Al-Sinak warehouses in Baghdad and Erbil industrial trade, backed by VIN and engine code fitment guarantees.'}
          </p>
        </div>

        {/* The Diagnostic Bay: Two-Column Industrial Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Column A: Primary Search & Vehicle Fitment Lock (7 Cols) */}
          <div className="lg:col-span-7 bg-[#151d2a] border border-white/[0.09] rounded-lg p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Active Vehicle Lock Strip */}
              <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-white/[0.07]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                      activeVehicle
                        ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-800/80 border border-white/10 text-slate-400'
                    }`}
                  >
                    <Car className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-[#94a3b8] flex items-center gap-1.5 font-medium">
                      <span>{isArabic ? 'المركبة الحالية' : 'Active Vehicle Lock'}</span>
                      {activeVehicle && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono font-medium">
                          {isArabic ? 'مطابقة مؤكدة' : 'Fitment Guaranteed'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-white truncate mt-0.5">
                      {activeVehicle ? (
                        <span>
                          {activeVehicle.year} {activeVehicle.make} {activeVehicle.model} {activeVehicle.trim}
                          {activeVehicle.engine && (
                            <span className="text-slate-400 font-normal font-mono text-[11px] ml-1.5 rtl:mr-1.5">
                              ({activeVehicle.engine})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">
                          {isArabic ? 'لم يتم تحديد مركبة بعد' : 'No vehicle locked'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  id="hero-vehicle-selector-trigger"
                  onClick={() => setActiveModal('vehicle_picker')}
                  className="px-2.5 py-1.5 rounded bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-medium text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <span>{activeVehicle ? (isArabic ? 'تغيير' : 'Change') : (isArabic ? 'اختر مركبة' : 'Lock Vehicle')}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              {/* Direct Search Bar Console */}
              <div className="relative" ref={searchContainerRef}>
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
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
                              ? `ابحث عن قطع تناسب ${activeVehicle.make} ${activeVehicle.model}...`
                              : `Search OEM part number or name for ${activeVehicle.make} ${activeVehicle.model}...`)
                          : (isArabic
                              ? 'ابحث باسم القطعة، رقم OEM، أو الماركة (مثل: 04465-60290)...'
                              : 'Search by part name, OEM code, or brand (e.g. 04465-60290)...')
                      }
                      className="w-full pl-9 pr-8 rtl:pl-8 rtl:pr-9 py-2.5 bg-[#0d111a] border border-white/[0.12] focus:border-[#2554d7] focus:ring-1 focus:ring-[#2554d7] rounded text-xs sm:text-sm text-white placeholder:text-slate-500 font-medium transition-colors"
                      autoComplete="off"
                    />
                    {localInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setLocalInput('');
                          setSearchQuery('');
                        }}
                        className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-2.5 rtl:pr-0 rtl:pl-2.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    id="home-hero-search-submit-btn"
                    className="px-4 py-2.5 bg-[#2554d7] hover:bg-[#1d42b0] text-white text-xs sm:text-sm font-semibold rounded transition-colors shrink-0 cursor-pointer micro-press"
                  >
                    {isArabic ? 'بحث بالمخزون' : 'Search Stock'}
                  </button>
                </form>

                {/* Technical Suggestions Dropdown */}
                {isFocused && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#151d2a] border border-white/[0.12] rounded shadow-xl z-50 p-1.5 text-left rtl:text-right">
                    <div className="text-[10px] text-[#94a3b8] px-2.5 py-1 font-medium border-b border-white/[0.06] flex items-center justify-between">
                      <span>{isArabic ? 'اقتراحات القطع والأرقام القياسية' : 'Suggested OEM Parts & Codes'}</span>
                      <span className="font-mono text-[10px] text-slate-400">OEM Catalog</span>
                    </div>

                    <div className="divide-y divide-white/[0.03] mt-1">
                      {suggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectSuggestion(item.query);
                          }}
                          className="w-full px-2.5 py-1.5 text-left rtl:text-right hover:bg-white/[0.05] rounded flex items-center justify-between transition-colors cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-medium text-slate-100 truncate">{item.label}</span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-400 ml-2 rtl:mr-2 shrink-0">
                            {item.code}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Catalog Filter Controls */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#94a3b8]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterInStockOnly}
                  onChange={(e) => setFilterInStockOnly(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-[#2554d7] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-slate-300 font-medium">
                  {isArabic ? 'إظهار القطع المتوفرة فوراً في المستودعات' : 'In-stock Baghdad & Erbil inventory only'}
                </span>
              </label>

              <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">
                {masterParts.length} {isArabic ? 'قطعة مفهرسة' : 'indexed components'}
              </span>
            </div>
          </div>

          {/* Column B: Sanawia OCR Scanner & Reverse Tender (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            
            {/* Sanawia Document Diagnostic Module */}
            <div className="bg-[#151d2a] border border-white/[0.09] rounded-lg p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <h2 className="text-xs font-semibold text-white">
                      {isArabic ? 'مسح سنوية المركبة (Sanawia OCR)' : 'Vehicle Registration Scanner'}
                    </h2>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded font-medium">
                    {isArabic ? 'خصوصية مشفرة' : 'Privacy Encrypted'}
                  </span>
                </div>
                <p className="text-[11px] text-[#94a3b8] leading-normal">
                  {isArabic
                    ? 'التقط صورة لسنوية المركبة لقراءة رقم الشاصي (VIN) والمحرك تلقائياً وضمان مطابقة القطع بنسبة 100٪ بدون كشف بيانات المالك.'
                    : 'Scan your Iraqi registration card to extract VIN and engine code for verified fitment. Personal ownership data is encrypted.'}
                </p>
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  id="hero-scan-sanawia-btn"
                  onClick={() => setActiveModal('sanawia_ocr')}
                  className="w-full py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors cursor-pointer micro-press"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'مسح أو رفع صورة السنوية' : 'Scan Vehicle Registration'}</span>
                </button>
              </div>
            </div>

            {/* Reverse Auction RFQ Module */}
            <div className="bg-[#151d2a] border border-white/[0.09] rounded-lg p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Gavel className="w-3.5 h-3.5 text-[#d9730d] shrink-0" />
                  <span>{isArabic ? 'لم تجد القطعة في المخزون؟' : 'Missing part or rare spec?'}</span>
                </div>
                <div className="text-[11px] text-[#94a3b8] truncate mt-0.5">
                  {isArabic
                    ? 'اطرح مناقصة لتنافس أكثر من 45 وكيلاً معتمداً في بغداد وأربيل'
                    : 'Tender an RFQ to 45+ verified merchants across Iraq'}
                </div>
              </div>

              <button
                type="button"
                id="hero-cant-find-part-btn"
                onClick={() => setActiveModal('request_part')}
                className="px-3 py-1.5 bg-[#d9730d]/15 hover:bg-[#d9730d]/25 border border-[#d9730d]/40 text-[#f6ad55] text-xs font-semibold rounded transition-colors cursor-pointer shrink-0 micro-press"
              >
                {isArabic ? 'طلب تسعيرة' : 'Request RFQ'}
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
