/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Car,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Truck,
  ShieldCheck,
  Store,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  Gavel,
  DollarSign,
  TrendingDown,
  Users,
  PlusCircle,
  Filter,
  Search,
  MessageSquare,
  Zap,
  Layers,
  Disc,
  Activity,
  Wrench,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { PartRequest, RequestOffer } from '../types';
import { SubmitPartBidModal } from './SubmitPartBidModal';

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
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';

  const categories = [
    { id: 'All', name: 'All Parts', nameAr: 'جميع القطع', icon: Layers },
    { id: 'Brake', name: 'Brake & Rotors', nameAr: 'الفرامل والسفايف', icon: Disc },
    { id: 'Engine', name: 'Engine & Ignition', nameAr: 'المحرك والاشتعال', icon: Activity },
    { id: 'Suspension', name: 'Suspension & Shocks', nameAr: 'المساعدات والمقصات', icon: Wrench },
    { id: 'Filters', name: 'Oil & Air Filters', nameAr: 'الفلاتر والزيوت', icon: Filter },
    { id: 'Cooling', name: 'Cooling & Radiators', nameAr: 'التبريد ومضخات الماء', icon: Zap },
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

  // Perspectives: "buyer" (Customer managing their requests & incoming bids) vs "dealer" (Store owners bidding on requests)
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

  // Filter requests
  const filteredRequests = partRequests.filter((r) => {
    if (selectedCategory && selectedCategory !== 'All') {
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
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-neutral-700 flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Board Hero / Header */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-neutral-800 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  {isArabic ? 'مزادات وطلبات القطع الحية' : 'Live Parts Reverse Auctions'}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {totalBidsReceived} {isArabic ? 'عرض متجر مسجل' : 'Store Bids Recorded'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isArabic
                  ? 'منصة طلب ومناقصة قطع الغيار'
                  : 'Parts Bidding & Reverse Auctions Floor'}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                {isArabic
                  ? 'عندما تبحث عن قطعة وتكون غير متوفرة في المتاجر، اطلبها فوراً عبر المنصة لتتنافس ورش ومحلات قطع الغيار المعتمدة في بغداد وأربيل والبصرة على تقديم أفضل الأسعار والضمان وسرعة التوصيل.'
                  : 'When a part is unavailable in regular stock, request it here. Over 120+ verified auto parts store owners and dealers across Baghdad, Erbil & Basra bid directly to fulfill your order at the lowest price.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="board-new-part-request-cta"
                onClick={() => setActiveModal('request_part')}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isArabic ? 'طلب قطعة غير متوفرة للمزايدة' : 'Request Out-of-Stock Part'}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div className="bg-neutral-800/60 backdrop-blur-xs rounded-2xl p-3.5 border border-neutral-700/60">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                {isArabic ? 'الطلبات المفتوحة للمزايدة' : 'Active Part RFQs'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-black text-white">{partRequests.length}</span>
                <span className="text-[10px] font-bold text-amber-400">Open for bids</span>
              </div>
            </div>

            <div className="bg-neutral-800/60 backdrop-blur-xs rounded-2xl p-3.5 border border-neutral-700/60">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                {isArabic ? 'عروض المتاجر المستلمة' : 'Store Dealer Quotes'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-black text-white">{totalBidsReceived}</span>
                <span className="text-[10px] font-bold text-emerald-400">+4 Today</span>
              </div>
            </div>

            <div className="bg-neutral-800/60 backdrop-blur-xs rounded-2xl p-3.5 border border-neutral-700/60">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                {isArabic ? 'متوسط التوفير بالأسعار' : 'Avg. Price Savings'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-black text-emerald-400">28.4%</span>
                <span className="text-[10px] font-bold text-neutral-400">vs Retail MSRP</span>
              </div>
            </div>

            <div className="bg-neutral-800/60 backdrop-blur-xs rounded-2xl p-3.5 border border-neutral-700/60">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                {isArabic ? 'حماية المشتري المعتمدة' : 'Escrow Protection'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-black text-white">100%</span>
                <span className="text-[10px] font-bold text-blue-400">Inspected & Sealed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Perspective Toggle & Filters Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Dual Perspective Buttons */}
          <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl border border-neutral-200/80">
            <button
              id="view-mode-buyer-btn"
              onClick={() => setBiddingPerspective('buyer')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                biddingPerspective === 'buyer'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-neutral-700" />
              <span>{isArabic ? 'منظور المشتري (طلباتي وعروض الأسعار)' : 'Buyer View: My Requests & Incoming Bids'}</span>
            </button>

            <button
              id="view-mode-dealer-btn"
              onClick={() => setBiddingPerspective('dealer')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                biddingPerspective === 'dealer'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>{isArabic ? 'صالة المزايدة للمتاجر (تقديم عروض الموردين)' : 'Store Owners: Browse Requests & Place Bids'}</span>
              <span className="bg-amber-500 text-neutral-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                BID ROOM
              </span>
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder={isArabic ? 'بحث باسم القطعة أو المركبة...' : 'Search part or vehicle...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Brand Filter */}
            <select
              value={makeFilter}
              onChange={(e) => setMakeFilter(e.target.value)}
              className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            >
              <option value="All">{isArabic ? 'جميع الماركات' : 'All Car Makes'}</option>
              <option value="Toyota">Toyota</option>
              <option value="Ford">Ford</option>
              <option value="BMW">BMW</option>
              <option value="Hyundai">Hyundai</option>
              <option value="Nissan">Nissan</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            >
              <option value="all">{isArabic ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="open">{isArabic ? 'مفتوح للمزايدة' : 'Bidding In Progress'}</option>
              <option value="accepted">{isArabic ? 'تم قبول العرض' : 'Offer Accepted'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Side Panel: Automotive Categories & Systems */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-neutral-800" />
                <span className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                  {isArabic ? 'أقسام وقطع الغيار' : 'Part Categories'}
                </span>
              </div>
              {selectedCategory !== 'All' && (
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {isArabic ? 'إلغاء الفلتر' : 'Reset'}
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                const count = getCategoryCount(cat.id);

                return (
                  <button
                    key={cat.id}
                    id={`side-cat-btn-${cat.id}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-neutral-900 text-white shadow-sm font-bold'
                        : 'text-neutral-700 hover:bg-neutral-100/80 hover:text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <span className="block truncate">{isArabic ? cat.nameAr : cat.name}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Vehicle Fitment Card on Side */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-4 border border-neutral-700 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                {isArabic ? 'توافق المركبة' : 'Selected Vehicle'}
              </span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-black px-1.5 py-0.5 rounded">
                FIT CHECK
              </span>
            </div>
            {activeVehicle ? (
              <div>
                <p className="text-xs font-black text-white">
                  {activeVehicle.make} {activeVehicle.model} ({activeVehicle.year})
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">{activeVehicle.engine}</p>
                <button
                  onClick={() => setActiveModal('vehicle_picker')}
                  className="mt-3 w-full py-1.5 px-3 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer text-center"
                >
                  {isArabic ? 'تغيير السيارة' : 'Change Vehicle'}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {isArabic ? 'حدد سيارتك لفلترة الطلبات المتوافقة' : 'Set vehicle to filter compatible requests'}
                </p>
                <button
                  onClick={() => setActiveModal('vehicle_picker')}
                  className="mt-3 w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[11px] font-black rounded-lg transition-colors cursor-pointer text-center"
                >
                  {isArabic ? 'اختيار المركبة' : 'Select Vehicle'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center Column: Request Cards */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
              {isArabic ? 'قائمة طلبات القطع' : 'Active Part Requests'} ({filteredRequests.length})
            </span>
            <span className="text-[11px] text-neutral-500">
              {biddingPerspective === 'dealer'
                ? isArabic ? 'اضغط لتقديم عرضك' : 'Click to inspect & bid'
                : isArabic ? 'اضغط للمقارنة' : 'Click to inspect quotes'}
            </span>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center text-neutral-500 text-xs">
              {isArabic ? 'لا توجد طلبات تطابق الفلتر الحالي.' : 'No part requests match the current filters.'}
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isSelected = req.id === selectedRequestId;
              const hasOffers = req.offers.length > 0;
              const lowestOfferPrice = hasOffers ? Math.min(...req.offers.map((o) => o.priceUSD)) : null;

              return (
                <div
                  key={req.id}
                  id={`request-list-card-${req.id}`}
                  onClick={() => setSelectedRequestId(req.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-neutral-900 bg-white shadow-md ring-1 ring-neutral-900'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                      {req.requestNumber}
                    </span>

                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        req.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : req.offers.length > 0
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                      }`}
                    >
                      {req.status === 'accepted'
                        ? isArabic ? 'تم التعاقد' : 'Bid Accepted'
                        : `${req.offers.length} ${isArabic ? 'عروض أسعار' : 'Dealer Bids'}`}
                    </span>
                  </div>

                  <h4 className="font-black text-neutral-900 text-sm leading-snug">
                    {req.partName}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 mt-1">
                    <Car className="w-3.5 h-3.5 text-neutral-400" />
                    <span>
                      {req.vehicle.make} {req.vehicle.model} ({req.vehicle.year})
                    </span>
                  </div>

                  {req.partNumberHint && (
                    <div className="text-[11px] font-mono text-neutral-500 mt-1">
                      Part #: {req.partNumberHint}
                    </div>
                  )}

                  {/* Pricing / Bid highlight */}
                  <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-neutral-500">{req.preferredCity} • {req.requiredDate}</span>
                    </div>

                    {lowestOfferPrice !== null ? (
                      <div className="text-right font-black text-emerald-700">
                        <span className="text-[10px] font-semibold text-neutral-500 block">{isArabic ? 'أقل مزايدة:' : 'Low Bid:'}</span>
                        ${lowestOfferPrice} USD
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-600">
                        {isArabic ? 'بانتظار المزايدات' : 'Awaiting 1st Bid'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Request Workspace & Competing Bids Matrix */}
        <div className="lg:col-span-5">
          {selectedRequest ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-neutral-200">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold bg-neutral-900 text-white px-2 py-0.5 rounded">
                      {selectedRequest.requestNumber}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {isArabic ? 'تاريخ النشر:' : 'Posted:'} {selectedRequest.createdAt.split('T')[0]}
                    </span>
                    <span className="text-xs font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                      {selectedRequest.preferredCity}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-neutral-900">
                    {selectedRequest.partName}
                  </h3>

                  <div className="text-xs text-neutral-700 flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 font-semibold">
                      <Car className="w-3.5 h-3.5 text-neutral-500" />
                      {selectedRequest.vehicle.year} {selectedRequest.vehicle.make} {selectedRequest.vehicle.model}
                      {selectedRequest.vehicle.engine && ` (${selectedRequest.vehicle.engine})`}
                    </span>
                    {selectedRequest.partNumberHint && (
                      <span className="font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-800 text-[11px]">
                        Ref: {selectedRequest.partNumberHint}
                      </span>
                    )}
                  </div>
                </div>

                {/* Urgency & Quality Requirement */}
                <div className="sm:text-right bg-neutral-50 p-3 rounded-xl border border-neutral-200/80">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                    {isArabic ? 'الجودة المطلوبة:' : 'Quality Required:'}
                  </span>
                  <span className="text-xs font-black text-neutral-900 uppercase">
                    {selectedRequest.qualityPreference.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] text-amber-700 font-bold block mt-1">
                    ⚡ {selectedRequest.requiredDate}
                  </span>
                </div>
              </div>

              {/* Description & Requester Note */}
              {selectedRequest.partDescription && (
                <div className="p-3.5 bg-neutral-50/80 rounded-xl border border-neutral-200 text-xs text-neutral-700 leading-relaxed">
                  <span className="font-bold text-neutral-900 block mb-1">
                    {isArabic ? 'تفاصيل طلب العميل / الورشة:' : 'Requester Notes & Diagnostic Issue:'}
                  </span>
                  {selectedRequest.partDescription}
                </div>
              )}

              {/* Action Bar for Testing / Store Bidding */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-100/80 p-3.5 rounded-xl border border-neutral-200">
                <div className="flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-neutral-800">
                    {biddingPerspective === 'dealer'
                      ? isArabic ? 'هل يتوفر هذا العنصر في متجرك؟ شارك في المزاد الآن' : 'Have this part in stock? Submit your dealer bid now'
                      : isArabic ? 'مصفوفة عروض المتاجر المنافسة' : 'Verified Store Dealer Bids Matrix'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Simulate Competing Bid Button */}
                  <button
                    onClick={() => {
                      simulateDealerBid(selectedRequest.id);
                      showToast('A verified local store has just submitted a competing bid!');
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold rounded-lg border border-neutral-300 transition-all flex items-center gap-1.5 shadow-xs"
                    title="Simulate another dealer placing a real-time bid"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isArabic ? 'محاكاة مزايدة متجر منافس' : 'Simulate Competitor Bid'}</span>
                  </button>

                  {/* Place Manual Bid Button */}
                  <button
                    onClick={() => setSelectedRequestForBid(selectedRequest)}
                    className="px-4 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Gavel className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isArabic ? 'تقديم عرض أسعار كمتجر' : 'Place Bid as Store Owner'}</span>
                  </button>
                </div>
              </div>

              {/* Competing Store Offers Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-black text-neutral-900 text-sm flex items-center gap-2">
                    <span>{isArabic ? 'عروض المتاجر المتنافسة على توفير القطعة' : 'Competing Store Offers'}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                      {selectedRequest.offers.length} {isArabic ? 'عروض' : 'Bids'}
                    </span>
                  </h4>
                  <span className="text-xs text-neutral-500">
                    {isArabic ? 'مرتبة حسب الأفضلية والسعر' : 'Sorted by value & price'}
                  </span>
                </div>

                {selectedRequest.offers.length === 0 ? (
                  <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                    <Clock className="w-8 h-8 text-neutral-400 mx-auto animate-pulse" />
                    <h5 className="text-sm font-bold text-neutral-800">
                      {isArabic ? 'في انتظار أول مزايدة من أصحاب المتاجر...' : 'Awaiting Dealer Bids'}
                    </h5>
                    <p className="text-xs text-neutral-500 max-w-md mx-auto">
                      {isArabic
                        ? 'تم إرسال إشعار فوري لجميع تجار قطع الغيار المعتمدين المتخصصين في هذه الماركة. اضغط على "تقديم عرض أسعار كمتجر" لإدخال أول عرض أسعار.'
                        : 'Notifications dispatched to all platform registered dealers. Use "Place Bid as Store Owner" or "Simulate Competitor Bid" to test the reverse bidding engine.'}
                    </p>
                    <button
                      onClick={() => setSelectedRequestForBid(selectedRequest)}
                      className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors"
                    >
                      {isArabic ? 'كن أول من يقدم عرضاً' : 'Place the First Bid'}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRequest.offers.map((offer) => {
                      const isAccepted = offer.status === 'accepted';
                      const isLowest =
                        offer.priceUSD === Math.min(...selectedRequest.offers.map((o) => o.priceUSD));

                      let badgeData = {
                        label: offer.badge || (isLowest ? 'LOWEST PRICE' : 'BEST VALUE'),
                        style: isLowest
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : offer.quality === 'genuine'
                          ? 'bg-blue-100 text-blue-900 border-blue-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300',
                      };

                      return (
                        <div
                          key={offer.id}
                          id={`offer-card-${offer.id}`}
                          className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                            isAccepted
                              ? 'border-emerald-500 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-500'
                              : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md'
                          }`}
                        >
                          <div>
                            {/* Top row: Badge & Price */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span
                                className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${badgeData.style}`}
                              >
                                {badgeData.label}
                              </span>

                              <div className="text-right">
                                <span className="font-black text-neutral-900 text-lg">
                                  ${offer.priceUSD} <span className="text-xs font-medium text-neutral-500">USD</span>
                                </span>
                                <span className="text-[10px] text-neutral-500 block font-mono">
                                  {offer.priceIQD.toLocaleString()} IQD
                                </span>
                              </div>
                            </div>

                            {/* Store Name & Verification */}
                            <div className="mt-1">
                              <div
                                onClick={() => {
                                  setSelectedSupplierIdForStore(offer.supplierId);
                                  setActiveModal('supplier_store');
                                }}
                                className="font-bold text-neutral-900 hover:text-emerald-700 cursor-pointer text-xs flex items-center gap-1"
                              >
                                <Store className="w-3.5 h-3.5 text-neutral-500" />
                                <span>{offer.supplierName}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-neutral-400" />
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
                                <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                                  <Star className="w-3 h-3 fill-amber-500" />
                                  {offer.supplierRating}
                                </span>
                                <span>•</span>
                                <span>{offer.verifiedInteractionsCount} {isArabic ? 'تقييم فحص' : 'verified sales'}</span>
                              </div>
                            </div>

                            {/* Offer Specifications */}
                            <div className="space-y-1 mt-3 pt-2.5 border-t border-neutral-100 text-xs">
                              <div className="flex justify-between">
                                <span className="text-neutral-500">{isArabic ? 'الجودة:' : 'Quality:'}</span>
                                <span className="font-bold text-neutral-800 uppercase text-[11px]">
                                  {offer.quality} ({offer.brand})
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-500">{isArabic ? 'الضمان:' : 'Warranty:'}</span>
                                <span className="font-semibold text-neutral-800">{offer.warranty}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-500">{isArabic ? 'التوصيل / الاستلام:' : 'Delivery / Ready:'}</span>
                                <span className="font-semibold text-emerald-700">{offer.deliveryTime}</span>
                              </div>
                            </div>

                            {offer.notes && (
                              <p className="text-[11px] text-neutral-600 bg-neutral-50 p-2 rounded-xl mt-2.5 border border-neutral-100 italic">
                                "{offer.notes}"
                              </p>
                            )}
                          </div>

                          {/* Order / Accept CTA */}
                          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-2">
                            {isAccepted ? (
                              <div className="w-full py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
                                <CheckCircle className="w-4 h-4" />
                                <span>{isArabic ? 'تم قبول العرض وإنشاء الطلب' : 'Bid Accepted & Order Created'}</span>
                              </div>
                            ) : (
                              <button
                                id={`accept-bid-btn-${offer.id}`}
                                onClick={() => {
                                  acceptRequestOffer(selectedRequest.id, offer.id);
                                  setActiveModal('cart');
                                  showToast(`Accepted bid from ${offer.supplierName}! Reviewing checkout order.`);
                                }}
                                className="w-full py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                              >
                                <span>{isArabic ? 'قبول العرض وتأكيد الطلب' : 'Accept Bid & Place Order'}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 text-neutral-500 text-xs">
              {isArabic
                ? 'يرجى اختيار طلب من القائمة لمعاينة عروض الأسعار ومقارنة مزايدات المتاجر.'
                : 'Select a part request from the list to inspect dealer bids and compare offers.'}
            </div>
          )}
        </div>
      </div>

      {/* Store Owner Bid Modal */}
      {selectedRequestForBid && (
        <SubmitPartBidModal
          request={selectedRequestForBid}
          onClose={() => setSelectedRequestForBid(null)}
        />
      )}
    </div>
  );
};
