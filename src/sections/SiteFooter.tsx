import React from "react";
import { useLang } from "@/i18n";
import { Logo } from "@/components/Logo";

const COLS: string[][] = [
  ["Catalog", "Dealer quotes", "RFQ tender", "Fitment checker"],
  ["Sell on IQAutoMarket", "Merchant verification", "Warehouse sync", "Pricing"],
  ["Fitment guarantee", "Delivery & COD", "Returns", "Contact"],
];

export default function SiteFooter() {
  const { t, tlist, lang } = useLang();
  return (
    <footer className="w-full max-w-full bg-night-deep text-paper overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14 sm:px-6 w-full">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1.2fr_2fr] w-full">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo variant="dark" size="md" showBadge={true} showSubtitle={false} isArabic={lang === "ar"} />
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/55">
              {t("footerTag")}
            </p>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.08em] text-paper/35">
              {t("footerCities")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 w-full min-w-0">
            {COLS.map((col, i) => (
              <div key={i} className="min-w-0">
                <div className="micro-label text-paper/40 truncate">{tlist("footerCols")[i]}</div>
                <ul className="mt-3.5 space-y-2.5">
                  {col.map((l) => (
                    <li key={l}>
                      <a
                        href="#top"
                        className="inline-flex min-h-[32px] items-center text-sm text-paper/65 transition-colors hover:text-paper"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-paper/10 pt-6">
          <span className="font-mono text-[11px] text-paper/40">
            © 2026 IQAutoMarket — Baghdad, Iraq
          </span>
          <span className="font-mono text-[11px] text-paper/40">
            VIN-VERIFIED · COD · AL-SINAK SYNC
          </span>
        </div>
      </div>
    </footer>
  );
}
