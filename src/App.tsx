/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { Header } from './components/Header';
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
import { MasterPart } from './types';
import { ShieldCheck, Car, Phone, Mail, MapPin, Sparkles, Layers, Gavel, CheckCircle2, Zap, ArrowRight } from 'lucide-react';

const MarketplaceApp: React.FC = () => {
  const {
    role,
    language,
    selectedRequestForBid,
    setSelectedRequestForBid,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
  } = useMarketplace();

  const [selectedPart, setSelectedPart] = useState<MasterPart | null>(null);
  const isArabic = language === 'ar';

  const isBiddingView = selectedCategory === 'requests';

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white"
    >
      {/* Universal Header */}
      <Header />

      {/* Automotive Departments Mega-Bar */}
      {role === 'customer' && <CarIdDepartmentBar />}

      {/* Main Role-Based Workspace */}
      <main className="flex-1 pb-16">
        {role === 'customer' && (
          <div>
            <HomeHero />

            {/* Buyer Mode View Switcher Bar */}
            <div className="max-w-7xl mx-auto px-4 mt-6">
              <div className="flex items-center justify-between gap-4 p-1.5 bg-white/[0.04] border border-white/10 rounded-2xl backdrop-blur-md">
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <button
                    id="buyer-tab-catalog"
                    onClick={() => {
                      if (selectedCategory === 'requests') {
                        setSelectedCategory('All');
                      }
                    }}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      !isBiddingView
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/25'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>{isArabic ? 'الكتالوج المباشر ومخزون الوكلاء' : 'Live Parts Catalog & Instant Stock'}</span>
                  </button>

                  <button
                    id="buyer-tab-bidding"
                    onClick={() => setSelectedCategory('requests')}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isBiddingView
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 font-black'
                        : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10'
                    }`}
                  >
                    <Gavel className="w-4 h-4" />
                    <span>{isArabic ? 'ساحة مناقصات ومزايدات الوكلاء' : 'Reverse RFQ & Live Dealer Bids'}</span>
                    <span className="hidden md:inline text-[10px] font-black uppercase bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded ml-1">
                      LIVE
                    </span>
                  </button>
                </div>

                <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 pr-3">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {isArabic
                      ? 'مخزون حقيقي متزامن مع وكلاء بغداد، أربيل، والبصرة'
                      : 'Real-time ERP/DMS inventory synced across Iraqi dealer networks'}
                  </span>
                </div>
              </div>
            </div>

            {/* Display Active Customer View */}
            {isBiddingView ? (
              <RequestsBoard />
            ) : (
              <SearchResults onSelectPart={(part) => setSelectedPart(part)} />
            )}
          </div>
        )}

        {role === 'workshop' && <WorkshopDashboard />}
        {role === 'supplier' && <SupplierPortal />}
        {role === 'admin' && <AdminDashboard />}
      </main>

      {/* Global Modals */}
      <MasterPartDetailModal part={selectedPart} onClose={() => setSelectedPart(null)} />
      <VehicleSelectorModal />
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
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                IQ
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                IQAuto<span className="text-indigo-400">Market</span>
              </span>
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
