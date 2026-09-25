/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { AppNavbar } from './components/Navigation/AppNavbar';
import { Logo } from './components/Logo';
import { PartlineConsole } from './components/Partline/PartlineConsole';
import { SanawiaDocOcrModal } from './components/Buyer/SanawiaDocOcrModal';
import { HomeHero } from './components/HomeHero';
import { SearchResults } from './components/SearchResults';
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
import { CarIdDepartmentBar } from './components/CarIdDepartmentBar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MasterPart } from './types';
import { ShieldCheck, Car, Phone, Mail, MapPin, Sparkles, Layers, Gavel, CheckCircle2, Zap, ArrowRight, Lock, AlertOctagon } from 'lucide-react';

const MarketplaceApp: React.FC = () => {
  const {
    role,
    language,
    selectedRequestForBid,
    setSelectedRequestForBid,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    currentUser,
    setRole,
    activeModal,
    setActiveModal,
  } = useMarketplace();

  const [selectedPart, setSelectedPart] = useState<MasterPart | null>(null);
  const [isSanawiaModalOpen, setIsSanawiaModalOpen] = useState(false);
  const [isPartlineConsoleOpen, setIsPartlineConsoleOpen] = useState(false);
  const isArabic = language === 'ar';

  const isBiddingView = selectedCategory === 'requests';

  // Global ⌘K / Ctrl+K listener
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

  if (isPartlineConsoleOpen) {
    return (
      <PartlineConsole
        onExitToMarketplace={() => setIsPartlineConsoleOpen(false)}
      />
    );
  }

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white"
    >
      {/* Role-Conscious Navigation Bar */}
      <AppNavbar
        onOpenSanawiaScan={() => setIsSanawiaModalOpen(true)}
        onOpenPartlineConsole={() => setIsPartlineConsoleOpen(true)}
      />

      {/* Main Role-Based Workspace */}
      <main className="flex-1 pb-24 md:pb-16">
        {role === 'customer' && (
          <div>
            <HomeHero />
            <CarIdDepartmentBar />
            {isBiddingView ? (
              <RequestsBoard />
            ) : (
              <SearchResults onSelectPart={(part) => setSelectedPart(part)} />
            )}
          </div>
        )}

        {role === 'workshop' && <WorkshopDashboard />}

        {/* Dealer Portal Boundary Guard */}
        {role === 'supplier' && (
          currentUser && currentUser.role !== 'supplier' && currentUser.role !== 'admin' ? (
            <div className="max-w-xl mx-auto my-16 p-8 bg-[#0e1424] rounded-3xl border border-red-500/30 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white">
                {isArabic ? 'غير مصرح: بوابة الوكلاء المعتمدين' : '403 Forbidden: Dealer Business Portal'}
              </h2>
              <p className="text-xs text-slate-400">
                {isArabic
                  ? 'حسابك الحالي مسجل كمشتري. للوصول لبوابة إدارة المخزون وتوريد القطع، يرجى تسجيل الدخول بحساب وكيل تجاري معتمد.'
                  : 'Your current session is a Buyer account. Authorized business credentials are required to access dealer inventory.'}
              </p>
              <button
                onClick={() => setRole('customer')}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
              >
                {isArabic ? 'العودة لسوق المشتري' : 'Return to Marketplace'}
              </button>
            </div>
          ) : (
            <SupplierPortal />
          )
        )}

        {/* Admin Console Boundary Guard */}
        {role === 'admin' && (
          currentUser?.role !== 'admin' ? (
            <div className="max-w-xl mx-auto my-16 p-8 bg-[#0e1424] rounded-3xl border border-red-500/30 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white">
                {isArabic ? '403 محظور: منطقة إدارية مقيدة' : '403 Forbidden: Restricted Administration'}
              </h2>
              <p className="text-xs text-slate-400">
                {isArabic
                  ? 'تم تسجيل محاولة وصول غير مصرح بها إلى مسارات الإدارة (/admin/*) وتوثيقها في سجل الأمان.'
                  : 'Unauthorized access attempt to /admin/* has been logged in the security audit trail.'}
              </p>
              <button
                onClick={() => setRole('customer')}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
              >
                {isArabic ? 'العودة للمنصة العامة' : 'Return to Public Marketplace'}
              </button>
            </div>
          ) : (
            <AdminDashboard />
          )
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (44px+ touch targets) */}
      <MobileBottomNav />

      {/* Global Modals */}
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

      {/* Sleek Minimalist Footer */}
      <footer className="bg-[#070a12] text-slate-400 border-t border-white/[0.08] text-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo
              variant="dark"
              size="sm"
              showBadge={true}
              showSubtitle={false}
              isArabic={isArabic}
            />
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400 text-xs hidden sm:inline">
              {isArabic ? 'سوق قطع الغيار المعتمد في العراق' : "Iraq's automotive spare-parts marketplace."}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-slate-500">
            <span>Baghdad</span>
            <span>•</span>
            <span>Erbil</span>
            <span>•</span>
            <span>Basra</span>
            <span>•</span>
            <span>Sulaymaniyah</span>
          </div>

          <div className="text-slate-500 text-[11px]">
            © 2026 IQAutoMarket
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <MarketplaceProvider>
      <MarketplaceApp />
    </MarketplaceProvider>
  );
};

export default App;
