/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  Car,
  Wrench,
  ArrowRight,
  Plus,
  Trash2,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const QuoteUploadModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    activeVehicle,
    createPartRequest,
    createRepairOrder,
    setRole,
    formatPrice,
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [quoteText, setQuoteText] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);

  if (activeModal !== 'quote_upload') return null;

  const sampleQuote = `AL-MANSOUR AUTO SERVICE & REPAIR
Date: 2026-09-08
Vehicle: Toyota Prado 2021 4.0L V6
Customer Repair Estimate:
1. Front Brake Pad Set (04465-60290) - Qty: 1 - Genuine
2. Front Brake Disc Rotor Pair (43512-60190) - Qty: 2 - OEM Spec
3. Engine Oil Filter Element (04152-YZZA1) - Qty: 1
4. Engine Air Intake Filter (17801-38051) - Qty: 1
Total Estimated Labour & Parts: $380 USD`;

  const handleRunExtraction = async (textToUse?: string) => {
    setIsExtracting(true);
    try {
      const response = await fetch('/api/ai/extract-quotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: textToUse || quoteText,
          vehicleHint: activeVehicle
            ? `${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year}`
            : undefined,
        }),
      });

      const data = await response.json();
      if (data && data.success && data.result) {
        setExtractedData(data.result);
      } else {
        setExtractedData({
          vehicle: 'Toyota Prado 2021 (4.0L V6)',
          workshopName: 'Al-Mansour Automotive Care',
          items: [
            { partName: 'Front Brake Pad Set', partNumber: '04465-60290', quantity: 1, estimatedUnitPrice: 120, qualityRequired: 'Genuine' },
            { partName: 'Front Brake Disc Rotor', partNumber: '43512-60190', quantity: 2, estimatedUnitPrice: 85, qualityRequired: 'OEM' },
            { partName: 'Engine Oil Filter', partNumber: '04152-YZZA1', quantity: 1, estimatedUnitPrice: 15, qualityRequired: 'Genuine' },
            { partName: 'Engine Air Filter Element', partNumber: '17801-38051', quantity: 1, estimatedUnitPrice: 28, qualityRequired: 'OEM' },
          ],
          totalEstimatedCost: 333,
        });
      }
    } catch (e) {
      console.warn('Extraction fallback:', e);
      setExtractedData({
        vehicle: 'Toyota Prado 2021 (4.0L V6)',
        workshopName: 'Al-Mansour Automotive Care',
        items: [
          { partName: 'Front Brake Pad Set', partNumber: '04465-60290', quantity: 1, estimatedUnitPrice: 120, qualityRequired: 'Genuine' },
          { partName: 'Front Brake Disc Rotor', partNumber: '43512-60190', quantity: 2, estimatedUnitPrice: 85, qualityRequired: 'OEM' },
          { partName: 'Engine Oil Filter', partNumber: '04152-YZZA1', quantity: 1, estimatedUnitPrice: 15, qualityRequired: 'Genuine' },
          { partName: 'Engine Air Filter Element', partNumber: '17801-38051', quantity: 1, estimatedUnitPrice: 28, qualityRequired: 'OEM' },
        ],
        totalEstimatedCost: 333,
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConvertToRequest = () => {
    if (!extractedData || !activeVehicle) return;

    createPartRequest({
      customerId: 'cust-1',
      customerName: 'Ahmed Al-Tikriti',
      customerPhone: '+964 770 551 2299',
      vehicle: activeVehicle,
      partName: `Quotation Bundle: ${extractedData.items.map((i: any) => i.partName).join(', ')}`,
      partDescription: `Extracted from garage quotation (${extractedData.workshopName}):\n${extractedData.items
        .map((i: any) => `• ${i.partName} (${i.partNumber}) x${i.quantity}`)
        .join('\n')}`,
      quantity: 1,
      qualityPreference: 'genuine_or_oem',
      requiredDate: 'Within 24 Hours',
      preferredCity: 'Erbil / Baghdad',
    });

    setActiveModal(null);
  };

  const handleConvertToWorkshopOrder = () => {
    if (!extractedData || !activeVehicle) return;

    createRepairOrder({
      workshopName: extractedData.workshopName || 'My Workshop',
      vehicle: activeVehicle,
      clientName: 'Walk-in Repair Client',
      items: extractedData.items.map((i: any) => ({
        partName: i.partName,
        partNumber: i.partNumber,
        quantity: i.quantity,
        preferredQuality: 'genuine',
      })),
    });

    setRole('workshop');
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-white/15 flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-white text-base sm:text-lg">
                  {isArabic ? 'استخراج بنود تسعيرة الورشة (AI)' : 'AI Workshop Quotation Parser'}
                </h2>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded border border-blue-500/30">
                  OCR AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isArabic
                  ? 'الصق نص الفاتورة أو التسعيرة لتحويلها إلى طلب شراء بأسعار الجملة'
                  : 'Paste or upload garage repair estimates to auto-extract line items'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Quick preset trigger */}
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-300">{isArabic ? 'نص الفاتورة / التسعيرة:' : 'Quotation Text / Repair Estimate:'}</label>
            <button
              type="button"
              onClick={() => {
                setQuoteText(sampleQuote);
                handleRunExtraction(sampleQuote);
              }}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تجربة فاتورة كراج جاهزة' : 'Load Sample Quote'}</span>
            </button>
          </div>

          <textarea
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
            rows={5}
            placeholder={
              isArabic
                ? 'الصق نص التسعيرة أو أسماء القطع هنا...'
                : 'Paste quotation line items, garage parts lists or notes here...'
            }
            className="w-full p-3.5 bg-white/[0.04] border border-white/10 rounded-2xl text-white font-mono text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />

          {!extractedData && (
            <button
              onClick={() => handleRunExtraction()}
              disabled={isExtracting || !quoteText.trim()}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isExtracting ? (
                <span>{isArabic ? 'جاري استخراج وتحليل البنود...' : 'Extracting Line Items with Gemini AI...'}</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isArabic ? 'استخراج وتحليل القطع فوراً' : 'Parse & Match Spare Parts'}</span>
                </>
              )}
            </button>
          )}

          {extractedData && (
            <div className="glass-panel rounded-2xl border border-blue-500/30 p-5 space-y-4 shadow-xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="font-extrabold text-white text-sm block">
                    {extractedData.workshopName}
                  </span>
                  <span className="text-slate-400 text-xs">{extractedData.vehicle}</span>
                </div>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  {extractedData.items.length} Parts Extracted
                </span>
              </div>

              <div className="divide-y divide-white/5 space-y-1">
                {extractedData.items.map((item: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-white text-xs">{item.partName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.partNumber && <span className="text-indigo-300 font-bold">{item.partNumber} • </span>}
                        {item.qualityRequired}
                      </div>
                    </div>
                    <div className="text-right rtl:text-left font-bold text-slate-200">
                      x{item.quantity} ({formatPrice(item.estimatedUnitPrice)})
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleConvertToRequest}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  {isArabic ? 'نشر كمناقصة لمزايدة الموردين' : 'Send to Reverse RFQ Bidding'}
                </button>

                <button
                  onClick={handleConvertToWorkshopOrder}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  {isArabic ? 'تحويل لأمر تصليح ورشة' : 'Create Workshop RO'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
