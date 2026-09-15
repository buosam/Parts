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
  ChevronDown,
  Globe,
  Bell,
  Sparkles,
  Gavel,
  Layers,
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
      label: 'Buyer Portal',
      labelAr: 'المشتري',
      icon: <Car className="w-3.5 h-3.5 text-emerald-400" />,
      desc: 'Search, Compare & Request',
    },
    workshop: {
      label: 'Workshop Portal',
      labelAr: 'بوابة الورش',
      icon: <Wrench className="w-3.5 h-3.5 text-blue-400" />,
      desc: 'Repair Orders & Smart Procurement',
    },
    supplier: {
      label: 'Dealer / Supplier',
      labelAr: 'الوكلاء والموردين',
      icon: <Store className="w-3.5 h-3.5 text-amber-400" />,
      desc: 'ERP & Inventory Sync Hub',
    },
    admin: {
      label: 'Platform Admin',
      labelAr: 'إدارة المنصة',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />,
      desc: 'Network Intelligence & Error Center',
    },
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0a0e1a]/90 backdrop-blur-xl border-b border-white/10">
      {/* Top Banner & Role Navigation */}
      <div className="bg-black/40 text-slate-300 text-xs px-4 py-2 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-medium text-[11px] border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isArabic ? 'سوق قطع الغيار وتكامل الوكلاء المعتمد' : 'Verified Automotive Spare Parts & Dealer Network'}
            </span>
            <span className="hidden md:inline text-slate-400 text-[11px]">
              {isArabic ? 'بغداد • أربيل • السليمانية • البصرة' : 'Baghdad • Erbil • Sulaymaniyah • Basra'}
            </span>
          </div>

          {/* Role selector bar */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10">
            <span className="text-[11px] text-slate-400 px-2 font-medium hidden sm:inline">
              {isArabic ? 'المنظومة:' : 'View Mode:'}
            </span>
            {(['customer', 'workshop', 'supplier', 'admin'] as UserRole[]).map((r) => {
              const active = role === r;
              return (
                <button
                  key={r}
                  id={`role-btn-${r}`}
                  onClick={() => setRole(r)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
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
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isArabic ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Brand & Tagline - IQAutoMarket */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => {
              setSelectedCategory('All');
            }}
            className="cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 text-white flex items-center justify-center font-black tracking-tighter text-sm shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-all border border-indigo-400/30">
              IQ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-white text-base sm:text-lg">
                  IQAuto<span className="text-indigo-400">Market</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                  {isArabic ? 'العراق' : 'IRAQ'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                {isArabic
                  ? 'سوق قطع الغيار المعتمد وتكامل أنظمة الوكلاء'
                  : 'Genuine Parts & Integrated Dealer Network'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Active Vehicle Selector Pill */}
        <div className="hidden lg:flex items-center">
          <button
            id="header-active-vehicle-btn"
            onClick={() => setActiveModal('vehicle_picker')}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.08] transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 group-hover:scale-105 transition-transform">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>{isArabic ? 'سيارتي المحددة' : 'MY VEHICLE'}</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1 rounded">
                  FITMENT
                </span>
              </div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                {activeVehicle ? (
                  <>
                    <span>{activeVehicle.make} {activeVehicle.model} {activeVehicle.year}</span>
                    <span className="text-[11px] text-slate-400 font-normal">({activeVehicle.engine})</span>
                  </>
                ) : (
                  <span className="text-amber-300 font-semibold">{isArabic ? 'اختر سيارتك لتأكيد التوافق' : 'Select Vehicle to Guarantee Fit'}</span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
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
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
          >
            <Gavel className="w-3.5 h-3.5 text-amber-400" />
            <span>{isArabic ? 'مزايدة ومناقصة قطع' : 'Parts Bidding'}</span>
          </button>

          {/* Quick Photo Search */}
          <button
            id="quick-photo-search-btn"
            onClick={() => setActiveModal('photo_search')}
            title={isArabic ? 'البحث بالصورة بواسطة الذكاء الاصطناعي' : 'Search Part by Photo (AI Identification)'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">{isArabic ? 'بحث بالصورة' : 'Photo Search'}</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1 rounded">AI</span>
          </button>

          {/* Quick Request a Part */}
          <button
            id="quick-request-part-btn"
            onClick={() => setActiveModal('request_part')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>{isArabic ? 'طلب قطعة' : 'Request Part'}</span>
          </button>

          {/* Cart / Orders */}
          <button
            id="header-cart-btn"
            onClick={() => setActiveModal('cart')}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.04] text-slate-200 hover:text-white transition-colors cursor-pointer"
            title={isArabic ? 'السلة والطلبات' : 'Cart & Active Orders'}
          >
            <ShoppingBag className="w-4 h-4" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Vehicle Selector bar if screen is small */}
      <div className="lg:hidden border-t border-white/5 bg-black/30 px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Car className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">{isArabic ? 'المركبة:' : 'Vehicle:'}</span>
          <span className="font-semibold text-white">
            {activeVehicle ? `${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year}` : 'None Selected'}
          </span>
        </div>
        <button
          onClick={() => setActiveModal('vehicle_picker')}
          className="text-indigo-400 font-medium hover:underline text-[11px]"
        >
          {isArabic ? 'تغيير' : 'Change'}
        </button>
      </div>
    </header>
  );
};
