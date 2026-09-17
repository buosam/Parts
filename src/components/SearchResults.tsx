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

        {/* Primary Filters (Progressive Disclosure) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Fits My Car Toggle */}
          {activeVehicle && (
            <button
              id="filter-fits-car-btn"
              onClick={() => setOnlyFitsMyCar(!onlyFitsMyCar)}
              className={`px-3 py-2 rounded-xl border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                onlyFitsMyCar
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10'
                  : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle className={`w-3.5 h-3.5 ${onlyFitsMyCar ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{isArabic ? `يناسب ${activeVehicle.make}` : `Fits ${activeVehicle.make}`}</span>
            </button>
          )}

          {/* Quality Quick Filter */}
          <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setQualityFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                qualityFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isArabic ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setQualityFilter(qualityFilter === 'genuine' ? 'all' : 'genuine')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                qualityFilter === 'genuine'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isArabic ? 'أصلي Genuine' : 'Genuine OEM'}
            </button>
          </div>

          {/* In Stock Today */}
          <button
            id="filter-in-stock-btn"
            onClick={() => setAvailabilityFilter(availabilityFilter === 'all' ? 'in_stock_today' : 'all')}
            className={`px-3 py-2 rounded-xl border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              availabilityFilter === 'in_stock_today'
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            <span>{isArabic ? 'متوفر اليوم' : 'In Stock'}</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-xl px-2.5 py-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
            <select
              id="sort-parts-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-hidden cursor-pointer"
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
            className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              showAdvancedFilters || selectedBrand !== 'all'
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isArabic ? 'تصفية إضافية' : 'More Filters'}</span>
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
              {/* Card Image & Fitment Status */}
              <div className="relative h-44 bg-slate-950/70 overflow-hidden cursor-pointer" onClick={() => onSelectPart(part)}>
                <img
                  src={part.imageUrl}
                  alt={part.partName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1424] via-transparent to-black/20 pointer-events-none" />

                {/* Top badges */}
                <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 flex items-center gap-1.5 z-10">
                  <span className="bg-black/75 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10">
                    {part.category}
                  </span>
                  {part.offers.some((o) => o.quality === 'genuine') && (
                    <span className="bg-emerald-500/90 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                      Genuine
                    </span>
                  )}
                </div>

                {/* Fitment Banner */}
                {activeVehicle && (
                  <div className="absolute bottom-2 left-2 right-2 z-10">
                    {isFit ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/90 text-slate-950 text-[11px] font-extrabold shadow-md backdrop-blur-md">
                        <CheckCircle className="w-3.5 h-3.5 text-slate-950" />
                        <span>{isArabic ? 'توافق مضمون لسيارتك' : `Fits ${activeVehicle.make} ${activeVehicle.model}`}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-900/90 text-slate-300 border border-white/10 text-[10px] font-medium">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>{isArabic ? 'تحقق من التوافق' : 'Check Fitment'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Brand & OEM */}
                  <div className="flex items-center justify-between gap-2 text-xs mb-1">
                    <span className="font-bold text-slate-300">{part.brand}</span>
                    <span className="font-mono text-[11px] text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                      {part.partNumber}
                    </span>
                  </div>

                  {/* Part Title */}
                  <h3
                    onClick={() => onSelectPart(part)}
                    className="font-bold text-white text-sm sm:text-base hover:text-indigo-300 cursor-pointer line-clamp-2 leading-snug transition-colors"
                  >
                    {isArabic && part.partNameArabic ? part.partNameArabic : part.partName}
                  </h3>

                  {/* Price & Dealer Info */}
                  <div className="mt-3 p-2.5 bg-white/[0.02] rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        {isArabic ? 'السعر' : 'Price'}
                      </div>
                      <div className="font-black text-white text-base">
                        {formatPrice(lowestPriceUSD, lowestPriceIQD)}
                      </div>
                    </div>

                    {bestOffer && (
                      <div className="text-right rtl:text-left text-xs">
                        <div
                          onClick={() => {
                            setSelectedSupplierIdForStore(bestOffer.supplierId);
                            setActiveModal('supplier_store');
                          }}
                          className="font-semibold text-slate-300 hover:text-indigo-300 cursor-pointer flex items-center justify-end rtl:justify-start gap-1 transition-colors"
                        >
                          <Store className="w-3 h-3 text-indigo-400" />
                          <span className="truncate max-w-[110px]">{bestOffer.supplierName}</span>
                        </div>
                        <div className="flex items-center justify-end rtl:justify-start gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="font-bold text-slate-200">{bestOffer.supplierRating}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Single Dominant CTA */}
                <div className="pt-3 mt-3 border-t border-white/10 flex items-center gap-2">
                  {bestOffer && !isOutOfStock ? (
                    <button
                      id={`buy-btn-${part.id}`}
                      onClick={() => addToCart(part, bestOffer)}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'شراء / إضافة للسلة' : 'Buy Now'}</span>
                    </button>
                  ) : (
                    <button
                      id={`get-offers-btn-${part.id}`}
                      onClick={() => {
                        setPrefilledPartRequest({
                          partName: part.partName,
                          partNumberHint: part.partNumber,
                          partDescription: `Need price quotes for ${part.partName} (${part.partNumber}).`,
                          qualityPreference: 'genuine_or_oem',
                        });
                        setActiveModal('request_part');
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Gavel className="w-3.5 h-3.5 text-slate-950" />
                      <span>{isArabic ? 'طلب عروض أسعار' : 'Get Offers'}</span>
                    </button>
                  )}

                  <button
                    id={`view-details-btn-${part.id}`}
                    onClick={() => onSelectPart(part)}
                    className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title={isArabic ? 'عرض التفاصيل الكاملة' : 'View Details'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

