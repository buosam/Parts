/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { LangProvider, useLang } from './i18n';
import { toast, Toaster } from 'sonner';
import { DEFAULT_VEHICLE, PARTS, type Part, type Vehicle } from './data/parts';
import SiteHeader from './sections/SiteHeader';
import HeroFitment from './sections/HeroFitment';
import TrustStrip from './sections/TrustStrip';
import CatalogSection, {
  EMPTY_FILTERS,
  type CatalogFilters,
  type SortKey,
} from './sections/CatalogSection';
import RfqBand from './sections/RfqBand';
import ScannerSection from './sections/ScannerSection';
import SiteFooter from './sections/SiteFooter';
import MobileTabBar from './sections/MobileTabBar';

// Contextual Modals & Dashboards
import { PartlineConsole } from './components/Partline/PartlineConsole';
import { SanawiaDocOcrModal } from './components/Buyer/SanawiaDocOcrModal';
import { MasterPartDetailModal } from './components/MasterPartDetailModal';
import { VehicleSelectorModal } from './components/VehicleSelectorModal';
import { PhotoSearchModal } from './components/PhotoSearchModal';
import { QuoteUploadModal } from './components/QuoteUploadModal';
import { RequestPartModal } from './components/RequestPartModal';
import { RequestsBoard } from './components/RequestsBoard';
import { SubmitPartBidModal } from './components/SubmitPartBidModal';
import { WorkshopDashboard } from './components/WorkshopDashboard';
import { SupplierPortal } from './components/SupplierPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { CartModal } from './components/CartModal';
import { AuthModal } from './components/AuthModal';
import { SupplierStorefrontModal } from './components/SupplierStorefrontModal';
import { DealerReviewModal } from './components/DealerReviewModal';
import { MasterPart } from './types';
import { Lock, AlertOctagon } from 'lucide-react';

const MarketplaceApp: React.FC = () => {
  const {
    role,
    setRole,
    currentUser,
    cart,
    addToCart,
    activeModal,
    setActiveModal,
    openAuthModal,
    selectedRequestForBid,
    setSelectedRequestForBid,
    selectedCategory,
  } = useMarketplace();

  const { t, lang, dir } = useLang();
  const [vehicle, setVehicle] = useState<Vehicle>(DEFAULT_VEHICLE);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("match");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("top");

  const [selectedPart, setSelectedPart] = useState<MasterPart | null>(null);
  const [isSanawiaModalOpen, setIsSanawiaModalOpen] = useState(false);
  const [isPartlineConsoleOpen, setIsPartlineConsoleOpen] = useState(false);

  // Global ⌘K / Ctrl+K listener for Partline AI Console
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPartlineConsoleOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter & sort catalog parts
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

  const handleOrder = (p: Part) => {
    const yr = parseInt(vehicle.year, 10) || 2021;
    const mappedMasterPart: MasterPart = {
      id: p.id,
      partNumber: p.oem,
      partName: p.name,
      partNameAr: p.name,
      category: p.category as any,
      description: `${p.brand} Part. Fits ${vehicle.year} ${vehicle.make} ${vehicle.model}. Lead time: ${p.leadTime}.`,
      compatibleVehicles: [{
        make: vehicle.make,
        model: vehicle.model,
        yearStart: yr - 3,
        yearEnd: yr + 3,
        engine: vehicle.engine,
        trim: vehicle.trim,
      }],
      standardPriceUSD: p.price,
      averageMarketPriceIQD: p.price * 1500,
      offers: [{
        id: `off_${p.id}`,
        supplierId: 'sup_alsinak_01',
        supplierName: p.warehouse === 'Baghdad' ? 'Al-Sinak Central Hub' : `${p.warehouse} Auto District`,
        supplierRating: p.rating,
        verifiedInteractionsCount: 420,
        repeatPurchaseRate: 98,
        quality: p.quality === 'Genuine OEM' ? 'genuine' : p.quality === 'OEM Spec' ? 'oem' : 'aftermarket',
        brand: p.brand,
        priceUSD: p.price,
        priceIQD: p.price * 1500,
        stockStatus: p.stock === 'in' ? 'in_stock_today' : 'order_on_demand',
        stockQuantity: p.stock === 'in' ? 14 : 2,
        warranty: '12-Month Official Warranty',
        deliveryTime: p.leadTime,
        deliveryOptions: ['express_courier', 'pickup'],
        supplierCity: p.warehouse,
        supplierLocationDetail: `${p.warehouse} Central Wholesale Market`,
      }],
      rating: p.rating,
      reviewCount: 28,
      inStock: p.stock === 'in',
    };

    addToCart(mappedMasterPart, mappedMasterPart.offers[0], 1);

    toast.success(t("orderPlaced"), {
      description: `${p.oem} — ${p.name} ${t("orderPlacedD")}`,
      action: {
        label: t("cart"),
        onClick: () => setActiveModal('cart'),
      },
    });
  };

  const navigate = (id: string) => {
    setActiveTab(id);
    if (id === 'garage') {
      setActiveModal('vehicle_selector');
      return;
    }
    if (id === 'account') {
      openAuthModal();
      return;
    }
    if (id === 'offers') {
      const el = document.getElementById('rfq');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isPartlineConsoleOpen) {
    return (
      <PartlineConsole
        onExitToMarketplace={() => setIsPartlineConsoleOpen(false)}
      />
    );
  }

  const isBiddingView = selectedCategory === 'requests';
  const cartTotalCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div dir={dir} className="min-h-screen bg-paper text-ink font-sans flex flex-col selection:bg-terra selection:text-white">
      {/* Redesigned Site Header */}
      <SiteHeader
        query={query}
        onQuery={setQuery}
        cartCount={cartTotalCount}
        userName={currentUser?.name || "Ahmed"}
        role={role}
        onOpenCart={() => setActiveModal('cart')}
        onOpenPartline={() => setIsPartlineConsoleOpen(true)}
        onOpenAuth={() => openAuthModal()}
        onOpenSanawiaScan={() => setIsSanawiaModalOpen(true)}
        onRoleChange={setRole}
      />

      {/* Main Role-Based Content */}
      <main className="flex-1 pb-24 md:pb-0">
        {role === 'customer' && (
          <div>
            {isBiddingView ? (
              <div className="max-w-7xl mx-auto px-4 py-8">
                <RequestsBoard />
              </div>
            ) : (
              <>
                {/* Hero Fitment Module */}
                <HeroFitment
                  vehicle={vehicle}
                  onVehicle={setVehicle}
                  onScan={() => {
                    setIsSanawiaModalOpen(true);
                  }}
                />

                {/* Trust & Guarantee Strip */}
                <TrustStrip />

                {/* Live Redesigned Warehouse Catalog */}
                <CatalogSection
                  parts={parts}
                  query={query}
                  filters={filters}
                  onFilters={setFilters}
                  sort={sort}
                  onSort={setSort}
                  view={view}
                  onView={setView}
                  vehicleLabel={vehicle.model}
                  onOrder={handleOrder}
                />

                {/* RFQ Tender Band */}
                <RfqBand />

                {/* Sanawia OCR Scanner Section */}
                <div id="scanner" className="scroll-mt-16">
                  <ScannerSection />
                </div>
              </>
            )}
          </div>
        )}

        {/* Workshop Dashboard */}
        {role === 'workshop' && <WorkshopDashboard />}

        {/* Dealer / Supplier Portal */}
        {role === 'supplier' && (
          currentUser && currentUser.role !== 'supplier' && currentUser.role !== 'admin' ? (
            <div className="max-w-xl mx-auto my-16 p-8 bg-surface rounded-3xl border border-terra-line text-center space-y-4 shadow-card">
              <div className="w-16 h-16 rounded-2xl bg-terra-soft text-terra flex items-center justify-center mx-auto">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-ink">
                {lang === 'ar' ? 'غير مصرح: بوابة الوكلاء المعتمدين' : '403 Forbidden: Dealer Business Portal'}
              </h2>
              <p className="text-xs text-ink-soft">
                {lang === 'ar'
                  ? 'حسابك الحالي مسجل كمشتري. للوصول لبوابة إدارة المخزون وتوريد القطع، يرجى تسجيل الدخول بحساب وكيل تجاري معتمد.'
                  : 'Your current session is a Buyer account. Authorized business credentials are required to access dealer inventory.'}
              </p>
              <button
                onClick={() => setRole('customer')}
                className="px-6 py-2.5 rounded-full bg-terra hover:bg-terra-hover text-paper font-semibold text-xs transition-colors"
              >
                {lang === 'ar' ? 'العودة لسوق المشتري' : 'Return to Marketplace'}
              </button>
            </div>
          ) : (
            <SupplierPortal />
          )
        )}

        {/* Admin Console */}
        {role === 'admin' && (
          currentUser?.role !== 'admin' ? (
            <div className="max-w-xl mx-auto my-16 p-8 bg-surface rounded-3xl border border-terra-line text-center space-y-4 shadow-card">
              <div className="w-16 h-16 rounded-2xl bg-night text-paper flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-ink">
                {lang === 'ar' ? '403 محظور: منطقة إدارية مقيدة' : '403 Forbidden: Restricted Administration'}
              </h2>
              <p className="text-xs text-ink-soft">
                {lang === 'ar'
                  ? 'تم تسجيل محاولة وصول غير مصرح بها إلى مسارات الإدارة (/admin/*) وتوثيقها في سجل الأمان.'
                  : 'Unauthorized access attempt to /admin/* has been logged in the security audit trail.'}
              </p>
              <button
                onClick={() => setRole('customer')}
                className="px-6 py-2.5 rounded-full bg-terra hover:bg-terra-hover text-paper font-semibold text-xs transition-colors"
              >
                {lang === 'ar' ? 'العودة للمنصة العامة' : 'Return to Public Marketplace'}
              </button>
            </div>
          ) : (
            <AdminDashboard />
          )
        )}
      </main>

      {/* Redesigned Footer */}
      <SiteFooter />

      {/* Mobile Tab Bar */}
      <MobileTabBar active={activeTab} onNavigate={navigate} cartCount={cartTotalCount} />

      {/* Global Modals & Notifications */}
      <Toaster position="top-center" richColors closeButton />
      <MasterPartDetailModal part={selectedPart} onClose={() => setSelectedPart(null)} />
      <VehicleSelectorModal />
      <SanawiaDocOcrModal
        isOpen={isSanawiaModalOpen || activeModal === 'sanawia_ocr'}
        onClose={() => {
          setIsSanawiaModalOpen(false);
          setActiveModal(null);
        }}
      />
      <PhotoSearchModal />
      <QuoteUploadModal />
      <RequestPartModal />
      <CartModal />
      <AuthModal />
      <SupplierStorefrontModal />
      <DealerReviewModal />

      {/* Store Owner Bid Modal */}
      {selectedRequestForBid && (
        <SubmitPartBidModal
          request={selectedRequestForBid}
          onClose={() => setSelectedRequestForBid(null)}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LangProvider>
      <MarketplaceProvider>
        <MarketplaceApp />
      </MarketplaceProvider>
    </LangProvider>
  );
};

export default App;
