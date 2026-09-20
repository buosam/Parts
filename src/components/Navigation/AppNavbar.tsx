/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket - Role-Conscious Clean Navigation System
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Car,
  Search,
  ShoppingBag,
  ShieldCheck,
  Globe,
  Coins,
  User,
  LogOut,
  Shield,
  Layers,
  Gavel,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ActiveSessionsModal } from '../Security/ActiveSessionsModal';

interface AppNavbarProps {
  onOpenSanawiaScan: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({ onOpenSanawiaScan }) => {
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
      <header className="sticky top-0 z-40 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/40">
        {/* Top Slim Trust Bar */}
        <div className="bg-black/50 text-slate-300 text-xs px-4 py-1.5 border-b border-white/5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-end gap-3">

            {/* Currency & Language Controls */}
            <div className="flex items-center gap-2">
              <button
                id="navbar-currency-toggle"
                onClick={() => setCurrency(currency === 'USD' ? 'IQD' : 'USD')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-amber-300 hover:text-amber-200 text-xs font-bold border border-amber-500/20 transition-all cursor-pointer"
                title="Switch Currency"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{currency === 'USD' ? '$ USD' : 'د.ع IQD'}</span>
              </button>

              <button
                id="navbar-language-toggle"
                onClick={() => setLanguage(isArabic ? 'en' : 'ar')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isArabic ? 'English' : 'العربية'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Nav Bar */}
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4">
          {/* Brand */}
          <div
            onClick={() => {
              setRole('customer');
              setSelectedCategory('All');
            }}
            className="cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-all border border-indigo-400/30">
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
                {isArabic ? 'سوق قطع الغيار وتكامل الوكلاء' : 'Genuine Spare Parts Marketplace'}
              </p>
            </div>
          </div>

          {/* Center: Active Vehicle Guaranteed Fitment Pill */}
          <div className="hidden lg:flex items-center">
            <button
              id="navbar-active-vehicle-pill"
              onClick={() => setActiveModal('vehicle_picker')}
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.08] transition-all text-left rtl:text-right group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 group-hover:scale-105 transition-transform">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span>{isArabic ? 'السيارة المحددة' : 'MY ACTIVE VEHICLE'}</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1 rounded">
                    ✓ FITMENT
                  </span>
                </div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  {activeVehicle ? (
                    <>
                      <span>{activeVehicle.make} {activeVehicle.model} {activeVehicle.year}</span>
                      <span className="text-[11px] text-slate-400 font-normal">({activeVehicle.engine})</span>
                    </>
                  ) : (
                    <span className="text-amber-300 font-semibold">
                      {isArabic ? 'حدد سيارتك لتأكيد التوافق' : 'Select vehicle to guarantee fit'}
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                </div>
              </div>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Sanawia AI Registration Recognition Trigger */}
            <button
              id="btn-scan-sanawia"
              onClick={onOpenSanawiaScan}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
              title="Recognize vehicle from registration document"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isArabic ? 'مسح السنوية (AI)' : 'Sanawia OCR'}</span>
            </button>

            {/* Quick Request a Part */}
            <button
              id="navbar-request-part-btn"
              onClick={() => setActiveModal('request_part')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Gavel className="w-4 h-4 text-indigo-200" />
              <span>{isArabic ? 'طلب قطعة' : 'Request Part'}</span>
            </button>

            {/* Cart Button */}
            <button
              id="navbar-cart-btn"
              onClick={() => setActiveModal('cart')}
              className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.04] text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {cart.length}
                </span>
              )}
            </button>

            {/* User Profile & Security Popover */}
            <div className="relative" ref={profileRef}>
              <button
                id="navbar-profile-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-500/40 text-xs transition-all cursor-pointer"
              >
                {currentUser ? (
                  <>
                    <img
                      src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-lg object-cover border border-indigo-400/40"
                    />
                    <span className="text-xs font-bold text-white hidden sm:inline truncate max-w-[90px]">
                      {currentUser.name.split(' ')[0]}
                    </span>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
                      {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                    </span>
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-72 rounded-2xl bg-[#0e1424] border border-white/10 shadow-2xl shadow-black/80 z-50 p-2 space-y-1">
                  {currentUser ? (
                    <>
                      <div className="p-3 border-b border-white/5">
                        <div className="font-bold text-white text-xs truncate">{currentUser.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                        <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {currentUser.role}
                        </span>
                      </div>

                      {/* Portal Links based on User Authorization */}
                      <div className="p-1 border-b border-white/5 space-y-1">
                        <button
                          onClick={() => {
                            setRole('customer');
                            setIsProfileOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left rtl:text-right transition-colors cursor-pointer ${
                            role === 'customer' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300 hover:bg-white/[0.04]'
                          }`}
                        >
                          <Car className="w-4 h-4 text-emerald-400" />
                          <span>{isArabic ? 'سوق المشتري' : 'Buyer Marketplace'}</span>
                        </button>

                        {(currentUser.role === 'supplier' || currentUser.role === 'admin') && (
                          <button
                            onClick={() => {
                              setRole('supplier');
                              setIsProfileOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left rtl:text-right transition-colors cursor-pointer ${
                              role === 'supplier' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300 hover:bg-white/[0.04]'
                            }`}
                          >
                            <Layers className="w-4 h-4 text-amber-400" />
                            <span>{isArabic ? 'بوابة الوكيل والمخزون' : 'Dealer Business Portal'}</span>
                          </button>
                        )}

                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => {
                              setRole('admin');
                              setIsProfileOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left rtl:text-right transition-colors cursor-pointer ${
                              role === 'admin' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300 hover:bg-white/[0.04]'
                            }`}
                          >
                            <ShieldCheck className="w-4 h-4 text-indigo-400" />
                            <span>{isArabic ? 'لوحة تحكم الإدارة' : 'Admin Console'}</span>
                          </button>
                        )}
                      </div>

                      {/* Security & Sessions Trigger */}
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsSessionsModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-indigo-400" />
                        <span>{isArabic ? 'الأمان والجلسات النشطة' : 'Active Sessions & Security'}</span>
                      </button>

                      {/* Logout */}
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
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
                        className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer text-center"
                      >
                        {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          openAuthModal('customer', 'signup');
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-bold text-xs border border-white/10 cursor-pointer text-center"
                      >
                        {isArabic ? 'إنشاء حساب مشتري' : 'Register Buyer'}
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          openAuthModal('supplier', 'signup');
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 cursor-pointer text-center"
                      >
                        {isArabic ? 'تسجيل كوكيل / متجر' : 'Apply as Dealer'}
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
