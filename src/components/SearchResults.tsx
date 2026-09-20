/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Star,
  Truck,
  ArrowUpDown,
  ShoppingBag,
  Eye,
  Store,
  Clock,
  Gavel,
  Sparkles,
  Check,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Wrench,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { MasterPart } from '../types';

interface SearchResultsProps {
  onSelectPart: (part: MasterPart) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ onSelectPart }) => {
  const {
    masterParts,
    activeVehicle,
    searchQuery,
    selectedCategory,
    addToCart,
    setSelectedSupplierIdForStore,
    setActiveModal,
    setPrefilledPartRequest,
    formatPrice,
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';

  const [onlyFitsMyCar, setOnlyFitsMyCar] = useState(true);
  const [qualityFilter, setQualityFilter] = useState<'all' | 'genuine' | 'oem' | 'aftermarket'>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'in_stock_today'>('all');
  const [sortBy, setSortBy] = useState<'compatibility' | 'price_asc' | 'price_desc' | 'trust'>('compatibility');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  // Extract unique brands
  const availableBrands = useMemo(() => {
    const brands = new Set(masterParts.map((p) => p.brand));
    return ['all', ...Array.from(brands)];
  }, [masterParts]);

  // Filter and rank parts
  const filteredAndRankedParts = useMemo(() => {
    return masterParts
      .filter((part) => {
        // Category filter
        if (selectedCategory !== 'All' && part.category !== selectedCategory) {
          return false;
        }

        // Search Query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesNumber =
            part.partNumber.toLowerCase().includes(q) ||
            part.oemNumber?.toLowerCase().includes(q) ||
            part.alternativeNumbers?.some((alt) => alt.toLowerCase().includes(q));

          const matchesName =
            part.partName.toLowerCase().includes(q) ||
            (part.partNameArabic && part.partNameArabic.includes(q)) ||
            part.description.toLowerCase().includes(q) ||
            part.brand.toLowerCase().includes(q);

          const matchesVehicle = part.compatibleVehicles.some(
            (v) =>
              v.make.toLowerCase().includes(q) ||
              v.model.toLowerCase().includes(q) ||
              (v.generation && v.generation.toLowerCase().includes(q))
          );

          if (!matchesNumber && !matchesName && !matchesVehicle) {
            return false;
          }
        }

        // Fitment Filter
        const isFit = activeVehicle
          ? part.compatibleVehicles.some(
              (v) =>
                v.make.toLowerCase() === activeVehicle.make.toLowerCase() &&
                v.model.toLowerCase() === activeVehicle.model.toLowerCase() &&
                activeVehicle.year >= v.yearStart &&
                activeVehicle.year <= v.yearEnd
            )
          : true;

        if (activeVehicle && onlyFitsMyCar && !isFit) {
          return false;
        }

        // Brand filter
        if (selectedBrand !== 'all' && part.brand !== selectedBrand) {
          return false;
        }

        // Quality filter on offers
        if (qualityFilter !== 'all') {
          const hasMatchingQuality = part.offers.some((o) => o.quality === qualityFilter);
          if (!hasMatchingQuality) return false;
        }

        // Availability filter
        if (availabilityFilter === 'in_stock_today') {
          const hasImmediateStock = part.offers.some((o) => o.stockStatus === 'in_stock_today');
          if (!hasImmediateStock) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const fitA = activeVehicle
          ? a.compatibleVehicles.some(
              (v) =>
                v.make.toLowerCase() === activeVehicle.make.toLowerCase() &&
                v.model.toLowerCase() === activeVehicle.model.toLowerCase() &&
                activeVehicle.year >= v.yearStart &&
                activeVehicle.year <= v.yearEnd
            )
          : false;

        const fitB = activeVehicle
          ? b.compatibleVehicles.some(
              (v) =>
                v.make.toLowerCase() === activeVehicle.make.toLowerCase() &&
                v.model.toLowerCase() === activeVehicle.model.toLowerCase() &&
                activeVehicle.year >= v.yearStart &&
                activeVehicle.year <= v.yearEnd
            )
          : false;

        const lowestPriceA = a.offers.length > 0 ? Math.min(...a.offers.map((o) => o.priceUSD)) : 999999;
        const lowestPriceB = b.offers.length > 0 ? Math.min(...b.offers.map((o) => o.priceUSD)) : 999999;

        const maxTrustA = a.offers.length > 0 ? Math.max(...a.offers.map((o) => o.supplierRating)) : 0;
        const maxTrustB = b.offers.length > 0 ? Math.max(...b.offers.map((o) => o.supplierRating)) : 0;

        if (sortBy === 'compatibility') {
          if (fitA && !fitB) return -1;
          if (!fitA && fitB) return 1;
          return maxTrustB - maxTrustA;
        }
        if (sortBy === 'price_asc') return lowestPriceA - lowestPriceB;
        if (sortBy === 'price_desc') return lowestPriceB - lowestPriceA;
        if (sortBy === 'trust') return maxTrustB - maxTrustA;
        return 0;
      });
  }, [masterParts, selectedCategory, searchQuery, onlyFitsMyCar, selectedBrand, qualityFilter, availabilityFilter, sortBy, activeVehicle]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Control / Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {isArabic ? 'قطع الغيار المتوفرة' : 'Available Parts'}
            </h2>
            <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
              {filteredAndRankedParts.length}
            </span>
          </div>
          {searchQuery && (
            <p className="text-xs text-slate-400 mt-1">
              {isArabic ? 'نتائج البحث عن:' : 'Showing results for:'}{' '}
              <span className="font-semibold text-indigo-300">"{searchQuery}"</span>
            </p>
          )}
        </div>

        {/* Primary Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Fits My Car Toggle */}
          {activeVehicle && (
            <button
              id="filter-fits-car-btn"
              onClick={() => setOnlyFitsMyCar(!onlyFitsMyCar)}
              className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                onlyFitsMyCar
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle className={`w-3.5 h-3.5 ${onlyFitsMyCar ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{isArabic ? `يناسب ${activeVehicle.model}` : `Fits ${activeVehicle.model}`}</span>
            </button>
          )}

          {/* In Stock Today */}
          <button
            id="filter-in-stock-btn"
            onClick={() => setAvailabilityFilter(availabilityFilter === 'all' ? 'in_stock_today' : 'all')}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              availabilityFilter === 'in_stock_today'
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-slate-400" />
            <span>{isArabic ? 'متوفر اليوم' : 'In Stock'}</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="sort-parts-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-300 text-xs font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="compatibility" className="bg-slate-900 text-white">
                {isArabic ? 'الأولوية: التوافق والتقييم' : 'Rank: Fitment & Trust'}
              </option>
              <option value="price_asc" className="bg-slate-900 text-white">
                {isArabic ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}
              </option>
              <option value="price_desc" className="bg-slate-900 text-white">
                {isArabic ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}
              </option>
              <option value="trust" className="bg-slate-900 text-white">
                {isArabic ? 'الأعلى تقييماً' : 'Highest Rating'}
              </option>
            </select>
          </div>

          {/* More Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
              showAdvancedFilters || selectedBrand !== 'all' || qualityFilter !== 'all'
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isArabic ? 'تصفية إضافية' : 'Filters'}</span>
            {(selectedBrand !== 'all' || qualityFilter !== 'all') && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Advanced Filters Drawer (Progressive Disclosure) */}
      {showAdvancedFilters && (
        <div className="p-4 mt-3 bg-[#0e1424] rounded-2xl border border-white/10 flex flex-wrap items-center gap-4 text-xs animate-in fade-in duration-150">
          <div>
            <span className="text-slate-400 block mb-1 font-semibold">{isArabic ? 'الشركة المصنعة / العلامة:' : 'Brand / Manufacturer:'}</span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-slate-900 border border-white/10 text-white rounded-xl px-3 py-1.5 focus:outline-hidden"
            >
              {availableBrands.map((b) => (
                <option key={b} value={b}>
                  {b === 'all' ? (isArabic ? 'جميع العلامات' : 'All Brands') : b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-slate-400 block mb-1 font-semibold">{isArabic ? 'درجة الجودة:' : 'Quality Tier:'}</span>
            <select
              value={qualityFilter}
              onChange={(e) => setQualityFilter(e.target.value as any)}
              className="bg-slate-900 border border-white/10 text-white rounded-xl px-3 py-1.5 focus:outline-hidden"
            >
              <option value="all">{isArabic ? 'جميع الدرجات' : 'All Tiers'}</option>
              <option value="genuine">{isArabic ? 'أصلي وكالة (Genuine OEM)' : 'Genuine OEM'}</option>
              <option value="oem">{isArabic ? 'معتمد تجاري (OEM Tier-1)' : 'OEM Tier-1'}</option>
              <option value="aftermarket">{isArabic ? 'تجاري بديل (Aftermarket)' : 'Aftermarket'}</option>
            </select>
          </div>

          {(selectedBrand !== 'all' || qualityFilter !== 'all') && (
            <button
              onClick={() => {
                setSelectedBrand('all');
                setQualityFilter('all');
              }}
              className="mt-4 text-xs text-rose-400 hover:underline cursor-pointer"
            >
              {isArabic ? 'إعادة تعيين الفلاتر' : 'Reset Filters'}
            </button>
          )}
        </div>
      )}

      {/* Zero results state with Get Offers opportunity */}
      {filteredAndRankedParts.length === 0 && (
        <div className="my-10 p-8 sm:p-12 bg-[#0e1424] text-white rounded-3xl border border-white/10 shadow-2xl max-w-xl mx-auto text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Gavel className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-white text-xl tracking-tight">
            {isArabic ? 'لم تجد القطعة المطلوبة في الكتالوج؟' : `Can't find "${searchQuery || 'this part'}" in stock?`}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 mb-6 max-w-md mx-auto leading-relaxed">
            {isArabic
              ? 'اطلب القطعة الآن وسيقوم أكثر من 120 وكيلاً ومتجراً معتمداً في العراق بتقديم عروض أسعار تنافسية فورية.'
              : 'Post your request and let 120+ verified auto parts dealers across Iraq compete with their best prices and instant delivery.'}
          </p>
          <button
            id="zero-results-request-bidding-btn"
            onClick={() => {
              setPrefilledPartRequest({
                partName: searchQuery || (activeVehicle ? `${activeVehicle.make} ${activeVehicle.model} Replacement Part` : 'Automotive Spare Part'),
                partDescription: `Searched in live catalogue for "${searchQuery}". Need verified store owners to bid on supplying this item.`,
              });
              setActiveModal('request_part');
            }}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all inline-flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
          >
            <Gavel className="w-4 h-4" />
            <span>{isArabic ? 'طلب عروض أسعار من الوكلاء' : 'Get Offers from Dealers'}</span>
          </button>
        </div>
      )}

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {filteredAndRankedParts.map((part) => {
          const isFit = activeVehicle
            ? part.compatibleVehicles.some(
                (v) =>
                  v.make.toLowerCase() === activeVehicle.make.toLowerCase() &&
                  v.model.toLowerCase() === activeVehicle.model.toLowerCase() &&
                  activeVehicle.year >= v.yearStart &&
                  activeVehicle.year <= v.yearEnd
              )
            : true;

          const inStockOffers = part.offers.filter((o) => o.stockQuantity > 0 && o.stockStatus !== 'out_of_stock');
          const isOutOfStock = part.offers.length === 0 || inStockOffers.length === 0;

          const lowestPriceUSD = part.offers.length > 0 ? Math.min(...part.offers.map((o) => o.priceUSD)) : 0;
          const lowestPriceIQD = part.offers.length > 0 ? Math.min(...part.offers.map((o) => o.priceIQD)) : 0;

          const bestOffer =
            part.offers.find((o) => o.quality === 'genuine' && o.stockQuantity > 0) ||
            inStockOffers[0] ||
            part.offers[0];

          return (
            <div
              key={part.id}
              id={`master-part-card-${part.id}`}
              className={`bg-[#0e1424] rounded-2xl border ${
                isOutOfStock ? 'border-amber-500/20' : 'border-white/10'
              } hover:border-indigo-500/40 hover:shadow-xl transition-all flex flex-col overflow-hidden group`}
            >
              {/* Card Image */}
              <div
                className="relative h-44 sm:h-48 bg-slate-900 overflow-hidden cursor-pointer"
                onClick={() => onSelectPart(part)}
              >
                {/* Fallback graphic if image is missing or loading */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-800">
                  <Wrench className="w-10 h-10 opacity-30" />
                </div>

                <img
                  src={part.imageUrl}
                  alt=""
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = '0';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 relative z-1"
                />

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1424] via-transparent to-transparent pointer-events-none z-2" />

                {/* Subtle Fitment Tag */}
                {activeVehicle && (
                  <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 z-10">
                    {isFit ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/90 text-slate-950 text-[10px] font-black shadow-xs backdrop-blur-xs">
                        <CheckCircle className="w-3 h-3 text-slate-950" />
                        <span>{isArabic ? `يناسب ${activeVehicle.model}` : `Fits ${activeVehicle.model}`}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 text-[10px] font-black shadow-xs backdrop-blur-xs">
                        <AlertTriangle className="w-3 h-3 text-slate-950" />
                        <span>{isArabic ? 'تحقق من التوافق' : 'Check Fitment'}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="cursor-pointer" onClick={() => onSelectPart(part)}>
                  {/* Brand & Part Number */}
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-semibold text-slate-300">{part.brand}</span>
                    <span className="font-mono text-[11px] text-slate-400">{part.partNumber}</span>
                  </div>

                  {/* Part Title */}
                  <h3
                    className="font-bold text-white text-sm sm:text-base hover:text-indigo-400 transition-colors line-clamp-1 leading-snug"
                    title={isArabic && part.partNameArabic ? part.partNameArabic : part.partName}
                  >
                    {isArabic && part.partNameArabic ? part.partNameArabic : part.partName}
                  </h3>

                  {/* Price & Supplier */}
                  <div className="mt-3.5 flex items-baseline justify-between">
                    <div className="font-black text-white text-base sm:text-lg tracking-tight">
                      {formatPrice(lowestPriceUSD, lowestPriceIQD)}
                    </div>

                    {bestOffer && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSupplierIdForStore(bestOffer.supplierId);
                          setActiveModal('supplier_store');
                        }}
                        className="text-xs text-slate-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
                      >
                        <span className="truncate max-w-[110px]">{bestOffer.supplierName}</span>
                        <span className="text-amber-400 font-bold text-[11px] flex items-center gap-0.5">
                          ★ {bestOffer.supplierRating}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Single Dominant CTA */}
                <div className="mt-3 pt-3 border-t border-white/[0.07]">
                  {bestOffer && !isOutOfStock ? (
                    <button
                      id={`buy-btn-${part.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(part, bestOffer);
                      }}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'شراء الآن' : 'Buy Now'}</span>
                    </button>
                  ) : (
                    <button
                      id={`get-offers-btn-${part.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrefilledPartRequest({
                          partName: part.partName,
                          partNumberHint: part.partNumber,
                          partDescription: `Need price quotes for ${part.partName} (${part.partNumber}).`,
                          qualityPreference: 'genuine_or_oem',
                        });
                        setActiveModal('request_part');
                      }}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                    >
                      <Gavel className="w-3.5 h-3.5 text-slate-950" />
                      <span>{isArabic ? 'طلب عروض أسعار' : 'Get Offers'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

