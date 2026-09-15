/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { Header } from './components/Header';
import { HomeHero } from './components/HomeHero';
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
import { SupplierStorefrontModal } from './components/SupplierStorefrontModal';
import { DealerReviewModal } from './components/DealerReviewModal';
import { CarIdDepartmentBar } from './components/CarIdDepartmentBar';
import { MasterPart } from './types';
import { ShieldCheck, Car, Phone, Mail, MapPin, Sparkles, Layers, Gavel, CheckCircle2 } from 'lucide-react';

const MarketplaceApp: React.FC = () => {
  const {
    role,
    language,
    selectedRequestForBid,
    setSelectedRequestForBid,
  } = useMarketplace();
  const [selectedPart, setSelectedPart] = useState<MasterPart | null>(null);

  const isArabic = language === 'ar';

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

            <RequestsBoard />
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
              Iraq’s unified automotive spare-parts ecosystem. Seamlessly connects car owners and repair workshops with verified dealers and real-time ERP/DMS inventory synchronization.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider text-slate-200">
              Core Capabilities
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Direct Marketplace Purchases</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reverse RFQ Dealer Bidding</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>B2B ERP / DMS & REST API Sync</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Multi-Branch Stock Allocation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Photo Vision Search</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider text-slate-200">
              Regional Hubs
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Baghdad (Al-Sinak & Sheikh Omar Hubs)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Erbil (Central Warehouse & 60m Ring)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Basra (Southern Auto District)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sulaymaniyah & Duhok Depots</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider text-slate-200">
              Trust & Guarantee
            </h4>
            <div className="p-3.5 bg-white/[0.03] rounded-2xl border border-white/10 space-y-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Genuine Part Fitment</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Verified genuine and OEM-spec components with physical inspection on pickup or doorstep courier delivery.
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
