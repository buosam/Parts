import { useEffect, useState } from "react";
import { useLang } from "@/i18n";
import { CartIcon, LogoMark, SearchIcon } from "@/components/icons";

interface Props {
  query: string;
  onQuery: (q: string) => void;
  cartCount: number;
}

export default function SiteHeader({ query, onQuery, cartCount }: Props) {
  const { t, lang, toggle } = useLang();
  const [scrolled, setScrolled] = useState(false);

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
          <span className="grid size-9 place-items-center rounded-[10px] bg-terra text-paper">
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
            className="h-11 w-full rounded-full border border-line bg-surface ps-10 pe-4 text-sm text-ink shadow-xs outline-none transition placeholder:text-ink-faint focus:border-terra-line"
            aria-label={t("navSearch")}
          />
          <kbd className="micro-label pointer-events-none absolute end-3.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-sand px-1.5 py-0.5 text-[10px] text-ink-faint lg:block">
            OEM#
          </kbd>
        </div>

        {/* Actions */}
        <div className="ms-auto flex items-center gap-1.5 md:ms-0">
          <button
            onClick={toggle}
            className="micro-label flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-ink-soft transition-colors hover:bg-sand hover:text-ink"
          >
            {lang === "en" ? "العربية" : "EN"}
          </button>
          <button
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
          <button className="hidden min-h-[44px] items-center gap-2 rounded-full ps-1.5 pe-3 transition-colors hover:bg-sand sm:flex">
            <span className="grid size-8 place-items-center rounded-full bg-night font-mono text-[11px] font-semibold text-paper">
              AK
            </span>
            <span className="text-sm font-medium">Ahmed</span>
          </button>
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
