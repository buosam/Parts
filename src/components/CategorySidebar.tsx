import React, { useState } from "react";
import { useLang } from "@/i18n";
import { ChevronDown, ChevronRight, X, Check, Filter } from "lucide-react";
import { CatalogFilters, Availability } from "@/sections/CatalogSection";
import { CategoryKey } from "@/data/parts";

interface CategoryTreeItem {
  id: string;
  key?: CategoryKey;
  labelEn: string;
  labelAr: string;
  subcategories?: { id: string; labelEn: string; labelAr: string }[];
}

const CATEGORY_TREE: CategoryTreeItem[] = [
  {
    id: "engine",
    key: "engine",
    labelEn: "Engine Parts",
    labelAr: "قطع المحرك",
    subcategories: [
      { id: "pistons", labelEn: "Pistons", labelAr: "المكابس (الـبستن)" },
      { id: "timing", labelEn: "Timing Components", labelAr: "مكونات التوقيت" },
      { id: "gaskets", labelEn: "Gaskets", labelAr: "كاسكيتات وجه المحرك" },
      { id: "bearings", labelEn: "Bearings", labelAr: "البوشات والبيرنغات" },
      { id: "belts", labelEn: "Belts", labelAr: "قايشات وسيور" },
    ],
  },
  {
    id: "brakes",
    key: "brakes",
    labelEn: "Brake System",
    labelAr: "نظام الفرامل",
    subcategories: [
      { id: "brake_pads", labelEn: "Brake Pads", labelAr: "فحمات البريك (دسك)" },
      { id: "brake_rotors", labelEn: "Brake Rotors", labelAr: "قماشات ودسكات" },
      { id: "calipers", labelEn: "Calipers", labelAr: "كاليبرات البريك" },
    ],
  },
  {
    id: "suspension",
    key: "suspension",
    labelEn: "Suspension",
    labelAr: "نظام التعليق والدبلات",
    subcategories: [
      { id: "shocks", labelEn: "Shocks", labelAr: "دبلات هيدروليك وغاز" },
      { id: "control_arms", labelEn: "Control Arms", labelAr: "دبّلات ومقصات" },
      { id: "bushings", labelEn: "Bushings", labelAr: "بوشات التعليق" },
    ],
  },
  {
    id: "electrical",
    labelEn: "Electrical",
    labelAr: "المنظومة الكهربائية",
    subcategories: [
      { id: "batteries", labelEn: "Batteries", labelAr: "البطاريات" },
      { id: "alternators", labelEn: "Alternators", labelAr: "دينامو الشحن" },
      { id: "starters", labelEn: "Starters", labelAr: "سلف التشغيل" },
    ],
  },
  {
    id: "filters",
    key: "filters",
    labelEn: "Filters",
    labelAr: "الفلاتر والمرشحات",
    subcategories: [
      { id: "oil_filters", labelEn: "Oil Filters", labelAr: "فلتر زيت المحرك" },
      { id: "air_filters", labelEn: "Air Filters", labelAr: "فلتر الهواء" },
      { id: "fuel_filters", labelEn: "Fuel Filters", labelAr: "فلتر البنزين" },
    ],
  },
  {
    id: "cooling",
    key: "cooling",
    labelEn: "Cooling System",
    labelAr: "نظام التبريد والرديتر",
  },
  {
    id: "transmission",
    labelEn: "Transmission",
    labelAr: "ناقل الحركة (الجير)",
  },
  {
    id: "body",
    key: "body",
    labelEn: "Body Parts",
    labelAr: "أجزاء الهيكل والدعاميات",
  },
  {
    id: "tires_wheels",
    labelEn: "Tires & Wheels",
    labelAr: "الإطارات والعجلات",
  },
  {
    id: "accessories",
    labelEn: "Accessories",
    labelAr: "الإكسسوارات والكماليات",
  },
];

interface Props {
  filters: CatalogFilters;
  onFilters: (f: CatalogFilters) => void;
  selectedVehicle?: { make: string; model: string; year: string; engine: string };
  availableBrands: string[];
  onSelectSubcategory?: (sub: string) => void;
}

export default function CategorySidebar({
  filters,
  onFilters,
  selectedVehicle,
  availableBrands,
  onSelectSubcategory,
}: Props) {
  const { lang } = useLang();
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    engine: true,
    brakes: true,
    suspension: true,
    filters: true,
  });

  const [priceRange, setPriceRange] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCats((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const toggleCategoryFilter = (catKey?: CategoryKey) => {
    if (!catKey) return;
    const exists = filters.categories.includes(catKey);
    const updated = exists
      ? filters.categories.filter((c) => c !== catKey)
      : [...filters.categories, catKey];
    onFilters({ ...filters, categories: updated });
  };

  const toggleBrandFilter = (brandName: string) => {
    const exists = filters.brands.includes(brandName);
    const updated = exists
      ? filters.brands.filter((b) => b !== brandName)
      : [...filters.brands, brandName];
    onFilters({ ...filters, brands: updated });
  };

  return (
    <aside aria-label={lang === "ar" ? "تصفية الأقسام والقطع" : "Categories and filter navigation"} className="bg-surface rounded-lg border border-line p-4 space-y-6 text-sm text-ink">
      {/* Categories Header */}
      <div>
        <h2 className="font-bold text-base text-ink pb-2 border-b border-line flex items-center justify-between">
          <span>{lang === "ar" ? "الأقسام" : "Categories"}</span>
        </h2>

        <ul className="mt-3 space-y-1 text-xs sm:text-sm">
          {CATEGORY_TREE.map((cat) => {
            const isExpanded = !!expandedCats[cat.id];
            const isSelected = cat.key && filters.categories.includes(cat.key);

            return (
              <li key={cat.id} className="space-y-1">
                <div className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-sand transition-colors">
                  <button
                    onClick={() => {
                      if (cat.key) toggleCategoryFilter(cat.key);
                      else toggleCategoryExpand(cat.id);
                    }}
                    className={`flex-1 text-start font-medium transition-colors ${
                      isSelected ? "text-terra font-semibold" : "text-ink hover:text-terra"
                    }`}
                  >
                    {lang === "ar" ? cat.labelAr : cat.labelEn}
                  </button>

                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <button
                      onClick={() => toggleCategoryExpand(cat.id)}
                      className="p-1 text-ink-faint hover:text-ink transition-colors"
                      aria-label="Toggle subcategories"
                    >
                      {isExpanded ? (
                        <ChevronDown className="size-3.5" />
                      ) : (
                        <ChevronRight className="size-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Subcategories */}
                {cat.subcategories && isExpanded && (
                  <ul className="ms-4 border-s-2 border-line/60 ps-2 space-y-1 text-xs text-ink-soft">
                    {cat.subcategories.map((sub) => (
                      <li key={sub.id}>
                        <button
                          onClick={() => {
                            if (cat.key && !filters.categories.includes(cat.key)) {
                              toggleCategoryFilter(cat.key);
                            }
                            if (onSelectSubcategory) onSelectSubcategory(sub.id);
                          }}
                          className="w-full text-start py-1 px-1.5 rounded hover:bg-sand hover:text-ink transition-colors"
                        >
                          {lang === "ar" ? sub.labelAr : sub.labelEn}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Shopping Filters Divider */}
      <div className="pt-2 border-t border-line">
        <h3 className="font-bold text-sm text-ink mb-3 flex items-center gap-1.5">
          <Filter className="size-4 text-terra" />
          <span>{lang === "ar" ? "تصفية المنتجات" : "Shopping Filters"}</span>
        </h3>

        {/* Selected Vehicle Filter Summary */}
        {selectedVehicle && (
          <div className="mb-4 p-2.5 rounded bg-sand/60 border border-line text-xs">
            <span className="text-ink-faint block text-[10px] uppercase font-mono mb-0.5">
              {lang === "ar" ? "السيارة المختارة" : "Active Vehicle"}
            </span>
            <div className="font-semibold text-ink">
              {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
            </div>
            <div className="text-[11px] text-ink-soft">{selectedVehicle.engine}</div>
          </div>
        )}

        {/* Filter Accordions */}
        <div className="space-y-4 text-xs">
          {/* Brand Filter */}
          <div>
            <span className="font-semibold text-ink block mb-1.5">
              {lang === "ar" ? "الماركة / المصنّع" : "Brand"}
            </span>
            <div className="space-y-1 max-h-36 overflow-y-auto pe-1">
              {availableBrands.map((brand) => {
                const checked = filters.brands.includes(brand);
                return (
                  <label
                    key={brand}
                    className="flex items-center gap-2 text-ink-soft hover:text-ink cursor-pointer py-0.5"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleBrandFilter(brand)}
                      className="rounded border-line text-terra focus:ring-terra size-3.5"
                    />
                    <span>{brand}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div>
            <span className="font-semibold text-ink block mb-1.5">
              {lang === "ar" ? "حالة التوفر" : "Availability"}
            </span>
            <div className="space-y-1">
              {[
                { id: "all", labelEn: "All Items", labelAr: "الكل" },
                { id: "in", labelEn: "In Stock Today", labelAr: "متوفر بالمخزن" },
                { id: "demand", labelEn: "On Demand / Import", labelAr: "طلب خارجي" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2 text-ink-soft hover:text-ink cursor-pointer py-0.5"
                >
                  <input
                    type="radio"
                    name="availability"
                    checked={filters.availability === opt.id}
                    onChange={() => onFilters({ ...filters, availability: opt.id as Availability })}
                    className="text-terra focus:ring-terra size-3.5"
                  />
                  <span>{lang === "ar" ? opt.labelAr : opt.labelEn}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Condition Filter */}
          <div>
            <span className="font-semibold text-ink block mb-1.5">
              {lang === "ar" ? "الحالة" : "Condition"}
            </span>
            <div className="space-y-1">
              {[
                { id: "all", labelEn: "All Conditions", labelAr: "جميع الحالات" },
                { id: "new", labelEn: "Brand New (OEM / OES)", labelAr: "جديد أصلي" },
                { id: "refurbished", labelEn: "Certified Refurbished", labelAr: "مجدد معتمد" },
              ].map((cond) => (
                <label
                  key={cond.id}
                  className="flex items-center gap-2 text-ink-soft hover:text-ink cursor-pointer py-0.5"
                >
                  <input
                    type="radio"
                    name="condition"
                    checked={selectedCondition === cond.id}
                    onChange={() => setSelectedCondition(cond.id)}
                    className="text-terra focus:ring-terra size-3.5"
                  />
                  <span>{lang === "ar" ? cond.labelAr : cond.labelEn}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <span className="font-semibold text-ink block mb-1.5">
              {lang === "ar" ? "السعر" : "Price Range"}
            </span>
            <div className="space-y-1">
              {[
                { id: "all", labelEn: "Any Price", labelAr: "كل الأسعار" },
                { id: "under50", labelEn: "Under $50", labelAr: "أقل من $50" },
                { id: "50_150", labelEn: "$50 to $150", labelAr: "$50 إلى $150" },
                { id: "over150", labelEn: "Over $150", labelAr: "أكثر من $150" },
              ].map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 text-ink-soft hover:text-ink cursor-pointer py-0.5"
                >
                  <input
                    type="radio"
                    name="priceRange"
                    checked={priceRange === p.id}
                    onChange={() => setPriceRange(p.id)}
                    className="text-terra focus:ring-terra size-3.5"
                  />
                  <span>{lang === "ar" ? p.labelAr : p.labelEn}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
