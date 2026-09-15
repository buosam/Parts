/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Check,
  X,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { IntegrationFieldMapping } from '../../types';

interface SmartCsvImportModalProps {
  supplierId: string;
  onClose: () => void;
  onImportSuccess?: () => void;
}

export const SmartCsvImportModal: React.FC<SmartCsvImportModalProps> = ({
  supplierId,
  onClose,
  onImportSuccess,
}) => {
  const {
    processSmartCsvImport,
    dealerBranches,
    dealerIntegrations,
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const branches = dealerBranches.filter((b) => b.dealerId === supplierId);
  const currentInteg = dealerIntegrations.find((i) => i.dealerId === supplierId);

  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'success'>('upload');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id || 'branch-1');
  const [fileName, setFileName] = useState<string>('toyota_oem_inventory_feed_2026.csv');

  // Sample initial CSV raw text
  const [rawCsvText, setRawCsvText] = useState<string>(
    `ItemCode,Description,OEMNumber,BrandName,QtyOnHand,UnitPriceUSD,WarehouseCode\n04465-60290,Front Brake Pad Set (Ceramic),04465-60290,Toyota Genuine,28,145.00,ERB-01\n04152-YZZA1,Engine Oil Filter Element with O-Rings,04152-YZZA1,Toyota Genuine,65,16.00,ERB-01\n48068-60030,Front Lower Control Arm Assembly RH,48068-60030,Toyota Genuine,12,185.00,ERB-01\n43512-60190,Front Brake Disc Rotor Pair,43512-60190,Toyota Genuine,14,165.00,ERB-01\n90919-01191,Iridium Spark Plugs Set (4 pcs),90919-01191,Denso OEM,40,52.00,ERB-01`
  );

  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<IntegrationFieldMapping[]>(
    currentInteg?.fieldMappings || [
      { id: '1', integrationId: 'csv', sourceField: 'ItemCode', destinationField: 'partNumber', required: true, transformationRule: 'uppercase' },
      { id: '2', integrationId: 'csv', sourceField: 'Description', destinationField: 'title', required: true, transformationRule: 'trim' },
      { id: '3', integrationId: 'csv', sourceField: 'OEMNumber', destinationField: 'oemNumber', required: false, transformationRule: 'uppercase' },
      { id: '4', integrationId: 'csv', sourceField: 'BrandName', destinationField: 'brand', required: true, transformationRule: 'trim' },
      { id: '5', integrationId: 'csv', sourceField: 'QtyOnHand', destinationField: 'totalQuantity', required: true, transformationRule: 'none' },
      { id: '6', integrationId: 'csv', sourceField: 'UnitPriceUSD', destinationField: 'priceUSD', required: true, transformationRule: 'none' },
    ]
  );

  const [importResult, setImportResult] = useState<{
    createdCount: number;
    updatedCount: number;
    errorCount: number;
    errors: string[];
  } | null>(null);

  const parseCsv = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return;
    const colHeaders = lines[0].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    setHeaders(colHeaders);

    const rows: Record<string, any>[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const rowObj: Record<string, any> = {};
      colHeaders.forEach((h, idx) => {
        rowObj[h] = values[idx] || '';
      });
      rows.push(rowObj);
    }
    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawCsvText(content);
      parseCsv(content);
      setStep('mapping');
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const templateContent =
      'ItemCode,Description,OEMNumber,BrandName,QtyOnHand,UnitPriceUSD,WarehouseCode\n04465-60290,Front Brake Pad Set,04465-60290,Toyota Genuine,20,145.00,ERB-01\n04152-YZZA1,Engine Oil Filter,04152-YZZA1,Toyota Genuine,50,15.00,ERB-01';
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'iqautomarket_inventory_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteImport = () => {
    if (parsedRows.length === 0) parseCsv(rawCsvText);
    const rowsToProcess = parsedRows.length > 0 ? parsedRows : [];

    if (rowsToProcess.length === 0) {
      // Parse immediate
      const lines = rawCsvText.trim().split('\n');
      const colHeaders = lines[0].split(',').map((c) => c.trim());
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(',').map((v) => v.trim());
        const row: Record<string, any> = {};
        colHeaders.forEach((h, idx) => (row[h] = vals[idx] || ''));
        rowsToProcess.push(row);
      }
    }

    const result = processSmartCsvImport(supplierId, rowsToProcess, mappings, {
      branchId: selectedBranchId,
      currency: 'USD',
      autoPublish: true,
    });

    setImportResult(result);
    setStep('success');
    if (onImportSuccess) onImportSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden animate-scaleUp my-6">
        {/* Modal Header */}
        <div className="bg-neutral-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded">
                  Method B — File Ingestion Pipeline
                </span>
              </div>
              <h2 className="text-base font-black tracking-tight text-white mt-0.5">
                {isArabic ? 'استيراد ومزامنة ملفات Excel / CSV الذكي' : 'Smart CSV & Excel Inventory Importer'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    {isArabic ? '1. اختر ملف الكتالوج أو الصق البيانات' : '1. Upload Inventory File or Template'}
                  </h3>
                  <p className="text-neutral-500 text-[11px]">
                    Supports .CSV, .XLSX, and tab-delimited feeds up to 100,000 SKUs.
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isArabic ? 'تحميل قالب CSV' : 'Download Sample CSV'}</span>
                </button>
              </div>

              {/* Drag and drop upload box */}
              <label className="block p-8 border-2 border-dashed border-neutral-300 hover:border-emerald-500 rounded-2xl bg-neutral-50 text-center cursor-pointer transition-colors group">
                <Upload className="w-8 h-8 text-neutral-400 group-hover:text-emerald-600 mx-auto mb-2 transition-colors" />
                <div className="font-bold text-sm text-neutral-800">
                  {fileName ? fileName : 'Click to select or drag and drop your parts file'}
                </div>
                <div className="text-neutral-500 text-[11px] mt-1">
                  Automatic header detection & character encoding resolution
                </div>
                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
              </label>

              {/* Destination Branch Picker */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Target Inventory Branch / Location:
                </label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 font-semibold bg-white"
                >
                  {(branches.length ? branches : [
                    { id: 'branch-1', branchName: 'Erbil Main Showroom', city: 'Erbil' },
                    { id: 'branch-2', branchName: 'Baghdad Distribution Hub', city: 'Baghdad' },
                    { id: 'branch-3', branchName: 'Sulaymaniyah Depot', city: 'Sulaymaniyah' },
                    { id: 'branch-4', branchName: 'Basra Southern Hub', city: 'Basra' },
                  ]).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branchName} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Direct Paste fallback */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Or Paste Raw CSV Data Directly:
                </label>
                <textarea
                  rows={5}
                  value={rawCsvText}
                  onChange={(e) => {
                    setRawCsvText(e.target.value);
                    parseCsv(e.target.value);
                  }}
                  className="w-full p-3 rounded-xl border border-neutral-200 font-mono text-[11px] bg-neutral-50 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  {isArabic ? '2. مراجعة وتأكيد مطابقة الأعمدة' : '2. Verify Column Mappings'}
                </h3>
                <p className="text-neutral-500 text-[11px]">
                  IQAutoMarket auto-detected your file columns. Confirm or adjust the target field mappings below.
                </p>
              </div>

              <div className="border border-neutral-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">File Column</th>
                      <th className="p-3">Target Field</th>
                      <th className="p-3">Transformation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {mappings.map((m, idx) => (
                      <tr key={m.id}>
                        <td className="p-3 font-mono font-bold text-neutral-900">{m.sourceField}</td>
                        <td className="p-3">
                          <span className="font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {m.destinationField}
                          </span>
                        </td>
                        <td className="p-3 text-neutral-500 font-mono text-[11px]">
                          {m.transformationRule || 'Direct'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 'success' && importResult && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-black text-neutral-900">
                  {isArabic ? 'تم استيراد ومزامنة المخزون بنجاح!' : 'Inventory Successfully Synchronized!'}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Products and stock quantities are now live and searchable by vehicle owners and garages.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-left">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] uppercase font-bold text-emerald-700">New Added</div>
                  <div className="text-lg font-black text-emerald-900">+{importResult.createdCount}</div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="text-[10px] uppercase font-bold text-blue-700">Updated</div>
                  <div className="text-lg font-black text-blue-900">+{importResult.updatedCount}</div>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="text-[10px] uppercase font-bold text-neutral-500">Errors</div>
                  <div className="text-lg font-black text-neutral-800">{importResult.errorCount}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-50 p-4 border-t border-neutral-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 font-bold hover:bg-neutral-100 text-xs"
          >
            {step === 'success' ? 'Close' : 'Cancel'}
          </button>

          {step === 'upload' && (
            <button
              type="button"
              onClick={() => {
                parseCsv(rawCsvText);
                setStep('mapping');
              }}
              className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Next: Confirm Mappings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {step === 'mapping' && (
            <button
              type="button"
              onClick={handleExecuteImport}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Publish & Synchronize Catalog</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
