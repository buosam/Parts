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
          // Compatibility first, then supplier trust, then availability
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-neutral-900 tracking-tight">
              {isArabic ? 'نتائج الكتالوج المركزي' : 'Master Parts Catalogue'}
            </h2>
            <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
              {filteredAndRankedParts.length} {isArabic ? 'قطعة مطابقة' : 'Parts'}
            </span>
          </div>
          {searchQuery && (
            <p className="text-xs text-neutral-500 mt-0.5">
              {isArabic ? 'البحث عن:' : 'Showing results for:'}{' '}
              <span className="font-semibold text-neutral-800">"{searchQuery}"</span>
            </p>
          )}
        </div>

        {/* Filter Pills & Sort Select */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          {/* Quality filter */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200/80">
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
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  qualityFilter === q.id
                    ? 'bg-white text-neutral-900 shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
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
            className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition-colors ${
              availabilityFilter === 'in_stock_today'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{isArabic ? 'متوفر اليوم' : 'In Stock Today'}</span>
          </button>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-xl px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              id="sort-parts-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-neutral-800 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="compatibility">
                {isArabic ? 'الأولوية: التوافق والتوثيق' : 'Rank: Compatibility & Trust'}
              </option>
              <option value="price_asc">
                {isArabic ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}
              </option>
              <option value="price_desc">
                {isArabic ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}
              </option>
              <option value="trust">
                {isArabic ? 'الأعلى تقييماً من العملاء' : 'Supplier Trust Score'}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Zero results state with Request Part opportunity */}
      {filteredAndRankedParts.length === 0 && (
        <div className="my-10 p-8 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-3xl border border-neutral-700 shadow-xl max-w-2xl mx-auto text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Gavel className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isArabic ? 'خدمة مزايدة قطع الغيار الحصرية' : 'Parts Sourcing & Dealer Bidding Floor'}</span>
          </div>
          <h3 className="font-black text-white text-xl">
            {isArabic ? 'القطعة غير متوفرة في الكتالوج المباشر؟' : `Couldn't Find "${searchQuery || 'This Part'}" in Stock?`}
          </h3>
          <p className="text-xs text-neutral-300 mt-2 mb-6 max-w-lg mx-auto leading-relaxed">
            {isArabic
              ? 'لا داعي للبحث في الأسواق! انشر طلبك الآن على المنصة لتتنافس أكثر من 120 متجراً ومورداً معتمداً في بغداد وأربيل والبصرة على تقديم أفضل عرض سعر وضمان لتوفير قطعتك.'
              : 'Don’t spend hours calling around. Post your request on our platform and let 120+ verified dealers and store owners compete by placing bids with their lowest price, warranty, and fast delivery.'}
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
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <Gavel className="w-4 h-4" />
              <span>{isArabic ? 'طلب القطعة ومزايدة المتاجر عليها' : 'Post Part Request for Dealer Bids'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid of Master Parts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
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
              className={`bg-white rounded-2xl border ${isOutOfStock ? 'border-amber-200/80' : 'border-neutral-200/90'} hover:border-neutral-300 hover:shadow-lg transition-all flex flex-col overflow-hidden group`}
            >
              {/* Card Image & Fitment Badge */}
              <div className="relative h-44 bg-neutral-100 overflow-hidden">
                <img
                  src={part.imageUrl}
                  alt={part.partName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Category & Stock Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="bg-neutral-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {part.category}
                  </span>
                  {isOutOfStock && (
                    <span className="bg-amber-600/95 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                      <Clock className="w-3 h-3" />
                      <span>{isArabic ? 'نفذت الكمية' : 'Out of Stock'}</span>
                    </span>
                  )}
                </div>

                {/* Fitment Status Badge */}
                {activeVehicle && (
                  <div className="absolute bottom-3 left-3 right-3">
                    {isFit ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white backdrop-blur-xs text-[11px] font-bold shadow-xs">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>
                          {isArabic ? 'مطابق لـ' : 'Guaranteed Fit:'} {activeVehicle.make} {activeVehicle.model} ({activeVehicle.year})
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800/80 text-neutral-300 backdrop-blur-xs text-[11px] font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isArabic ? 'تحقق من التوافق' : 'Check Fitment Compatibility'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Master Part Number & Brand */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                      {part.partNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-neutral-500">
                      {part.brand}
                    </span>
                  </div>

                  {/* Part Title */}
                  <h3
                    onClick={() => onSelectPart(part)}
                    className="font-bold text-neutral-900 text-sm hover:text-emerald-700 cursor-pointer line-clamp-2 mt-1 leading-snug"
                  >
                    {isArabic && part.partNameArabic ? part.partNameArabic : part.partName}
                  </h3>

                  {/* Quality Badges available for this master part */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {hasGenuine && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Genuine
                      </span>
                    )}
                    {hasOEM && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        OEM
                      </span>
                    )}
                    {hasAftermarket && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                        Aftermarket
                      </span>
                    )}
                  </div>

                  {/* Top Supplier Snapshot */}
                  {bestOffer && (
                    <div className="mt-3.5 p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 text-xs flex items-center justify-between">
                      <div>
                        <div
                          onClick={() => {
                            setSelectedSupplierIdForStore(bestOffer.supplierId);
                            setActiveModal('supplier_store');
                          }}
                          className="font-semibold text-neutral-800 hover:text-emerald-700 cursor-pointer flex items-center gap-1"
                        >
                          <Store className="w-3 h-3 text-neutral-400" />
                          <span className="truncate max-w-[150px]">{bestOffer.supplierName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-0.5">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-neutral-800">{bestOffer.supplierRating}</span>
                          <span>({bestOffer.verifiedInteractionsCount})</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-neutral-400 uppercase font-semibold">
                          {isArabic ? 'يبدأ من' : 'From'}
                        </div>
                        <div className="font-black text-neutral-900 text-sm">
                          ${lowestPriceUSD}
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          {lowestPriceIQD.toLocaleString()} IQD
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-3.5 mt-3 border-t border-neutral-100 flex items-center gap-2">
                  <button
                    id={`compare-offers-btn-${part.id}`}
                    onClick={() => onSelectPart(part)}
                    className={`flex-1 py-2 rounded-xl ${
                      isOutOfStock
                        ? 'bg-neutral-800 hover:bg-neutral-900 text-white'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                    } text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs`}
                  >
                    {isOutOfStock ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'تفاصيل النقص والتنبيه' : 'Details & Stock Alert'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isArabic ? 'مقارنة العروض' : 'Compare Offers'}</span>
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
                      className="p-2 rounded-xl border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 text-neutral-700 transition-colors"
                      title={isArabic ? 'إضافة العرض الموصى به إلى السلة' : 'Add top offer to Cart'}
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
                      className="px-3 py-2 rounded-xl border border-amber-400 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1 shadow-xs"
                      title={isArabic ? 'طلب مزايدة من أصحاب المتاجر' : 'Request Dealer Bids'}
                    >
                      <Gavel className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'مزايدة' : 'Bid Request'}</span>
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
