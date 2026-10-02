import { useMemo, useState } from "react";
import { toast, Toaster } from "sonner";
import { DEFAULT_VEHICLE, PARTS, type Part, type Vehicle } from "@/data/parts";
import { useLang } from "@/i18n";
import SiteHeader from "@/sections/SiteHeader";
import HeroFitment from "@/sections/HeroFitment";
import TrustStrip from "@/sections/TrustStrip";
import CatalogSection, {
  EMPTY_FILTERS,
  type CatalogFilters,
  type SortKey,
} from "@/sections/CatalogSection";
import RfqBand from "@/sections/RfqBand";
import ScannerSection from "@/sections/ScannerSection";
import SiteFooter from "@/sections/SiteFooter";
import MobileTabBar from "@/sections/MobileTabBar";

export default function Home() {
  const { t } = useLang();
  const [vehicle, setVehicle] = useState<Vehicle>(DEFAULT_VEHICLE);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("match");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [cartCount, setCartCount] = useState(0);
  const [activeTab, setActiveTab] = useState("top");

  const parts = useMemo(() => {
    let list = PARTS.slice();

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.oem.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }
    if (filters.fitsOnly) list = list.filter((p) => p.fits);
    if (filters.categories.length)
      list = list.filter((p) => filters.categories.includes(p.category));
    if (filters.qualities.length)
      list = list.filter((p) => filters.qualities.includes(p.quality));
    if (filters.brands.length)
      list = list.filter((p) => filters.brands.includes(p.brand));
    if (filters.availability !== "all")
      list = list.filter((p) => p.stock === filters.availability);

    switch (sort) {
      case "priceAsc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort(
          (a, b) =>
            Number(b.fits) - Number(a.fits) ||
            (a.stock === "in" ? 0 : 1) - (b.stock === "in" ? 0 : 1) ||
            b.rating - a.rating
        );
    }
    return list;
  }, [query, filters, sort]);

  const order = (p: Part) => {
    setCartCount((c) => c + 1);
    toast.success(t("orderPlaced"), {
      description: `${p.oem} — ${p.name} ${t("orderPlacedD")}`,
    });
  };

  const navigate = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else if (id === "garage" || id === "account") {
      toast(id === "garage" ? "Garage" : "Account", {
        description: "Demo build — this section is not wired up yet.",
      });
    }
  };

  const vehicleLabel = vehicle.model;

  return (
    <div className="min-h-screen">
      <SiteHeader query={query} onQuery={setQuery} cartCount={cartCount} />

      <main className="pb-20 md:pb-0">
        <HeroFitment
          vehicle={vehicle}
          onVehicle={setVehicle}
          onScan={() => navigate("scanner")}
        />
        <TrustStrip />
        <CatalogSection
          parts={parts}
          query={query}
          filters={filters}
          onFilters={setFilters}
          sort={sort}
          onSort={setSort}
          view={view}
          onView={setView}
          vehicleLabel={vehicleLabel}
          onOrder={order}
        />
        <RfqBand />
        <div id="scanner" className="scroll-mt-16">
          <ScannerSection />
        </div>
      </main>

      <SiteFooter />
      <MobileTabBar active={activeTab} onNavigate={navigate} cartCount={cartCount} />
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}
