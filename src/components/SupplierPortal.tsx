/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Store,
  ShieldCheck,
  Star,
  Upload,
  PackageCheck,
  Plus,
  Truck,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const SupplierPortal: React.FC = () => {
  const {
    suppliers,
    partRequests,
    submitSupplierOffer,
    bulkUploadProducts,
    orders,
    updateOrderStatus,
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';

  // Active supplier is ABC Genuine Parts (sup-1)
  const currentSupplier = suppliers.find((s) => s.id === 'sup-1') || suppliers[0];

  const [activeTab, setActiveTab] = useState<'requests' | 'orders' | 'bulk_upload'>('requests');

  // Submit quote state for inbound request
  const [selectedReqForQuote, setSelectedReqForQuote] = useState<string | null>(null);
  const [quotePartName, setQuotePartName] = useState('');
  const [quotePartNumber, setQuotePartNumber] = useState('');
  const [quotePriceUSD, setQuotePriceUSD] = useState(135);
  const [quoteBrand, setQuoteBrand] = useState('Toyota Genuine');
  const [quoteQuality, setQuoteQuality] = useState<'genuine' | 'oem' | 'aftermarket'>('genuine');
  const [quoteWarranty, setQuoteWarranty] = useState('12-Month Official Warranty');
  const [quoteDelivery, setQuoteDelivery] = useState('Same Day Delivery / Instant Pickup');
  const [quoteNotes, setQuoteNotes] = useState('Original sealed box with holographic tamper seal.');

  // Bulk Upload State
  const [csvText, setCsvText] = useState(
    `PartNumber,PartName,PriceUSD,Stock,Brand,Quality\n04465-60290,Front Brake Pad Set,140,18,Toyota Genuine,genuine\n04152-YZZA1,Engine Oil Filter Element,14,45,Toyota Genuine,genuine\n48068-60030,Front Lower Control Arm,175,6,Toyota Genuine,genuine\n43512-60190,Brake Disc Rotor Pair,155,10,Toyota Genuine,genuine`
  );
  const [uploadStats, setUploadStats] = useState<{ matchedCount: number; newCount: number } | null>(null);

  const inboundRequests = partRequests.filter(
    (r) => r.status === 'open' || r.status === 'offers_received'
  );

  const supplierOrders = orders.filter((o) => o.supplierId === currentSupplier.id);

  const handleOpenQuoteModal = (req: any) => {
    setSelectedReqForQuote(req.id);
    setQuotePartName(req.partName);
    setQuotePartNumber(req.partNumberHint || '04465-60290');
  };

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForQuote) return;

    submitSupplierOffer(selectedReqForQuote, {
      supplierId: currentSupplier.id,
      supplierName: currentSupplier.companyName,
      supplierRating: currentSupplier.rating,
      verifiedInteractionsCount: currentSupplier.verifiedInteractionsCount,
      partName: quotePartName,
      partNumber: quotePartNumber,
      brand: quoteBrand,
      quality: quoteQuality,
      priceUSD: Number(quotePriceUSD),
      priceIQD: Math.round(Number(quotePriceUSD) * 1320),
      warranty: quoteWarranty,
      deliveryTime: quoteDelivery,
      stockStatus: 'in_stock_today',
      notes: quoteNotes,
    });

    setSelectedReqForQuote(null);
  };

  const handleRunBulkUpload = () => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return;

    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (cols.length >= 4) {
        rows.push({
          partNumber: cols[0]?.trim(),
          partName: cols[1]?.trim(),
          priceUSD: Number(cols[2]?.trim()) || 50,
          stock: Number(cols[3]?.trim()) || 10,
          brand: cols[4]?.trim() || 'OEM Genuine',
          quality: cols[5]?.trim() || 'genuine',
        });
      }
    }

    const result = bulkUploadProducts(currentSupplier.id, rows);
    setUploadStats(result);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Supplier Profile Banner (PRD Section 15) */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-black text-xl shadow-xs">
              ABC
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-neutral-900">
                  {currentSupplier.companyName}
                </h2>
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Level 3 Verified Genuine Partner
                </span>
              </div>
              <div className="text-xs text-neutral-500 flex flex-wrap items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {currentSupplier.city} • {currentSupplier.address}
                </span>
                <span>Phone: {currentSupplier.phone}</span>
                <span>
                  Delivery Radius:{' '}
                  {Array.isArray(currentSupplier.deliveryCoverage)
                    ? currentSupplier.deliveryCoverage.join(', ')
                    : currentSupplier.deliveryCoverage || 'Nationwide'}
                </span>
              </div>
            </div>
          </div>

          {/* Supplier KPIs (PRD Section 15) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" />
                <span className="text-base font-black text-neutral-900">{currentSupplier.rating}</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-semibold block uppercase mt-0.5">
                Dealer Rating
              </span>
            </div>

            <div className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-center">
              <div className="text-base font-black text-emerald-700">
                {currentSupplier.onTimeDeliveryRate}%
              </div>
              <span className="text-[10px] text-neutral-500 font-semibold block uppercase mt-0.5">
                On-Time Fulfillment
              </span>
            </div>

            <div className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-center">
              <div className="text-base font-black text-neutral-900">
                {currentSupplier.repeatCustomerPercentage}%
              </div>
              <span className="text-[10px] text-neutral-500 font-semibold block uppercase mt-0.5">
                Repeat Customer Rate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 mb-6 gap-2 text-xs font-bold">
        <button
          id="supplier-tab-requests"
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Inbound Part Requests</span>
          <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded-full text-[10px]">
            {inboundRequests.length}
          </span>
        </button>

        <button
          id="supplier-tab-orders"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Active Customer Orders</span>
          <span className="bg-neutral-100 text-neutral-800 px-1.5 py-0.2 rounded-full text-[10px]">
            {supplierOrders.length}
          </span>
        </button>

        <button
          id="supplier-tab-bulk"
          onClick={() => setActiveTab('bulk_upload')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'bulk_upload'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Bulk Inventory Upload (CSV)</span>
        </button>
      </div>

      {/* TAB 1: Inbound Part Requests to Bid on (PRD Section 16 & 23) */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="text-xs text-neutral-500">
            Automated notifications for parts matching your certified brand specializations (Toyota, Lexus, Genuine):
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inboundRequests.map((req) => {
              const alreadyBid = req.offers.some((o) => o.supplierId === currentSupplier.id);

              return (
                <div
                  key={req.id}
                  id={`inbound-req-card-${req.id}`}
                  className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-neutral-500">
                        {req.requestNumber}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Target City: {req.preferredCity}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-neutral-900">{req.partName}</h3>
                    <div className="text-xs text-neutral-600 mt-1">
                      Vehicle:{' '}
                      <strong className="text-neutral-900">
                        {req.vehicle.make} {req.vehicle.model} {req.vehicle.year} ({req.vehicle.engine})
                      </strong>
                    </div>

                    {req.partDescription && (
                      <p className="text-xs text-neutral-600 mt-2 p-2 bg-neutral-50 rounded-lg line-clamp-2">
                        "{req.partDescription}"
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100 pt-2">
                      <span>Requirement: {req.qualityPreference.replace(/_/g, ' ')}</span>
                      <span>Required: {req.requiredDate}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100">
                    {alreadyBid ? (
                      <div className="py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl text-center border border-emerald-200 flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Quotation Submitted by Your Dealership
                      </div>
                    ) : (
                      <button
                        id={`open-quote-modal-btn-${req.id}`}
                        onClick={() => handleOpenQuoteModal(req)}
                        className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <span>Submit Live Quotation</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quote Submission Modal */}
      {selectedReqForQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-neutral-200 text-xs">
            <h3 className="font-bold text-neutral-900 text-base mb-1">
              Submit Quotation for Inbound Request
            </h3>
            <p className="text-neutral-500 mb-4">
              Enter your competitive pricing, warranty, and delivery window for the buyer.
            </p>

            <form onSubmit={handleSubmitQuote} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Part Name</label>
                  <input
                    type="text"
                    required
                    value={quotePartName}
                    onChange={(e) => setQuotePartName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Part Number</label>
                  <input
                    type="text"
                    required
                    value={quotePartNumber}
                    onChange={(e) => setQuotePartNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Price (USD)</label>
                  <input
                    type="number"
                    required
                    value={quotePriceUSD}
                    onChange={(e) => setQuotePriceUSD(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-bold"
                  />
                  <span className="text-[10px] text-neutral-400">
                    ≈ {(quotePriceUSD * 1320).toLocaleString()} IQD
                  </span>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={quoteBrand}
                    onChange={(e) => setQuoteBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Quality Grade</label>
                  <select
                    value={quoteQuality}
                    onChange={(e) => setQuoteQuality(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="genuine">Genuine (أصلي وكالة)</option>
                    <option value="oem">OEM Certified (وكالة معتمد)</option>
                    <option value="aftermarket">Aftermarket (تجاري)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Warranty</label>
                  <input
                    type="text"
                    value={quoteWarranty}
                    onChange={(e) => setQuoteWarranty(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Delivery Time</label>
                <input
                  type="text"
                  value={quoteDelivery}
                  onChange={(e) => setQuoteDelivery(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Dealer Notes for Buyer</label>
                <input
                  type="text"
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReqForQuote(null)}
                  className="flex-1 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-submit-quote-btn"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Send Quotation to Buyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Orders to Fulfill */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {supplierOrders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 text-neutral-500 text-xs">
              No orders currently pending fulfillment.
            </div>
          ) : (
            supplierOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 bg-white rounded-xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900">{ord.orderNumber}</span>
                    <span className="text-neutral-500">({ord.createdAt.split('T')[0]})</span>
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                      {(ord.status || '').toUpperCase()}
                    </span>
                  </div>
                  <div className="font-bold text-neutral-800 mt-1">
                    Customer: {ord.customerName} ({ord.customerPhone})
                  </div>
                  <div className="text-neutral-500">
                    Vehicle: {ord.vehicleInfo} • Destination: {ord.deliveryAddress}
                  </div>
                  <div className="mt-1 font-medium text-neutral-700">
                    Items: {ord.items.map((i) => `${i.partName} x${i.quantity}`).join(', ')}
                  </div>
                </div>

                <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-2">
                  <div>
                    <div className="text-base font-black text-neutral-900">${ord.totalUSD}</div>
                    <div className="text-[10px] text-neutral-500">
                      {ord.totalIQD.toLocaleString()} IQD (COD)
                    </div>
                  </div>

                  {ord.status === 'confirmed' && (
                    <button
                      onClick={() => updateOrderStatus(ord.id, 'out_for_delivery')}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Mark Out for Delivery</span>
                    </button>
                  )}
                  {ord.status === 'out_for_delivery' && (
                    <button
                      onClick={() => updateOrderStatus(ord.id, 'delivered')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Confirm Delivered</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Bulk Inventory Upload (PRD Section 16) */}
      {activeTab === 'bulk_upload' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4 text-xs">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Bulk Inventory Upload & Master Catalogue Linker
            </h3>
            <p className="text-neutral-500 mt-0.5">
              Paste or upload CSV/Excel columns (PartNumber, PartName, PriceUSD, Stock, Brand, Quality).
              Our system automatically matches your part numbers to the master catalogue and updates your live stock.
            </p>
          </div>

          <div>
            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-3 font-mono text-xs border border-neutral-300 rounded-xl focus:outline-emerald-600"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              id="execute-bulk-upload-btn"
              onClick={handleRunBulkUpload}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Import & Sync Inventory</span>
            </button>

            {uploadStats && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-medium">
                Successfully synced: <strong>{uploadStats.matchedCount} existing master parts</strong> updated,{' '}
                <strong>{uploadStats.newCount} new parts</strong> added to catalogue!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
