/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket - Restrained Product Discovery & Cards (Sections 8 & 9)
 */

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Star,
  Truck,
  ArrowUpDown,
  ShoppingBag,
  Eye,
  Store,
  Clock,
  Gavel,
  Check,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Wrench,
  Search,
  RotateCcw,
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
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
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
  const [sortBy, setSortBy] = useState<'compatibility' | 'price_asc' | 'price_desc' | 'trust'>('compatibility');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  // Filter and prioritize parts
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

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') {
          const minA = a.offers.length > 0 ? Math.min(...a.offers.map((o) => o.priceUSD)) : Infinity;
          const minB = b.offers.length > 0 ? Math.min(...b.offers.map((o) => o.priceUSD)) : Infinity;
          return minA - minB;
        }
        if (sortBy === 'price_desc') {
          const maxA = a.offers.length > 0 ? Math.max(...a.offers.map((o) => o.priceUSD)) : 0;
          const maxB = b.offers.length > 0 ? Math.max(...b.offers.map((o) => o.priceUSD)) : 0;
          return maxB - maxA;
        }
        if (sortBy === 'trust') {
          const ratingA = Math.max(...a.offers.map((o) => o.supplierRating || 0), 0);
          const ratingB = Math.max(...b.offers.map((o) => o.supplierRating || 0), 0);
          return ratingB - ratingA;
        }

        // Default 'compatibility': prioritizes active vehicle fitment and genuine stock
        if (activeVehicle) {
          const fitA = a.compatibleVehicles.some(
            (v) =>
              v.make.toLowerCase() === activeVehicle.make.toLowerCase() &&
              v.model.toLowerCase() === activeVehicle.model.toLowerCase()
          );
          const fitB = b.compatibleVehicles.some(
            (v) =>
              v.make.toLowerCase() === activeVehicle.make.toLowerCase() &&
              v.model.toLowerCase() === activeVehicle.model.toLowerCase()
          );
          if (fitA && !fitB) return -1;
          if (!fitA && fitB) return 1;
        }
        return 0;
      });
  }, [masterParts, searchQuery, selectedCategory, activeVehicle, onlyFitsMyCar, selectedBrand, qualityFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Search Header & Filter Controls Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="text-xs text-slate-400 font-medium">
          <span className="font-bold text-white">{filteredAndRankedParts.length}</span>{' '}
          <span>{isArabic ? 'قطعة متوفرة' : 'parts available'}</span>
          {searchQuery && (
            <span>
              {' '}• {isArabic ? 'للبحث:' : 'for'}{' '}
              <strong className="text-white">"{searchQuery}"</strong>
            </span>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs">
          {/* Fitment Toggle */}
          {activeVehicle && (
            <button
              type="button"
              onClick={() => setOnlyFitsMyCar(!onlyFitsMyCar)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer micro-press ${
                onlyFitsMyCar
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {isArabic ? `يناسب ${activeVehicle.model} فقط` : `Fits ${activeVehicle.model} Only`}
              </span>
            </button>
          )}

          {/* Quality Filter */}
          <select
            value={qualityFilter}
            onChange={(e) => setQualityFilter(e.target.value as any)}
            className="bg-[#0e1424] border border-white/10 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="all">{isArabic ? 'جميع الجودات' : 'All Quality'}</option>
            <option value="genuine">{isArabic ? 'أصلي (OEM)' : 'Genuine OEM'}</option>
            <option value="oem">{isArabic ? 'مواصفة وكالة' : 'OEM Spec'}</option>
            <option value="aftermarket">{isArabic ? 'تجاري معتمد' : 'Aftermarket'}</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#0e1424] border border-white/10 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="compatibility">{isArabic ? 'الأكثر توافقاً' : 'Best Match'}</option>
            <option value="price_asc">{isArabic ? 'الأقل سعراً' : 'Price: Low to High'}</option>
            <option value="price_desc">{isArabic ? 'الأعلى سعراً' : 'Price: High to Low'}</option>
            <option value="trust">{isArabic ? 'أعلى تقييم' : 'Highest Rating'}</option>
          </select>

          {/* Reset Filters */}
          {(selectedCategory !== 'All' || searchQuery || qualityFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setQualityFilter('all');
                setSelectedBrand('all');
              }}
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isArabic ? 'إعادة ضبط' : 'Reset'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Zero Results State with Reverse RFQ Opportunity (Section 28) */}
      {filteredAndRankedParts.length === 0 && (
        <div className="my-12 p-8 sm:p-12 surface-card rounded-3xl text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <Gavel className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {isArabic ? 'لم يتم العثور على قطع مطابقة' : 'No matching parts found'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              {isArabic
                ? 'لا تقلق! يمكنك طلب هذه القطعة الآن وسيقوم أكثر من 120 وكيلاً معتمداً في العراق بتقديم عروض أسعار منافسة.'
                : 'Don\'t worry! Post a part request and let 120+ verified dealers across Iraq compete with their best stock and pricing.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setPrefilledPartRequest({
                  partName: searchQuery || (activeVehicle ? `${activeVehicle.make} ${activeVehicle.model} Part` : 'Spare Part'),
                  partDescription: `Requesting quote for ${searchQuery}.`,
                });
                setActiveModal('request_part');
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#335aff] hover:bg-[#2647e6] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md micro-press"
            >
              <Gavel className="w-4 h-4" />
              <span>{isArabic ? 'طلب عروض أسعار من الوكلاء' : 'Request Quotes from Dealers'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setOnlyFitsMyCar(false);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 font-semibold text-xs border border-white/10 cursor-pointer transition-colors"
            >
              {isArabic ? 'عرض كل القطع' : 'View All Parts'}
            </button>
          </div>
        </div>
      )}

      {/* Clean Restrained Product Cards Grid (Section 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5 mt-6">
        {filteredAndRankedParts.map((part) => {
          const isFit = activeVehicle
            ? part.compatibleVehicles.some(
                (v) =>
                  v.make.toLowerCase() === activeVehicle.make.toLowerCase() &&
                  v.model.toLowerCase() === activeVehicle.model.toLowerCase() &&
                  activeVehicle.year >= v.yearStart &&
                  activeVehicle.year <= v.yearEnd
              )
            : null;

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
              onClick={() => onSelectPart(part)}
              className="surface-card-interactive rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer group"
            >
              {/* Card Image with Restrained Compatibility Overlay */}
              <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                <img
                  src={part.imageUrl}
                  alt={part.partName}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />

                {/* Subtle gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1424] via-transparent to-transparent opacity-80 pointer-events-none" />

                {/* Compatibility Badge (Section 7 & 9) */}
                <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 z-10">
                  {isFit === true && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/90 text-slate-950 text-[10px] font-black shadow-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isArabic ? `مطابق لـ ${activeVehicle?.model}` : `Fits ${activeVehicle?.model}`}</span>
                    </span>
                  )}
                  {isFit === false && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-slate-950 text-[10px] font-black shadow-xs">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{isArabic ? 'تحقق من التوافق' : 'Check Fitment'}</span>
                    </span>
                  )}
                </div>

                {/* Quality Tier Chip */}
                {bestOffer && (
                  <div className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 z-10">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-slate-200 border border-white/10">
                      {bestOffer.quality === 'genuine' ? 'OEM Genuine' : bestOffer.quality === 'oem' ? 'OEM Spec' : 'Aftermarket'}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body - Extreme Restraint */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Brand & Part Number */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-300">{part.brand}</span>
                    <span className="font-mono text-slate-500">{part.partNumber}</span>
                  </div>

                  {/* Part Title */}
                  <h3
                    className="font-bold text-white text-sm sm:text-base leading-snug group-hover:text-[#335aff] transition-colors line-clamp-1"
                    title={isArabic && part.partNameArabic ? part.partNameArabic : part.partName}
                  >
                    {isArabic && part.partNameArabic ? part.partNameArabic : part.partName}
                  </h3>

                  {/* Availability Status */}
                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    {!isOutOfStock ? (
                      <span className="text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{isArabic ? 'متوفر بالمخزن (شحن فوري)' : 'In Stock • Ships Today'}</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium text-[11px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>{isArabic ? 'حسب الطلب (عروض أسعار)' : 'On Demand • Get Quotes'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Price & Single Dominant CTA */}
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <div className="text-base font-black text-white tracking-tight">
                    {formatPrice(lowestPriceUSD, lowestPriceIQD)}
                  </div>

                  {bestOffer && !isOutOfStock ? (
                    <button
                      type="button"
                      id={`buy-btn-${part.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(part, bestOffer);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-[#335aff] hover:text-white text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer micro-press border border-white/10 hover:border-transparent"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'شراء' : 'Order'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
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
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer micro-press border border-amber-500/25"
                    >
                      <Gavel className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'طلب عروض' : 'Get Offers'}</span>
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
