/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Zap,
  RefreshCw,
  Server,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Key,
  Copy,
  Check,
  Play,
  Pause,
  Sliders,
  Layers,
  Code2,
  Building2,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

interface IntegrationDashboardProps {
  supplierId: string;
  onOpenWizard: () => void;
  onOpenCsvImport: () => void;
  onOpenErrorCenter: () => void;
  onOpenApiSandbox: () => void;
  onOpenBranchManager: () => void;
}

export const IntegrationDashboard: React.FC<IntegrationDashboardProps> = ({
  supplierId,
  onOpenWizard,
  onOpenCsvImport,
  onOpenErrorCenter,
  onOpenApiSandbox,
  onOpenBranchManager,
}) => {
  const {
    dealerIntegrations,
    syncJobs,
    syncErrors,
    triggerManualSync,
    toggleIntegrationStatus,
    generateOrRotateApiKey,
    language,
    dealerBranches,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Integrations belonging to this dealer (or primary mock integ)
  const integrations = dealerIntegrations.filter((i) => i.dealerId === supplierId);
  const primaryInteg = integrations[0] || dealerIntegrations[0];

  const dealerJobs = syncJobs.filter((j) => j.dealerId === supplierId || j.integrationId === primaryInteg?.id);
  const openErrors = syncErrors.filter(
    (e) => (e.dealerId === supplierId || e.integrationId === primaryInteg?.id) && e.status === 'open'
  );
  const dealerBranchList = dealerBranches.filter((b) => b.dealerId === supplierId);

  const handleManualSync = async (integId: string) => {
    setIsSyncing(integId);
    try {
      const job = await triggerManualSync(integId, 'incremental');
      setSyncFeedback(
        isArabic
          ? `تمت المزامنة بنجاح: تم معالجة ${job.recordsProcessed} سجل (${job.recordsUpdated} تحديث، ${job.recordsCreated} جديد)`
          : `Sync completed: Processed ${job.recordsProcessed} records (${job.recordsUpdated} updated, ${job.recordsCreated} created)`
      );
      setTimeout(() => setSyncFeedback(null), 5000);
    } finally {
      setIsSyncing(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Success */}
      {syncFeedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{syncFeedback}</span>
          </div>
          <button
            onClick={() => setSyncFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            {isArabic ? 'إغلاق' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Primary KPI Header Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isArabic ? 'حالة الاتصال' : 'Connection'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                primaryInteg?.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
          </div>
          <div className="text-base font-black text-neutral-900 capitalize flex items-center gap-1.5">
            {primaryInteg ? primaryInteg.status : 'Active'}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 truncate">
            {primaryInteg?.providerName || 'REST API Gateway'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isArabic ? 'صحة المزامنة' : 'Sync Health'}
            </span>
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-base font-black text-emerald-600">
            {primaryInteg?.syncHealthScore ?? 98}%
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {primaryInteg?.lastSyncAt ? 'Updated 8 min ago' : 'Live'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isArabic ? 'القطع المتزامنة' : 'Synced Products'}
            </span>
            <Layers className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-base font-black text-neutral-900">
            {(primaryInteg?.totalProductsSynced ?? 3420).toLocaleString()}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">{isArabic ? 'كتالوج معتمد' : 'In Marketplace'}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isArabic ? 'سجلات المخزون' : 'Stock Records'}
            </span>
            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-base font-black text-neutral-900">
            {(primaryInteg?.totalInventorySynced ?? 14850).toLocaleString()}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {dealerBranchList.length || 4} {isArabic ? 'فروع ومستودعات' : 'Branches'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isArabic ? 'سجلات معلقة' : 'Pending Updates'}
            </span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-base font-black text-amber-600">
            {primaryInteg?.pendingUpdatesCount ?? 12}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">{isArabic ? 'في طابور المزامنة' : 'In Sync Queue'}</p>
        </div>

        <div
          onClick={onOpenErrorCenter}
          className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs cursor-pointer hover:border-red-300 transition-colors group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-red-600">
              {isArabic ? 'أخطاء وسجلات' : 'Sync Errors'}
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-base font-black text-red-600 flex items-center justify-between">
            <span>{openErrors.length}</span>
            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
              {isArabic ? 'مراجعة' : 'Review'}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">{isArabic ? 'مركز معالجة الأخطاء' : 'Click to resolve'}</p>
        </div>
      </div>

      {/* Quick Actions Action Bar */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 rounded-2xl p-5 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] uppercase tracking-wider">
              B2B CONNECT
            </span>
            <h3 className="font-bold text-base">
              {isArabic ? 'بوابة تكامل ومزامنة أنظمة الوكلاء والمتاجر' : 'Dealer ERP & Inventory Integration Gateway'}
            </h3>
          </div>
          <p className="text-neutral-300 text-xs mt-1">
            {isArabic
              ? 'اربط نظام ERP، DMS، أو POS الخاص بك أو ارفع ملفات Excel لمزامنة الأسعار والمخزون والفروع تلقائياً.'
              : 'Connect your DMS, ERP, POS or Excel files to automatically publish real-time stock, pricing, and branch availability.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => primaryInteg && handleManualSync(primaryInteg.id)}
            disabled={isSyncing !== null}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? (isArabic ? 'جاري المزامنة...' : 'Syncing...') : isArabic ? 'مزامنة فورية الآن' : 'Trigger Sync'}</span>
          </button>

          <button
            onClick={onOpenCsvImport}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isArabic ? 'استيراد ذكي Excel / CSV' : 'Smart CSV/Excel'}</span>
          </button>

          <button
            onClick={onOpenWizard}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isArabic ? 'معالج ربط نظام جديد' : 'New System Wizard'}</span>
          </button>

          <button
            onClick={onOpenApiSandbox}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs border border-neutral-700 flex items-center gap-1.5 transition-all"
          >
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{isArabic ? 'منصة اختبار API' : 'Partner API & Docs'}</span>
          </button>

          <button
            onClick={onOpenBranchManager}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs border border-neutral-700 flex items-center gap-1.5 transition-all"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>{isArabic ? 'إدارة الفروع والمستودعات' : 'Branches'}</span>
          </button>
        </div>
      </div>

      {/* Connected Systems List */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-black text-neutral-900">
              {isArabic ? 'الأنظمة والروابط المتصلة' : 'Connected Systems & Connectors'}
            </h3>
            <p className="text-xs text-neutral-500">
              {isArabic
                ? 'إدارة قنوات التكامل النشطة، مفاتيح API، وقواعد التزامن التلقائي.'
                : 'Manage active integration connectors, API credentials, and sync schedules.'}
            </p>
          </div>
          <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
            {integrations.length || 1} {isArabic ? 'موصل نشط' : 'Active Connector(s)'}
          </span>
        </div>

        <div className="space-y-4">
          {integrations.map((integ) => (
            <div
              key={integ.id}
              className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-white hover:border-neutral-300 transition-all space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-xs">
                    {integ.providerType === 'dms' ? 'DMS' : integ.providerType === 'erp' ? 'ERP' : 'POS'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-neutral-900">{integ.providerName}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                        {integ.providerVersion || 'v1.0'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          integ.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {integ.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Method: <span className="font-semibold text-neutral-700 uppercase">{integ.integrationMethod}</span> ·
                      Frequency: <span className="font-semibold text-neutral-700">{integ.syncRules?.syncFrequency || 'every_15min'}</span> ·
                      Reservation: <span className="font-semibold text-neutral-700">{integ.syncRules?.stockReservationMode || 'Marketplace'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleManualSync(integ.id)}
                    disabled={isSyncing === integ.id}
                    className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing === integ.id ? 'animate-spin' : ''}`} />
                    <span>{isSyncing === integ.id ? 'Syncing...' : isArabic ? 'مزامنة' : 'Sync'}</span>
                  </button>

                  <button
                    onClick={() =>
                      toggleIntegrationStatus(integ.id, integ.status === 'active' ? 'paused' : 'active')
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                      integ.status === 'active'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    {integ.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{integ.status === 'active' ? (isArabic ? 'إيقاف مؤقت' : 'Pause') : isArabic ? 'استئناف' : 'Resume'}</span>
                  </button>

                  <button
                    onClick={onOpenWizard}
                    className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>{isArabic ? 'تعديل القواعد' : 'Configure'}</span>
                  </button>
                </div>
              </div>

              {/* API Credentials & Webhook Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-neutral-200/70 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-neutral-200">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Key className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                    <span className="text-neutral-500 font-medium">Partner API Key:</span>
                    <code className="font-mono text-neutral-900 truncate">
                      {integ.maskedApiKey || 'iqm_live_••••••••••••••••••••7d41'}
                    </code>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={() => handleCopy(integ.apiKey || 'iqm_live_9f83a09b2e1f40d7c58e8b2a7d41', integ.id)}
                      title="Copy Key"
                      className="p-1 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors"
                    >
                      {copiedKey === integ.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => generateOrRotateApiKey(integ.id)}
                      title="Rotate Key"
                      className="text-[10px] font-bold text-neutral-500 hover:text-neutral-900 px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 transition-colors"
                    >
                      {isArabic ? 'تدوير' : 'Rotate'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-neutral-200">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Server className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                    <span className="text-neutral-500 font-medium">Endpoint:</span>
                    <span className="text-neutral-800 font-mono truncate text-[11px]">
                      {integ.endpointUrl || '/api/v1/partner/inventory/sync'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {integ.webhookStatus || 'ACTIVE'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync Jobs History */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-neutral-900">
              {isArabic ? 'سجل عمليات المزامنة الأخيرة' : 'Recent Synchronization Jobs'}
            </h3>
            <p className="text-xs text-neutral-500">
              {isArabic ? 'سجل زمني دقيق لكل استدعاء API أو استيراد ملف مع عدد السجلات المعالجة.' : 'Audit trail of recent API sync executions and file imports.'}
            </p>
          </div>
          <span className="text-xs text-neutral-400">Showing last {dealerJobs.length} jobs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">{isArabic ? 'معرف العملية' : 'Job ID'}</th>
                <th className="pb-3">{isArabic ? 'نوع المزامنة' : 'Sync Type'}</th>
                <th className="pb-3">{isArabic ? 'الحالة' : 'Status'}</th>
                <th className="pb-3">{isArabic ? 'السجلات المعالجة' : 'Processed'}</th>
                <th className="pb-3">{isArabic ? 'التحديث / الإضافة' : 'Updated / New'}</th>
                <th className="pb-3">{isArabic ? 'الأخطاء' : 'Failed'}</th>
                <th className="pb-3">{isArabic ? 'التوقيت والمدة' : 'Timestamp & Duration'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {dealerJobs.map((job) => (
                <tr key={job.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-3 font-mono font-bold text-neutral-900">{job.id}</td>
                  <td className="py-3 capitalize">
                    <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 font-medium">
                      {job.syncType}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] ${
                        job.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : job.status === 'completed_with_warnings'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {job.status === 'completed' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      )}
                      {job.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 font-bold">{job.recordsProcessed.toLocaleString()}</td>
                  <td className="py-3">
                    <span className="text-emerald-700 font-semibold">+{job.recordsUpdated} updated</span>{' '}
                    <span className="text-neutral-400">({job.recordsCreated} new)</span>
                  </td>
                  <td className="py-3">
                    {job.recordsFailed > 0 ? (
                      <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                        {job.recordsFailed} failed
                      </span>
                    ) : (
                      <span className="text-neutral-400">0</span>
                    )}
                  </td>
                  <td className="py-3 text-neutral-500">
                    <div>{new Date(job.startedAt).toLocaleTimeString()}</div>
                    <div className="text-[10px] text-neutral-400">{job.durationMs || 820}ms</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
