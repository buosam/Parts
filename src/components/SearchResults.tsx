/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Star,
  ShieldCheck,
  Truck,
  ArrowUpDown,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  Store,
  Bell,
  Mail,
  Clock,
  Gavel,
  Sparkles,
  MapPin,
  Check,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { MasterPart, SupplierOffer } from '../types';

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

  const [qualityFilter, setQualityFilter] = useState<'all' | 'genuine' | 'oem' | 'aftermarket'>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'in_stock_today'>('all');
  const [sortBy, setSortBy] = useState<'compatibility' | 'price_asc' | 'price_desc' | 'trust'>('compatibility');

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
        // Check fitment match against activeVehicle
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
        if (sortBy === 'price_asc') {
          return lowestPriceA - lowestPriceB;
        }
        if (sortBy === 'price_desc') {
          return lowestPriceB - lowestPriceA;
        }
        if (sortBy === 'trust') {
          return maxTrustB - maxTrustA;
        }
        return 0;
      });
  }, [masterParts, selectedCategory, searchQuery, qualityFilter, availabilityFilter, sortBy, activeVehicle]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Control / Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isArabic ? 'الكتالوج المركزي وقطع الوكلاء' : 'Live Genuine Parts & Dealer Inventory'}
            </h2>
            <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
              {filteredAndRankedParts.length} {isArabic ? 'قطعة مطابقة' : 'Parts'}
            </span>
          </div>
          {searchQuery && (
            <p className="text-xs text-slate-400 mt-1">
              {isArabic ? 'البحث عن:' : 'Showing verified matches for:'}{' '}
              <span className="font-semibold text-indigo-300">"{searchQuery}"</span>
            </p>
          )}
        </div>

        {/* Filter Pills & Sort Select */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          {/* Quality filter */}
          <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/10">
            {[
              { id: 'all', label: 'All Quality', labelAr: 'الكل' },
              { id: 'genuine', label: 'Genuine Only', labelAr: 'أصلي فقط' },
              { id: 'oem', label: 'OEM Only', labelAr: 'وكالة OEM' },
              { id: 'aftermarket', label: 'Aftermarket', labelAr: 'تجاري معتمد' },
            ].map((q) => (
              <button
                key={q.id}
                id={`filter-quality-${q.id}`}
                onClick={() => setQualityFilter(q.id as any)}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  qualityFilter === q.id
                    ? 'bg-indigo-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {isArabic ? q.labelAr : q.label}
              </button>
            ))}
          </div>

          {/* Quick in-stock filter */}
          <button
            id="filter-in-stock-btn"
            onClick={() => setAvailabilityFilter(availabilityFilter === 'all' ? 'in_stock_today' : 'all')}
            className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              availabilityFilter === 'in_stock_today'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm'
                : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isArabic ? 'متوفر اليوم فوراً' : 'In Stock Today'}</span>
          </button>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
            <select
              id="sort-parts-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="compatibility" className="bg-slate-900 text-white">
                {isArabic ? 'الأولوية: التوافق والتوثيق' : 'Rank: Fitment & Trust'}
              </option>
              <option value="price_asc" className="bg-slate-900 text-white">
                {isArabic ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}
              </option>
              <option value="price_desc" className="bg-slate-900 text-white">
                {isArabic ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}
              </option>
              <option value="trust" className="bg-slate-900 text-white">
                {isArabic ? 'الأعلى تقييماً من العملاء' : 'Supplier Trust Score'}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Zero results state with Request Part opportunity */}
      {filteredAndRankedParts.length === 0 && (
        <div className="my-10 p-8 sm:p-12 glass-panel text-white rounded-3xl border border-white/10 shadow-2xl max-w-2xl mx-auto text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/10">
            <Gavel className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isArabic ? 'خدمة مناقصة ومزايدة قطع الغيار' : 'Reverse RFQ Dealer Bidding Floor'}</span>
          </div>
          <h3 className="font-extrabold text-white text-xl sm:text-2xl tracking-tight">
            {isArabic ? 'القطعة غير متوفرة في الكتالوج المباشر؟' : `Couldn't Find "${searchQuery || 'This Part'}" in Stock?`}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 mb-6 max-w-lg mx-auto leading-relaxed">
            {isArabic
              ? 'انشر طلبك الآن على منصة المناقصات ليتنافس أكثر من 120 وكيلاً ومتجراً معتمداً في بغداد وأربيل والبصرة بتقديم أفضل الأسعار والضمانات.'
              : 'Post your request on our reverse RFQ floor and let 120+ verified auto parts dealers across Iraq compete with their best prices and instant delivery.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="zero-results-request-bidding-btn"
              onClick={() => {
                setPrefilledPartRequest({
                  partName: searchQuery || (activeVehicle ? `${activeVehicle.make} ${activeVehicle.model} Replacement Part` : 'Automotive Spare Part'),
                  partDescription: `Searched in live catalogue for "${searchQuery}". Need verified store owners to bid on supplying this item.`,
                });
                setActiveModal('request_part');
              }}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
            >
              <Gavel className="w-4 h-4" />
              <span>{isArabic ? 'نشر طلب قطعة لمزايدة الوكلاء' : 'Post Part Request for Dealer Bids'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid of Master Parts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredAndRankedParts.map((part) => {
          // Check fitment with activeVehicle
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
          const hasGenuine = part.offers.some((o) => o.quality === 'genuine');
          const hasOEM = part.offers.some((o) => o.quality === 'oem');
          const hasAftermarket = part.offers.some((o) => o.quality === 'aftermarket');

          const bestOffer =
            part.offers.find((o) => o.quality === 'genuine' && o.stockQuantity > 0) ||
            inStockOffers[0] ||
            part.offers[0];

          return (
            <div
              key={part.id}
              id={`master-part-card-${part.id}`}
              className={`glass-panel rounded-2xl border ${
                isOutOfStock ? 'border-amber-500/30' : 'border-white/10'
              } hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all flex flex-col overflow-hidden group`}
            >
              {/* Card Image & Fitment Badge */}
              <div className="relative h-48 bg-slate-900/80 overflow-hidden">
                <img
                  src={part.imageUrl}
                  alt={part.partName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Ambient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-black/30 pointer-events-none" />

                {/* Category & Stock Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                  <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/10">
                    {part.category}
                  </span>
                  {isOutOfStock && (
                    <span className="bg-amber-500/90 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                      <Clock className="w-3 h-3" />
                      <span>{isArabic ? 'غير متوفر فوراً' : 'Out of Stock'}</span>
                    </span>
                  )}
                </div>

                {/* Fitment Status Badge */}
                {activeVehicle && (
                  <div className="absolute bottom-3 left-3 right-3 z-10">
                    {isFit ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/90 text-slate-950 backdrop-blur-md text-[11px] font-extrabold shadow-md">
                        <CheckCircle className="w-3.5 h-3.5 text-slate-950" />
                        <span>
                          {isArabic ? 'توافق مضمون لـ' : 'Guaranteed Fit:'} {activeVehicle.make} {activeVehicle.model} ({activeVehicle.year})
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-300 border border-white/10 backdrop-blur-md text-[11px] font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isArabic ? 'تحقق من التوافق' : 'Check Fitment Compatibility'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Master Part Number & Brand */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                      {part.partNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {part.brand}
                    </span>
                  </div>

                  {/* Part Title */}
                  <h3
                    onClick={() => onSelectPart(part)}
                    className="font-bold text-white text-base hover:text-indigo-300 cursor-pointer line-clamp-2 mt-1 leading-snug transition-colors"
                  >
                    {isArabic && part.partNameArabic ? part.partNameArabic : part.partName}
                  </h3>

                  {/* Quality Badges available for this master part */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {hasGenuine && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        Genuine
                      </span>
                    )}
                    {hasOEM && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        OEM
                      </span>
                    )}
                    {hasAftermarket && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-white/10">
                        Aftermarket
                      </span>
                    )}
                  </div>

                  {/* Top Supplier Snapshot */}
                  {bestOffer && (
                    <div className="mt-4 p-3 bg-white/[0.03] rounded-xl border border-white/5 text-xs flex items-center justify-between">
                      <div>
                        <div
                          onClick={() => {
                            setSelectedSupplierIdForStore(bestOffer.supplierId);
                            setActiveModal('supplier_store');
                          }}
                          className="font-bold text-slate-200 hover:text-indigo-400 cursor-pointer flex items-center gap-1.5 transition-colors"
                        >
                          <Store className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="truncate max-w-[140px]">{bestOffer.supplierName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="font-bold text-slate-200">{bestOffer.supplierRating}</span>
                          <span>({bestOffer.verifiedInteractionsCount})</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          {isArabic ? 'يبدأ من' : 'From'}
                        </div>
                        <div className="font-black text-emerald-400 text-base">
                          {formatPrice(lowestPriceUSD, lowestPriceIQD)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 mt-4 border-t border-white/10 flex items-center gap-2">
                  <button
                    id={`compare-offers-btn-${part.id}`}
                    onClick={() => onSelectPart(part)}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    {isOutOfStock ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'تفاصيل النقص والتنبيه' : 'Details & Stock Alert'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isArabic ? 'مقارنة عروض الوكلاء' : 'Compare Offers'}</span>
                        <span className="w-4 h-4 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center">
                          {part.offers.length}
                        </span>
                      </>
                    )}
                  </button>

                  {bestOffer && !isOutOfStock ? (
                    <button
                      id={`quick-cart-btn-${part.id}`}
                      onClick={() => addToCart(part, bestOffer)}
                      className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 hover:text-white transition-colors cursor-pointer"
                      title={isArabic ? 'إضافة العرض الأفضل إلى السلة' : 'Add Best Offer to Cart'}
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      id={`quick-bid-request-btn-${part.id}`}
                      onClick={() => {
                        setPrefilledPartRequest({
                          partName: part.partName,
                          partNumberHint: part.partNumber,
                          partDescription: `Requesting dealer bids for ${part.partName} (${part.partNumber}). Current catalog stock is depleted, please submit quote.`,
                          qualityPreference: 'genuine_or_oem',
                        });
                        setActiveModal('request_part');
                      }}
                      className="px-3 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                      title={isArabic ? 'طلب مزايدة وتوفير القطعة' : 'Request Dealer Bids'}
                    >
                      <Gavel className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isArabic ? 'مزايدة' : 'Bid'}</span>
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
