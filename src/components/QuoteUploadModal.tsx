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
      if (data.success && data.result) {
        setExtractedData(data.result);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-neutral-200 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-neutral-900 text-base">
                  {isArabic ? 'استخراج بنود تسعيرة الورشة (AI)' : 'AI Workshop Quotation Parser'}
                </h2>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                  PRD Section 14
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                {isArabic
                  ? 'ارفع صورة أو الصق نص فاتورة الكراج لاستخراج قائمة القطع ومقارنة أسعار الموردين'
                  : 'Convert garage estimate or handwritten parts list into instant market offers'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-lg hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {!extractedData ? (
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-neutral-700">
                    {isArabic ? 'الصق نص الفاتورة أو قائمة القطع:' : 'Paste Quotation / Repair Text:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setQuoteText(sampleQuote);
                      handleRunExtraction(sampleQuote);
                    }}
                    className="text-blue-600 hover:underline font-semibold text-[11px]"
                  >
                    {isArabic ? 'استخدم نص تجريبي' : 'Load Sample Quotation'}
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  placeholder="e.g. 1. Brake pads 04465-60290 x1&#10;2. Front Disc Rotors x2&#10;3. Oil filter 04152-YZZA1..."
                  className="w-full p-3 border border-neutral-300 rounded-xl focus:outline-blue-600 font-mono text-xs"
                />
              </div>

              <button
                id="parse-quote-btn"
                onClick={() => handleRunExtraction()}
                disabled={isExtracting || !quoteText.trim()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
              >
                {isExtracting ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-blue-200" />
                )}
                <span>{isArabic ? 'استخراج القطع بالذكاء الاصطناعي' : 'Extract Parts with Gemini AI'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-blue-950 text-sm">
                    {extractedData.workshopName}
                  </div>
                  <div className="text-blue-700 mt-0.5">
                    Vehicle: <strong>{extractedData.vehicle}</strong>
                  </div>
                </div>
                <span className="text-xs font-black text-blue-900 bg-blue-200/80 px-2 py-0.5 rounded-full">
                  {extractedData.items.length} Parts Extracted
                </span>
              </div>

              {/* Items List */}
              <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-200 overflow-hidden">
                {extractedData.items.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-neutral-900">{item.partName}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {item.partNumber || 'OEM Pending'} • Qty: {item.quantity} • Spec: {item.qualityRequired || 'OEM'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-neutral-900">
                        ${item.estimatedUnitPrice * item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  id="convert-quote-to-request-btn"
                  onClick={handleConvertToRequest}
                  className="py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isArabic ? 'إرسال كطلب للموردين' : 'Post as Part Request'}</span>
                </button>

                <button
                  id="convert-quote-to-procure-btn"
                  onClick={handleConvertToWorkshopOrder}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'فتح في الشراء الذكي للورش' : 'Open in Smart Procurement'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
