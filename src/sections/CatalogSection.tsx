import React, { useMemo, useState } from "react";
import { PARTS, type Part, type Vehicle } from "@/data/parts";
import { useLang } from "@/i18n";
import PartCard from "@/components/PartCard";
import CategorySidebar from "@/components/CategorySidebar";
import CompactVehicleSelector from "@/components/CompactVehicleSelector";
import { GridIcon, ListIcon, SlidersIcon, ChevronIcon } from "@/components/icons";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChevronRight, Home, Filter } from "lucide-react";

export type SortKey = "match" | "priceAsc" | "priceDesc" | "rating";
export type Availability = "all" | "in" | "demand";

export interface CatalogFilters {
  categories: any[];
  qualities: any[];
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
  vehicle: Vehicle;
  onVehicleChange: (v: Vehicle) => void;
  onOrder: (p: Part) => void;
  onSelectPart?: (p: Part) => void;
}

export default function CatalogSection(props: Props) {
  const { filters, onFilters, vehicle, onVehicleChange } = props;
  const { lang } = useLang();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const availableBrands = useMemo(
    () => Array.from(new Set(PARTS.map((p) => p.brand))).sort(),
    []
  );

  const activeFilterCount =
    filters.categories.length +
    filters.qualities.length +
    filters.brands.length +
    (filters.availability !== "all" ? 1 : 0);

  return (
    <section id="catalog" className="mx-auto max-w-7xl px-3 sm:px-6 py-6">
      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-ink-soft flex items-center gap-1.5 flex-wrap">
        <a href="#top" className="hover:text-terra flex items-center gap-1">
          <Home className="size-3.5" />
          <span>{lang === "ar" ? "الرئيسية" : "Home"}</span>
        </a>
        <ChevronRight className="size-3 text-ink-faint rtl:rotate-180" />
        <span className="hover:text-terra cursor-pointer">
          {lang === "ar" ? "قطع السيارات" : "Auto Parts"}
        </span>
        <ChevronRight className="size-3 text-ink-faint rtl:rotate-180" />
        <span className="font-semibold text-ink">
          {vehicle.make} {vehicle.model} ({vehicle.year})
        </span>
      </nav>

      {/* Main Grid Layout: Left Sidebar + Main Shopping Area */}
      <div className="grid gap-6 lg:grid-cols-[260px_1fr] items-start">
        {/* Left Category & Filter Sidebar (Desktop) */}
        <div className="hidden lg:block sticky top-20">
          <CategorySidebar
            filters={filters}
            onFilters={onFilters}
            selectedVehicle={vehicle}
            availableBrands={availableBrands}
          />
        </div>

        {/* Main Shopping Area */}
        <div className="min-w-0">
          {/* Compact Vehicle Selector */}
          <CompactVehicleSelector
            vehicle={vehicle}
            onVehicleChange={onVehicleChange}
          />

          {/* Results Toolbar Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line mb-4">
            {/* Mobile Filter Sheet Trigger */}
            <div className="lg:hidden">
              <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetTrigger asChild>
                  <button className="flex h-9 items-center gap-2 rounded border border-line bg-surface px-3 text-xs font-semibold text-ink">
                    <Filter className="size-3.5 text-terra" />
                    <span>{lang === "ar" ? "التصفية والأقسام" : "Categories & Filters"}</span>
                    {activeFilterCount > 0 && (
                      <span className="grid min-w-4 place-items-center rounded-full bg-terra px-1 text-[10px] text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto bg-surface p-4">
                  <SheetHeader className="mb-4">
                    <SheetTitle className="text-start text-base font-bold">
                      {lang === "ar" ? "تصفية الأقسام والقطع" : "Categories & Filters"}
                    </SheetTitle>
                  </SheetHeader>
                  <CategorySidebar
                    filters={filters}
                    onFilters={onFilters}
                    selectedVehicle={vehicle}
                    availableBrands={availableBrands}
                  />
                </SheetContent>
              </Sheet>
            </div>

            {/* Results Counter */}
            <div className="text-xs text-ink-soft">
              <span className="font-bold text-ink text-sm sm:text-base font-mono me-1">
                {props.parts.length}
              </span>
              <span>{lang === "ar" ? "قطعة متوفرة" : "results"}</span>
              {props.query && (
                <span className="ms-1.5 text-terra font-mono">
                  "{props.query}"
                </span>
              )}
            </div>

            {/* Sort & Grid/List View Controls */}
            <div className="flex items-center gap-2 ms-auto">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={props.sort}
                  onChange={(e) => props.onSort(e.target.value as SortKey)}
                  className="h-9 appearance-none rounded border border-line bg-surface ps-3 pe-8 text-xs font-semibold text-ink outline-none focus:ring-1 focus:ring-terra"
                  aria-label="Sort products"
                >
                  <option value="match">{lang === "ar" ? "الأكثر ملاءمة" : "Sort by: Relevance"}</option>
                  <option value="priceAsc">{lang === "ar" ? "السعر: من الأقل للأعلى" : "Sort by: Price (Low to High)"}</option>
                  <option value="priceDesc">{lang === "ar" ? "السعر: من الأعلى للأقل" : "Sort by: Price (High to Low)"}</option>
                  <option value="rating">{lang === "ar" ? "أعلى تقييم" : "Sort by: Top Rated"}</option>
                </select>
                <ChevronIcon className="pointer-events-none absolute end-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" />
              </div>

              {/* Grid/List View Toggle */}
              <div className="flex items-center rounded border border-line bg-surface p-0.5">
                <button
                  onClick={() => props.onView("grid")}
                  aria-label="Grid view"
                  className={`p-1.5 rounded transition-colors ${
                    props.view === "grid" ? "bg-night text-white" : "text-ink-faint hover:text-ink"
                  }`}
                >
                  <GridIcon className="size-4" />
                </button>
                <button
                  onClick={() => props.onView("list")}
                  aria-label="List view"
                  className={`p-1.5 rounded transition-colors ${
                    props.view === "list" ? "bg-night text-white" : "text-ink-faint hover:text-ink"
                  }`}
                >
                  <ListIcon className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid (4-columns on desktop) */}
          {props.parts.length > 0 ? (
            <div
              className={
                props.view === "grid"
                  ? "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col gap-3"
              }
            >
              {props.parts.map((p) => (
                <PartCard
                  key={p.id}
                  part={p}
                  view={props.view}
                  vehicleLabel={props.vehicleLabel}
                  onOrder={props.onOrder}
                  onSelectPart={props.onSelectPart}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-line bg-surface p-12 text-center my-6">
              <p className="font-bold text-base text-ink">
                {lang === "ar" ? "لم نجد قطع غيار مطابقة للبحث" : "No matching parts found"}
              </p>
              <p className="text-xs text-ink-soft mt-1 max-w-md mx-auto">
                {lang === "ar"
                  ? "تأكد من كتابة اسم القطعة بشكل صحيح أو جرب تغيير تصفية الماركات والبحث."
                  : "Try adjusting your vehicle selection, search terms, or category filters."}
              </p>
              <button
                onClick={() => onFilters(EMPTY_FILTERS)}
                className="mt-4 px-4 py-2 bg-terra text-white font-semibold text-xs rounded hover:bg-terra-hover transition-colors"
              >
                {lang === "ar" ? "إعادة ضبط الفلاتر" : "Reset All Filters"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
