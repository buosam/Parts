/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Car,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Store,
  ArrowRight,
  ShoppingBag,
  Gavel,
  PlusCircle,
  Filter,
  Search,
  Zap,
  Layers,
  Disc,
  Activity,
  Wrench,
  Check,
  Star,
  ChevronRight,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { PartRequest, RequestOffer } from '../types';

export const RequestsBoard: React.FC = () => {
  const {
    partRequests,
    acceptRequestOffer,
    setActiveModal,
    setSelectedSupplierIdForStore,
    selectedRequestForBid,
    setSelectedRequestForBid,
    simulateDealerBid,
    selectedCategory,
    setSelectedCategory,
    activeVehicle,
    formatPrice,
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';

  const categories = [
    { id: 'All', name: 'All Parts', nameAr: 'جميع القطع', icon: Layers },
    { id: 'Brake', name: 'Brake & Rotors', nameAr: 'الفرامل والسفايف', icon: Disc },
    { id: 'Engine', name: 'Engine & Ignition', nameAr: 'المحرك والاشتعال', icon: Activity },
    { id: 'Suspension', name: 'Suspension & Shocks', nameAr: 'المساعدات والمقصات', icon: Wrench },
    { id: 'Filters', name: 'Oil & Air Filters', nameAr: 'الفلاتر والزيوت', icon: Filter },
    { id: 'Cooling', name: 'Cooling & Radiators', nameAr: 'التبريد والرديتر', icon: Zap },
  ];

  const getCategoryCount = (catId: string) => {
    if (catId === 'All') return partRequests.length;
    const catKeywords: Record<string, string[]> = {
      Brake: ['brake', 'pad', 'rotor', 'disc', 'caliper'],
      Engine: ['engine', 'plug', 'spark', 'ignition', 'belt', 'valve', 'piston', 'sensor', 'timing', 'motor'],
      Suspension: ['suspension', 'control arm', 'shock', 'strut', 'bushing', 'spring', 'link', 'steering', 'rack', 'epas'],
      Filters: ['filter', 'oil', 'air', 'cabin', 'cleaner'],
      Cooling: ['cool', 'radiator', 'water pump', 'thermostat', 'compressor', 'a/c', 'ac', 'climate'],
    };
    const keywords = catKeywords[catId] || [];
    return partRequests.filter((r) => {
      const textToSearch = `${r.partName} ${r.partDescription} ${r.partNumberHint || ''}`.toLowerCase();
      return keywords.some((k) => textToSearch.includes(k));
    }).length;
  };

  const [biddingPerspective, setBiddingPerspective] = useState<'buyer' | 'dealer'>('buyer');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    partRequests[0]?.id || null
  );
  const [makeFilter, setMakeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'accepted'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredRequests = partRequests.filter((r) => {
    if (selectedCategory && selectedCategory !== 'All' && selectedCategory !== 'requests') {
      const catKeywords: Record<string, string[]> = {
        Brake: ['brake', 'pad', 'rotor', 'disc', 'caliper'],
        Engine: ['engine', 'plug', 'spark', 'ignition', 'belt', 'valve', 'piston', 'sensor', 'timing', 'motor'],
        Suspension: ['suspension', 'control arm', 'shock', 'strut', 'bushing', 'spring', 'link', 'steering', 'rack', 'epas'],
        Filters: ['filter', 'oil', 'air', 'cabin', 'cleaner'],
        Cooling: ['cool', 'radiator', 'water pump', 'thermostat', 'compressor', 'a/c', 'ac', 'climate'],
      };
      const keywords = catKeywords[selectedCategory] || [];
      const textToSearch = `${r.partName} ${r.partDescription} ${r.partNumberHint || ''}`.toLowerCase();
      const matchesCategory = keywords.some((k) => textToSearch.includes(k));
      if (!matchesCategory) return false;
    }

    if (makeFilter !== 'All' && r.vehicle.make.toLowerCase() !== makeFilter.toLowerCase()) {
      return false;
    }
    if (statusFilter === 'open' && r.status === 'accepted') return false;
    if (statusFilter === 'accepted' && r.status !== 'accepted') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.partName.toLowerCase().includes(q);
      const matchVehicle = `${r.vehicle.make} ${r.vehicle.model}`.toLowerCase().includes(q);
      const matchHint = r.partNumberHint?.toLowerCase().includes(q);
      if (!matchName && !matchVehicle && !matchHint) return false;
    }
    return true;
  });

  useEffect(() => {
    if (filteredRequests.length > 0 && !filteredRequests.some((r) => r.id === selectedRequestId)) {
      setSelectedRequestId(filteredRequests[0].id);
    }
  }, [filteredRequests, selectedRequestId]);

  const selectedRequest = partRequests.find((r) => r.id === selectedRequestId);
  const totalBidsReceived = partRequests.reduce((sum, r) => sum + r.offers.length, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 bg-[#090d16] text-white px-4 py-3 rounded-2xl shadow-2xl border border-indigo-500/30 flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner - Clean & Premium */}
      <div className="bg-[#0e1424] rounded-3xl p-6 sm:p-8 text-white border border-white/10 mb-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {isArabic ? 'طلبات القطع وعروض الأسعار' : 'Part Requests & Verified Quotes'}
              </span>
              <span className="text-xs text-slate-400">
                {totalBidsReceived} {isArabic ? 'عرض مستلم' : 'Offers Received'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isArabic ? 'عروض الأسعار المباشرة من الوكلاء' : 'Live Quotes from Verified Dealers'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {isArabic
                ? 'قارن عروض الأسعار والضمان وسرعة التوصيل مباشرة من الوكلاء والمتاجر المعتمدة في العراق.'
                : 'Compare real-time prices, warranty, and fast delivery directly from authorized parts suppliers.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="board-new-part-request-cta"
              onClick={() => setActiveModal('request_part')}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer min-h-[48px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isArabic ? 'طلب تسعير قطعة جديدة' : 'Get Offers for a Part'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Perspective Toggle & Filter Bar */}
      <div className="bg-[#0e1424] rounded-2xl border border-white/10 p-3.5 mb-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Dual Perspective Toggle */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
            <button
              id="view-mode-buyer-btn"
              onClick={() => setBiddingPerspective('buyer')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px] ${
                biddingPerspective === 'buyer'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isArabic ? 'طلباتي ومقارنة العروض' : 'My Requests & Quotes'}</span>
            </button>

            <button
              id="view-mode-dealer-btn"
              onClick={() => setBiddingPerspective('dealer')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px] ${
                biddingPerspective === 'dealer'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{isArabic ? 'صالة تقديم العروض للمتاجر' : 'Dealer Quote Room'}</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 absolute start-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder={isArabic ? 'بحث باسم القطعة أو السيارة...' : 'Search part or vehicle...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-9 pe-3 py-2 bg-black/30 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden min-h-[44px]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-xs font-bold text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer min-h-[44px]"
            >
              <option value="all" className="bg-slate-900 text-white">{isArabic ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="open" className="bg-slate-900 text-white">{isArabic ? 'بانتظار العروض' : 'Awaiting Offers'}</option>
              <option value="accepted" className="bg-slate-900 text-white">{isArabic ? 'تم قبول العرض' : 'Offer Accepted'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Categories + Center Request Cards + Right Selected Offer Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#0e1424] rounded-2xl border border-white/10 p-4 shadow-md">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                {isArabic ? 'التصنيفات' : 'Categories'}
              </span>
              {selectedCategory !== 'All' && selectedCategory !== 'requests' && (
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Reset'}
                </button>
              )}
            </div>

            <div className="space-y-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                const count = getCategoryCount(cat.id);

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left rtl:text-right min-h-[44px] ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                      <span className="truncate">{isArabic ? cat.nameAr : cat.name}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/40 text-slate-400">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              {isArabic ? 'طلبات القطع' : 'Requests'} ({filteredRequests.length})
            </span>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="bg-[#0e1424] rounded-2xl border border-white/10 p-8 text-center text-slate-400 text-xs">
              {isArabic ? 'لا توجد طلبات تطابق الفلتر الحالي.' : 'No part requests match the current filters.'}
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isSelected = req.id === selectedRequestId;
              const hasOffers = req.offers.length > 0;
              const lowestPrice = hasOffers ? Math.min(...req.offers.map((o) => o.priceUSD)) : null;

              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestId(req.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-indigo-500 bg-[#121a30] shadow-lg ring-1 ring-indigo-500/50'
                      : 'border-white/10 bg-[#0e1424] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-black/40 px-2 py-0.5 rounded-md">
                      #{req.requestNumber}
                    </span>

                    {req.status === 'accepted' ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>{isArabic ? 'تم قبول العرض' : 'Accepted'}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{isArabic ? 'جاري استقبال العروض' : `${req.offers.length} Offers`}</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-white line-clamp-1">
                    {req.partName}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <Car className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      {req.vehicle.make} {req.vehicle.model} ({req.vehicle.year})
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-xs">
                    <span className="text-slate-400">
                      {req.offers.length} {isArabic ? 'عروض مستلمة' : 'offers received'}
                    </span>
                    {lowestPrice !== null ? (
                      <span className="font-extrabold text-emerald-400 text-sm">
                        {formatPrice(lowestPrice)}
                      </span>
                    ) : (
                      <span className="text-amber-300 text-[11px] font-medium">
                        {isArabic ? 'بانتظار العروض' : 'Awaiting offers'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Request & Offers Detail Comparison */}
        <div className="lg:col-span-5">
          {selectedRequest ? (
            <div className="bg-[#0e1424] rounded-3xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-6">
              {/* Request Info Card */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                    #{selectedRequest.requestNumber}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{selectedRequest.city || 'Erbil'}</span>
                  </span>
                </div>

                <h3 className="text-xl font-black text-white tracking-tight">
                  {selectedRequest.partName}
                </h3>

                <div className="p-3.5 bg-black/30 rounded-2xl border border-white/5 mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">{isArabic ? 'المركبة:' : 'Vehicle:'}</span>
                    <span className="font-bold text-white">
                      {selectedRequest.vehicle.make} {selectedRequest.vehicle.model} ({selectedRequest.vehicle.year})
                    </span>
                  </div>
                  {selectedRequest.partNumberHint && (
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">{isArabic ? 'رقم القطعة (OEM):' : 'Part Number:'}</span>
                      <span className="font-mono font-bold text-indigo-300">
                        {selectedRequest.partNumberHint}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">{isArabic ? 'الجودة المطلوبة:' : 'Quality:'}</span>
                    <span className="font-semibold text-slate-200 capitalize">
                      {selectedRequest.qualityPreference || 'Genuine OEM'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dealer Perspective Action */}
              {biddingPerspective === 'dealer' && selectedRequest.status !== 'accepted' && (
                <div className="pt-2 border-t border-white/10">
                  <button
                    id="submit-dealer-bid-btn"
                    onClick={() => setSelectedRequestForBid(selectedRequest)}
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
                  >
                    <Gavel className="w-4 h-4 text-slate-950" />
                    <span>{isArabic ? 'تقديم عرض سعر كوكيل معتمد' : 'Submit Dealer Offer'}</span>
                  </button>
                </div>
              )}

              {/* Offers Comparison Cards (Mobile-friendly Stacked) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{isArabic ? 'العروض المستلمة' : 'Received Offers'} ({selectedRequest.offers.length})</span>
                  </h4>
                  <button
                    onClick={() => {
                      simulateDealerBid(selectedRequest.id);
                      showToast(isArabic ? 'تم استلام عرض منافس جديد!' : 'New competitive dealer offer received!');
                    }}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isArabic ? 'محاكاة عرض' : 'Simulate Bid'}</span>
                  </button>
                </div>

                {selectedRequest.offers.length === 0 ? (
                  <div className="p-8 text-center bg-black/20 rounded-2xl border border-white/5 space-y-2">
                    <Clock className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
                    <p className="text-xs text-white font-bold">
                      {isArabic ? 'جاري البحث عن عروض من الوكلاء المعتمدين...' : 'Finding matching parts from verified dealers...'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {isArabic ? 'ستصلك عروض الأسعار قريباً مع الضمان والتوصيل' : 'You will receive quotes with warranty & delivery details soon'}
                    </p>
                  </div>
                ) : (
                  selectedRequest.offers.map((offer) => {
                    const isLowest =
                      offer.priceUSD === Math.min(...selectedRequest.offers.map((o) => o.priceUSD));
                    const isOfferAccepted = offer.status === 'accepted' || selectedRequest.status === 'accepted';

                    return (
                      <div
                        key={offer.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isOfferAccepted
                            ? 'bg-emerald-500/10 border-emerald-500/40 shadow-md'
                            : isLowest
                            ? 'bg-indigo-500/[0.08] border-indigo-500/30'
                            : 'bg-black/30 border-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                onClick={() => {
                                  setSelectedSupplierIdForStore(offer.supplierId);
                                  setActiveModal('supplier_store');
                                }}
                                className="font-extrabold text-white text-sm hover:text-indigo-400 cursor-pointer flex items-center gap-1.5"
                              >
                                <Store className="w-3.5 h-3.5 text-indigo-400" />
                                <span>{offer.supplierName}</span>
                              </span>
                              {isLowest && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                                  BEST PRICE
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="font-bold text-slate-200">{offer.supplierRating || 4.9}</span>
                              </div>
                              <span>•</span>
                              <span className="text-slate-300">{offer.warranty || '12-Month Warranty'}</span>
                            </div>
                          </div>

                          <div className="text-right rtl:text-left">
                            <div className="text-base font-black text-emerald-400">
                              {formatPrice(offer.priceUSD, offer.priceIQD)}
                            </div>
                            <span className="text-[11px] text-slate-400">{offer.deliveryTime || 'Delivery tomorrow'}</span>
                          </div>
                        </div>

                        {offer.notes && (
                          <p className="text-[11px] text-slate-300 mt-2 p-2.5 bg-black/40 rounded-xl border border-white/5">
                            {offer.notes}
                          </p>
                        )}

                        <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">
                            {offer.brand} • <span className="capitalize">{offer.quality}</span>
                          </span>

                          {selectedRequest.status === 'accepted' ? (
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>{isArabic ? 'العرض المقبول' : 'Accepted Offer'}</span>
                            </span>
                          ) : (
                            <button
                              id={`accept-offer-btn-${offer.id}`}
                              onClick={() => {
                                const created = acceptRequestOffer(selectedRequest.id, offer.id);
                                if (created) {
                                  showToast(isArabic ? 'تم قبول العرض وإضافته للسلة!' : 'Offer accepted and added to cart!');
                                  setActiveModal('cart');
                                }
                              }}
                              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer min-h-[40px]"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>{isArabic ? 'قبول العرض والشراء' : 'Accept Offer'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#0e1424] rounded-3xl border border-white/10 p-12 text-center text-slate-400 text-xs">
              {isArabic ? 'اختر طلباً من القائمة لعرض العروض المقدمة.' : 'Select a part request to view offers.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
