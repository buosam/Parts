/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
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
  DollarSign,
  Coins,
  User,
  LogOut,
  Settings,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Shield,
  KeyRound,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { UserRole } from '../types';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    currentUser,
    openAuthModal,
    logout,
    language,
    setLanguage,
    currency,
    setCurrency,
    activeVehicle,
    setActiveModal,
    cart,
    orders,
    partRequests,
    setSelectedCategory,
  } = useMarketplace();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isArabic = language === 'ar';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleLabels: Record<UserRole, { label: string; labelAr: string; icon: React.ReactNode; desc: string; descAr: string }> = {
    customer: {
      label: 'Buyer Portal',
      labelAr: 'بوابة المشتري وسوق القطع',
      icon: <Car className="w-4 h-4 text-emerald-400" />,
      desc: 'Search, Compare & Order Parts',
      descAr: 'البحث والشراء والمقارنة الفورية',
    },
    workshop: {
      label: 'Workshop Portal',
      labelAr: 'بوابة الورش ومراكز الصيانة',
      icon: <Wrench className="w-4 h-4 text-blue-400" />,
      desc: 'Repair Orders & Smart Procurement',
      descAr: 'إدارة أوامر التصليح وتوريد القطع',
    },
    supplier: {
      label: 'Dealer & Supplier ERP',
      labelAr: 'بوابة الوكلاء وموردي الجملة',
      icon: <Store className="w-4 h-4 text-amber-400" />,
      desc: 'Inventory Sync, ERP & Bidding Hub',
      descAr: 'الربط البرمجي ومزامنة المخزون وتلبية الطلبات',
    },
    admin: {
      label: 'Platform Administration',
      labelAr: 'إدارة المنصة والشبكة الذكية',
      icon: <ShieldCheck className="w-4 h-4 text-indigo-400" />,
      desc: 'Ecosystem Controls & Analytics',
      descAr: 'التحكم بالشبكة، التدقيق وتحليلات السوق',
    },
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/40">

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Brand & Tagline - IQAutoMarket */}
        <Logo
          variant="dark"
          size="md"
          showBadge={true}
          showSubtitle={true}
          isArabic={isArabic}
          onClick={() => setSelectedCategory('All')}
        />

        {/* Center: Active Vehicle Selector Pill */}
        <div className="hidden lg:flex items-center">
          <button
            id="header-active-vehicle-btn"
            onClick={() => setActiveModal('vehicle_picker')}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.08] transition-all text-left rtl:text-right group cursor-pointer"
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Currency Switcher */}
          <button
            id="currency-toggle-btn"
            onClick={() => setCurrency(currency === 'USD' ? 'IQD' : 'USD')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-amber-300 hover:text-amber-200 text-xs font-bold border border-amber-500/20 transition-all cursor-pointer shadow-xs"
            title={isArabic ? 'تبديل العملة (دولار / دينار عراقي)' : 'Switch Currency (USD / Iraqi Dinar)'}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{currency === 'USD' ? '$ USD' : 'د.ع IQD'}</span>
          </button>

          {/* Language Toggle */}
          <button
            id="language-toggle-btn"
            onClick={() => setLanguage(isArabic ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isArabic ? 'English' : 'العربية'}</span>
          </button>
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

          {/* User Profile Avatar & Interactive Popover Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              id="header-user-avatar-btn"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-500/40 text-xs transition-all cursor-pointer group"
              title={isArabic ? 'الملف الشخصي والإعدادات وبوابات العمل' : 'User Profile, Settings & Portals'}
            >
              {currentUser ? (
                <>
                  <div className="relative">
                    <img
                      src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-lg object-cover border border-indigo-400/40 shadow-xs"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0a0e1a]" />
                  </div>
                  <div className="text-left rtl:text-right hidden sm:block">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 leading-tight">
                      <span className="truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
                      <span className="text-[9px] font-black uppercase text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-1 py-0.2 rounded">
                        {role}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
                    {isArabic ? 'الحساب' : 'Account'}
                  </span>
                </div>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Popover */}
            {isProfileOpen && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 sm:w-88 rounded-2xl bg-[#0e1424] border border-white/10 shadow-2xl shadow-black/80 backdrop-blur-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Profile Header */}
                {currentUser ? (
                  <div className="p-4 bg-gradient-to-b from-indigo-950/40 to-transparent border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                        alt={currentUser.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-indigo-500/30 shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white truncate">{currentUser.name}</h4>
                          {currentUser.verificationStatus === 'verified' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {roleLabels[role]?.label || role}
                          </span>
                          {currentUser.companyName && (
                            <span className="text-[10px] text-slate-400 truncate">
                              • {currentUser.companyName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gradient-to-b from-indigo-950/40 to-transparent border-b border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {isArabic ? 'مرحباً بك في المنصة' : 'Welcome to IQAutoMarket'}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {isArabic ? 'سجل دخولك لإدارة الطلبات والأسعار' : 'Sign in to manage orders and quotes'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          openAuthModal(role, 'signin');
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer text-center"
                      >
                        {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          openAuthModal(role, 'signup');
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/10 font-semibold text-xs transition-colors cursor-pointer text-center"
                      >
                        {isArabic ? 'حساب جديد' : 'Register'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary Quick Links: Orders, Garage, Bidding */}
                <div className="p-2 border-b border-white/5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1">
                    {isArabic ? 'الوصول السريع' : 'Quick Access'}
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setActiveModal('cart');
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left rtl:text-right">
                        <div className="font-semibold">{isArabic ? 'طلباتي وفواتيري' : 'My Orders & Invoices'}</div>
                        <div className="text-[10px] text-slate-400">{orders.length} {isArabic ? 'طلبات مسجلة' : 'active orders'}</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-white/[0.06] text-slate-300 font-bold px-1.5 py-0.5 rounded">
                      {cart.length > 0 ? `${cart.length} in cart` : orders.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setActiveModal('vehicle_picker');
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Car className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left rtl:text-right">
                        <div className="font-semibold">{isArabic ? 'مرآبي وسياراتي المحفوظة' : 'My Garage & Vehicles'}</div>
                        <div className="text-[10px] text-slate-400">
                          {activeVehicle ? `${activeVehicle.make} ${activeVehicle.model}` : (isArabic ? 'لا توجد سيارة محددة' : 'No vehicle selected')}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold">{isArabic ? 'توافق القطع' : 'Fitment'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setSelectedCategory('requests');
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Gavel className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left rtl:text-right">
                        <div className="font-semibold">{isArabic ? 'سوق المزايدات والمناقصات' : 'Parts Bidding Floor'}</div>
                        <div className="text-[10px] text-slate-400">{partRequests.length} {isArabic ? 'طلبات مفتوحة' : 'live requests'}</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded">
                      Live
                    </span>
                  </button>
                </div>

                {/* Switch Portal / Workspace */}
                <div className="p-2 border-b border-white/5 bg-white/[0.01]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1">
                    {isArabic ? 'تبديل بوابة العمل والمنظومة' : 'Switch Portal & Workspace'}
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {(['customer', 'workshop', 'supplier', 'admin'] as UserRole[]).map((r) => {
                      const active = role === r;
                      const item = roleLabels[r];
                      return (
                        <button
                          key={r}
                          onClick={() => {
                            setRole(r);
                            setIsProfileOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                            active
                              ? 'bg-indigo-600/20 border border-indigo-500/30 text-white'
                              : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${active ? 'bg-indigo-500/20' : 'bg-white/[0.04]'}`}>
                              {item.icon}
                            </div>
                            <div className="text-left rtl:text-right">
                              <div className="font-semibold text-xs">{isArabic ? item.labelAr : item.label}</div>
                              <div className="text-[10px] text-slate-400">{isArabic ? item.descAr : item.desc}</div>
                            </div>
                          </div>
                          {active && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Account Settings & Sign Out */}
                <div className="p-2 bg-black/20">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      openAuthModal(role, 'signin');
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isArabic ? 'إعدادات الحساب والأمان' : 'Account & Security Settings'}</span>
                  </button>

                  {currentUser ? (
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>{isArabic ? 'تسجيل الخروج' : 'Sign Out'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        openAuthModal(role, 'signin');
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors cursor-pointer font-semibold"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isArabic ? 'تسجيل الدخول بحساب آخر' : 'Sign In with Account'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
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

