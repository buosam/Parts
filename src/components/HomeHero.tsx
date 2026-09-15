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
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
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
    { id: 'All', name: 'All Categories', nameAr: 'جميع القطع', icon: Layers },
    { id: 'Brake', name: 'Brake', nameAr: 'الفرامل والسفايف', icon: Disc },
    { id: 'Engine', name: 'Engine', nameAr: 'المحرك والاشتعال', icon: Activity },
    { id: 'Suspension', name: 'Suspension', nameAr: 'المساعدات والمقصات', icon: Layers },
    { id: 'Filters', name: 'Filters', nameAr: 'الفلاتر (زيت وهواء)', icon: Filter },
    { id: 'Cooling', name: 'Cooling', nameAr: 'التبريد ومضخات الماء', icon: Zap },
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
    <div className="bg-linear-to-b from-neutral-900 via-neutral-900 to-neutral-800 text-white border-b border-neutral-800">
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-12 sm:pt-14 sm:pb-16 text-center">
        {/* Core Value Prop Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {isArabic
              ? 'القطعة الصحيحة، من المورد المناسب، بالسعر الأفضل'
              : 'Find the right part, from the right supplier, at the right price'}
          </span>
        </div>

        {/* Primary Headline (PRD Section 6) */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white max-w-2xl mx-auto leading-tight">
          {isArabic ? 'اعثر على القطعة المطابقة لسيارتك بدقة' : 'Find the right part for your car'}
        </h1>

        <p className="mt-3 text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
          {isArabic
            ? 'كتالوج مركزي موثق، مقارنة فورية بين الموردين للأصلي والـ OEM، وتأكيد التوافق برقم الشاصي.'
            : 'Centralized master catalogue, side-by-side Genuine & OEM supplier comparison, and verified fitment.'}
        </p>

        {/* Vehicle Section: "My Vehicle" (PRD Section 6) */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-3 bg-neutral-800/90 border border-neutral-700/80 rounded-2xl px-4 py-2 text-left shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-neutral-700/80 text-emerald-400 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                {isArabic ? 'سيارتي المحددة' : 'MY VEHICLE'}
              </div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                {activeVehicle ? (
                  <span>
                    {activeVehicle.make} {activeVehicle.model} {activeVehicle.year} • {activeVehicle.engine}
                  </span>
                ) : (
                  <span className="text-amber-300">
                    {isArabic ? 'لم يتم تحديد سيارة بعد' : 'No Vehicle Selected'}
                  </span>
                )}
              </div>
            </div>
            <button
              id="hero-change-vehicle-btn"
              onClick={() => setActiveModal('vehicle_picker')}
              className="ml-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
            >
              {isArabic ? 'تغيير المركبة' : 'Change Vehicle'}
            </button>
          </div>
        </div>

        {/* Primary Search Bar (PRD Section 6 & 7) */}
        <div className="mt-8 max-w-3xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-2xl border-2 border-neutral-700 focus-within:border-emerald-500 transition-all">
              <div className="pl-3 pr-2 text-neutral-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                id="main-search-input"
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                placeholder={
                  isArabic
                    ? 'ابحث برقم القطعة (04465-60290)، اسم القطعة (فحمات)، أو جملة طبيعية...'
                    : 'Search part name, part number (e.g. 04465-60290), or natural phrase...'
                }
                className="w-full text-neutral-900 placeholder:text-neutral-400 text-sm sm:text-base font-medium bg-transparent focus:outline-hidden py-2"
              />
              <button
                type="submit"
                id="main-search-submit-btn"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shrink-0 shadow-sm"
              >
                {isArabic ? 'بحث' : 'Search Parts'}
              </button>
            </div>
          </form>

          {/* Quick Search Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-neutral-400">
            <span className="font-semibold text-neutral-500">Popular:</span>
            {[
              { label: '04465-60290 (Prado Brake Pads)', query: '04465-60290' },
              { label: 'Oil Filter 04152-YZZA1', query: '04152-YZZA1' },
              { label: 'Control Arm 48068-60030', query: '48068-60030' },
              { label: 'Patrol Y62 Brakes', query: 'Nissan Patrol' },
            ].map((chip) => (
              <button
                key={chip.query}
                type="button"
                onClick={() => handleQuickSearch(chip.query)}
                className="bg-neutral-800 hover:bg-neutral-700 hover:text-white px-2.5 py-1 rounded-lg text-neutral-300 border border-neutral-700 text-[11px] transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Secondary Actions: Search by Photo & Request a Part (PRD Section 6) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 max-w-2xl mx-auto">
            <button
              id="hero-search-by-photo-btn"
              onClick={() => setActiveModal('photo_search')}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-xs font-semibold text-neutral-200 hover:text-white transition-all group"
            >
              <Camera className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>{isArabic ? 'البحث بالصورة (AI)' : 'Search by Photo'}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1 rounded">
                AI
              </span>
            </button>

            <button
              id="hero-upload-quote-btn"
              onClick={() => setActiveModal('quote_upload')}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-xs font-semibold text-neutral-200 hover:text-white transition-all group"
            >
              <FileText className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>{isArabic ? 'رفع تسعيرة كراج' : 'Upload Garage Quote'}</span>
            </button>

            <button
              id="hero-request-part-btn"
              onClick={() => setActiveModal('request_part')}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md transition-all group"
            >
              <Sparkles className="w-4 h-4 text-emerald-200 group-hover:rotate-12 transition-transform" />
              <span>{isArabic ? 'طلب قطعة غير متوفرة' : 'Request a Part'}</span>
            </button>
          </div>
        </div>

        {/* Popular Categories (PRD Section 6) */}
        <div className="mt-10 pt-8 border-t border-neutral-800">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-chip-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
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
