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
  Check,
  Building,
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
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Board Hero / Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-white/10 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  {isArabic ? 'مناقصات ومزايدات القطع الحية' : 'Live Parts Reverse Auctions'}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {totalBidsReceived} {isArabic ? 'عرض متجر مسجل' : 'Store Bids Recorded'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isArabic
                  ? 'منصة طلب ومناقصة قطع الغيار'
                  : 'Parts Bidding & Reverse Auctions Floor'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {isArabic
                  ? 'عندما تبحث عن قطعة وتكون غير متوفرة في المتاجر، اطلبها فوراً عبر المنصة لتتنافس ورش ومحلات قطع الغيار المعتمدة في بغداد وأربيل والبصرة على تقديم أفضل الأسعار والضمان وسرعة التوصيل.'
                  : 'When a part is unavailable in regular stock, request it here. Over 120+ verified auto parts store owners and dealers across Baghdad, Erbil & Basra bid directly to fulfill your order at the lowest price.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="board-new-part-request-cta"
                onClick={() => setActiveModal('request_part')}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isArabic ? 'طلب قطعة غير متوفرة للمزايدة' : 'Request Out-of-Stock Part'}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div className="bg-white/[0.04] backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isArabic ? 'الطلبات المفتوحة للمزايدة' : 'Active Part RFQs'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-black text-white">{partRequests.length}</span>
                <span className="text-[10px] font-bold text-amber-400">Open for bids</span>
              </div>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isArabic ? 'عروض المتاجر المستلمة' : 'Store Dealer Quotes'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-black text-white">{totalBidsReceived}</span>
                <span className="text-[10px] font-bold text-emerald-400">+4 Today</span>
              </div>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isArabic ? 'متوسط التوفير بالأسعار' : 'Avg. Price Savings'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-black text-emerald-400">28.4%</span>
                <span className="text-[10px] font-bold text-slate-400">vs Retail MSRP</span>
              </div>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isArabic ? 'حماية المشتري المعتمدة' : 'Escrow Protection'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-black text-white">100%</span>
                <span className="text-[10px] font-bold text-indigo-400">Inspected & Sealed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Perspective Toggle & Filters Bar */}
      <div className="glass-panel rounded-2xl border border-white/10 p-4 mb-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Dual Perspective Buttons */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/10">
            <button
              id="view-mode-buyer-btn"
              onClick={() => setBiddingPerspective('buyer')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                biddingPerspective === 'buyer'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isArabic ? 'منظور المشتري (طلباتي وعروض الأسعار)' : 'Buyer View: My Requests & Incoming Bids'}</span>
            </button>

            <button
              id="view-mode-dealer-btn"
              onClick={() => setBiddingPerspective('dealer')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                biddingPerspective === 'dealer'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-white/[0.04]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{isArabic ? 'صالة المزايدة للمتاجر (تقديم عروض الموردين)' : 'Store Owners: Browse Requests & Place Bids'}</span>
              <span className="bg-amber-500/30 text-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                BID ROOM
              </span>
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute start-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={isArabic ? 'بحث باسم القطعة أو المركبة...' : 'Search part or vehicle...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-8 pe-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Brand Filter */}
            <select
              value={makeFilter}
              onChange={(e) => setMakeFilter(e.target.value)}
              className="px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs font-bold text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-white">{isArabic ? 'جميع الماركات' : 'All Car Makes'}</option>
              <option value="Toyota" className="bg-slate-900 text-white">Toyota</option>
              <option value="Ford" className="bg-slate-900 text-white">Ford</option>
              <option value="BMW" className="bg-slate-900 text-white">BMW</option>
              <option value="Hyundai" className="bg-slate-900 text-white">Hyundai</option>
              <option value="Nissan" className="bg-slate-900 text-white">Nissan</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs font-bold text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">{isArabic ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="open" className="bg-slate-900 text-white">{isArabic ? 'مفتوح للمزايدة' : 'Bidding In Progress'}</option>
              <option value="accepted" className="bg-slate-900 text-white">{isArabic ? 'تم قبول العرض' : 'Offer Accepted'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Side Panel: Automotive Categories & Systems */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel rounded-2xl border border-white/10 p-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  {isArabic ? 'أقسام وقطع الغيار' : 'Part Categories'}
                </span>
              </div>
              {selectedCategory !== 'All' && selectedCategory !== 'requests' && (
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
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
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left rtl:text-right ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md font-bold'
                        : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-white/[0.05] text-slate-400'
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
                          : 'bg-white/[0.05] text-slate-400'
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
          <div className="glass-panel text-white rounded-2xl p-4 border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                <p className="text-[11px] text-slate-400 mt-0.5">{activeVehicle.engine}</p>
                <button
                  onClick={() => setActiveModal('vehicle_picker')}
                  className="mt-3 w-full py-2 px-3 bg-white/[0.06] hover:bg-white/[0.12] text-white text-[11px] font-bold rounded-xl border border-white/10 transition-colors cursor-pointer text-center"
                >
                  {isArabic ? 'تغيير السيارة' : 'Change Vehicle'}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isArabic ? 'حدد سيارتك لفلترة الطلبات المتوافقة' : 'Set vehicle to filter compatible requests'}
                </p>
                <button
                  onClick={() => setActiveModal('vehicle_picker')}
                  className="mt-3 w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-[11px] font-black rounded-xl transition-colors cursor-pointer text-center shadow-md"
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
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              {isArabic ? 'قائمة طلبات القطع' : 'Active Part Requests'} ({filteredRequests.length})
            </span>
            <span className="text-[11px] text-slate-400">
              {biddingPerspective === 'dealer'
                ? isArabic ? 'اضغط لتقديم عرضك' : 'Click to inspect & bid'
                : isArabic ? 'اضغط للمقارنة' : 'Click to inspect quotes'}
            </span>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="glass-panel rounded-2xl border border-white/10 p-8 text-center text-slate-400 text-xs">
              {isArabic ? 'لا توجد طلبات تطابق الفلتر الحالي.' : 'No part requests match the current filters.'}
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isSelected = req.id === selectedRequestId;
              const hasOffers = req.offers.length > 0;
              const lowestOfferPriceUSD = hasOffers ? Math.min(...req.offers.map((o) => o.priceUSD)) : null;

              return (
                <div
                  key={req.id}
                  id={`request-list-card-${req.id}`}
                  onClick={() => setSelectedRequestId(req.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-indigo-500/80 bg-slate-900/90 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Status indicator badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/5">
                      #{req.requestNumber}
                    </span>

                    {req.status === 'accepted' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>{isArabic ? 'مكتمل ومقبول' : 'Accepted'}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                        <Clock className="w-3 h-3" />
                        <span>{isArabic ? 'جاري استقبال العروض' : 'Live Bidding'}</span>
                      </span>
                    )}
                  </div>

                  {/* Part Title */}
                  <h4 className="font-extrabold text-sm text-white line-clamp-1">
                    {req.partName}
                  </h4>

                  {/* Vehicle Spec */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <Car className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      {req.vehicle.make} {req.vehicle.model} ({req.vehicle.year}) • {req.vehicle.engine}
                    </span>
                  </div>

                  {/* Bids Counter & Lowest Price */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Gavel className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-slate-200">
                        {req.offers.length} {isArabic ? 'عروض' : 'Bids'}
                      </span>
                    </div>

                    {lowestOfferPriceUSD !== null ? (
                      <div className="text-right rtl:text-left">
                        <span className="text-[10px] text-slate-400 uppercase me-1">
                          {isArabic ? 'أقل عرض:' : 'Lowest:'}
                        </span>
                        <span className="font-black text-emerald-400 text-sm">
                          {formatPrice(lowestOfferPriceUSD)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-amber-300 italic font-semibold">
                        {isArabic ? 'بانتظار العرض الأول' : 'Waiting for 1st bid'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Request Detail & Live Dealer Floor */}
        <div className="lg:col-span-5">
          {selectedRequest ? (
            <div className="glass-panel rounded-3xl border border-white/10 p-5 sm:p-6 shadow-2xl space-y-6">
              {/* Header Info */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                      #{selectedRequest.requestNumber}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{selectedRequest.createdAt}</span>
                    </span>
                  </div>

                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{selectedRequest.city || 'Baghdad Central'}</span>
                  </span>
                </div>

                <h3 className="text-xl font-black text-white tracking-tight">
                  {selectedRequest.partName}
                </h3>

                <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5 mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">{isArabic ? 'المركبة المستهدفة:' : 'Target Vehicle:'}</span>
                    <span className="font-bold text-white">
                      {selectedRequest.vehicle.make} {selectedRequest.vehicle.model} ({selectedRequest.vehicle.year})
                    </span>
                  </div>
                  {selectedRequest.partNumberHint && (
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">{isArabic ? 'رقم القطعة المقترح:' : 'Part Number OEM:'}</span>
                      <span className="font-mono font-bold text-indigo-300 bg-indigo-500/10 px-1.5 rounded">
                        {selectedRequest.partNumberHint}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">{isArabic ? 'الجودة المطلوبة:' : 'Quality Preference:'}</span>
                    <span className="font-semibold text-slate-200 capitalize">
                      {selectedRequest.qualityPreference || 'Genuine / OEM Certified'}
                    </span>
                  </div>
                </div>

                {selectedRequest.partDescription && (
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <span className="font-bold text-slate-400 block mb-1">{isArabic ? 'ملاحظات العميل:' : 'Buyer Notes:'}</span>
                    {selectedRequest.partDescription}
                  </p>
                )}
              </div>

              {/* Action Buttons for Perspective */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                {biddingPerspective === 'dealer' && selectedRequest.status !== 'accepted' && (
                  <button
                    id="submit-dealer-bid-btn"
                    onClick={() => setSelectedRequestForBid(selectedRequest)}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Gavel className="w-4 h-4 text-slate-950" />
                    <span>{isArabic ? 'تقديم عرض سعر متجر رسمي' : 'Submit Verified Dealer Bid'}</span>
                  </button>
                )}

                <button
                  id="simulate-dealer-bid-btn"
                  onClick={() => {
                    simulateDealerBid(selectedRequest.id);
                    showToast(isArabic ? 'تم محاكاة تقديم عرض جديد من متجر معتمد!' : 'Simulated new competitive store bid received!');
                  }}
                  className="py-3 px-4 bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-bold rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  title="Simulate incoming competitive dealer bids"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isArabic ? 'محاكاة مزايدة متجر' : 'Simulate Dealer Bid'}</span>
                </button>
              </div>

              {/* Offers List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Gavel className="w-4 h-4 text-amber-400" />
                    <span>{isArabic ? 'عروض الأسعار المقدمة' : 'Submitted Dealer Offers'} ({selectedRequest.offers.length})</span>
                  </h4>
                  {selectedRequest.offers.length > 0 && (
                    <span className="text-[11px] text-emerald-400 font-bold">
                      {isArabic ? 'أفضل سعر مضمون' : 'Best Price Guarantee'}
                    </span>
                  )}
                </div>

                {selectedRequest.offers.length === 0 ? (
                  <div className="p-8 text-center bg-white/[0.02] rounded-2xl border border-white/5 space-y-2">
                    <Clock className="w-8 h-8 text-amber-400 mx-auto animate-spin" />
                    <p className="text-xs text-slate-300 font-semibold">
                      {isArabic ? 'جاري البث لـ 120 متجراً معتمداً...' : 'Broadcasting RFQ to 120+ verified dealers...'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {isArabic ? 'انقر على "محاكاة مزايدة متجر" لتجربة التنافس الفوري' : 'Click "Simulate Dealer Bid" to test live auction flow'}
                    </p>
                  </div>
                ) : (
                  selectedRequest.offers.map((offer, idx) => {
                    const isLowest =
                      offer.priceUSD === Math.min(...selectedRequest.offers.map((o) => o.priceUSD));
                    const isOfferAccepted = offer.status === 'accepted' || selectedRequest.status === 'accepted';

                    return (
                      <div
                        key={offer.id}
                        id={`offer-card-${offer.id}`}
                        className={`p-4 rounded-2xl border transition-all ${
                          isOfferAccepted
                            ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                            : isLowest
                            ? 'bg-amber-500/[0.07] border-amber-500/30'
                            : 'bg-white/[0.03] border-white/10'
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
                                className="font-extrabold text-white text-sm hover:text-indigo-400 cursor-pointer flex items-center gap-1.5 transition-colors"
                              >
                                <Store className="w-3.5 h-3.5 text-indigo-400" />
                                <span>{offer.supplierName}</span>
                              </span>

                              {isLowest && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-xs">
                                  LOWEST BID
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="font-bold text-slate-200">{offer.supplierRating || 4.9}</span>
                              </div>
                              <span>•</span>
                              <span className="text-slate-300">{offer.warranty}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-base font-black text-emerald-400">
                              {formatPrice(offer.priceUSD, offer.priceIQD)}
                            </div>
                            <span className="text-[10px] text-slate-400">{offer.deliveryTime}</span>
                          </div>
                        </div>

                        {offer.notes && (
                          <p className="text-[11px] text-slate-300 mt-2 p-2 bg-black/30 rounded-lg border border-white/5">
                            {offer.notes}
                          </p>
                        )}

                        {/* Accept Offer Action */}
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
                                  showToast(isArabic ? 'تم قبول العرض وإنشاء طلب الشراء بنجاح!' : 'Offer accepted! Order created successfully.');
                                  setActiveModal('cart');
                                }
                              }}
                              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>{isArabic ? 'قبول العرض والشراء' : 'Accept & Order'}</span>
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
            <div className="glass-panel rounded-3xl border border-white/10 p-12 text-center text-slate-400 text-xs">
              {isArabic ? 'اختر طلباً من القائمة لعرض تفاصيل المناقصة.' : 'Select a part request from the list to view active bidding details.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
