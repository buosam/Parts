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

            {/* Buyer Mode View Switcher Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-1.5 bg-[#0e1424] border border-white/[0.08] rounded-2xl shadow-sm">
                <div className="flex items-center gap-1.5 w-full sm:w-auto p-0.5 bg-black/30 rounded-xl">
                  <button
                    id="buyer-tab-catalog"
                    type="button"
                    onClick={() => {
                      if (selectedCategory === 'requests') {
                        setSelectedCategory('All');
                      }
                    }}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer micro-press ${
                      !isBiddingView
                        ? 'bg-[#335aff] text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>{isArabic ? 'كتالوج قطع الغيار' : 'Browse Parts Catalog'}</span>
                  </button>

                  <button
                    id="buyer-tab-bidding"
                    type="button"
                    onClick={() => setSelectedCategory('requests')}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer micro-press ${
                      isBiddingView
                        ? 'bg-[#335aff] text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Gavel className="w-4 h-4" />
                    <span>{isArabic ? 'طلبات وعروض الأسعار' : 'Dealer Quotes & RFQ'}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                  </button>
                </div>

                <div className="hidden lg:flex items-center gap-3 pr-2 rtl:pr-0 rtl:pl-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      {isArabic
                        ? 'مخزون حقيقي متزامن مع وكلاء بغداد وأربيل والبصرة'
                        : 'Live inventory synced across verified Iraqi dealers'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Active Customer View */}
            {isBiddingView ? (
              <RequestsBoard />
            ) : (
              <>
                {/* Automotive Departments Filter Bar */}
                <CarIdDepartmentBar />
                <SearchResults onSelectPart={(part) => setSelectedPart(part)} />
              </>
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

      {/* Sleek Footer */}
      <footer className="bg-[#070a12] text-slate-300 border-t border-white/10 text-xs py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-3.5">
              <Logo
                variant="dark"
                size="sm"
                showBadge={true}
                showSubtitle={false}
                isArabic={isArabic}
              />
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {isArabic
                ? 'سوق قطع الغيار المعتمد في العراق. ربط مباشر بين المشترين والورش والوكلاء مع المزامنة اللحظية للمخزون.'
                : 'Iraq’s unified automotive spare-parts ecosystem. Seamlessly connects car owners and workshops with verified dealers.'}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">
              {isArabic ? 'الخدمات الرئيسية' : 'Core Capabilities'}
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isArabic ? 'شراء مباشر من الكتالوج المعتمد' : 'Direct Marketplace Purchases'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isArabic ? 'صالة مناقصات ومزايدات المتاجر' : 'Reverse RFQ Dealer Bidding'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isArabic ? 'ربط وتكامل أنظمة ERP / DMS' : 'B2B ERP / DMS & REST API Sync'}</span>

              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isArabic ? 'فحص الصور بالذكاء الاصطناعي' : 'AI Photo Vision Search'}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">
              {isArabic ? 'المراكز والمستودعات' : 'Regional Hubs'}
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isArabic ? 'بغداد (السنك والشيخ عمر)' : 'Baghdad (Al-Sinak & Sheikh Omar)'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isArabic ? 'أربيل (المستودع المركزي وشارع 60)' : 'Erbil (Central Warehouse & 60m Ring)'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isArabic ? 'البصرة والسليمانية ودهوك' : 'Basra, Sulaymaniyah & Duhok'}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">
              {isArabic ? 'الضمان والموثوقية' : 'Trust & Guarantee'}
            </h4>
            <div className="p-3.5 bg-white/[0.03] rounded-2xl border border-white/10 space-y-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>{isArabic ? 'ضمان مطابقة 100% للقطعة' : '100% Guaranteed Fitment'}</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {isArabic
                  ? 'قطع أصلية ومعتمدة مع فحص فيزيائي عند الاستلام أو التوصيل السريع لعنوانك.'
                  : 'Verified genuine and OEM-spec components with physical inspection on pickup or doorstep courier.'}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-3">
          <span>© 2026 IQAutoMarket</span>
          <span>Part of IQAuto Community</span>
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
