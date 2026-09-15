/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Car,
  Search,
  Camera,
  FileSpreadsheet,
  ShoppingBag,
  ShieldCheck,
  Wrench,
  Store,
  SlidersHorizontal,
  ChevronDown,
  Globe,
  Bell,
  Sparkles,
  Gavel,
  Plus,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { UserRole } from '../types';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    language,
    setLanguage,
    activeVehicle,
    setActiveModal,
    cart,
    orders,
    partRequests,
    setSelectedCategory,
  } = useMarketplace();

  const isArabic = language === 'ar';

  const roleLabels: Record<UserRole, { label: string; labelAr: string; icon: React.ReactNode; desc: string }> = {
    customer: {
      label: 'Vehicle Owner',
      labelAr: 'مالك سيارة',
      icon: <Car className="w-4 h-4 text-emerald-600" />,
      desc: 'Search, Compare & Request',
    },
    workshop: {
      label: 'Workshop Portal',
      labelAr: 'بوابة الورش',
      icon: <Wrench className="w-4 h-4 text-blue-600" />,
      desc: 'Repair Orders & Smart Procurement',
    },
    supplier: {
      label: 'Supplier / Dealer',
      labelAr: 'المورد / التاجر',
      icon: <Store className="w-4 h-4 text-amber-600" />,
      desc: 'ABC Genuine Parts Portal',
    },
    admin: {
      label: 'Marketplace Admin',
      labelAr: 'إدارة المنصة',
      icon: <ShieldCheck className="w-4 h-4 text-indigo-600" />,
      desc: 'Catalogue & Demand Intelligence',
    },
  };

  const pendingOffersCount = partRequests.reduce(
    (sum, r) => sum + (r.status === 'offers_received' ? r.offers.length : 0),
    0
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      {/* Top Banner & Role Navigation */}
      <div className="bg-neutral-900 text-neutral-100 text-xs px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium text-[11px] border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isArabic ? 'سوق قطع الغيار المعتمد' : 'Verified Automotive Spare Parts Marketplace'}
            </span>
            <span className="hidden md:inline text-neutral-400">
              {isArabic ? 'العراق والشرق الأوسط' : 'Serving Iraq & Regional Automotive Networks'}
            </span>
          </div>

          {/* Role selector bar */}
          <div className="flex items-center gap-1 bg-neutral-800 p-1 rounded-lg border border-neutral-700">
            <span className="text-[11px] text-neutral-400 px-2 font-medium hidden sm:inline">
              {isArabic ? 'الدور الحالي:' : 'Operating As:'}
            </span>
            {(['customer', 'workshop', 'supplier', 'admin'] as UserRole[]).map((r) => {
              const active = role === r;
              return (
                <button
                  key={r}
                  id={`role-btn-${r}`}
                  onClick={() => setRole(r)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    active
                      ? 'bg-neutral-100 text-neutral-900 shadow-sm'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-700/60'
                  }`}
                >
                  {roleLabels[r].icon}
                  <span>{isArabic ? roleLabels[r].labelAr : roleLabels[r].label}</span>
                </button>
              );
            })}
          </div>

          {/* Language Toggle */}
          <button
            id="language-toggle-btn"
            onClick={() => setLanguage(isArabic ? 'en' : 'ar')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium border border-neutral-700"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isArabic ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Brand & Tagline - Inspired by CARiD's automotive styling */}
        {/* Brand & Tagline - IQAutoMarket */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => {
              setSelectedCategory('All');
            }}
            className="cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center font-black tracking-tighter text-sm shadow-md group-hover:from-red-700 group-hover:to-red-800 transition-all">
              IQ
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black tracking-tight text-neutral-900 text-base sm:text-lg">
                  IQAuto<span className="text-red-600">Market</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                  {isArabic ? 'العراق' : 'IRAQ'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 hidden sm:block">
                {isArabic
                  ? 'سوق قطع الغيار المعتمد وتكامل أنظمة الوكلاء'
                  : 'Genuine Parts & Integrated Dealer Marketplace'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Active Vehicle Selector Pill (Guaranteed Fitment - CARiD signature) */}
        <div className="hidden lg:flex items-center">
          <button
            id="header-active-vehicle-btn"
            onClick={() => setActiveModal('vehicle_picker')}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-red-500 hover:bg-red-50/20 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 group-hover:text-red-600 group-hover:border-red-300">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 group-hover:text-red-600 flex items-center gap-1">
                <span>{isArabic ? 'سيارتي المحددة' : 'MY VEHICLE'}</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">
                  FITMENT
                </span>
              </div>
              <div className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                {activeVehicle ? (
                  <>
                    <span>{activeVehicle.make} {activeVehicle.model} {activeVehicle.year}</span>
                    <span className="text-[11px] text-neutral-500 font-normal">({activeVehicle.engine})</span>
                  </>
                ) : (
                  <span className="text-red-700 font-bold">{isArabic ? 'اختر سيارتك لتأكيد التوافق' : 'Select Vehicle to Guarantee Fit'}</span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700" />
              </div>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Parts Bidding Request */}
          <button
            id="header-parts-bidding-btn"
            onClick={() => setActiveModal('request_part')}
            title={isArabic ? 'طلب قطعة غير متوفرة لمزايدة المتاجر' : 'Request out-of-stock part for dealer bidding'}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors"
          >
            <Gavel className="w-3.5 h-3.5 text-amber-600" />
            <span>{isArabic ? 'مزايدة ومناقصة قطع' : 'Parts Bidding'}</span>
          </button>

          {/* Quick Photo Search */}
          <button
            id="quick-photo-search-btn"
            onClick={() => setActiveModal('photo_search')}
            title={isArabic ? 'البحث بالصورة بواسطة الذكاء الاصطناعي' : 'Search Part by Photo (AI Identification)'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/80 transition-colors"
          >
            <Camera className="w-4 h-4 text-emerald-600" />
            <span className="hidden md:inline">{isArabic ? 'بحث بالصورة' : 'Photo Search'}</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">AI</span>
          </button>

          {/* Quick Request a Part */}
          <button
            id="quick-request-part-btn"
            onClick={() => setActiveModal('request_part')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{isArabic ? 'طلب قطعة' : 'Request Part'}</span>
          </button>

          {/* Cart / Orders */}
          <button
            id="header-cart-btn"
            onClick={() => setActiveModal('cart')}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-neutral-200 hover:border-neutral-400 bg-white text-neutral-700 transition-colors"
            title={isArabic ? 'السلة والطلبات' : 'Cart & Active Orders'}
          >
            <ShoppingBag className="w-4 h-4" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Vehicle Selector bar if screen is small */}
      <div className="lg:hidden border-t border-neutral-100 bg-neutral-50 px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Car className="w-3.5 h-3.5 text-neutral-500" />
          <span className="text-neutral-500">{isArabic ? 'المركبة:' : 'Vehicle:'}</span>
          <span className="font-semibold text-neutral-900">
            {activeVehicle ? `${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year}` : 'None Selected'}
          </span>
        </div>
        <button
          onClick={() => setActiveModal('vehicle_picker')}
          className="text-emerald-700 font-medium hover:underline text-[11px]"
        >
          {isArabic ? 'تغيير' : 'Change'}
        </button>
      </div>
    </header>
  );
};
