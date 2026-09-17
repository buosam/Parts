/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Home,
  Search,
  Gavel,
  Car,
  User,
  LayoutDashboard,
  Layers,
  ShoppingBag,
  Menu,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

interface MobileBottomNavProps {
  onOpenProfile: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenProfile }) => {
  const {
    role,
    language,
    selectedCategory,
    setSelectedCategory,
    setActiveModal,
    activeVehicle,
    cart,
    partRequests,
    currentUser,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const isRequestsView = selectedCategory === 'requests';

  if (role === 'admin' || role === 'workshop') {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        {role === 'customer' ? (
          <>
            {/* 1. Home */}
            <button
              id="mobile-nav-home"
              onClick={() => {
                if (selectedCategory === 'requests') {
                  setSelectedCategory('All');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                !isRequestsView ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{isArabic ? 'الرئيسية' : 'Home'}</span>
            </button>

            {/* 2. Search Parts */}
            <button
              id="mobile-nav-search"
              onClick={() => {
                if (selectedCategory === 'requests') {
                  setSelectedCategory('All');
                }
                const searchInput = document.getElementById('home-hero-search-input');
                if (searchInput) {
                  searchInput.focus();
                  searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <Search className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{isArabic ? 'البحث' : 'Search'}</span>
            </button>

            {/* 3. Get Offers (Live Bidding) */}
            <button
              id="mobile-nav-requests"
              onClick={() => setSelectedCategory('requests')}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                isRequestsView ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gavel className="w-5 h-5 mb-0.5" />
              {partRequests.length > 0 && (
                <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#090d16]" />
              )}
              <span className="text-[10px]">{isArabic ? 'العروض' : 'Offers'}</span>
            </button>

            {/* 4. Garage */}
            <button
              id="mobile-nav-garage"
              onClick={() => setActiveModal('vehicle_picker')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                activeVehicle ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Car className="w-5 h-5 mb-0.5" />
                {activeVehicle && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </div>
              <span className="text-[10px]">{isArabic ? 'المرآب' : 'Garage'}</span>
            </button>

            {/* 5. Account / Cart */}
            <button
              id="mobile-nav-account"
              onClick={onOpenProfile}
              className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover mb-0.5 border border-indigo-400/40"
                />
              ) : (
                <User className="w-5 h-5 mb-0.5" />
              )}
              {cart.length > 0 && (
                <span className="absolute top-0 right-2 bg-indigo-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
              <span className="text-[10px]">{isArabic ? 'حسابي' : 'Account'}</span>
            </button>
          </>
        ) : (
          <>
            {/* Dealer Mobile Navigation */}
            <button
              id="mobile-dealer-home"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-indigo-400 font-bold transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{isArabic ? 'الأعمال' : 'Business'}</span>
            </button>

            <button
              id="mobile-dealer-requests"
              onClick={() => {
                const el = document.getElementById('dealer-bids-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <Gavel className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{isArabic ? 'الطلبات' : 'Requests'}</span>
            </button>

            <button
              id="mobile-dealer-inventory"
              onClick={() => {
                const el = document.getElementById('dealer-inventory-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <Layers className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{isArabic ? 'المخزون' : 'Inventory'}</span>
            </button>

            <button
              id="mobile-dealer-orders"
              onClick={() => {
                const el = document.getElementById('dealer-orders-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{isArabic ? 'المبيعات' : 'Orders'}</span>
            </button>

            <button
              id="mobile-dealer-more"
              onClick={onOpenProfile}
              className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <Menu className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{isArabic ? 'المزيد' : 'More'}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
