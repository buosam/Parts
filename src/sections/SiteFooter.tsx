import { useLang } from "@/i18n";
import { LogoMark } from "@/components/icons";

const COLS: string[][] = [
  ["Catalog", "Dealer quotes", "RFQ tender", "Fitment checker"],
  ["Sell on IQAutoMarket", "Merchant verification", "Warehouse sync", "Pricing"],
  ["Fitment guarantee", "Delivery & COD", "Returns", "Contact"],
];

export default function SiteFooter() {
  const { t, tlist } = useLang();
  return (
    <footer className="bg-night-deep text-paper">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-[10px] bg-terra text-paper">
                <LogoMark className="size-5" />
              </span>
              <span className="text-[15px] font-semibold">
                IQ<span className="text-terra">Auto</span>Market
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/55">
              {t("footerTag")}
            </p>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.08em] text-paper/35">
              {t("footerCities")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLS.map((col, i) => (
              <div key={i}>
                <div className="micro-label text-paper/40">{tlist("footerCols")[i]}</div>
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
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-paper/10 pt-6">
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
