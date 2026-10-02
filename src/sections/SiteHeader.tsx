import React, { useEffect, useState } from "react";
import { useLang } from "@/i18n";
import { CartIcon, LogoMark, SearchIcon } from "@/components/icons";
import { Sparkles, User, Shield, Wrench, Store } from "lucide-react";

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
}: Props) {
  const { t, lang, toggle } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-paper/85 backdrop-blur-[14px] backdrop-saturate-150 transition-[border-color,box-shadow] duration-300 ${
        scrolled ? "border-line shadow-[0_1px_0_rgb(38_34_25/0.02)]" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-5 sm:px-6">
        {/* Brand */}
        <a href="#top" className="flex min-h-[44px] items-center gap-2.5" aria-label="IQAutoMarket home">
          <span className="grid size-9 place-items-center rounded-[10px] bg-terra text-paper shadow-sm">
            <LogoMark className="size-5" />
          </span>
          <span className="leading-none">
            <span className="block text-[15px] font-semibold tracking-[-0.01em]">
              IQ<span className="text-terra">Auto</span>Market
            </span>
            <span className="micro-label mt-1 block text-ink-faint">IRQ · EST. 2026</span>
          </span>
        </a>

        {/* Search — center on desktop */}
        <div className="relative mx-auto hidden w-full max-w-xl md:block">
          <SearchIcon className="pointer-events-none absolute start-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-11 w-full rounded-full border border-line bg-surface ps-10 pe-16 text-sm text-ink shadow-xs outline-none transition placeholder:text-ink-faint focus:border-terra-line"
            aria-label={t("navSearch")}
          />
          <kbd className="micro-label pointer-events-none absolute end-3.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-sand px-1.5 py-0.5 text-[10px] text-ink-faint lg:block">
            OEM#
          </kbd>
        </div>

        {/* Actions */}
        <div className="ms-auto flex items-center gap-1.5 md:ms-0">
          {/* Partline AI button */}
          {onOpenPartline && (
            <button
              onClick={onOpenPartline}
              className="flex min-h-[40px] items-center gap-1.5 rounded-full border border-terra/20 bg-terra-soft/60 px-3 text-xs font-semibold text-terra transition-colors hover:bg-terra-soft"
              title="Partline AI Console (⌘K)"
            >
              <Sparkles className="size-3.5" />
              <span className="hidden sm:inline">Partline AI</span>
              <span className="hidden rounded bg-terra/10 px-1 py-0.5 text-[9px] font-mono lg:inline">⌘K</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={toggle}
            className="micro-label flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-ink-soft transition-colors hover:bg-sand hover:text-ink"
            aria-label="Toggle language"
          >
            {lang === "en" ? "العربية" : "EN"}
          </button>

          {/* Cart */}
          <button
            onClick={onOpenCart}
            className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sand hover:text-ink"
            aria-label={t("cart")}
          >
            <CartIcon className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -end-0.5 grid min-w-5 place-items-center rounded-full bg-terra px-1 py-0.5 font-mono text-[10px] font-semibold leading-none text-paper">
                {cartCount}
              </span>
            )}
          </button>

          {/* Account Profile / Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex min-h-[44px] items-center gap-2 rounded-full ps-1.5 pe-3 transition-colors hover:bg-sand"
            >
              <span className="grid size-8 place-items-center rounded-full bg-night font-mono text-[11px] font-semibold text-paper">
                {userName.substring(0, 2).toUpperCase()}
              </span>
              <span className="hidden text-sm font-medium sm:inline">{userName}</span>
            </button>

            {isMenuOpen && (
              <div className="absolute end-0 mt-2 w-56 rounded-2xl border border-line bg-surface p-2 shadow-lift animate-fade-up z-50">
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
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-start transition-colors ${
                          role === "customer" ? "bg-terra-soft text-terra" : "text-ink hover:bg-sand"
                        }`}
                      >
                        <User className="size-3.5" />
                        Buyer Marketplace
                      </button>
                      <button
                        onClick={() => {
                          onRoleChange("workshop");
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-start transition-colors ${
                          role === "workshop" ? "bg-terra-soft text-terra" : "text-ink hover:bg-sand"
                        }`}
                      >
                        <Wrench className="size-3.5" />
                        Workshop Dashboard
                      </button>
                      <button
                        onClick={() => {
                          onRoleChange("supplier");
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-start transition-colors ${
                          role === "supplier" ? "bg-terra-soft text-terra" : "text-ink hover:bg-sand"
                        }`}
                      >
                        <Store className="size-3.5" />
                        Supplier / Dealer Portal
                      </button>
                      <button
                        onClick={() => {
                          onRoleChange("admin");
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-start transition-colors ${
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
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-start text-ink hover:bg-sand border-t border-line mt-1 pt-2"
                    >
                      Manage Account / Sign In
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search row */}
      <div className="border-t border-line/70 px-4 pb-3 pt-2.5 md:hidden">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute start-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-11 w-full rounded-full border border-line bg-surface ps-10 pe-4 text-sm outline-none placeholder:text-ink-faint focus:border-terra-line"
            aria-label={t("navSearch")}
          />
        </div>
      </div>
    </header>
  );
}
