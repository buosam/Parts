/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket - Privacy-Conscious AI Vehicle Registration (Sanawia) Document Scanner
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Camera,
  Upload,
  CheckCircle2,
  FileText,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Car,
  Edit3,
  Check,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Vehicle } from '../../types';

interface SanawiaDocOcrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SanawiaDocOcrModal: React.FC<SanawiaDocOcrModalProps> = ({ isOpen, onClose }) => {
  const { language, addUserVehicle, setActiveVehicle } = useMarketplace();
  const isArabic = language === 'ar';

  const [step, setStep] = useState<'upload' | 'scanning' | 'confirm'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Extracted vehicle state
  const [extractedVehicle, setExtractedVehicle] = useState<{
    make: string;
    model: string;
    year: number;
    engine: string;
    trim: string;
    vinMasked: string;
  }>({
    make: 'Toyota',
    model: 'Land Cruiser (LC300)',
    year: 2023,
    engine: '3.5L Twin Turbo V6 (V35A-FTS)',
    trim: 'VXR Grade',
    vinMasked: 'JTJHY••••••••8902',
  });

  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setStep('scanning');
    setTimeout(() => {
      setStep('confirm');
    }, 1200);
  };

  const handleConfirmAndActivate = () => {
    const newVeh: Vehicle = {
      id: `veh_${Date.now()}`,
      make: extractedVehicle.make,
      model: extractedVehicle.model,
      year: extractedVehicle.year,
      engine: extractedVehicle.engine,
      trim: extractedVehicle.trim,
      vin: extractedVehicle.vinMasked,
      nickname: `${extractedVehicle.make} ${extractedVehicle.model}`,
    };

    addUserVehicle(newVeh);
    setActiveVehicle(newVeh);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        dir={isArabic ? 'rtl' : 'ltr'}
        className="relative w-full max-w-lg bg-[#0e1424] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base sm:text-lg">
                {isArabic ? 'التعرف الذكي على سنوية السيارة' : 'AI Vehicle Registration Recognition'}
              </h2>
              <p className="text-xs text-slate-400">
                {isArabic ? 'استخراج فوري لبيانات السيارة مع حماية تامة للخصوصية' : 'Instant vehicle specification with zero document leakage'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Privacy Guarantee Pill (Section 7 Compliance) */}
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-xs text-emerald-300">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-200 block mb-0.5">
                {isArabic ? 'حماية مشددة لوثائقك الشخصية (Zero-Leakage)' : 'Protected Document Privacy Guarantee'}
              </span>
              <span>
                {isArabic
                  ? 'يتم تشفير السنوية في خزانة خاصة، ولن يتم إرسالها أو عرضها للوكلاء إطلاقاً. يتلقى الوكلاء فقط نوع السيارة للتأكد من توافق القطع.'
                  : 'Your registration document is encrypted at rest and is NEVER shared with dealers. Dealers receive only the minimum vehicle specifications required to quote parts.'}
              </span>
            </div>
          </div>

          {step === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files?.[0]) {
                    setSelectedFile(e.dataTransfer.files[0]);
                    handleSimulateScan();
                  }
                }}
                className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${
                  dragOver
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-white/10 hover:border-indigo-500/40 bg-white/[0.02]'
                }`}
                onClick={handleSimulateScan}
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-white text-sm">
                  {isArabic ? 'التقط صورة للسنوية أو ارفع ملفاً' : 'Snap photo or upload registration document'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isArabic ? 'يدعم: JPG, PNG, PDF أو كاميرا الهاتف مباشرة' : 'Supports: JPG, PNG, PDF, or direct camera capture'}
                </p>
                <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all">
                  <Upload className="w-4 h-4" />
                  <span>{isArabic ? 'اختيار وثيقة السنوية' : 'Select Registration File'}</span>
                </div>
              </div>
            </div>
          )}

          {step === 'scanning' && (
            <div className="p-8 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-600/40">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>
              </div>
              <h3 className="text-base font-black text-white">
                {isArabic ? 'جاري تحليل السنوية والتعرف على المركبة...' : 'AI is reading registration and extracting specs...'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isArabic
                  ? 'جاري استخراج: الشركة الصانعة، الموديل، سنة الصنع، وسعة المحرك بدقة عالية'
                  : 'Extracting: Make, Model, Production Year, Engine Spec & Trim with fitment verification.'}
              </p>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              {/* "We found this vehicle" Card (Section 6 Requirement) */}
              <div className="bg-gradient-to-br from-indigo-950/40 via-[#0e1424] to-[#121a30] border border-indigo-500/30 rounded-3xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isArabic ? 'وجدنا هذه السيارة' : 'We Found This Vehicle'}</span>
                  </span>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? (isArabic ? 'إلغاء التعديل' : 'Cancel Edit') : (isArabic ? 'تعديل' : 'Edit')}</span>
                  </button>
                </div>

                {!isEditing ? (
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Car className="w-5 h-5 text-indigo-400" />
                      <span>{extractedVehicle.make} {extractedVehicle.model}</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2.5 bg-black/20 rounded-xl border border-white/5">
                        <span className="text-slate-400 block text-[10px]">{isArabic ? 'سنة الصنع' : 'Year'}</span>
                        <span className="font-bold text-white text-sm">{extractedVehicle.year}</span>
                      </div>
                      <div className="p-2.5 bg-black/20 rounded-xl border border-white/5">
                        <span className="text-slate-400 block text-[10px]">{isArabic ? 'المحرك' : 'Engine'}</span>
                        <span className="font-bold text-white text-xs truncate block">{extractedVehicle.engine}</span>
                      </div>
                      <div className="p-2.5 bg-black/20 rounded-xl border border-white/5">
                        <span className="text-slate-400 block text-[10px]">{isArabic ? 'الفئة' : 'Trim'}</span>
                        <span className="font-bold text-white text-xs">{extractedVehicle.trim}</span>
                      </div>
                      <div className="p-2.5 bg-black/20 rounded-xl border border-white/5">
                        <span className="text-slate-400 block text-[10px]">{isArabic ? 'رقم الشاصي المقنع' : 'Masked VIN'}</span>
                        <span className="font-mono text-emerald-300 text-xs font-bold">{extractedVehicle.vinMasked}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">{isArabic ? 'الشركة' : 'Make'}</label>
                        <input
                          type="text"
                          value={extractedVehicle.make}
                          onChange={(e) => setExtractedVehicle({ ...extractedVehicle, make: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">{isArabic ? 'الموديل' : 'Model'}</label>
                        <input
                          type="text"
                          value={extractedVehicle.model}
                          onChange={(e) => setExtractedVehicle({ ...extractedVehicle, model: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">{isArabic ? 'المحرك' : 'Engine'}</label>
                      <input
                        type="text"
                        value={extractedVehicle.engine}
                        onChange={(e) => setExtractedVehicle({ ...extractedVehicle, engine: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons (Section 6 Requirement: Confirm / Edit) */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setStep('upload');
                    setIsEditing(false);
                  }}
                  className="py-3 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  {isArabic ? 'إعادة الرفع' : 'Re-upload'}
                </button>

                <button
                  id="btn-confirm-detected-vehicle"
                  onClick={handleConfirmAndActivate}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isArabic ? 'تأكيد وحفظ السيارة' : 'Confirm & Use Vehicle'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
