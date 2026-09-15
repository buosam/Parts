/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Store,
  ShieldCheck,
  Star,
  MapPin,
  Phone,
  Clock,
  ThumbsUp,
  Package,
  CheckCircle,
  Truck,
  Layers,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const SupplierStorefrontModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    selectedSupplierIdForStore,
    suppliers,
    masterParts,
    reviews,
    addToCart,
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [activeTab, setActiveTab] = useState<'inventory' | 'reviews'>('inventory');

  if (activeModal !== 'supplier_store' || !selectedSupplierIdForStore) return null;

  const supplier = suppliers.find((s) => s.id === selectedSupplierIdForStore) || suppliers[0];

  // Dealer inventory items
  const supplierOffers = masterParts.flatMap((part) =>
    part.offers
      .filter((o) => o.supplierId === supplier.id)
      .map((offer) => ({ masterPart: part, offer }))
  );

  const supplierReviews = reviews.filter((r) => r.supplierId === supplier.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-neutral-200 flex flex-col">
        {/* Top Close Button */}
        <div className="relative bg-neutral-900 text-white p-6">
          <button
            onClick={() => setActiveModal(null)}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                {(supplier?.companyName || 'SP').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black">{supplier.companyName}</h2>
                  <span className="text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    Verified Dealer
                  </span>
                </div>
                <div className="text-xs text-neutral-300 flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {supplier.city} • {supplier.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {supplier.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Score pill */}
            <div className="bg-neutral-800/80 border border-neutral-700 p-2.5 rounded-xl text-center self-start sm:self-auto">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-black text-lg">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{supplier.rating}</span>
              </div>
              <span className="text-[10px] text-neutral-400 block font-medium">
                {supplier.repeatCustomerPercentage}% repeat buyers
              </span>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-neutral-200 px-5 pt-2 gap-4 text-xs font-bold bg-white">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Storefront Catalogue ({supplierOffers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Verified Customer Reviews ({supplierReviews.length})</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'inventory' && (
            <div className="space-y-3">
              {supplierOffers.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-500">
                  No active listings currently displayed for this supplier.
                </div>
              ) : (
                supplierOffers.map(({ masterPart, offer }) => (
                  <div
                    key={offer.id}
                    className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={masterPart.imageUrl}
                        alt={masterPart.partName}
                        className="w-12 h-12 rounded-lg object-cover bg-white"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-neutral-900 bg-white px-1.5 py-0.5 rounded border border-neutral-200">
                            {masterPart.partNumber}
                          </span>
                          <span className="font-bold text-neutral-900">{masterPart.partName}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          Grade: <strong className="uppercase text-emerald-800">{offer.quality}</strong> ({offer.brand}) • Warranty: {offer.warranty}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="font-black text-neutral-900 text-sm">
                          ${offer.priceUSD}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {offer.priceIQD.toLocaleString()} IQD
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          addToCart(masterPart, offer);
                          setActiveModal('cart');
                        }}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg text-xs"
                      >
                        Order Part
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4 text-xs">
              {/* Review summary stats (PRD Section 31) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-center">
                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold">Overall Rating</span>
                  <span className="text-lg font-black text-neutral-900">{supplier.rating} / 5.0</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold">Part Authenticity</span>
                  <span className="text-lg font-black text-emerald-700">4.9 ★</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold">Delivery Speed</span>
                  <span className="text-lg font-black text-blue-700">4.8 ★</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold">Would Deal Again</span>
                  <span className="text-lg font-black text-neutral-900">
                    {supplier.repeatCustomerPercentage}%
                  </span>
                </div>
              </div>

              {/* Review cards */}
              <div className="space-y-3">
                {supplierReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 bg-white rounded-xl border border-neutral-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900">{rev.reviewerName}</span>
                        <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded capitalize">
                          {rev.reviewerType}
                        </span>
                        {rev.isVerifiedBuyer && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <CheckCircle className="w-3 h-3" />
                            Verified Buyer
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{rev.overallRating}</span>
                      </div>
                    </div>

                    <p className="text-neutral-700 leading-relaxed">"{rev.comment}"</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-[11px] text-neutral-400">
                      <div>Part: {rev.partPurchased}</div>
                      {rev.wouldDealAgain && (
                        <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <ThumbsUp className="w-3 h-3" />
                          Would buy from this dealer again
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
