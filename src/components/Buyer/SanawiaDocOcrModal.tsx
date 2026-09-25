/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket - Privacy-Conscious AI Vehicle Registration (Sanawia) Document Scanner (Section 14)
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
  Sparkles,
  Car,
  Edit3,
  Check,
  ArrowRight,
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
    }, 900);
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

  const handleReset = () => {
    setStep('upload');
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        dir={isArabic ? 'rtl' : 'ltr'}
        className="relative w-full max-w-lg bg-[#0e1424] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base sm:text-lg">
                {isArabic ? 'التعرف الذكي على سنوية السيارة' : 'AI Vehicle Registration Scan'}
              </h2>
              <p className="text-xs text-slate-400">
                {isArabic ? 'استخراج تلقائي لمواصفات سيارتك لمنع أخطاء التوافق' : 'Instant vehicle identification with zero document leakage'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Privacy Guarantee Banner (Section 14 & Privacy) */}
          <div className="p-3 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-300">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-emerald-200 block">
                {isArabic ? 'خصوصية تامة للوثائق الرسمية' : 'Zero-Leakage Privacy Protection'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isArabic
                  ? 'يتم استخراج مواصفات السيارة في متصفحك ولا يتم مشاركة صورة السنوية أو الهوية مع أي تاجر أو طرف ثالث.'
                  : 'Document is processed for vehicle fitment specifications only. Personal IDs and registration images are NEVER shared with dealers.'}
              </span>
            </div>
          </div>

          {/* STEP 1: UPLOAD REGISTRATION PHOTO */}
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
                  handleSimulateScan();
                }}
                onClick={handleSimulateScan}
                className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer group ${
                  dragOver
                    ? 'border-[#335aff] bg-[#335aff]/10'
                    : 'border-white/15 hover:border-[#335aff]/50 bg-white/[0.02]'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/[0.06] text-slate-300 group-hover:text-[#335aff] group-hover:scale-105 flex items-center justify-center mx-auto mb-3 transition-all">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-sm">
                  {isArabic ? 'التقط صورة للسنوية أو اسحب الملف هنا' : 'Snap a photo of your registration card'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isArabic ? 'يدعم صور كاميرا الهاتف، PNG، JPG، أو PDF' : 'Drag & drop file or click to select camera photo'}
                </p>
                <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-[#335aff] hover:bg-[#2647e6] text-white text-xs font-bold transition-all shadow-md">
                  <Camera className="w-4 h-4" />
                  <span>{isArabic ? 'رفع صورة السنوية' : 'Choose Registration Document'}</span>
                </div>
              </div>

              {/* Instant 1-Click Sample For Fast Demo */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleSimulateScan}
                  className="text-xs text-slate-400 hover:text-white transition-colors underline cursor-pointer"
                >
                  {isArabic
                    ? 'تجربة فورية بنموذج سنوية عراقي (Toyota Land Cruiser 2023)'
                    : 'Test with sample Iraqi registration card (Toyota Land Cruiser)'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SCANNING PROGRESS */}
          {step === 'scanning' && (
            <div className="p-8 text-center space-y-4">
              <div className="relative w-14 h-14 mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black">
                  <Sparkles className="w-7 h-7 animate-spin" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white">
                {isArabic ? 'جاري قراءة بيانات السنوية...' : 'Reading registration specifications...'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isArabic
                  ? 'التعرف التلقائي على الشركة الصانعة، الموديل، سنة الصنع، والمحرك.'
                  : 'Extracting: Make, Model, Year, Engine code & VIN.'}
              </p>
              <div className="w-48 h-1.5 bg-white/10 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full skeleton-shimmer w-full" />
              </div>
            </div>
          )}

          {/* STEP 3: "WE FOUND YOUR VEHICLE" (Section 14 Requirement) */}
          {step === 'confirm' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="surface-card rounded-2xl p-5 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/25">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'تم التعرف على السيارة بنجاح' : 'We Found Your Vehicle'}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? (isArabic ? 'إلغاء' : 'Cancel') : (isArabic ? 'تعديل' : 'Edit')}</span>
                  </button>
                </div>

                {!isEditing ? (
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Car className="w-5 h-5 text-slate-300" />
                      <span>{extractedVehicle.make} {extractedVehicle.model} {extractedVehicle.year}</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-3">
                      <div className="p-2.5 bg-black/30 rounded-xl border border-white/[0.05]">
                        <span className="text-slate-400 block text-[10px]">{isArabic ? 'سنة الصنع' : 'Year'}</span>
                        <span className="font-bold text-white">{extractedVehicle.year}</span>
                      </div>
                      <div className="p-2.5 bg-black/30 rounded-xl border border-white/[0.05]">
                        <span className="text-slate-400 block text-[10px]">{isArabic ? 'المحرك' : 'Engine'}</span>
                        <span className="font-bold text-white truncate block">{extractedVehicle.engine}</span>
                      </div>
                      <div className="p-2.5 bg-black/30 rounded-xl border border-white/[0.05]">
                        <span className="text-slate-400 block text-[10px]">{isArabic ? 'الفئة' : 'Trim'}</span>
                        <span className="font-bold text-white">{extractedVehicle.trim}</span>
                      </div>
                      <div className="p-2.5 bg-black/30 rounded-xl border border-white/[0.05]">
                        <span className="text-slate-400 block text-[10px]">{isArabic ? 'رقم الشاصي المقنع' : 'Masked VIN'}</span>
                        <span className="font-mono text-emerald-300 font-bold">{extractedVehicle.vinMasked}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-400 block mb-1">{isArabic ? 'الشركة' : 'Make'}</label>
                        <input
                          type="text"
                          value={extractedVehicle.make}
                          onChange={(e) => setExtractedVehicle({ ...extractedVehicle, make: e.target.value })}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">{isArabic ? 'الموديل' : 'Model'}</label>
                        <input
                          type="text"
                          value={extractedVehicle.model}
                          onChange={(e) => setExtractedVehicle({ ...extractedVehicle, model: e.target.value })}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmation Action */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  id="sanawia-confirm-btn"
                  onClick={handleConfirmAndActivate}
                  className="flex-1 py-3 rounded-2xl bg-[#335aff] hover:bg-[#2647e6] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#335aff]/25 transition-all cursor-pointer micro-press"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {isArabic
                      ? `تأكيد وتفعيل ${extractedVehicle.make} ${extractedVehicle.model}`
                      : `Confirm & Set ${extractedVehicle.make} ${extractedVehicle.model}`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold border border-white/10 cursor-pointer"
                >
                  {isArabic ? 'إعادة مسح' : 'Re-scan'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
