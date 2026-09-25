/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket - Role-Conscious Clean Navigation System
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Car,
  ShoppingBag,
  Globe,
  Coins,
  User,
  LogOut,
  Shield,
  Layers,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Check,
  Plus,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ActiveSessionsModal } from '../Security/ActiveSessionsModal';
import { Logo } from '../Logo';

interface AppNavbarProps {
  onOpenSanawiaScan: () => void;
  onOpenPartlineConsole?: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({ onOpenSanawiaScan, onOpenPartlineConsole }) => {
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
    setSelectedCategory,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 glass-nav border-b border-white/[0.08] shadow-lg shadow-black/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
          {/* Brand Logo */}
          <div className="shrink-0">
            <Logo
              variant="dark"
              size="sm"
              showBadge={true}
              showSubtitle={false}
              isArabic={isArabic}
              onClick={() => {
                setRole('customer');
                setSelectedCategory('All');
              }}
            />
          </div>

          {/* Center: Persistent Vehicle Fitment Context Pill */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-2">
            <button
              id="navbar-active-vehicle-pill"
              onClick={() => setActiveModal('vehicle_picker')}
              className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-1.5 rounded-full border text-left rtl:text-right transition-all cursor-pointer group micro-press ${
                activeVehicle
                  ? 'bg-emerald-500/[0.08] border-emerald-500/25 hover:border-emerald-500/40 text-white'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-300'
              }`}
              title={isArabic ? 'تأكيد توافق القطع مع سيارتك' : 'Guarantee part fitment for your vehicle'}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    activeVehicle
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/10 text-slate-400 group-hover:text-white'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  {activeVehicle ? (
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-xs font-bold text-white truncate">
                        {activeVehicle.make} {activeVehicle.model} {activeVehicle.year}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.2 rounded-full bg-emerald-500/15 shrink-0 flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" />
                        <span>{isArabic ? 'مطابق' : 'Fits'}</span>
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs font-medium text-slate-400 group-hover:text-slate-200 truncate flex items-center gap-1.5">
                      <Plus className="w-3 h-3 text-indigo-400" />
                      <span>{isArabic ? 'اختر سيارتك لتأكيد التوافق' : 'Select vehicle to guarantee fit'}</span>
                    </div>
                  )}
                </div>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0" />
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Currency Switcher */}
            <button
              id="navbar-currency-toggle"
              onClick={() => setCurrency(currency === 'USD' ? 'IQD' : 'USD')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all cursor-pointer micro-press"
              title="Switch Currency (USD / IQD)"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{currency === 'USD' ? '$ USD' : 'د.ع IQD'}</span>
            </button>

            {/* Language Switcher */}
            <button
              id="navbar-language-toggle"
              onClick={() => setLanguage(isArabic ? 'en' : 'ar')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all cursor-pointer micro-press"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isArabic ? 'English' : 'العربية'}</span>
            </button>

            {/* Shopping Bag / Cart */}
            <button
              id="navbar-cart-btn"
              onClick={() => setActiveModal('cart')}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer micro-press"
              title={isArabic ? 'سلة الطلبات' : 'Cart & Active Orders'}
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute 1 top-1 right-1 bg-[#335aff] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cart.length}
                </span>
              )}
            </button>

            {/* User Profile & Role Popover */}
            <div className="relative" ref={profileRef}>
              <button
                id="navbar-profile-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-white/[0.05] text-xs transition-all cursor-pointer micro-press border border-transparent hover:border-white/10"
                aria-expanded={isProfileOpen}
              >
                {currentUser ? (
                  <>
                    <img
                      src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover border border-white/20"
                    />
                    <span className="text-xs font-semibold text-slate-200 hidden sm:inline truncate max-w-[80px]">
                      {currentUser.name.split(' ')[0]}
                    </span>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-300 hover:text-white">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold hidden sm:inline">
                      {isArabic ? 'حسابي' : 'Sign In'}
                    </span>
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isProfileOpen && (
                <div
                  className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-72 rounded-2xl bg-[#0e1424] border border-white/10 shadow-2xl shadow-black/80 z-50 p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-150"
                  dir={isArabic ? 'rtl' : 'ltr'}
                >
                  {currentUser ? (
                    <>
                      <div className="p-3 border-b border-white/[0.07]">
                        <div className="font-bold text-white text-xs truncate">{currentUser.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                        <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/25">
                          {currentUser.role}
                        </span>
                      </div>

                      {/* Role Switching */}
                      <div className="py-1 border-b border-white/[0.07] space-y-1">
                        <button
                          onClick={() => {
                            setRole('customer');
                            setIsProfileOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left rtl:text-right transition-colors cursor-pointer ${
                            role === 'customer'
                              ? 'bg-blue-600/15 text-blue-400 font-bold'
                              : 'text-slate-300 hover:bg-white/[0.04]'
                          }`}
                        >
                          <Car className="w-4 h-4 text-emerald-400" />
                          <span>{isArabic ? 'سوق المشتري' : 'Buyer Marketplace'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setRole('workshop');
                            setIsProfileOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left rtl:text-right transition-colors cursor-pointer ${
                            role === 'workshop'
                              ? 'bg-blue-600/15 text-blue-400 font-bold'
                              : 'text-slate-300 hover:bg-white/[0.04]'
                          }`}
                        >
                          <Layers className="w-4 h-4 text-blue-400" />
                          <span>{isArabic ? 'بوابة الورش ومراكز الصيانة' : 'Workshop & Garage Portal'}</span>
                        </button>

                        {(currentUser.role === 'supplier' || currentUser.role === 'admin') && (
                          <button
                            onClick={() => {
                              setRole('supplier');
                              setIsProfileOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left rtl:text-right transition-colors cursor-pointer ${
                              role === 'supplier'
                                ? 'bg-blue-600/15 text-blue-400 font-bold'
                                : 'text-slate-300 hover:bg-white/[0.04]'
                            }`}
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-400" />
                            <span>{isArabic ? 'بوابة الوكلاء والتوريد' : 'Dealer Business Portal'}</span>
                          </button>
                        )}

                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => {
                              setRole('admin');
                              setIsProfileOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left rtl:text-right transition-colors cursor-pointer ${
                              role === 'admin'
                                ? 'bg-blue-600/15 text-blue-400 font-bold'
                                : 'text-slate-300 hover:bg-white/[0.04]'
                            }`}
                          >
                            <Shield className="w-4 h-4 text-indigo-400" />
                            <span>{isArabic ? 'لوحة تحكم المنصة' : 'Platform Administration'}</span>
                          </button>
                        )}
                      </div>

                      {/* Security and Logout */}
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsSessionsModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-slate-400" />
                        <span>{isArabic ? 'الأمان والجلسات' : 'Security & Active Sessions'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{isArabic ? 'تسجيل الخروج' : 'Sign Out'}</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-2 space-y-2">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          openAuthModal('customer', 'signin');
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#335aff] hover:bg-[#2647e6] text-white font-bold text-xs cursor-pointer text-center transition-colors shadow-md"
                      >
                        {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          openAuthModal('customer', 'signup');
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 font-semibold text-xs border border-white/10 cursor-pointer text-center transition-colors"
                      >
                        {isArabic ? 'إنشاء حساب جديد' : 'Create Account'}
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          openAuthModal('supplier', 'signup');
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/20 cursor-pointer text-center transition-colors"
                      >
                        {isArabic ? 'تسجيل كوكيل / مورد' : 'Dealer Registration'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Active Sessions Modal */}
      <ActiveSessionsModal
        isOpen={isSessionsModalOpen}
        onClose={() => setIsSessionsModalOpen(false)}
      />
    </>
  );
};
