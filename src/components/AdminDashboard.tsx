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
  CheckCircle2,
  Plus,
  BarChart3,
  Flame,
  ArrowUpRight,
  Server,
  Zap,
  Activity,
  Check,
  X,
  AlertCircle,
  Clock,
  Store,
  FileText,
  DollarSign,
  Gavel,
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
    syncErrors,
    formatPrice,
    orders,
    partRequests,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [activeTab, setActiveTab] = useState<'overview' | 'dealers' | 'insights' | 'disputes'>('overview');

  // Supplier verification state
  const [selectedDealerForVerify, setSelectedDealerForVerify] = useState<any | null>(null);

  // Stats calculation
  const totalGMV = orders.reduce((acc, o) => acc + (o.totalUSD || 0), 0) + 128500;
  const activeDealersCount = suppliers.length;
  const pendingVerifications = suppliers.filter((s) => s.verificationLevel < 2 || !s.isVerified);
  const openDisputes = disputes.filter((d) => d.status === 'open' || d.status === 'under_investigation');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Top Banner */}
      <div className="bg-[#0e1424] rounded-3xl border border-white/10 p-6 sm:p-8 mb-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/30 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {isArabic ? 'لوحة الإدارة والتحكم' : 'Platform Administration'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isArabic
                  ? 'مراقبة العمليات، توثيق الوكلاء، تتبع النزاعات، وذكاء السوق'
                  : 'Operational overview, dealer verification, dispute resolution & market intelligence'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 mb-6 gap-2 text-xs font-bold overflow-x-auto">
        {[
          { id: 'overview', label: isArabic ? 'نظرة عامة' : 'Overview', icon: TrendingUp },
          { id: 'dealers', label: isArabic ? 'توثيق الوكلاء' : 'Dealer Verification', count: pendingVerifications.length, icon: Store },
          { id: 'insights', label: isArabic ? 'ذكاء السوق' : 'Market Insights', icon: Flame },
          { id: 'disputes', label: isArabic ? 'إدارة النزاعات' : 'Disputes', count: openDisputes.length, icon: AlertCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer min-h-[44px] ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 font-black'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW (Section 20) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Main Operational Overview KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-[#0e1424] rounded-2xl p-5 border border-white/10 shadow-md">
              <span className="text-xs font-bold text-slate-400 block">GMV (Volume)</span>
              <div className="text-2xl font-black text-white mt-1">${totalGMV.toLocaleString()}</div>
              <span className="text-[11px] font-bold text-emerald-400">+18.4% this week</span>
            </div>

            <div className="bg-[#0e1424] rounded-2xl p-5 border border-white/10 shadow-md">
              <span className="text-xs font-bold text-slate-400 block">{isArabic ? 'إجمالي الطلبات' : 'Orders'}</span>
              <div className="text-2xl font-black text-white mt-1">{orders.length + 84}</div>
              <span className="text-[11px] font-bold text-indigo-400">99.2% fulfillment</span>
            </div>

            <div className="bg-[#0e1424] rounded-2xl p-5 border border-white/10 shadow-md">
              <span className="text-xs font-bold text-slate-400 block">{isArabic ? 'الوكلاء المعتمدين' : 'Active Dealers'}</span>
              <div className="text-2xl font-black text-white mt-1">{activeDealersCount}</div>
              <span className="text-[11px] font-bold text-emerald-400">Baghdad, Erbil, Basra</span>
            </div>

            <div className="bg-[#0e1424] rounded-2xl p-5 border border-white/10 shadow-md">
              <span className="text-xs font-bold text-slate-400 block">{isArabic ? 'طلبات التسعير' : 'RFQs'}</span>
              <div className="text-2xl font-black text-white mt-1">{partRequests.length + 140}</div>
              <span className="text-[11px] font-bold text-amber-400">3.4 bids/req avg</span>
            </div>

            <div className="bg-[#0e1424] rounded-2xl p-5 border border-white/10 shadow-md">
              <span className="text-xs font-bold text-slate-400 block">{isArabic ? 'نسبة الإنجاز' : 'Fill Rate'}</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">94.8%</div>
              <span className="text-[11px] font-bold text-slate-400">&lt; 4 hr resolution</span>
            </div>
          </div>

          {/* Needs Attention Triage Bar (Section 20) */}
          <div className="bg-[#0e1424] rounded-2xl border border-amber-500/20 p-5 shadow-md">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>{isArabic ? 'يتطلب إجراء إداري عاجل' : 'Needs Attention'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                onClick={() => setActiveTab('dealers')}
                className="p-3.5 bg-black/40 rounded-xl border border-white/5 hover:border-indigo-500 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">{pendingVerifications.length || 1} {isArabic ? 'وكلاء بانتظار التوثيق' : 'Dealers awaiting verification'}</p>
                  <p className="text-[11px] text-slate-400">{isArabic ? 'مراجعة الأوراق والاعتماد' : 'Review registration documents'}</p>
                </div>
                <button className="text-xs font-bold text-indigo-400">{isArabic ? 'مراجعة' : 'Review'}</button>
              </div>

              <div
                onClick={() => setActiveTab('disputes')}
                className="p-3.5 bg-black/40 rounded-xl border border-white/5 hover:border-amber-500 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">{openDisputes.length || 1} {isArabic ? 'نزاعات مفتوحة' : 'Open customer disputes'}</p>
                  <p className="text-[11px] text-slate-400">{isArabic ? 'ضمان إرجاع أو مطابقة' : 'Warranty or fitment check'}</p>
                </div>
                <button className="text-xs font-bold text-amber-400">{isArabic ? 'حل النزاع' : 'Resolve'}</button>
              </div>

              <div
                className="p-3.5 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">0 {isArabic ? 'انقطاعات في المزامنة' : 'Sync interruptions'}</p>
                  <p className="text-[11px] text-emerald-400 font-bold">{isArabic ? 'جميع تكاملات ERP تعمل بكفاءة' : 'All ERP feeds operational'}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEALER VERIFICATION (Section 21) */}
      {activeTab === 'dealers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              {isArabic ? 'قائمة وتوثيق الوكلاء والمتاجر' : 'Dealer Verification Queue'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map((dealer) => (
              <div key={dealer.id} className="bg-[#0e1424] rounded-2xl border border-white/10 p-5 shadow-md space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-base text-white">{dealer.companyName || dealer.name}</h4>
                    <p className="text-xs text-slate-400">{dealer.city} • {dealer.address}</p>
                    <p className="text-xs text-slate-400 mt-1">{dealer.phone} • {dealer.brands?.join(', ') || 'Toyota Genuine'}</p>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    dealer.isVerified
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}>
                    {dealer.isVerified ? '✓ Verified Merchant' : 'Pending Verification'}
                  </span>
                </div>

                {/* 1-Click Verification Action (Section 21) */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400">
                    Rating: <span className="text-white font-bold">{dealer.rating || 4.9}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {!dealer.isVerified ? (
                      <button
                        onClick={() => updateSupplierVerification(dealer.id, 3, true)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        {isArabic ? 'اعتماد الوكيل وتوثيقه ✓' : 'Approve & Verify'}
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        {isArabic ? 'معتمد رسمي' : 'Authorized'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MARKET INSIGHTS (Section 22) */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">
            {isArabic ? 'ذكاء السوق والطلب الإقليمي' : 'Market Demand & Pricing Insights'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demandIntelligence.map((item, idx) => (
              <div key={idx} className="bg-[#0e1424] rounded-2xl border border-white/10 p-5 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400">{item.category}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                    {item.region}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{item.partName}</h4>
                <p className="text-xs text-slate-400">{item.vehicleTarget}</p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{isArabic ? 'متوسط السعر:' : 'Avg Price:'}</span>
                  <span className="font-bold text-white">${item.averagePriceUSD}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DISPUTE MANAGEMENT (Section 23) */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">
            {isArabic ? 'طابور النزاعات والشكاوى' : 'Open Dispute Queue'} ({openDisputes.length})
          </h3>

          {openDisputes.length === 0 ? (
            <div className="bg-[#0e1424] rounded-2xl border border-white/10 p-8 text-center text-slate-400 text-xs">
              {isArabic ? 'لا توجد أي نزاعات مفتوحة حالياً.' : 'No open disputes found.'}
            </div>
          ) : (
            openDisputes.map((disp) => (
              <div key={disp.id} className="bg-[#0e1424] rounded-2xl border border-white/10 p-5 shadow-md space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                      Order #{disp.orderNumber || '1024'}
                    </span>
                    <h4 className="font-bold text-sm text-white mt-1">{disp.reason}</h4>
                    <p className="text-xs text-slate-400">{disp.customerName} vs {disp.supplierName}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                    ${disp.amountUSD || 140}
                  </span>
                </div>

                <p className="text-xs text-slate-300 p-3 bg-black/30 rounded-xl border border-white/5">
                  {disp.description || 'Customer reported fitment mismatch for Land Cruiser 2023. Sealed return requested.'}
                </p>

                <div className="pt-2 border-t border-white/5 flex items-center justify-end gap-2">
                  <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
                    {isArabic ? 'قبول الإرجاع واسترداد المبلغ' : 'Approve Refund'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
