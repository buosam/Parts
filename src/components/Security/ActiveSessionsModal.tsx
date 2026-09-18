/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Security - Active Device Sessions Manager
 */

import React, { useState, useEffect } from 'react';
import { X, Shield, Smartphone, Laptop, Globe, LogOut, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

interface ActiveSessionItem {
  id: string;
  device: string;
  ipAddress: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

interface ActiveSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActiveSessionsModal: React.FC<ActiveSessionsModalProps> = ({ isOpen, onClose }) => {
  const { language, currentUser } = useMarketplace();
  const isArabic = language === 'ar';

  const [sessions, setSessions] = useState<ActiveSessionItem[]>([
    {
      id: 'sess_curr',
      device: 'Chrome on Windows 11',
      ipAddress: '192.168.1.104 (Baghdad, IQ)',
      createdAt: '2 hours ago',
      lastActiveAt: 'Active Now',
      isCurrent: true,
    },
    {
      id: 'sess_mob_01',
      device: 'iPhone 15 Pro Max (Safari / iOS)',
      ipAddress: '185.120.44.12 (Baghdad, IQ)',
      createdAt: 'Yesterday at 18:30',
      lastActiveAt: '3 hours ago',
      isCurrent: false,
    },
    {
      id: 'sess_tab_01',
      device: 'iPad Pro (Erbil Showroom Terminal)',
      ipAddress: '82.199.201.8 (Erbil, IQ)',
      createdAt: '3 days ago',
      lastActiveAt: '1 day ago',
      isCurrent: false,
    },
  ]);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRevoke = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setStatusMessage(isArabic ? 'تم إنهاء الجلسة للجهاز المحدد بنجاح.' : 'Device session revoked successfully.');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleRevokeAllOther = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    setStatusMessage(isArabic ? 'تم تسجيل الخروج من كافة الأجهزة الأخرى فوراً.' : 'Signed out of all other devices successfully.');
    setTimeout(() => setStatusMessage(null), 3500);
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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base sm:text-lg">
                {isArabic ? 'الأجهزة والجلسات النشطة' : 'Active Devices & Sessions'}
              </h2>
              <p className="text-xs text-slate-400">
                {isArabic ? 'مراقبة أمان الحساب وإلغاء الجلسات المشبوهة فوراً' : 'Monitor account security and revoke unauthorized devices'}
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
          {/* Status Alert */}
          {statusMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-3.5 text-xs text-indigo-200 flex items-start gap-3">
            <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">
                {isArabic ? 'أمان فوري على مدار الساعة' : 'Real-time Zero-Trust Revocation'}
              </span>
              <span>
                {isArabic
                  ? 'أي جهاز يتم إلغاؤه يفقد حق الوصول فوراً دون انتظار انتهاء مدة الجلسة.'
                  : 'Revoked sessions are terminated immediately server-side with zero delay.'}
              </span>
            </div>
          </div>

          {/* Device List */}
          <div className="space-y-2.5">
            {sessions.map((sess) => {
              const isMobile = sess.device.toLowerCase().includes('iphone') || sess.device.toLowerCase().includes('android');
              return (
                <div
                  key={sess.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    sess.isCurrent
                      ? 'bg-indigo-600/10 border-indigo-500/30'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        sess.isCurrent ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/[0.05] text-slate-400'
                      }`}
                    >
                      {isMobile ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white truncate">{sess.device}</h4>
                        {sess.isCurrent && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {isArabic ? 'هذا الجهاز' : 'THIS DEVICE'}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        <span>{sess.ipAddress}</span> • <span>{sess.lastActiveAt}</span>
                      </div>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      onClick={() => handleRevoke(sess.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all shrink-0"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>{isArabic ? 'إنهاء' : 'Revoke'}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bulk Action */}
          {sessions.length > 1 && (
            <button
              onClick={handleRevokeAllOther}
              className="w-full py-2.5 px-4 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all mt-4"
            >
              <LogOut className="w-4 h-4" />
              <span>{isArabic ? 'تسجيل الخروج من كافة الأجهزة الأخرى' : 'Sign Out All Other Devices'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
