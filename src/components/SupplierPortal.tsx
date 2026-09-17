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
  Zap,
  Server,
  Code2,
  Building2,
  AlertTriangle,
  Coins,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { IntegrationDashboard } from './DealerIntegrations/IntegrationDashboard';
import { IntegrationOnboardingWizard } from './DealerIntegrations/IntegrationOnboardingWizard';
import { SmartCsvImportModal } from './DealerIntegrations/SmartCsvImportModal';
import { DealerErrorCenter } from './DealerIntegrations/DealerErrorCenter';
import { PartnerApiSandbox } from './DealerIntegrations/PartnerApiSandbox';
import { BranchInventoryManager } from './DealerIntegrations/BranchInventoryManager';

export const SupplierPortal: React.FC = () => {
  const {
    suppliers,
    partRequests,
    submitSupplierOffer,
    bulkUploadProducts,
    orders,
    updateOrderStatus,
    language,
    dealerIntegrations,
    syncErrors,
    formatPrice,
  } = useMarketplace();

  const isArabic = language === 'ar';

  // Active supplier is ABC Genuine Parts (sup-1)
  const currentSupplier = suppliers.find((s) => s.id === 'sup-1') || suppliers[0];

  const [activeTab, setActiveTab] = useState<'integrations' | 'requests' | 'orders' | 'bulk_upload'>('integrations');

  // Integration sub-modals
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);
  const [isErrorCenterOpen, setIsErrorCenterOpen] = useState<boolean>(false);
  const [isApiSandboxOpen, setIsApiSandboxOpen] = useState<boolean>(false);
  const [isBranchManagerOpen, setIsBranchManagerOpen] = useState<boolean>(false);

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
  const primaryInteg = dealerIntegrations.find((i) => i.dealerId === currentSupplier.id);
  const openErrors = syncErrors.filter((e) => e.dealerId === currentSupplier.id && e.status === 'open');

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
      priceIQD: Math.round(Number(quotePriceUSD) * 1500),
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
    <div className="max-w-7xl mx-auto px-4 py-8" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Supplier Profile Banner */}
      <div className="glass-panel rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl mb-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20 shrink-0">
              ABC
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {currentSupplier.companyName}
                </h2>
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-500/10 text-emerald-300 px-3 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Level 3 Verified Genuine Partner
                </span>
                {primaryInteg && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                    <Server className="w-3 h-3 text-indigo-400" />
                    ERP Synced ({primaryInteg.providerType.toUpperCase()})
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {currentSupplier.city} • {currentSupplier.address}
                </span>
                <span>Phone: {currentSupplier.phone}</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Auto-Sync Active ({primaryInteg?.syncRules?.syncFrequency || 'every 15 min'})
                </span>
              </div>
            </div>
          </div>

          {/* Supplier KPIs */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-center min-w-[90px]">
              <div className="flex items-center justify-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="text-base font-black text-white">{currentSupplier.rating}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase mt-0.5">
                Dealer Rating
              </span>
            </div>

            <div className="px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-center min-w-[90px]">
              <div className="text-base font-black text-emerald-400">
                {primaryInteg?.syncHealthScore || 98}%
              </div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase mt-0.5">
                Health Score
              </span>
            </div>

            <div className="px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-center min-w-[90px]">
              <div className="text-base font-black text-white">
                {(primaryInteg?.totalProductsSynced || 3420).toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase mt-0.5">
                Live SKUs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-white/10 mb-6 gap-2 text-xs font-bold overflow-x-auto">
        <button
          id="supplier-tab-integrations"
          onClick={() => setActiveTab('integrations')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'integrations'
              ? 'border-indigo-500 text-indigo-400 font-black'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4 text-indigo-400" />
          <span>{isArabic ? 'تكامل ومزامنة المخزون (ERP / API)' : 'Integrations & Inventory Sync'}</span>
          <span className="bg-indigo-500/20 text-indigo-300 font-black px-2 py-0.2 rounded-full text-[10px] border border-indigo-500/30">
            B2B
          </span>
        </button>

        <button
          id="supplier-tab-requests"
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'requests'
              ? 'border-amber-500 text-amber-400 font-black'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>{isArabic ? 'طلبات ومناقصات القطع الواردة' : 'Inbound Part Requests'}</span>
          <span className="bg-amber-500/20 text-amber-300 px-2 py-0.2 rounded-full text-[10px] font-bold border border-amber-500/30">
            {inboundRequests.length}
          </span>
        </button>

        <button
          id="supplier-tab-orders"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'orders'
              ? 'border-emerald-500 text-emerald-400 font-black'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <PackageCheck className="w-4 h-4 text-emerald-400" />
          <span>{isArabic ? 'الطلبات المباشرة' : 'Active Customer Orders'}</span>
          <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full text-[10px] font-bold border border-emerald-500/30">
            {supplierOrders.length}
          </span>
        </button>

        <button
          id="supplier-tab-bulk"
          onClick={() => setActiveTab('bulk_upload')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'bulk_upload'
              ? 'border-blue-500 text-blue-400 font-black'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-blue-400" />
          <span>{isArabic ? 'استيراد CSV سريع' : 'Quick CSV Upload'}</span>
        </button>
      </div>

      {/* TAB 0: B2B Dealer Integrations Dashboard */}
      {activeTab === 'integrations' && (
        <IntegrationDashboard
          supplierId={currentSupplier.id}
          onOpenWizard={() => setIsWizardOpen(true)}
          onOpenCsvImport={() => setIsCsvModalOpen(true)}
          onOpenErrorCenter={() => setIsErrorCenterOpen(true)}
          onOpenApiSandbox={() => setIsApiSandboxOpen(true)}
          onOpenBranchManager={() => setIsBranchManagerOpen(true)}
        />
      )}

      {/* TAB 1: Inbound Part Requests to Bid on */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            {isArabic ? 'إشعارات تلقائية للطلبات المطابقة لاختصاصاتك (Toyota, Lexus, Genuine):' : 'Automated notifications for parts matching your certified brand specializations (Toyota, Lexus, Genuine):'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {inboundRequests.map((req) => {
              const alreadyBid = req.offers.some((o) => o.supplierId === currentSupplier.id);

              return (
                <div
                  key={req.id}
                  id={`inbound-req-card-${req.id}`}
                  className="glass-panel rounded-3xl border border-white/10 p-6 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-slate-400 bg-white/[0.04] px-2.5 py-0.5 rounded-lg border border-white/5">
                        #{req.requestNumber}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                        Target City: {req.preferredCity || 'Baghdad Central'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{req.partName}</h3>
                    <div className="text-xs text-slate-400 mt-1">
                      {isArabic ? 'المركبة:' : 'Vehicle:'}{' '}
                      <strong className="text-slate-200">
                        {req.vehicle.make} {req.vehicle.model} {req.vehicle.year} ({req.vehicle.engine})
                      </strong>
                    </div>

                    {req.partDescription && (
                      <p className="text-xs text-slate-300 mt-2.5 p-3 bg-white/[0.02] rounded-xl border border-white/5 line-clamp-2 leading-relaxed">
                        "{req.partDescription}"
                      </p>
                    )}

                    <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400 border-t border-white/5 pt-2.5">
                      <span>Requirement: <strong className="text-slate-200">{req.qualityPreference.replace(/_/g, ' ')}</strong></span>
                      <span>Required: {req.requiredDate}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/10">
                    {alreadyBid ? (
                      <div className="py-2.5 bg-emerald-500/10 text-emerald-300 text-xs font-bold rounded-xl text-center border border-emerald-500/30 flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        Quotation Submitted by Your Dealership
                      </div>
                    ) : (
                      <button
                        id={`open-quote-modal-btn-${req.id}`}
                        onClick={() => handleOpenQuoteModal(req)}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Submit Live Dealer Quotation</span>
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

      {/* TAB 2: Direct Customer Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Direct marketplace and workshop purchases assigned to your dealership:
          </div>

          <div className="glass-panel rounded-3xl border border-white/10 p-6 shadow-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Customer / Workshop</th>
                  <th className="p-3">Vehicle</th>
                  <th className="p-3">Items Count</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {supplierOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/[0.03]">
                    <td className="p-3 font-mono font-bold text-indigo-300">{ord.orderNumber}</td>
                    <td className="p-3 font-bold text-white">
                      {ord.customerName}
                      <div className="text-[10px] text-slate-400 font-normal">{ord.customerPhone}</div>
                    </td>
                    <td className="p-3 text-slate-300">{ord.vehicleInfo}</td>
                    <td className="p-3">{ord.items.length} items</td>
                    <td className="p-3 font-black text-emerald-400">
                      {formatPrice(ord.totalUSD, ord.totalIQD)}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={ord.status}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                        className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-hidden cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="delivered">Delivered</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Quick CSV Upload */}
      {activeTab === 'bulk_upload' && (
        <div className="glass-panel rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-white">Quick Batch Stock Importer</h3>
            <p className="text-xs text-slate-400 mt-1">
              Direct CSV copy-paste to bulk update SKU stock quantities and prices.
            </p>
          </div>

          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={6}
            className="w-full p-4 bg-slate-950 font-mono text-xs text-indigo-300 border border-white/10 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={handleRunBulkUpload}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              Parse & Sync {csvText.trim().split('\n').length - 1} SKUs
            </button>

            {uploadStats && (
              <span className="text-xs font-bold text-emerald-400">
                ✓ Synced {uploadStats.matchedCount} matched catalog items, created {uploadStats.newCount} new parts.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Submit Quote Modal */}
      {selectedReqForQuote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-xs space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-400" />
                <span>Submit Dealer Quote for RFQ</span>
              </h3>
              <button
                onClick={() => setSelectedReqForQuote(null)}
                className="text-slate-400 hover:text-white cursor-pointer px-2 py-1 rounded bg-white/[0.05]"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Part Name</label>
                <input
                  type="text"
                  required
                  value={quotePartName}
                  onChange={(e) => setQuotePartName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Part # OEM</label>
                  <input
                    type="text"
                    required
                    value={quotePartNumber}
                    onChange={(e) => setQuotePartNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white font-mono focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Price (USD)</label>
                  <input
                    type="number"
                    required
                    value={quotePriceUSD}
                    onChange={(e) => setQuotePriceUSD(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-hidden font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={quoteBrand}
                    onChange={(e) => setQuoteBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Quality Tier</label>
                  <select
                    value={quoteQuality}
                    onChange={(e) => setQuoteQuality(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="genuine">Genuine (Original OEM)</option>
                    <option value="oem">OEM Tier 1</option>
                    <option value="aftermarket">Certified Aftermarket</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Warranty & Notes</label>
                <input
                  type="text"
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
              >
                Publish Live Bid to Buyer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dealer Integrations Modals */}
      {isWizardOpen && (
        <IntegrationOnboardingWizard
          supplierId={currentSupplier.id}
          onClose={() => setIsWizardOpen(false)}
        />
      )}

      {isCsvModalOpen && (
        <SmartCsvImportModal
          dealerId={currentSupplier.id}
          onClose={() => setIsCsvModalOpen(false)}
        />
      )}

      {isErrorCenterOpen && (
        <DealerErrorCenter
          dealerId={currentSupplier.id}
          onClose={() => setIsErrorCenterOpen(false)}
        />
      )}

      {isApiSandboxOpen && (
        <PartnerApiSandbox
          dealerId={currentSupplier.id}
          onClose={() => setIsApiSandboxOpen(false)}
        />
      )}

      {isBranchManagerOpen && (
        <BranchInventoryManager
          dealerId={currentSupplier.id}
          onClose={() => setIsBranchManagerOpen(false)}
        />
      )}
    </div>
  );
};
