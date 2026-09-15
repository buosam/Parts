/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Check,
  X,
  FileDown,
  HelpCircle,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { IntegrationSyncError } from '../../types';

interface DealerErrorCenterProps {
  supplierId: string;
  onClose?: () => void;
}

export const DealerErrorCenter: React.FC<DealerErrorCenterProps> = ({
  supplierId,
  onClose,
}) => {
  const { syncErrors, resolveSyncError, language } = useMarketplace();
  const isArabic = language === 'ar';

  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved'>('open');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedErrorForDetails, setSelectedErrorForDetails] = useState<IntegrationSyncError | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const errors = syncErrors.filter(
    (e) => e.dealerId === supplierId || e.integrationId === 'integ-1'
  );

  const filtered = errors.filter((e) => {
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    if (filterType !== 'all' && e.errorType !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.externalRecordId.toLowerCase().includes(q) ||
        e.productNameHint?.toLowerCase().includes(q) ||
        e.errorMessage.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleResolve = (id: string, action: 'resolve' | 'ignore' | 'retry') => {
    resolveSyncError(id, action);
    setActionFeedback(
      action === 'retry'
        ? (isArabic ? 'تمت جدولة إعادة المحاولة للسجل بنجاح' : 'Record scheduled for instant retry')
        : (isArabic ? 'تم تحديث حالة السجل بنجاح' : 'Error marked as resolved')
    );
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleExportErrors = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Record ID,Product Name,Error Type,Error Message,Date Detected,Status']
        .concat(
          filtered.map(
            (e) =>
              `"${e.externalRecordId}","${e.productNameHint || ''}","${e.errorType}","${e.errorMessage}","${e.dateDetected}","${e.status}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `iqautomarket_sync_errors_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-100 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-neutral-900">
                {isArabic ? 'مركز معالجة أخطاء المزامنة والبيانات' : 'Dealer Integration Error Center'}
              </h3>
              <p className="text-xs text-neutral-500">
                {isArabic
                  ? 'سجل تفصيلي للأخطاء المكتشفة أثناء فحص وتزامن بيانات المنتجات والمخزون مع إرشادات الحل.'
                  : 'Diagnostic log of failed payload rows with root-cause explanations and 1-click remediation.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportErrors}
            className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isArabic ? 'تصدير تقرير CSV' : 'Export Errors CSV'}</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors"
            >
              {isArabic ? 'العودة للوحة' : 'Back to Overview'}
            </button>
          )}
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'بحث برقم السجل، اسم القطعة، أو نص الخطأ...' : 'Search by Record ID, Part Name, or Error description...'}
            className="w-full text-xs font-medium focus:outline-hidden text-neutral-900"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
            {(['open', 'resolved', 'all'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                  filterStatus === st ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-neutral-200 font-medium bg-white text-xs"
          >
            <option value="all">All Error Types</option>
            <option value="missing_part_number">Missing Part Number</option>
            <option value="invalid_price">Invalid / Negative Price</option>
            <option value="unmapped_branch">Unmapped Branch Code</option>
            <option value="negative_stock">Negative Stock</option>
            <option value="unrecognized_brand">Unrecognized Brand</option>
          </select>
        </div>
      </div>

      {/* Errors Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4">{isArabic ? 'معرف السجل' : 'Record ID'}</th>
                <th className="p-4">{isArabic ? 'المنتج المكتشف' : 'Product Hint'}</th>
                <th className="p-4">{isArabic ? 'نوع الخطأ' : 'Error Category'}</th>
                <th className="p-4">{isArabic ? 'السبب والحل المقترح' : 'Root Cause & Suggested Fix'}</th>
                <th className="p-4">{isArabic ? 'الحالة' : 'Status'}</th>
                <th className="p-4 text-right">{isArabic ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-neutral-700">No sync errors found</p>
                    <p className="text-xs">All inventory records matched IQAutoMarket validation schema.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((err) => (
                  <tr key={err.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="p-4 font-mono font-bold text-neutral-900">{err.externalRecordId}</td>
                    <td className="p-4">
                      <div className="font-bold text-neutral-900">{err.productNameHint || 'Unspecified Part'}</div>
                      <div className="text-[11px] text-neutral-400">{new Date(err.dateDetected).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                        {err.errorType.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 max-w-md">
                      <div className="font-semibold text-neutral-800">{err.errorMessage}</div>
                      <div className="text-[11px] text-emerald-700 flex items-center gap-1 mt-0.5">
                        <Sparkles className="w-3 h-3 flex-shrink-0" />
                        <span>Fix: {err.suggestedSolution}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          err.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : err.status === 'ignored'
                            ? 'bg-neutral-100 text-neutral-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {err.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleResolve(err.id, 'retry')}
                          title="Retry Record"
                          className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                        <button
                          onClick={() => handleResolve(err.id, 'resolve')}
                          title="Mark Resolved"
                          className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
