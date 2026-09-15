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
import { SupplierStorefrontModal } from './components/SupplierStorefrontModal';
import { DealerReviewModal } from './components/DealerReviewModal';
import { CarIdDepartmentBar } from './components/CarIdDepartmentBar';
import { MasterPart } from './types';
import { ShieldCheck, Car, Phone, Mail, MapPin, Sparkles, Layers, Gavel, Flame } from 'lucide-react';

const MarketplaceApp: React.FC = () => {
  const {
    role,
    language,
    selectedRequestForBid,
    setSelectedRequestForBid,
  } = useMarketplace();
  const [selectedPart, setSelectedPart] = useState<MasterPart | null>(null);
  const [customerSubTab, setCustomerSubTab] = useState<'catalogue' | 'bidding'>('catalogue');

  const isArabic = language === 'ar';

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-screen bg-neutral-100/60 text-neutral-900 font-sans flex flex-col selection:bg-red-500 selection:text-white"
    >
      {/* Universal Header */}
      <Header />

      {/* CARiD-inspired Automotive Departments Mega-Bar */}
      {role === 'customer' && (
        <CarIdDepartmentBar
          activeView={customerSubTab === 'bidding' ? 'requests' : 'parts'}
          setActiveView={(v) => {
            if (v === 'requests') setCustomerSubTab('bidding');
            else setCustomerSubTab('catalogue');
          }}
        />
      )}

      {/* Main Role-Based Workspace */}
      <main className="flex-1 pb-16">
        {role === 'customer' && (
          <div>
            <HomeHero />

            {/* Sub-view toggle for Customer: Search Catalogue vs Parts Bidding Floor */}
            <div className="max-w-7xl mx-auto px-4 pt-6">
              <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-3">
                <button
                  id="tab-catalogue-btn"
                  onClick={() => setCustomerSubTab('catalogue')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    customerSubTab === 'catalogue'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'قطع الغيار والكتالوج المباشر' : 'Auto Parts Catalogue'}</span>
                </button>

                <button
                  id="tab-bidding-floor-btn"
                  onClick={() => setCustomerSubTab('bidding')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    customerSubTab === 'bidding'
                      ? 'bg-amber-500 text-neutral-950 shadow-md font-black'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300'
                  }`}
                >
                  <Gavel className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isArabic ? 'منصة طلب ومناقصات القطع (مزايدات المتاجر)' : 'Parts Bidding Floor (Store Owner Bids)'}</span>
                  <span className="text-[9px] bg-neutral-900 text-amber-400 font-black px-1.5 py-0.5 rounded uppercase">
                    LIVE RFQs
                  </span>
                </button>
              </div>
            </div>

            {customerSubTab === 'catalogue' && (
              <SearchResults onSelectPart={(part) => setSelectedPart(part)} />
            )}
            {customerSubTab === 'bidding' && <RequestsBoard />}
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

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800 text-xs py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-sm">
                ID
              </div>
              <span className="font-bold text-white text-sm tracking-tight">
                AUTO ID SPARE PARTS
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Premier automotive spare parts marketplace with reverse auction bidding.
              When parts are out of stock, 120+ verified stores and dealers compete to supply them at the lowest price.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">
              Core Capabilities
            </h4>
            <ul className="space-y-1.5 text-neutral-400">
              <li>Centralized Master Catalogue</li>
              <li>Vehicle Fitment Database & VIN Decoder</li>
              <li>Out-of-Stock Parts Bidding & Reverse Auctions</li>
              <li>Store Owner & Dealer Quotation Portal</li>
              <li>AI Photo Identification (Gemini Vision)</li>
              <li>Workshop Repair Sourcing Engine</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">
              Regional Coverage
            </h4>
            <ul className="space-y-1.5 text-neutral-400">
              <li>Baghdad Sheikh Omar & Sinak Parts Market</li>
              <li>Erbil Industrial Zone & 60m Road Hubs</li>
              <li>Basra Auto District & Port Clearance</li>
              <li>Sulaymaniyah & Duhok Logistics</li>
              <li>Same-Day Express Courier Delivery</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">
              Trust & Security
            </h4>
            <div className="p-3 bg-neutral-800/80 rounded-xl border border-neutral-700/80 space-y-2 text-[11px] text-neutral-300">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Level 3 Genuine Guarantee</span>
              </div>
              <p className="text-neutral-400">
                100% Escrow and payment at counter upon physical fitment inspection.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-neutral-500 text-[11px] gap-2">
          <span>© 2026 AutoID Spare Parts Marketplace. All rights reserved.</span>
          <span>Powered by Google Gemini 2.5 Flash & Full-Stack Node.js</span>
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
