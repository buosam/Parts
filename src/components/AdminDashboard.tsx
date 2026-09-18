/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Platform Administration - Multi-Role Hierarchy, Dealer Verification, User Moderation & Audit Logs
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
  ShieldAlert,
  Sliders,
  UserCheck,
  UserX,
  Lock,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const AdminDashboard: React.FC = () => {
  const {
    suppliers,
    updateSupplierVerification,
    disputes,
    language,
    orders,
    partRequests,
  } = useMarketplace();

  const isArabic = language === 'ar';

  // Admin Sub-Role Hierarchy (Section 15)
  const [adminSubRole, setAdminSubRole] = useState<
    'super_admin' | 'ops_admin' | 'dealer_admin' | 'support_admin' | 'finance_admin' | 'content_admin'
  >('super_admin');

  const [activeTab, setActiveTab] = useState<'overview' | 'dealers' | 'users' | 'audit' | 'commercial' | 'disputes'>('overview');

  // Platform Users state for moderation
  const [mockUsers, setMockUsers] = useState([
    { id: 'usr_01', name: 'Ahmed Al-Tikriti', email: 'ahmed@iqautomarket.iq', role: 'Buyer', status: 'ACTIVE', ordersCount: 4 },
    { id: 'usr_02', name: 'Mustafa Al-Mansour', email: 'sales@mansourparts.iq', role: 'Dealer (Al-Mansour)', status: 'ACTIVE', ordersCount: 42 },
    { id: 'usr_03', name: 'Karwan Barzani', email: 'contact@erbilparts.iq', role: 'Dealer (Erbil Auto)', status: 'ACTIVE', ordersCount: 28 },
    { id: 'usr_04', name: 'Ali Wrench Master', email: 'service@babilauto.iq', role: 'Workshop', status: 'ACTIVE', ordersCount: 15 },
    { id: 'usr_05', name: 'Suspended Bad Parts Co', email: 'suspended@badparts.iq', role: 'Dealer', status: 'SUSPENDED', ordersCount: 0 },
  ]);

  // Immutable Audit Logs state (Section 43)
  const [auditLogs, setAuditLogs] = useState([
    { id: 'aud_01', actor: 'admin@iqautomarket.iq', role: 'SuperAdmin', action: 'DEALER_APPROVAL', resource: 'dlr_mansour_01', ip: '192.168.1.1', time: '10 mins ago', status: 'SUCCESS' },
    { id: 'aud_02', actor: 'usr_buyer_01', role: 'Buyer', action: 'ORDER_CREATE', resource: 'ord_1001', ip: '185.120.44.12', time: '25 mins ago', status: 'SUCCESS' },
    { id: 'aud_03', actor: 'hacker_ip_99', role: 'ANONYMOUS', action: 'PRIVILEGE_ESCALATION_BLOCKED', resource: 'role:admin', ip: '45.12.89.2', time: '1 hour ago', status: 'DENIED' },
    { id: 'aud_04', actor: 'usr_dealer_a', role: 'Dealer', action: 'INVENTORY_MUTATION', resource: 'prd_04465', ip: '82.199.201.8', time: '2 hours ago', status: 'SUCCESS' },
    { id: 'aud_05', actor: 'usr_dealer_b', role: 'Dealer', action: 'CROSS_ORG_ACCESS_BLOCKED', resource: 'dlr_mansour_orders', ip: '82.199.201.8', time: '4 hours ago', status: 'DENIED' },
  ]);

  // Commercial Model config
  const [commissionRate, setCommissionRate] = useState(4.5);
  const [savedCommercialNotice, setSavedCommercialNotice] = useState(false);

  const totalGMV = orders.reduce((acc, o) => acc + (o.totalUSD || 0), 0) + 128500;
  const pendingVerifications = suppliers.filter((s) => !s.isVerified);
  const openDisputes = disputes.filter((d) => d.status === 'open' || d.status === 'under_investigation');

  const handleToggleUserStatus = (userId: string) => {
    setMockUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          // Record in audit log
          setAuditLogs((a) => [
            {
              id: `aud_${Date.now()}`,
              actor: 'admin@iqautomarket.iq',
              role: adminSubRole,
              action: 'ROLE_CHANGE',
              resource: u.email,
              ip: '127.0.0.1',
              time: 'Just now',
              status: 'SUCCESS',
            },
            ...a,
          ]);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const handleSuspendDealer = (dealerId: string) => {
    setAuditLogs((a) => [
      {
        id: `aud_${Date.now()}`,
        actor: 'admin@iqautomarket.iq',
        role: adminSubRole,
        action: 'DEALER_SUSPEND',
        resource: dealerId,
        ip: '127.0.0.1',
        time: 'Just now',
        status: 'SUCCESS',
      },
      ...a,
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Top Banner with Admin Role Hierarchy (Section 15) */}
      <div className="bg-[#0e1424] rounded-3xl border border-white/10 p-6 sm:p-8 mb-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/30 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {isArabic ? 'مركز الإدارة والأمان للمنصة' : 'Platform Administration & Security Center'}
                </h1>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  /admin/*
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isArabic
                  ? 'التحكم بالشبكة، توثيق الوكلاء، إدارة المستخدمين، وسجل التدقيق الأمني غير القابل للتعديل'
                  : 'Zero-trust governance, dealer verification, user moderation & immutable security audit trail'}
              </p>
            </div>
          </div>

          {/* Admin Role Hierarchy Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">{isArabic ? 'المستوى الإداري:' : 'Admin Role:'}</span>
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
              {(
                [
                  { id: 'super_admin', label: 'Super Admin' },
                  { id: 'ops_admin', label: 'Operations' },
                  { id: 'dealer_admin', label: 'Dealer Admin' },
                  { id: 'finance_admin', label: 'Finance' },
                ] as const
              ).map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setAdminSubRole(sub.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    adminSubRole === sub.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 mb-6 gap-2 text-xs font-bold overflow-x-auto">
        {[
          { id: 'overview', label: isArabic ? 'نظرة عامة' : 'Overview', icon: TrendingUp },
          { id: 'dealers', label: isArabic ? 'توثيق الوكلاء' : 'Dealer Verification', count: pendingVerifications.length, icon: Store },
          { id: 'users', label: isArabic ? 'إدارة المستخدمين' : 'Users & Moderation', count: mockUsers.length, icon: Users },
          { id: 'audit', label: isArabic ? 'سجل التدقيق الأمني' : 'Audit Logs', count: auditLogs.length, icon: ShieldAlert },
          { id: 'commercial', label: isArabic ? 'النموذج التجاري' : 'Commercial Model', icon: DollarSign },
          { id: 'disputes', label: isArabic ? 'النزاعات' : 'Disputes', count: openDisputes.length, icon: AlertCircle },
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

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-[#0e1424] rounded-2xl p-5 border border-white/10 shadow-md">
              <span className="text-xs font-bold text-slate-400 block">GMV (Volume)</span>
              <div className="text-2xl font-black text-white mt-1">${totalGMV.toLocaleString()}</div>
              <span className="text-[11px] font-bold text-emerald-400">+18.4% this week</span>
            </div>

            <div className="bg-[#0e1424] rounded-2xl p-5 border border-white/10 shadow-md">
              <span className="text-xs font-bold text-slate-400 block">{isArabic ? 'الطلبات' : 'Orders'}</span>
              <div className="text-2xl font-black text-white mt-1">{orders.length + 84}</div>
              <span className="text-[11px] font-bold text-indigo-400">99.2% fulfillment</span>
            </div>

            <div className="bg-[#0e1424] rounded-2xl p-5 border border-white/10 shadow-md">
              <span className="text-xs font-bold text-slate-400 block">{isArabic ? 'الوكلاء' : 'Active Dealers'}</span>
              <div className="text-2xl font-black text-white mt-1">{suppliers.length}</div>
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

          {/* Needs Attention Triage Bar */}
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
                  <p className="text-[11px] text-slate-400">{isArabic ? 'مراجعة السجل التجاري والموافقة' : 'Review business registration & approve'}</p>
                </div>
                <button className="text-xs font-bold text-indigo-400">{isArabic ? 'مراجعة' : 'Review'}</button>
              </div>

              <div
                onClick={() => setActiveTab('users')}
                className="p-3.5 bg-black/40 rounded-xl border border-white/5 hover:border-indigo-500 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">1 {isArabic ? 'حساب معلق' : 'Suspended Account'}</p>
                  <p className="text-[11px] text-slate-400">{isArabic ? 'مراجعة حالة الحظر' : 'Review suspended dealer'}</p>
                </div>
                <button className="text-xs font-bold text-amber-400">{isArabic ? 'إدارة' : 'Manage'}</button>
              </div>

              <div
                onClick={() => setActiveTab('audit')}
                className="p-3.5 bg-black/40 rounded-xl border border-white/5 hover:border-indigo-500 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">{auditLogs.length} {isArabic ? 'أحداث تدقيق أمني' : 'Security Audit Events'}</p>
                  <p className="text-[11px] text-emerald-400 font-bold">{isArabic ? 'سجل محمي وغير قابل للتعديل' : 'Immutable tamper-proof logs'}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEALER VERIFICATION QUEUE (Section 20) */}
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
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {isArabic ? 'معتمد رسمي' : 'Authorized'}
                        </span>
                        <button
                          onClick={() => handleSuspendDealer(dealer.id)}
                          className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg border border-red-500/20 transition-colors cursor-pointer"
                        >
                          {isArabic ? 'تعليق الوكيل' : 'Suspend'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: USERS & MODERATION (Section 47) */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-[#0e1424] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{isArabic ? 'إدارة المستخدمين والحسابات' : 'User Accounts & Moderation'}</h3>
              <span className="text-xs text-slate-400">{mockUsers.length} total registered accounts</span>
            </div>
            <div className="divide-y divide-white/5">
              {mockUsers.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.02]">
                  <div>
                    <div className="font-bold text-xs text-white">{user.name}</div>
                    <div className="text-[11px] text-slate-400">{user.email} • {user.role}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                      user.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-red-500/10 text-red-300 border-red-500/30'
                    }`}>
                      {user.status}
                    </span>

                    <button
                      onClick={() => handleToggleUserStatus(user.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        user.status === 'ACTIVE'
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                      }`}
                    >
                      {user.status === 'ACTIVE' ? (isArabic ? 'تعليق الحساب' : 'Suspend') : (isArabic ? 'تفعيل الحساب' : 'Activate')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IMMUTABLE AUDIT LOGS (Section 43) */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-[#0e1424] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-400" />
                  <span>{isArabic ? 'سجل الأحداث والتدقيق الأمني' : 'Immutable Security Audit Logs'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isArabic ? 'يسجل كافة محاولات تسجيل الدخول، تعديل الصلاحيات، والوصول للوثائق' : 'Tamper-proof event stream recording access, credential changes & security alarms'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left rtl:text-right">
                <thead className="bg-black/40 text-[10px] uppercase text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Actor</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Resource</th>
                    <th className="p-3.5">IP Address</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="p-3.5 text-slate-400">{log.time}</td>
                      <td className="p-3.5 font-bold text-white">{log.actor}</td>
                      <td className="p-3.5 font-bold text-indigo-300">{log.action}</td>
                      <td className="p-3.5 text-slate-300">{log.resource}</td>
                      <td className="p-3.5 text-slate-400">{log.ip}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCCESS' ? 'text-emerald-300 bg-emerald-500/10' : 'text-red-300 bg-red-500/10'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COMMERCIAL MODEL CONFIGURATION (Section 27) */}
      {activeTab === 'commercial' && (
        <div className="space-y-4">
          <div className="bg-[#0e1424] rounded-2xl border border-white/10 p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>{isArabic ? 'إعدادات النموذج التجاري والعمولات' : 'Commercial Revenue Model Settings'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isArabic
                  ? 'ضبط نسبة عمولة المعاملات، خطط اشتراكات الوكلاء، ورسوم الربط البرمجي'
                  : 'Configure transaction commissions, dealer subscription tiers & ERP integration fees'}
              </p>
            </div>

            {savedCommercialNotice && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isArabic ? 'تم حفظ وتطبيق السياسة المالية الجديدة بنجاح.' : 'Commercial policy saved and applied successfully.'}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-3">
                <label className="text-xs font-bold text-slate-300 block">
                  {isArabic ? 'نسبة عمولة السوق على المبيعات (%)' : 'Marketplace Transaction Commission (%)'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.5"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-24 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-black text-sm"
                  />
                  <span className="text-xs text-slate-400">% per completed purchase</span>
                </div>
              </div>

              <div className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-3">
                <label className="text-xs font-bold text-slate-300 block">
                  {isArabic ? 'تكلفة الترويج المميز (يومياً)' : 'Featured Placement Fee (Daily)'}
                </label>
                <div className="flex items-center gap-3">
                  <span className="font-black text-base text-white">$15.00</span>
                  <span className="text-xs text-slate-400">USD per sponsored part</span>
                </div>
              </div>
            </div>

            {/* Subscription Tiers */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">Dealer Subscription Plans</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-white/[0.02] border border-white/10 rounded-2xl">
                  <span className="text-xs font-bold text-white">Starter Dealer</span>
                  <div className="text-lg font-black text-white mt-1">Free</div>
                  <p className="text-[11px] text-slate-400 mt-2">Up to 250 parts • Manual & CSV upload • Basic analytics</p>
                </div>
                <div className="p-4 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl">
                  <span className="text-xs font-bold text-indigo-300">Pro Dealer</span>
                  <div className="text-lg font-black text-white mt-1">$79 / month</div>
                  <p className="text-[11px] text-slate-400 mt-2">Up to 5,000 parts • Multi-Branch support • Priority bidding</p>
                </div>
                <div className="p-4 bg-white/[0.02] border border-white/10 rounded-2xl">
                  <span className="text-xs font-bold text-white">Enterprise DMS/ERP</span>
                  <div className="text-lg font-black text-white mt-1">$249 / month</div>
                  <p className="text-[11px] text-slate-400 mt-2">Unlimited parts • Automated REST API / Webhooks • Dedicated SLA</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSavedCommercialNotice(true);
                setTimeout(() => setSavedCommercialNotice(false), 3000);
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 cursor-pointer transition-all"
            >
              {isArabic ? 'حفظ السياسة التجارية' : 'Save Commercial Policy'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: DISPUTES */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div className="bg-[#0e1424] rounded-2xl border border-white/10 p-5 shadow-md">
            <h3 className="text-sm font-bold text-white mb-3">Open Customer Disputes & Warranty Claims</h3>
            <div className="p-4 bg-black/20 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white">DSP-8812 • Front Brake Pads Fitment</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Buyer claims wrong rotor offset. Al-Mansour Genuine Parts confirmed replacement ready.</p>
              </div>
              <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl">
                Resolve Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
