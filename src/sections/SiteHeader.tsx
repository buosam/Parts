import React, { useEffect, useState } from "react";
import { useLang } from "@/i18n";
import { Logo } from "@/components/Logo";
import { CartIcon, SearchIcon } from "@/components/icons";
import { User, Package, Menu, Sparkles, ChevronDown, Store, Wrench, Shield } from "lucide-react";

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
  userName = "Ahmed",
  role = "customer",
  onOpenCart,
  onOpenPartline,
  onOpenAuth,
  onRoleChange,
  onSelectBrandCategory,
}: Props) {
  const { lang, toggle } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (term: string) => {
    if (onSelectBrandCategory) {
      onSelectBrandCategory(term);
    } else {
      onQuery(term);
    }
  };

  const navItems = [
    { label: lang === "ar" ? "قطع السيارات" : "Auto Parts", filter: "Auto Parts" },
    { label: "Toyota", filter: "Toyota" },
    { label: "Lexus", filter: "Lexus" },
    { label: "Nissan", filter: "Nissan" },
    { label: "Hyundai", filter: "Hyundai" },
    { label: "Kia", filter: "Kia" },
    { label: lang === "ar" ? "سيارات أوروبية" : "European Cars", filter: "European" },
    { label: lang === "ar" ? "شاحنات" : "Trucks", filter: "Trucks" },
    { label: lang === "ar" ? "إكسسوارات" : "Accessories", filter: "Accessories" },
    { label: lang === "ar" ? "العروض والتخفيضات" : "Deals", filter: "Deals" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-line shadow-xs">
      {/* Top Header Bar */}
      <div className="bg-[#121820] text-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:px-6">
          {/* Logo */}
          <a href="#top" className="flex items-center gap-2 shrink-0 me-2" aria-label="IQAutoMarket home">
            <Logo variant="light" size="md" showBadge={false} showSubtitle={false} isArabic={lang === "ar"} />
          </a>

          {/* Search Bar - Amazon style */}
          <div className="flex-1 max-w-3xl mx-2">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center rounded-md overflow-hidden bg-white text-ink focus-within:ring-2 focus-within:ring-terra"
            >
              <div className="relative flex-1 flex items-center">
                <SearchIcon className="pointer-events-none absolute start-3 size-4 text-ink-faint" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => onQuery(e.target.value)}
                  placeholder={
                    lang === "ar"
                      ? "ابحث عن قطع الغيار بالاسم، الرقم المرجعي (OEM)، VIN، أو نوع السيارة..."
                      : "Search parts by name, part number, VIN, or vehicle..."
                  }
                  className="w-full h-10 ps-9 pe-3 text-xs sm:text-sm text-ink placeholder:text-ink-faint bg-white outline-none"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-4 bg-terra hover:bg-terra-hover text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors shrink-0"
              >
                <SearchIcon className="size-4" />
                <span className="hidden sm:inline">{lang === "ar" ? "بحث" : "Search"}</span>
              </button>
            </form>
          </div>

          {/* Right Header Navigation */}
          <div className="flex items-center gap-1 sm:gap-3 text-xs shrink-0 ms-auto">
            {/* Partline AI Console Button */}
            {onOpenPartline && (
              <button
                onClick={onOpenPartline}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                title="Partline AI (⌘K)"
              >
                <Sparkles className="size-3.5 text-terra" />
                <span>Partline AI</span>
                <span className="text-[10px] bg-white/20 px-1 rounded font-mono">⌘K</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={toggle}
              className="px-2 py-1.5 rounded hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-xs font-semibold"
            >
              {lang === "en" ? "العربية" : "EN"}
            </button>

            {/* Account / Sign In Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-white/10 text-start transition-colors"
              >
                <User className="size-4 text-gray-300" />
                <div className="hidden sm:block text-[11px] leading-tight">
                  <div className="text-gray-400 text-[10px]">{lang === "ar" ? "مرحباً،" : "Hello,"} {userName}</div>
                  <div className="font-semibold text-white flex items-center gap-0.5">
                    {lang === "ar" ? "الحساب والقوائم" : "Account & Orders"}
                    <ChevronDown className="size-3 text-gray-400" />
                  </div>
                </div>
              </button>

              {isAccountMenuOpen && (
                <div className="absolute end-0 mt-1 w-56 rounded-md border border-line bg-surface p-2 shadow-lift text-ink z-50">
                  <div className="px-3 py-2 border-b border-line">
                    <div className="text-xs font-semibold text-ink">{userName}</div>
                    <div className="text-[11px] text-ink-faint capitalize">{role} Account</div>
                  </div>
                  <div className="py-1">
                    {onRoleChange && (
                      <>
                        <button
                          onClick={() => {
                            onRoleChange("customer");
                            setIsAccountMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-start transition-colors ${
                            role === "customer" ? "bg-terra-soft text-terra" : "text-ink hover:bg-sand"
                          }`}
                        >
                          <User className="size-3.5" />
                          Buyer Marketplace
                        </button>
                        <button
                          onClick={() => {
                            onRoleChange("workshop");
                            setIsAccountMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-start transition-colors ${
                            role === "workshop" ? "bg-terra-soft text-terra" : "text-ink hover:bg-sand"
                          }`}
                        >
                          <Wrench className="size-3.5" />
                          Workshop Dashboard
                        </button>
                        <button
                          onClick={() => {
                            onRoleChange("supplier");
                            setIsAccountMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-start transition-colors ${
                            role === "supplier" ? "bg-terra-soft text-terra" : "text-ink hover:bg-sand"
                          }`}
                        >
                          <Store className="size-3.5" />
                          Supplier / Dealer Portal
                        </button>
                        <button
                          onClick={() => {
                            onRoleChange("admin");
                            setIsAccountMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-start transition-colors ${
                            role === "admin" ? "bg-terra-soft text-terra" : "text-ink hover:bg-sand"
                          }`}
                        >
                          <Shield className="size-3.5" />
                          Admin Console
                        </button>
                      </>
                    )}
                    {onOpenAuth && (
                      <button
                        onClick={() => {
                          onOpenAuth();
                          setIsAccountMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-start text-ink hover:bg-sand border-t border-line mt-1 pt-2"
                      >
                        {lang === "ar" ? "إدارة الحساب / تسجيل الدخول" : "Manage Account / Sign In"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Orders */}
            <button
              onClick={() => onOpenCart?.()}
              className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded hover:bg-white/10 text-start text-gray-300 hover:text-white transition-colors"
            >
              <Package className="size-4" />
              <div className="text-[11px] leading-tight">
                <div className="text-gray-400 text-[10px]">{lang === "ar" ? "متابعة" : "Returns"}</div>
                <div className="font-semibold text-white">{lang === "ar" ? "& الطلبات" : "& Orders"}</div>
              </div>
            </button>

            {/* Cart */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-white/10 text-white font-semibold text-xs transition-colors relative"
            >
              <div className="relative">
                <CartIcon className="size-5 text-terra" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -end-2 bg-terra text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline ms-1">{lang === "ar" ? "السلة" : "Cart"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Second Navigation Bar - Categories & Quick Links */}
      <div className="bg-[#1c2430] text-gray-200 border-t border-gray-800 text-xs overflow-x-auto scrollbar-none">
        <div className="mx-auto flex h-9 max-w-7xl items-center px-3 sm:px-6 gap-1 whitespace-nowrap">
          {/* All Categories Button */}
          <button
            onClick={() => handleNavClick("")}
            className="flex items-center gap-1.5 font-bold text-white px-2.5 py-1 rounded hover:bg-white/10 me-2 transition-colors shrink-0"
          >
            <Menu className="size-4" />
            <span>{lang === "ar" ? "جميع الأقسام" : "All Categories"}</span>
          </button>

          {/* Category/Brand Quick Links */}
          {navItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleNavClick(item.filter)}
              className="px-2.5 py-1 rounded hover:bg-white/10 hover:text-white transition-colors shrink-0 text-gray-300 font-medium"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
