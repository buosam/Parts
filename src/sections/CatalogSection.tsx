import React, { useMemo, useState } from "react";
import {
  CATEGORIES,
  PARTS,
  type CategoryKey,
  type Part,
  type Quality,
} from "@/data/parts";
import { useLang } from "@/i18n";
import PartCard from "@/components/PartCard";
import {
  CATEGORY_ICONS,
  CheckIcon,
  ChevronIcon,
  GridIcon,
  ListIcon,
  SlidersIcon,
  XIcon,
} from "@/components/icons";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type SortKey = "match" | "priceAsc" | "priceDesc" | "rating";
export type Availability = "all" | "in" | "demand";

export interface CatalogFilters {
  categories: CategoryKey[];
  qualities: Quality[];
  brands: string[];
  availability: Availability;
  fitsOnly: boolean;
}

export const EMPTY_FILTERS: CatalogFilters = {
  categories: [],
  qualities: [],
  brands: [],
  availability: "all",
  fitsOnly: true,
};

interface Props {
  parts: Part[];
  query: string;
  filters: CatalogFilters;
  onFilters: (f: CatalogFilters) => void;
  sort: SortKey;
  onSort: (s: SortKey) => void;
  view: "grid" | "list";
  onView: (v: "grid" | "list") => void;
  vehicleLabel: string;
  onOrder: (p: Part) => void;
}

const QUALITIES: { key: Quality; tKey: "genuine" | "oemSpec" | "aftermarket" }[] = [
  { key: "Genuine OEM", tKey: "genuine" },
  { key: "OEM Spec", tKey: "oemSpec" },
  { key: "Aftermarket", tKey: "aftermarket" },
];

export default function CatalogSection(props: Props) {
  const { filters, onFilters } = props;
  const { t, dir } = useLang();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // counts always reflect the full catalog, not the filtered result
  const brands = useMemo(
    () => Array.from(new Set(PARTS.map((p) => p.brand))).sort(),
    []
  );
  const countOf = useMemo(() => {
    const by = <K extends keyof Part>(k: K) =>
      PARTS.reduce<Record<string, number>>((acc, p) => {
        const key = String(p[k]);
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
    return { category: by("category"), quality: by("quality") };
  }, []);

  const activeCount =
    filters.categories.length +
    filters.qualities.length +
    filters.brands.length +
    (filters.availability !== "all" ? 1 : 0);

  const toggleIn = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const rail = (
    <div className="space-y-7">
      {/* Category */}
      <FilterGroup label={t("category")}>
        {CATEGORIES.map((c) => {
          const Icon = CATEGORY_ICONS[c.key];
          const checked = filters.categories.includes(c.key);
          const count = countOf.category[c.key] ?? 0;
          return (
            <CheckRow
              key={c.key}
              checked={checked}
              onToggle={() =>
                onFilters({ ...filters, categories: toggleIn(filters.categories, c.key) })
              }
            >
              <Icon className="size-4" />
              <span>{dir === "rtl" ? c.ar : c.en}</span>
              <span className="ms-auto font-mono text-[11px] text-ink-faint">{count}</span>
            </CheckRow>
          );
        })}
      </FilterGroup>

      {/* Quality */}
      <FilterGroup label={t("quality")}>
        {QUALITIES.map((q) => (
          <CheckRow
            key={q.key}
            checked={filters.qualities.includes(q.key)}
            onToggle={() =>
              onFilters({ ...filters, qualities: toggleIn(filters.qualities, q.key) })
            }
          >
            <span>{t(q.tKey)}</span>
            <span className="ms-auto font-mono text-[11px] text-ink-faint">
              {countOf.quality[q.key] ?? 0}
            </span>
          </CheckRow>
        ))}
      </FilterGroup>

      {/* Availability */}
      <FilterGroup label={t("availability")}>
        {(
          [
            ["all", t("allShort")],
            ["in", t("inStock")],
            ["demand", t("onDemand")],
          ] as [Availability, string][]
        ).map(([k, label]) => (
          <RadioRow
            key={k}
            checked={filters.availability === k}
            onSelect={() => onFilters({ ...filters, availability: k })}
            label={label}
          />
        ))}
      </FilterGroup>

      {/* Brand */}
      <FilterGroup label={t("brand")}>
        <div className="flex flex-wrap gap-1.5">
          {brands.map((b) => {
            const on = filters.brands.includes(b);
            return (
              <button
                key={b}
                onClick={() => onFilters({ ...filters, brands: toggleIn(filters.brands, b) })}
                className={`min-h-[36px] rounded-full border px-3 font-mono text-[11px] font-medium transition-colors ${
                  on
                    ? "border-terra bg-terra text-paper"
                    : "border-line bg-surface text-ink-soft hover:border-ink/30"
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {activeCount > 0 && (
        <button
          onClick={() => onFilters({ ...EMPTY_FILTERS, fitsOnly: filters.fitsOnly })}
          className="micro-label flex min-h-[44px] items-center gap-1.5 text-terra transition-colors hover:text-terra-hover"
        >
          <XIcon className="size-3.5" />
          {t("clearAll")} ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <section id="catalog" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
      {/* Section head */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="micro-label flex items-center gap-2 text-terra">
            <span className="inline-block size-1.5 rounded-full bg-terra" />
            {t("catalogEyebrow")}
          </p>
          <h2 className="mt-2 text-[clamp(26px,3.4vw,38px)] font-semibold tracking-[-0.03em]">
            {t("catalogTitle")}
          </h2>
        </div>
        <span className="font-mono text-xs text-ink-faint">
          {props.parts.length} {t("partsAvailable")}
        </span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* ── Filter rail (desktop) ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">{rail}</div>
        </aside>

        {/* ── Main column ── */}
        <div>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* mobile filters */}
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <button className="flex min-h-[44px] items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium lg:hidden">
                  <SlidersIcon className="size-4" />
                  {t("filters")}
                  {activeCount > 0 && (
                    <span className="grid min-w-5 place-items-center rounded-full bg-terra px-1 font-mono text-[10px] font-semibold text-paper">
                      {activeCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] overflow-y-auto bg-paper p-6">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-start text-lg font-semibold tracking-[-0.02em]">
                    {t("filters")}
                  </SheetTitle>
                </SheetHeader>
                {rail}
              </SheetContent>
            </Sheet>

            {/* fits toggle */}
            <button
              role="switch"
              aria-checked={filters.fitsOnly}
              onClick={() => onFilters({ ...filters, fitsOnly: !filters.fitsOnly })}
              className={`flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${
                filters.fitsOnly
                  ? "border-terra bg-terra-soft text-terra"
                  : "border-line bg-surface text-ink-soft hover:border-ink/30"
              }`}
            >
              <span
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  filters.fitsOnly ? "bg-terra" : "bg-line"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${
                    filters.fitsOnly ? "start-[18px]" : "start-0.5"
                  }`}
                />
              </span>
              {t("fitsOnly")}
            </button>

            <div className="ms-auto flex items-center gap-2.5">
              {/* sort */}
              <div className="relative">
                <select
                  value={props.sort}
                  onChange={(e) => props.onSort(e.target.value as SortKey)}
                  className="h-11 appearance-none rounded-full border border-line bg-surface ps-4 pe-9 text-sm font-medium outline-none transition focus:border-terra-line"
                  aria-label="Sort"
                >
                  <option value="match">{t("bestMatch")}</option>
                  <option value="priceAsc">{t("priceLow")}</option>
                  <option value="priceDesc">{t("priceHigh")}</option>
                  <option value="rating">{t("topRated")}</option>
                </select>
                <ChevronIcon className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
              </div>

              {/* view toggle */}
              <div className="hidden rounded-full border border-line bg-surface p-1 sm:flex">
                {(
                  [
                    ["grid", GridIcon, t("viewGrid")],
                    ["list", ListIcon, t("viewList")],
                  ] as const
                ).map(([v, Icon, label]) => (
                  <button
                    key={v}
                    onClick={() => props.onView(v)}
                    aria-label={label}
                    className={`grid min-h-[36px] min-w-[40px] place-items-center rounded-full transition-colors ${
                      props.view === v ? "bg-night text-paper" : "text-ink-faint hover:text-ink"
                    }`}
                  >
                    <Icon className="size-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result count + query echo */}
          <div className="mt-4 flex items-center gap-2 text-[13px] text-ink-soft">
            <span className="font-mono text-xs">{props.parts.length}</span>
            {t("partsAvailable")}
            {props.query && (
              <>
                <span className="text-ink-faint">·</span>
                {t("resultsFor")}{" "}
                <span className="font-mono text-xs text-terra">“{props.query}”</span>
              </>
            )}
          </div>

          {/* Cards */}
          {props.parts.length > 0 ? (
            <div
              className={
                props.view === "grid"
                  ? "mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                  : "mt-5 flex flex-col gap-3"
              }
            >
              {props.parts.map((p, i) => (
                <div
                  key={p.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                >
                  <PartCard
                    part={p}
                    view={props.view}
                    vehicleLabel={props.vehicleLabel}
                    onOrder={props.onOrder}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-sand text-ink-faint">
                <XIcon className="size-5" />
              </div>
              <p className="mt-4 font-semibold">{t("noResults")}</p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-soft">{t("noResultsD")}</p>
              <a
                href="#rfq"
                className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-terra px-5 text-sm font-semibold text-paper transition-colors hover:bg-terra-hover"
              >
                {t("rfqCta")}
              </a>
            </div>
          )}

          {/* fitment footnote */}
          <p className="mt-6 flex items-center gap-2 font-mono text-[11px] text-ink-faint">
            <CheckIcon className="size-3.5 text-forest" />
            VIN-VERIFIED FITMENT · 1GR-FE · AL-SINAK SYNC 04:00 GST
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── small rail primitives ─────────────────────────────────────── */
function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="micro-label mb-2.5 text-ink-faint">{label}</legend>
      <div className="space-y-1">{children}</div>
    </fieldset>
  );
}

function CheckRow({
  checked,
  onToggle,
  children,
}: {
  key?: React.Key;
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onToggle}
      role="checkbox"
      aria-checked={checked}
      className={`flex min-h-[40px] w-full items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors ${
        checked ? "bg-terra-soft font-medium text-terra" : "text-ink-soft hover:bg-sand"
      }`}
    >
      <span
        className={`grid size-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors ${
          checked ? "border-terra bg-terra text-paper" : "border-line bg-surface"
        }`}
      >
        {checked && <CheckIcon className="size-3" strokeWidth={2.4} />}
      </span>
      {children}
    </button>
  );
}

function RadioRow({
  checked,
  onSelect,
  label,
}: {
  key?: React.Key;
  checked: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onSelect}
      role="radio"
      aria-checked={checked}
      className={`flex min-h-[40px] w-full items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors ${
        checked ? "bg-terra-soft font-medium text-terra" : "text-ink-soft hover:bg-sand"
      }`}
    >
      <span
        className={`grid size-[18px] shrink-0 place-items-center rounded-full border transition-colors ${
          checked ? "border-terra" : "border-line bg-surface"
        }`}
      >
        {checked && <span className="size-2 rounded-full bg-terra" />}
      </span>
      {label}
    </button>
  );
}
