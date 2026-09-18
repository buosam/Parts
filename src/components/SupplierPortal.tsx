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
  CheckCircle2,
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
  Gavel,
  DollarSign,
  Layers,
  ChevronRight,
  RefreshCw,
  Lock,
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
    setSelectedRequestForBid,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const currentSupplier = suppliers.find((s) => s.id === 'sup-1') || suppliers[0];

  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'inventory' | 'orders' | 'branches'>('overview');
  const [staffRole, setStaffRole] = useState<'owner' | 'manager' | 'sales' | 'inventory' | 'finance'>('owner');

  // Integration modals
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);
  const [isErrorCenterOpen, setIsErrorCenterOpen] = useState<boolean>(false);
  const [isApiSandboxOpen, setIsApiSandboxOpen] = useState<boolean>(false);
  const [isBranchManagerOpen, setIsBranchManagerOpen] = useState<boolean>(false);

  // Manual Add Part form state
  const [showAddPart, setShowAddPart] = useState(false);
  const [manualPartNumber, setManualPartNumber] = useState('');
  const [manualPartName, setManualPartName] = useState('');
  const [manualPrice, setManualPrice] = useState(120);
  const [manualStock, setManualStock] = useState(15);
  const [manualAddedSuccess, setManualAddedSuccess] = useState(false);

  // Bulk Upload State
  const [csvText, setCsvText] = useState(
    `PartNumber,PartName,PriceUSD,Stock,Brand,Quality\n04465-60290,Front Brake Pad Set,140,18,Toyota Genuine,genuine\n04152-YZZA1,Engine Oil Filter Element,14,45,Toyota Genuine,genuine\n48068-60030,Front Lower Control Arm,175,6,Toyota Genuine,genuine\n43512-60190,Brake Disc Rotor Pair,155,10,Toyota Genuine,genuine`
  );
  const [uploadStats, setUploadStats] = useState<{ matchedCount: number; newCount: number } | null>(null);

  const inboundRequests = partRequests.filter(
    (r) => r.status === 'open' || r.status === 'offers_received'
  );

  const supplierOrders = orders.filter((o) => o.supplierId === currentSupplier.id);
  const pendingOrders = supplierOrders.filter((o) => o.status === 'placed' || o.status === 'confirmed');
  const primaryInteg = dealerIntegrations.find((i) => i.dealerId === currentSupplier.id);
  const openErrors = syncErrors.filter((e) => e.dealerId === currentSupplier.id && e.status === 'open');

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPartNumber || !manualPartName) return;

    bulkUploadProducts(currentSupplier.id, [
      {
        partNumber: manualPartNumber,
        partName: manualPartName,
        priceUSD: Number(manualPrice),
        stock: Number(manualStock),
        brand: 'Toyota Genuine',
        quality: 'genuine',
      },
    ]);

    setManualAddedSuccess(true);
    setManualPartNumber('');
    setManualPartName('');
    setTimeout(() => {
      setManualAddedSuccess(false);
      setShowAddPart(false);
    }, 1500);
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
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Modals */}
      {isWizardOpen && (
        <IntegrationOnboardingWizard
          dealerId={currentSupplier.id}
          dealerName={currentSupplier.companyName}
          onClose={() => setIsWizardOpen(false)}
          onComplete={() => setIsWizardOpen(false)}
        />
      )}
      {isCsvModalOpen && (
        <SmartCsvImportModal
          dealerId={currentSupplier.id}
          onClose={() => setIsCsvModalOpen(false)}
          onSuccess={() => setIsCsvModalOpen(false)}
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

      {/* Dealer Header */}
      <div className="bg-[#0e1424] rounded-3xl border border-white/10 p-6 sm:p-8 mb-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/30 shrink-0">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {currentSupplier.companyName}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isArabic ? 'وكيل معتمد' : 'Verified Dealer'}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {currentSupplier.city} • {currentSupplier.address}
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {isArabic ? 'متصل بنظام المخزون' : 'ERP Connected'}
                </span>
              </div>

              {/* Staff Granular Permissions Switcher (Section 13) */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-[11px] text-slate-400 font-semibold">{isArabic ? 'صلاحية الموظف:' : 'Staff Role:'}</span>
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[10px]">
                  {(['owner', 'manager', 'sales', 'inventory', 'finance'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setStaffRole(r)}
                      className={`px-2 py-0.5 rounded-lg font-bold transition-all capitalize cursor-pointer ${
                        staffRole === r
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold rounded-xl border border-white/10 transition-colors cursor-pointer flex items-center gap-2 min-h-[44px]"
            >
              <Server className="w-4 h-4 text-indigo-400" />
              <span>{isArabic ? 'ربط نظام المخزون (ERP)' : 'Connect Inventory'}</span>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2 min-h-[44px]"
            >
              <Gavel className="w-4 h-4" />
              <span>{isArabic ? 'عروض الأسعار' : 'Customer Requests'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 mb-6 gap-2 text-xs font-bold overflow-x-auto">
        {[
          { id: 'overview', label: isArabic ? 'أعمال اليوم' : "Today's Business", icon: TrendingUp },
          { id: 'requests', label: isArabic ? 'الطلبات الواردة' : 'Requests', count: inboundRequests.length, icon: Gavel },
          { id: 'inventory', label: isArabic ? 'إدارة المخزون' : 'Inventory', icon: Layers },
          { id: 'orders', label: isArabic ? 'طلبات الشراء' : 'Orders', count: pendingOrders.length, icon: PackageCheck },
          { id: 'branches', label: isArabic ? 'الفروع والمستودعات' : 'Branches', icon: Building2 },
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

      {/* TAB 1: OVERVIEW (TODAY'S BUSINESS) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Actionable KPIs (Section 12) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0e1424] rounded-2xl p-5 border border-white/10 shadow-md">
              <span className="text-xs font-bold text-slate-400 block">
                {isArabic ? 'الطلبات الجديدة' : 'New Requests'}
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-white">{inboundRequests.length}</span>
                <span className="text-[11px] font-bold text-amber-400">{isArabic ? 'تنتظر التسعير' : 'waiting for offer'}</span>
              </div>
            </div>

            <div className="bg-[#0e1424] rounded-2xl p-5 border border-white/10 shadow-md">
              <span className="text-xs font-bold text-slate-400 block">
                {isArabic ? 'طلبات قيد الشحن' : 'Orders to Ship'}
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-white">{pendingOrders.length || 3}</span>
                <span className="text-[11px] font-bold text-indigo-400">{isArabic ? 'جاهزة للتجهيز' : 'ready to dispatch'}</span>
              </div>
            </div>

            <div className="bg-[#0e1424] rounded-2xl p-5 border border-white/10 shadow-md">
              <span className="text-xs font-bold text-slate-400 block">
                {isArabic ? 'مبيعات اليوم' : "Today's Sales"}
              </span>
              {staffRole === 'inventory' ? (
                <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold">{isArabic ? 'محجوب (مالك/مالية فقط)' : 'Restricted (Owner/Finance)'}</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-emerald-400">$12,450</span>
                  <span className="text-[11px] font-bold text-slate-400">IQD 18.6M</span>
                </div>
              )}
            </div>

            <div className="bg-[#0e1424] rounded-2xl p-5 border border-white/10 shadow-md">
              <span className="text-xs font-bold text-slate-400 block">
                {isArabic ? 'حالة مزامنة المخزون' : 'Inventory Sync'}
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-xl font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" />
                  {isArabic ? 'متصل ومحدث' : 'Connected'}
                </span>
              </div>
            </div>
          </div>

          {/* Needs Attention Bar (Section 12) */}
          <div className="bg-[#0e1424] rounded-2xl border border-amber-500/20 p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {isArabic ? 'يتطلب انتباهك' : 'Needs Attention'}
                </h4>
                <p className="text-xs text-slate-300">
                  {inboundRequests.length} {isArabic ? 'طلبات بانتظار عرضك' : 'requests waiting'} • {pendingOrders.length || 3} {isArabic ? 'طلبات للتسليم' : 'orders to ship'} • {openErrors.length} {isArabic ? 'ملاحظات مزامنة' : 'sync notes'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('requests')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer min-h-[40px]"
              >
                {isArabic ? 'تسعير الطلبات الآن' : 'Quote Requests'}
              </button>
            </div>
          </div>

          {/* Quick 3 Inventory Actions Preview (Section 14) */}
          <div className="bg-[#0e1424] rounded-2xl border border-white/10 p-6 shadow-md">
            <h3 className="text-sm font-bold text-white mb-4">
              {isArabic ? 'طرق إدارة وربط المخزون' : '3 Simple Inventory Methods'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setIsWizardOpen(true)}
                className="p-5 rounded-2xl bg-black/30 border border-white/5 hover:border-indigo-500/50 transition-all cursor-pointer group"
              >
                <Server className="w-6 h-6 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-sm text-white">{isArabic ? '1. ربط النظام (ERP / DMS)' : '1. Connect ERP / DMS'}</h4>
                <p className="text-xs text-slate-400 mt-1">{isArabic ? 'مزامنة تلقائية للمخزون والأسعار كل 15 دقيقة.' : 'Auto-sync stock and prices every 15 minutes.'}</p>
              </div>

              <div
                onClick={() => setIsCsvModalOpen(true)}
                className="p-5 rounded-2xl bg-black/30 border border-white/5 hover:border-emerald-500/50 transition-all cursor-pointer group"
              >
                <FileSpreadsheet className="w-6 h-6 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-sm text-white">{isArabic ? '2. رفع ملف إكسل (Excel)' : '2. Upload Excel / CSV'}</h4>
                <p className="text-xs text-slate-400 mt-1">{isArabic ? 'تحديث وتنزيل ملفات القطع والمخزون بضغطة زر.' : 'Import thousands of parts in seconds.'}</p>
              </div>

              <div
                onClick={() => {
                  setActiveTab('inventory');
                  setShowAddPart(true);
                }}
                className="p-5 rounded-2xl bg-black/30 border border-white/5 hover:border-amber-500/50 transition-all cursor-pointer group"
              >
                <Plus className="w-6 h-6 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-sm text-white">{isArabic ? '3. إضافة قطع يدوياً' : '3. Add Parts Manually'}</h4>
                <p className="text-xs text-slate-400 mt-1">{isArabic ? 'إدخال سريع لقطعة معينة برقمها وسعرها.' : 'Quick single part creation form.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INBOUND REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              {isArabic ? 'طلبات قطع السيارات بانتظار تسعيرك' : 'Incoming Part Requests'} ({inboundRequests.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inboundRequests.map((req) => (
              <div
                key={req.id}
                className="bg-[#0e1424] rounded-2xl border border-white/10 p-5 shadow-md space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                      #{req.requestNumber}
                    </span>
                    <h4 className="font-bold text-base text-white mt-1">{req.partName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      🚗 {req.vehicle.make} {req.vehicle.model} ({req.vehicle.year}) • {req.city || 'Erbil'}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    {req.offers.length} {isArabic ? 'عروض موجودة' : 'Quotes'}
                  </span>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {isArabic ? 'الجودة المطلوبة:' : 'Target:'} <span className="text-white font-bold">{req.qualityPreference || 'Genuine OEM'}</span>
                  </span>
                  <button
                    onClick={() => setSelectedRequestForBid(req)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer min-h-[40px]"
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'تقديم عرض سعر' : 'Send Offer'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INVENTORY (3 METHODS) */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Status Box (Section 14) */}
          <div className="bg-[#0e1424] rounded-2xl border border-white/10 p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  {isArabic ? 'المخزون متصل ومحدث ✓' : 'Inventory Connected ✓'}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  24,820 {isArabic ? 'قطعة معرفة' : 'parts registered'} • 18,420 {isArabic ? 'متوفرة في المخزن' : 'units in stock'} • {isArabic ? 'آخر مزامنة: قبل دقيقتين' : 'Last sync: 2 mins ago'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsWizardOpen(true)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/10 cursor-pointer min-h-[40px]"
              >
                {isArabic ? 'إعدادات المزامنة' : 'Sync Settings'}
              </button>
            </div>
          </div>

          {/* 3 Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="p-5 bg-[#0e1424] rounded-2xl border border-white/10 hover:border-indigo-500 text-left rtl:text-right transition-all cursor-pointer"
            >
              <Server className="w-5 h-5 text-indigo-400 mb-2" />
              <h4 className="font-bold text-white text-sm">{isArabic ? '1. ربط ERP / DMS' : '1. Connect ERP / DMS'}</h4>
              <p className="text-xs text-slate-400 mt-1">{isArabic ? 'ربط تلقائي مع أنظمة SAP, Odoo, Microline.' : 'Automated API connectors.'}</p>
            </button>

            <button
              onClick={() => setIsCsvModalOpen(true)}
              className="p-5 bg-[#0e1424] rounded-2xl border border-white/10 hover:border-emerald-500 text-left rtl:text-right transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-400 mb-2" />
              <h4 className="font-bold text-white text-sm">{isArabic ? '2. رفع ملف إكسل' : '2. Upload Excel / CSV'}</h4>
              <p className="text-xs text-slate-400 mt-1">{isArabic ? 'رفع جدول قطع الغيار دفعة واحدة.' : 'Bulk upload stock sheets.'}</p>
            </button>

            <button
              onClick={() => setShowAddPart(!showAddPart)}
              className="p-5 bg-[#0e1424] rounded-2xl border border-white/10 hover:border-amber-500 text-left rtl:text-right transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 text-amber-400 mb-2" />
              <h4 className="font-bold text-white text-sm">{isArabic ? '3. إضافة يدوية' : '3. Add Single Part'}</h4>
              <p className="text-xs text-slate-400 mt-1">{isArabic ? 'إضافة قطعة فردية مباشرة إلى المتجر.' : 'Manual part insertion form.'}</p>
            </button>
          </div>

          {/* Manual Add Part Form */}
          {showAddPart && (
            <form onSubmit={handleManualAddSubmit} className="bg-[#0e1424] rounded-2xl border border-white/10 p-6 shadow-md space-y-4">
              <h4 className="text-sm font-bold text-white">{isArabic ? 'إضافة قطعة جديدة يدوياً' : 'Add New Part'}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <input
                  type="text"
                  required
                  placeholder={isArabic ? 'رقم القطعة (Part Number)' : 'Part Number OEM'}
                  value={manualPartNumber}
                  onChange={(e) => setManualPartNumber(e.target.value)}
                  className="px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden min-h-[44px]"
                />
                <input
                  type="text"
                  required
                  placeholder={isArabic ? 'اسم القطعة (Part Name)' : 'Part Name'}
                  value={manualPartName}
                  onChange={(e) => setManualPartName(e.target.value)}
                  className="px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden min-h-[44px]"
                />
                <input
                  type="number"
                  required
                  placeholder={isArabic ? 'السعر ($ USD)' : 'Price ($ USD)'}
                  value={manualPrice}
                  onChange={(e) => setManualPrice(Number(e.target.value))}
                  className="px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden min-h-[44px]"
                />
                <input
                  type="number"
                  required
                  placeholder={isArabic ? 'الكمية المتوفرة' : 'Stock Quantity'}
                  value={manualStock}
                  onChange={(e) => setManualStock(Number(e.target.value))}
                  className="px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden min-h-[44px]"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer min-h-[44px]"
                >
                  {isArabic ? 'حفظ وإضافة للمخزون' : 'Save & Add to Stock'}
                </button>
                {manualAddedSuccess && (
                  <span className="text-xs font-bold text-emerald-400">
                    {isArabic ? 'تمت إضافة القطعة بنجاح!' : 'Part added to inventory successfully!'}
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 4: ORDERS (Timeline Section 17) */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">
            {isArabic ? 'طلبات الشراء والتجهيز' : 'Customer Orders'} ({supplierOrders.length})
          </h3>

          {supplierOrders.length === 0 ? (
            <div className="bg-[#0e1424] rounded-2xl border border-white/10 p-8 text-center text-slate-400 text-xs">
              {isArabic ? 'لا توجد طلبات شراء مسجلة حالياً.' : 'No orders found.'}
            </div>
          ) : (
            supplierOrders.map((ord) => (
              <div key={ord.id} className="bg-[#0e1424] rounded-2xl border border-white/10 p-5 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                      #{ord.orderNumber}
                    </span>
                    <p className="text-sm font-bold text-white mt-1">{ord.customerName} • {ord.customerPhone}</p>
                    <p className="text-xs text-slate-400">{ord.deliveryAddress}</p>
                  </div>
                  <div className="text-right rtl:text-left">
                    <span className="text-lg font-black text-emerald-400">{formatPrice(ord.totalUSD, ord.totalIQD)}</span>
                  </div>
                </div>

                {/* Timeline Visual (Section 17) */}
                <div className="p-3 bg-black/30 rounded-xl border border-white/5 flex items-center justify-between text-xs font-bold overflow-x-auto gap-2">
                  {['placed', 'confirmed', 'preparing', 'shipped', 'delivered'].map((step, idx) => {
                    const stepLabels: Record<string, { en: string; ar: string }> = {
                      placed: { en: 'Order Placed', ar: 'تم الطلب' },
                      confirmed: { en: 'Confirmed', ar: 'تم التأكيد' },
                      preparing: { en: 'Preparing', ar: 'قيد التجهيز' },
                      shipped: { en: 'Shipped', ar: 'تم الشحن' },
                      delivered: { en: 'Delivered', ar: 'تم التوصيل' },
                    };
                    const isPassed = ['placed', 'confirmed', 'preparing', 'shipped', 'delivered'].indexOf(ord.status) >= idx;

                    return (
                      <div key={step} className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] ${
                          isPassed ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-white/10 text-slate-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className={isPassed ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {isArabic ? stepLabels[step].ar : stepLabels[step].en}
                        </span>
                        {idx < 4 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{ord.items.length} {isArabic ? 'قطع مطلوبة' : 'items'}</span>
                  {ord.status !== 'delivered' && (
                    <button
                      onClick={() => updateOrderStatus(ord.id, ord.status === 'placed' ? 'confirmed' : ord.status === 'confirmed' ? 'preparing' : 'shipped')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors cursor-pointer min-h-[40px]"
                    >
                      {isArabic ? 'تحديث الحالة للمرحلة التالية' : 'Advance Order Status'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: BRANCHES (Multi-Branch Section 16) */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              {isArabic ? 'مخزون الفروع والمستودعات' : 'Multi-Branch Inventory'}
            </h3>
            <button
              onClick={() => setIsBranchManagerOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer min-h-[40px]"
            >
              {isArabic ? 'إدارة الفروع' : 'Manage Branches'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { city: 'Erbil', cityAr: 'أربيل', units: 4820, status: 'Active Dispatch' },
              { city: 'Baghdad', cityAr: 'بغداد (السنك)', units: 12450, status: 'Main Hub' },
              { city: 'Sulaymaniyah', cityAr: 'السليمانية', units: 3910, status: 'Active Dispatch' },
              { city: 'Basra', cityAr: 'البصرة', units: 3640, status: 'Active Dispatch' },
            ].map((br) => (
              <div key={br.city} className="bg-[#0e1424] rounded-2xl border border-white/10 p-5 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{isArabic ? br.cityAr : br.city}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400 mt-2">{br.units.toLocaleString()}</div>
                <span className="text-[11px] text-slate-400 mt-1 block">{br.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
