/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Main Navigation Header - Clean Separation of Portals & Modern Auth Experience
 */

import React, { useEffect, useState, useRef } from "react";
import { useLang } from "@/i18n";
import { Logo } from "@/components/Logo";
import { CartIcon, SearchIcon } from "@/components/icons";
import {
  User,
  Package,
  Menu,
  Sparkles,
  ChevronDown,
  Store,
  Wrench,
  Shield,
  Crown,
  LogIn,
  LogOut,
  UserPlus,
  Car,
  Settings,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";

interface Props {
  query: string;
  onQuery: (q: string) => void;
  cartCount: number;
  userName?: string;
  role?: string;
  onOpenCart?: () => void;
  onOpenPartline?: () => void;
  onOpenAuth?: () => void;
  onOpenSanawiaScan?: () => void;
  onRoleChange?: (role: any) => void;
  onSelectBrandCategory?: (brandOrCategory: string) => void;
}

export default function SiteHeader({
  query,
  onQuery,
  cartCount,
  onOpenCart,
  onOpenPartline,
  onOpenAuth,
  onRoleChange,
  onSelectBrandCategory,
}: Props) {
  const { lang, toggle } = useLang();
  const {
    currentUser,
    logout,
    openAuthModal,
    role,
    setRole,
    setActiveModal,
    activeSubscription,
  } = useMarketplace();

  const isArabic = lang === "ar";
  const [scrolled, setScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Clean profile click
  const handleProfileClick = () => {
    openAuthModal(currentUser?.role || 'customer', 'profile');
  };

  const handleNavClick = (term: string) => {
    if (onSelectBrandCategory) {
      onSelectBrandCategory(term);
    } else {
      onQuery(term);
    }
  };

  const navItems = [
    { label: isArabic ? "قطع السيارات" : "Auto Parts", filter: "Auto Parts" },
    { label: "Toyota", filter: "Toyota" },
    { label: "Lexus", filter: "Lexus" },
    { label: "Nissan", filter: "Nissan" },
    { label: "Hyundai", filter: "Hyundai" },
    { label: "Kia", filter: "Kia" },
    { label: isArabic ? "سيارات أوروبية" : "European Cars", filter: "European" },
    { label: isArabic ? "شاحنات" : "Trucks", filter: "Trucks" },
    { label: isArabic ? "إكسسوارات" : "Accessories", filter: "Accessories" },
    { label: isArabic ? "العروض والتخفيضات" : "Deals", filter: "Deals" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-line shadow-xs" dir={isArabic ? "rtl" : "ltr"}>
      {/* Top Header Bar */}
      <div className="bg-[#121820] text-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 sm:gap-4 px-3 sm:px-6">
          {/* Logo */}
          <a href="#top" className="flex items-center gap-2 shrink-0 me-1 sm:me-2" aria-label="IQAutoMarket home">
            <Logo variant="light" size="md" showBadge={false} showSubtitle={false} isArabic={isArabic} />
          </a>

          {/* Search Bar - Amazon style */}
          <div className="flex-1 max-w-2xl mx-1 sm:mx-2">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center rounded-lg overflow-hidden bg-white text-ink focus-within:ring-2 focus-within:ring-terra"
            >
              <div className="relative flex-1 flex items-center">
                <SearchIcon className="pointer-events-none absolute start-3 size-4 text-ink-faint" />
                <input
                  id="site-search-input"
                  name="q"
                  type="text"
                  value={query}
                  onChange={(e) => onQuery(e.target.value)}
                  aria-label={
                    isArabic
                      ? "البحث عن قطع الغيار بالاسم أو رقم القطعة"
                      : "Search automotive parts by name, OEM, or VIN"
                  }
                  placeholder={
                    isArabic
                      ? "ابحث عن قطع الغيار بالاسم، رقم OEM، VIN، أو الموديل..."
                      : "Search by part name, OEM number, VIN, or vehicle..."
                  }
                  className="w-full h-9 sm:h-10 ps-9 pe-3 text-xs sm:text-sm text-ink placeholder:text-ink-faint bg-white outline-none"
                />
              </div>
              <button
                type="submit"
                aria-label={isArabic ? "تنفيذ البحث" : "Submit Search"}
                className="h-9 sm:h-10 px-3 sm:px-4 bg-terra hover:bg-terra-hover text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
              >
                <SearchIcon className="size-4" />
                <span className="hidden md:inline">{isArabic ? "بحث" : "Search"}</span>
              </button>
            </form>
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-xs shrink-0 ms-auto">
            {/* Partline AI Console Button */}
            {onOpenPartline && (
              <button
                onClick={onOpenPartline}
                aria-label="Open Partline AI Assistant (Shortcut Cmd+K)"
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors cursor-pointer"
                title="Partline AI (⌘K)"
              >
                <Sparkles className="size-3.5 text-terra" />
                <span>Partline AI</span>
                <span className="text-[10px] bg-white/20 px-1 rounded font-mono">⌘K</span>
              </button>
            )}

            {/* Subscriptions / Prime Button */}
            <button
              onClick={() => setActiveModal('subscription')}
              aria-label={isArabic ? "خطط الاشتراك وباقات العضوية" : "View Subscription Plans & Prime"}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <Crown className="size-3.5 text-amber-400" />
              <span>
                {activeSubscription && activeSubscription.priceUSD > 0
                  ? activeSubscription.tierName
                  : isArabic
                    ? "الاشتراكات"
                    : "Prime & Plans"}
              </span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggle}
              aria-label={lang === "en" ? "التبديل إلى اللغة العربية" : "Switch language to English"}
              className="px-2 py-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-xs font-semibold cursor-pointer"
            >
              {lang === "en" ? "العربية" : "EN"}
            </button>

            {/* SEPARATED AUTHENTICATION AREA - NO FLOATING DROPDOWN OVERLAYS */}
            {currentUser ? (
              /* User is Logged In: Direct Profile Button + Direct Sign Out */
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleProfileClick}
                  aria-label={isArabic ? "الملف الشخصي وإدارة الحساب" : "User Profile & Account Settings"}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-start transition-all cursor-pointer group"
                  title={isArabic ? "إدارة الحساب والملف الشخصي" : "Manage Account & Profile"}
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 group-hover:scale-105 transition-transform">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="hidden sm:block text-[11px] leading-tight max-w-[120px]">
                    <div className="font-bold text-white truncate">{currentUser.name}</div>
                    <div className="text-slate-400 text-[10px] capitalize truncate">
                      {currentUser.role === 'customer' ? (isArabic ? 'حساب مشتري' : 'Buyer') :
                       currentUser.role === 'workshop' ? (isArabic ? 'ورشة صيانة' : 'Workshop') :
                       currentUser.role === 'supplier' ? (isArabic ? 'تاجر قطع' : 'Dealer') : 'Admin'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => logout()}
                  aria-label={isArabic ? "تسجيل الخروج من الحساب" : "Sign Out"}
                  className="flex items-center justify-center p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-colors cursor-pointer"
                  title={isArabic ? "تسجيل الخروج" : "Sign Out"}
                >
                  <LogOut className="size-3.5" />
                </button>
              </div>
            ) : (
              /* User is NOT Logged In: Clean Sign In & Register Buttons */
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openAuthModal('customer', 'signin')}
                  aria-label={isArabic ? "تسجيل الدخول إلى حسابك" : "Sign In to your account"}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                  style={{ color: '#ffffff' }}
                >
                  <LogIn className="size-3.5 text-white" />
                  <span>{isArabic ? "تسجيل الدخول" : "Sign In"}</span>
                </button>

                <button
                  onClick={() => openAuthModal('customer', 'signup')}
                  aria-label={isArabic ? "إنشاء حساب مشتري أو ورشة جديد" : "Create a new IQAutoMarket account"}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="size-3.5 text-slate-300" />
                  <span>{isArabic ? "حساب جديد" : "Register"}</span>
                </button>
              </div>
            )}

            {/* Orders Quick Link */}
            <button
              onClick={() => onOpenCart?.()}
              aria-label={isArabic ? "عرض وتتبع الطلبات" : "View and Track Orders"}
              className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/10 text-start text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <Package className="size-4" />
              <div className="text-[11px] leading-tight">
                <div className="text-gray-400 text-[10px]">{isArabic ? "متابعة" : "Returns"}</div>
                <div className="font-semibold text-white">{isArabic ? "& الطلبات" : "& Orders"}</div>
              </div>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              aria-label={isArabic ? `عربة التسوق (${cartCount} عنصر)` : `Shopping Cart with ${cartCount} items`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition-colors relative cursor-pointer"
            >
              <div className="relative">
                <CartIcon className="size-5 text-terra" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -end-2 bg-terra text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline ms-1">{isArabic ? "السلة" : "Cart"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Second Navigation Bar - Clean Separation of B2B Portals & Categories */}
      <div className="bg-[#1c2430] text-gray-200 border-t border-gray-800 text-xs overflow-x-auto scrollbar-none">
        <div className="mx-auto flex h-10 max-w-7xl items-center px-3 sm:px-6 justify-between gap-2 whitespace-nowrap">
          {/* Left: Category Quick Links */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleNavClick("")}
              className="flex items-center gap-1.5 font-bold text-white px-2.5 py-1.5 rounded-lg hover:bg-white/10 me-1 transition-colors shrink-0 cursor-pointer"
            >
              <Menu className="size-4" />
              <span>{isArabic ? "جميع الأقسام" : "All Categories"}</span>
            </button>

            {navItems.slice(0, 6).map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleNavClick(item.filter)}
                className="px-2.5 py-1 rounded-lg hover:bg-white/10 hover:text-white transition-colors shrink-0 text-gray-300 font-medium cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right: Dedicated B2B Portals Switcher (Separated from user profile!) */}
          <div className="flex items-center gap-1 shrink-0 ps-2 border-s border-gray-700/60">
            {/* Buyer Marketplace Tab */}
            <button
              onClick={() => onRoleChange?.("customer")}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                role === "customer"
                  ? "bg-terra text-white shadow-xs"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Car className="size-3.5" />
              <span>{isArabic ? "سوق القطع" : "Marketplace"}</span>
            </button>

            {/* Workshop Dashboard Tab */}
            <button
              onClick={() => onRoleChange?.("workshop")}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                role === "workshop"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Wrench className="size-3.5" />
              <span>{isArabic ? "بوابة الورش" : "Workshops"}</span>
            </button>

            {/* Dealer Portal Tab */}
            <button
              onClick={() => onRoleChange?.("supplier")}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                role === "supplier"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Store className="size-3.5" />
              <span>{isArabic ? "بوابة الوكلاء" : "Dealers"}</span>
            </button>

            {/* Admin Console (if Admin role or testing) */}
            {(role === "admin" || currentUser?.role === "admin") && (
              <button
                onClick={() => onRoleChange?.("admin")}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  role === "admin"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Shield className="size-3.5" />
                <span>{isArabic ? "لوحة الإدارة" : "Admin"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
