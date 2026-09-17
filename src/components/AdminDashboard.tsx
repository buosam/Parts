/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Users,
  Layers,
  Search,
  CheckCircle,
  Plus,
  BarChart3,
  Flame,
  ArrowUpRight,
  Server,
  Zap,
  Activity,
  Check,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const AdminDashboard: React.FC = () => {
  const {
    masterParts,
    suppliers,
    updateSupplierVerification,
    demandIntelligence,
    disputes,
    addMasterPart,
    language,
    dealerIntegrations,
    syncJobs,
    syncErrors,
    dealerBranches,
    formatPrice,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [activeTab, setActiveTab] = useState<'integrations' | 'demand' | 'suppliers' | 'catalogue'>('integrations');

  // New Master Part state
  const [showAddPart, setShowAddPart] = useState(false);
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newPartName, setNewPartName] = useState('');
  const [newCategory, setNewCategory] = useState('Engine');
  const [newBrand, setNewBrand] = useState('Toyota Genuine');

  const handleCreateMasterPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartNumber || !newPartName) return;

    addMasterPart({
      partNumber: newPartNumber,
      partName: newPartName,
      brand: newBrand,
      manufacturer: newBrand,
      category: newCategory,
      description: `Official master part record for ${newPartName}. Verified fitment.`,
      specifications: { 'Part Number': newPartNumber, 'Verification Status': 'Platform Certified' },
      imageUrl: 'https://images.unsplash.com/photo-1558441719-8b489c63f7d1?auto=format&fit=crop&w=600&q=80',
      compatibleVehicles: [
        {
          make: 'Toyota',
          model: 'Prado',
          yearStart: 2018,
          yearEnd: 2024,
          engine: '4.0L V6',
        },
      ],
      offers: [],
    });

    setShowAddPart(false);
    setNewPartNumber('');
    setNewPartName('');
  };

  const totalSyncedStock = dealerIntegrations.reduce((acc, i) => acc + (i.totalInventorySynced || 0), 0);
  const avgHealth = Math.round(
    dealerIntegrations.reduce((acc, i) => acc + (i.syncHealthScore || 100), 0) / (dealerIntegrations.length || 1)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isArabic ? 'لوحة تحكم إدارة منصة IQAutoMarket' : 'IQAutoMarket Admin & Intelligence Suite'}
            </h2>
            <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
              Enterprise B2B
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic
              ? 'مراقبة شبكة تكاملات الوكلاء (ERP/DMS/API)، الكتالوج الموحد، ذكاء الطلب الإقليمي، وتوثيق الشركاء'
              : 'Dealer ERP/DMS integration health, master catalogue normalization, demand intelligence & partner governance'}
          </p>
        </div>

        {/* Quick stat counters */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="px-3.5 py-2 glass-panel rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[10px]">Active ERP/DMS Feeds</span>
            <span className="font-bold text-white">{dealerIntegrations.length} Connected</span>
          </div>
          <div className="px-3.5 py-2 glass-panel rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[10px]">Synced Inventory</span>
            <span className="font-bold text-emerald-400">{totalSyncedStock.toLocaleString()} Units</span>
          </div>
          <div className="px-3.5 py-2 glass-panel rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[10px]">Network Health</span>
            <span className="font-bold text-indigo-300">{avgHealth}%</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mt-6 mb-6 gap-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('integrations')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'integrations'
              ? 'border-indigo-500 text-indigo-400 font-black'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>{isArabic ? 'مراقبة تكاملات الوكلاء (B2B Integrations)' : 'Dealer Integrations Oversight'}</span>
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded-full text-[10px] font-black">
            LIVE
          </span>
        </button>

        <button
          onClick={() => setActiveTab('demand')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'demand'
              ? 'border-amber-500 text-amber-400 font-black'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>{isArabic ? 'ذكاء الطلب الإقليمي' : 'Regional Demand Intelligence'}</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'suppliers'
              ? 'border-emerald-500 text-emerald-400 font-black'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>{isArabic ? 'توثيق واعتماد المتاجر' : 'Supplier Verification Levels'}</span>
        </button>

        <button
          onClick={() => setActiveTab('catalogue')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'catalogue'
              ? 'border-blue-500 text-blue-400 font-black'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-400" />
          <span>{isArabic ? 'الكتالوج المركزي الموحد' : 'Master Parts Database'}</span>
        </button>
      </div>

      {/* TAB 0: Dealer Integrations Oversight */}
      {activeTab === 'integrations' && (
        <div className="space-y-6 text-xs">
          {/* Top Network Intelligence Header */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-white/10 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-black text-[10px] uppercase tracking-wider border border-indigo-500/30">
                    DEALER ECOSYSTEM
                  </span>
                  <h3 className="font-extrabold text-lg text-white">
                    {isArabic ? 'شبكة الربط والتكامل المباشر لمتاجر العراق' : 'Iraq Automotive Dealer B2B Integration Hub'}
                  </h3>
                </div>
                <p className="text-slate-300 text-xs mt-1.5 max-w-2xl leading-relaxed">
                  {isArabic
                    ? 'مراقبة موصلات ERP و DMS و POS للوكلاء المعتمدين والموزعين مع رصد تلقائي لجودة الأسعار والمخزون وحجز القطع.'
                    : 'System-wide monitoring of real-time dealer feeds (CDK, SAP B1, Custom POS, and Smart CSV pipelines) powering marketplace inventory.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3.5 bg-white/[0.04] rounded-2xl text-center border border-white/10">
                  <div className="text-lg font-black text-emerald-400">99.4%</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">API Uptime</div>
                </div>
                <div className="p-3.5 bg-white/[0.04] rounded-2xl text-center border border-white/10">
                  <div className="text-lg font-black text-white">4,820</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Daily Webhooks</div>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Dealer Integrations Table */}
          <div className="glass-panel rounded-3xl border border-white/10 p-6 shadow-xl space-y-4">
            <div>
              <h4 className="text-sm font-black text-white">
                {isArabic ? 'الوكلاء ومزودو الأنظمة المتصلة' : 'Connected Dealerships & Inventory Connectors'}
              </h4>
              <p className="text-slate-400 text-[11px]">
                {dealerIntegrations.length} active enterprise connections synchronized across Erbil, Baghdad, and Basra.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Dealership</th>
                    <th className="p-3">Provider & Version</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Synced SKUs</th>
                    <th className="p-3">Total Stock Units</th>
                    <th className="p-3">Sync Schedule</th>
                    <th className="p-3">Health Score</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium text-slate-200">
                  {dealerIntegrations.map((integ) => (
                    <tr key={integ.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 font-bold text-white">
                        {integ.dealerName}
                        <div className="text-[10px] text-slate-400 font-normal font-mono">{integ.dealerId}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-white">{integ.providerName}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">{integ.providerType} · {integ.providerVersion || 'v1.0'}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-white/[0.05] text-indigo-300 border border-white/10">
                          {integ.integrationMethod}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-white">{integ.totalProductsSynced.toLocaleString()}</td>
                      <td className="p-3 font-bold text-emerald-400">{integ.totalInventorySynced.toLocaleString()}</td>
                      <td className="p-3 text-slate-400">{integ.syncRules?.syncFrequency || 'Every 15 min'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-400">{integ.syncHealthScore}%</span>
                          <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${integ.syncHealthScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            integ.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {integ.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Sync Errors Audit */}
          <div className="glass-panel rounded-3xl border border-white/10 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-white">
                  {isArabic ? 'سجل تدقيق أخطاء المزامنة عبر الشبكة' : 'Network-Wide Sync Exception Audit'}
                </h4>
                <p className="text-slate-400 text-[11px]">
                  Unresolved validation errors requiring dealer item master corrections.
                </p>
              </div>
              <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30 px-3 py-1 rounded-full">
                {syncErrors.filter((e) => e.status === 'open').length} Open Exceptions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Dealer</th>
                    <th className="p-3">Record ID</th>
                    <th className="p-3">Error Category</th>
                    <th className="p-3">Message & Diagnostics</th>
                    <th className="p-3">Date Detected</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {syncErrors.map((err) => (
                    <tr key={err.id} className="hover:bg-white/[0.03]">
                      <td className="p-3 font-bold text-white">{err.dealerName}</td>
                      <td className="p-3 font-mono font-bold text-slate-300">{err.externalRecordId}</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {err.errorType.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 max-w-md text-slate-300">{err.errorMessage}</td>
                      <td className="p-3 text-slate-400">{new Date(err.dateDetected).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            err.status === 'resolved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {err.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Demand Intelligence System */}
      {activeTab === 'demand' && (
        <div className="space-y-6">
          <div className="glass-panel border border-amber-500/30 rounded-3xl p-5 text-xs text-amber-200 flex items-start gap-3.5 shadow-xl">
            <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm">Automated Regional Demand Intelligence</div>
              <p className="text-slate-300 mt-1 leading-relaxed">
                Algorithmic tracking of search queries, zero-result keywords, workshop repair order frequency, and regional vehicle fleet density. Used to notify suppliers of high-demand stock opportunities.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {demandIntelligence.map((item) => (
              <div
                key={item.id}
                className="glass-panel rounded-3xl border border-white/10 p-5 shadow-xl space-y-4 hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg">
                    {item.partNumber}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    High Demand
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">{item.partName}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.compatibleMake} {item.compatibleModel} ({item.compatibleYears})
                  </p>
                </div>

                <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Search Volume (30d):</span>
                    <strong className="text-white">{item.searchVolume30Days} searches</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Unfulfilled Rate:</span>
                    <strong className="text-rose-400">{item.unfulfilledRequestsRate}%</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Avg Market Price:</span>
                    <strong className="text-emerald-400">{formatPrice(item.avgMarketPriceUSD)}</strong>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Top Cities: <strong className="text-slate-200">{item.topCities.join(', ')}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Supplier Verification Levels */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl border border-white/10 p-6 shadow-xl space-y-4">
            <h4 className="text-sm font-black text-white">Registered Suppliers & Verification Tiers</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Supplier / Business</th>
                    <th className="p-3">City & Location</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Current Verification</th>
                    <th className="p-3">Action: Upgrade Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {suppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-white/[0.03]">
                      <td className="p-3 font-bold text-white">
                        {sup.companyName}
                        <div className="text-[10px] text-slate-400 font-normal">{sup.contactEmail}</div>
                      </td>
                      <td className="p-3 text-slate-300">{sup.city} ({sup.location})</td>
                      <td className="p-3 font-bold text-amber-400">{sup.rating} ★</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {sup.verificationLevel}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={sup.verificationLevel}
                          onChange={(e) => updateSupplierVerification(sup.id, e.target.value as any)}
                          className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-hidden cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Verified Business">Verified Business</option>
                          <option value="Authorized Dealer">Authorized Dealer</option>
                          <option value="Genuine Parts Partner">Genuine Parts Partner</option>
                          <option value="Trusted Dealer">Trusted Dealer</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Master Parts Database */}
      {activeTab === 'catalogue' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white">Normalized Master Parts Registry ({masterParts.length})</h4>
            <button
              onClick={() => setShowAddPart(!showAddPart)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Master Part Record</span>
            </button>
          </div>

          {showAddPart && (
            <form onSubmit={handleCreateMasterPart} className="glass-panel border border-indigo-500/30 rounded-3xl p-6 text-xs space-y-4 shadow-2xl">
              <h5 className="font-bold text-white text-sm">Add New Certified Master Part to Central Database</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">OEM Part Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 04465-60290"
                    value={newPartNumber}
                    onChange={(e) => setNewPartNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Standardized Part Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Front Brake Pad Set"
                    value={newPartName}
                    onChange={(e) => setNewPartName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                Publish Master Part
              </button>
            </form>
          )}

          <div className="glass-panel rounded-3xl border border-white/10 p-6 shadow-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Part #</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3">Offers Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {masterParts.map((mp) => (
                  <tr key={mp.id} className="hover:bg-white/[0.03]">
                    <td className="p-3 font-mono font-bold text-indigo-300">{mp.partNumber}</td>
                    <td className="p-3 font-bold text-white">{mp.partName}</td>
                    <td className="p-3 text-slate-300">{mp.category}</td>
                    <td className="p-3 text-slate-400">{mp.brand}</td>
                    <td className="p-3 font-bold text-emerald-400">{mp.offers.length} active quotes</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
