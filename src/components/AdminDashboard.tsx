/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Platform Administration - Governance, Verification, User Moderation, Coupons & City Shipping Rates
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
  Tag,
  Truck,
  Edit3,
  Trash2,
  Percent,
  MapPin,
  Save,
  RefreshCw,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Coupon, CityShippingRate } from '../data/ecommerceConfig';

export const AdminDashboard: React.FC = () => {
  const {
    suppliers,
    updateSupplierVerification,
    disputes,
    language,
    orders,
    partRequests,
    coupons,
    shippingRates,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    updateShippingRate,
  } = useMarketplace();

  const isArabic = language === 'ar';

  // Admin Sub-Role Hierarchy (Section 15)
  const [adminSubRole, setAdminSubRole] = useState<
    'super_admin' | 'ops_admin' | 'dealer_admin' | 'support_admin' | 'finance_admin' | 'content_admin'
  >('super_admin');

  const [activeTab, setActiveTab] = useState<
    'overview' | 'coupons' | 'shipping' | 'dealers' | 'users' | 'audit' | 'commercial' | 'disputes'
  >('overview');

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

  // New Coupon Form state
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [newCouponDescAr, setNewCouponDescAr] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed_usd'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState(15);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState(50);
  const [newCouponMaxDiscount, setNewCouponMaxDiscount] = useState(30);
  const [newCouponUsageLimit, setNewCouponUsageLimit] = useState(500);
  const [newCouponExpiresAt, setNewCouponExpiresAt] = useState('2027-12-31');

  // Shipping Rates Filter & Edit state
  const [shippingCitySearch, setShippingCitySearch] = useState('');
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [editStandardUSD, setEditStandardUSD] = useState<number>(5);
  const [editStandardDays, setEditStandardDays] = useState<string>('1-2 Days');
  const [editExpressUSD, setEditExpressUSD] = useState<number>(12);
  const [editExpressHours, setEditExpressHours] = useState<string>('2-4 Hours');
  const [editThresholdUSD, setEditThresholdUSD] = useState<number>(120);
  const [shippingSaveSuccess, setShippingSaveSuccess] = useState<string | null>(null);

  const totalGMV = orders.reduce((acc, o) => acc + (o.totalUSD || 0), 0) + 128500;
  const pendingVerifications = suppliers.filter((s) => !s.isVerified);
  const openDisputes = disputes.filter((d) => d.status === 'open' || d.status === 'under_investigation');

  const handleToggleUserStatus = (userId: string) => {
    setMockUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
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

  const handleCreateCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    await createCoupon({
      code: newCouponCode.trim().toUpperCase(),
      description: newCouponDesc || `${newCouponValue}${newCouponType === 'percentage' ? '%' : '$'} discount code`,
      descriptionAr: newCouponDescAr || `خصم بقيمة ${newCouponValue}${newCouponType === 'percentage' ? '%' : ' دولار'}`,
      discountType: newCouponType,
      discountValue: Number(newCouponValue),
      minOrderUSD: Number(newCouponMinOrder),
      maxDiscountUSD: Number(newCouponMaxDiscount),
      usageLimit: Number(newCouponUsageLimit),
      expiresAt: newCouponExpiresAt,
      isActive: true,
    });

    setAuditLogs((a) => [
      {
        id: `aud_${Date.now()}`,
        actor: 'admin@iqautomarket.iq',
        role: adminSubRole,
        action: 'COUPON_CREATED',
        resource: newCouponCode.toUpperCase(),
        ip: '127.0.0.1',
        time: 'Just now',
        status: 'SUCCESS',
      },
      ...a,
    ]);

    setIsCreatingCoupon(false);
    setNewCouponCode('');
    setNewCouponDesc('');
    setNewCouponDescAr('');
  };

  const handleStartEditRate = (rate: CityShippingRate) => {
    setEditingRateId(rate.id);
    setEditStandardUSD(rate.standardShippingUSD);
    setEditStandardDays(rate.standardDeliveryDays);
    setEditExpressUSD(rate.expressShippingUSD);
    setEditExpressHours(rate.expressDeliveryHours);
    setEditThresholdUSD(rate.freeShippingThresholdUSD);
  };

  const handleSaveRate = async (rateId: string) => {
    await updateShippingRate(rateId, {
      standardShippingUSD: Number(editStandardUSD),
      standardDeliveryDays: editStandardDays,
      expressShippingUSD: Number(editExpressUSD),
      expressDeliveryHours: editExpressHours,
      freeShippingThresholdUSD: Number(editThresholdUSD),
    });

    setAuditLogs((a) => [
      {
        id: `aud_${Date.now()}`,
        actor: 'admin@iqautomarket.iq',
        role: adminSubRole,
        action: 'SHIPPING_RATE_UPDATE',
        resource: rateId,
        ip: '127.0.0.1',
        time: 'Just now',
        status: 'SUCCESS',
      },
      ...a,
    ]);

    setEditingRateId(null);
    setShippingSaveSuccess(isArabic ? 'تم حفظ وتحديث تسعيرة الشحن بنجاح' : 'Shipping matrix updated successfully');
    setTimeout(() => setShippingSaveSuccess(null), 3500);
  };

  const filteredShippingRates = shippingRates.filter(
    (r) =>
      r.city.toLowerCase().includes(shippingCitySearch.toLowerCase()) ||
      r.cityAr.includes(shippingCitySearch)
  );

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
                  {isArabic ? 'مركز الإدارة والتجارة الإلكترونية للمنصة' : 'Platform Administration & Ecommerce HQ'}
                </h1>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  /admin/*
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isArabic
                  ? 'إدارة الكوبونات، أسعار الشحن للمحافظات، توثيق الوكلاء، وسجل التدقيق الأمني'
                  : 'Ecommerce coupon campaigns, city logistics matrix, dealer verification & immutable audit trail'}
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
          { id: 'coupons', label: isArabic ? 'الكوبونات والخصومات' : 'Coupons & Discounts', count: coupons.filter(c => c.isActive).length, icon: Tag },
          { id: 'shipping', label: isArabic ? 'أسعار شحن المحافظات' : 'City Shipping & Rates', count: shippingRates.length, icon: Truck },
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
              <span className="text-xs font-bold text-slate-400 block">{isArabic ? 'الطلبات المسددة' : 'Paid Orders'}</span>
              <div className="text-2xl font-black text-white mt-1">{orders.length + 84}</div>
              <span className="text-[11px] font-bold text-indigo-400">100% Upfront Paid</span>
            </div>

            <div className="bg-[#0e1424] rounded-2xl p-5 border border-white/10 shadow-md">
              <span className="text-xs font-bold text-slate-400 block">{isArabic ? 'الكوبونات النشطة' : 'Active Coupons'}</span>
              <div className="text-2xl font-black text-white mt-1">{coupons.filter(c => c.isActive).length}</div>
              <span className="text-[11px] font-bold text-amber-400">Across 18 Governorates</span>
            </div>

            <div className="bg-[#0e1424] rounded-2xl p-5 border border-white/10 shadow-md">
              <span className="text-xs font-bold text-slate-400 block">{isArabic ? 'تغطية الشحن' : 'Shipping Cities'}</span>
              <div className="text-2xl font-black text-white mt-1">{shippingRates.length}</div>
              <span className="text-[11px] font-bold text-emerald-400">Standard + Express 2-4h</span>
            </div>

            <div className="bg-[#0e1424] rounded-2xl p-5 border border-white/10 shadow-md">
              <span className="text-xs font-bold text-slate-400 block">{isArabic ? 'نسبة الإنجاز' : 'Fill Rate'}</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">94.8%</div>
              <span className="text-[11px] font-bold text-slate-400">&lt; 4 hr resolution</span>
            </div>
          </div>

          {/* Quick Actions Triage */}
          <div className="bg-[#0e1424] rounded-2xl border border-indigo-500/20 p-5 shadow-md">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>{isArabic ? 'إدارة المبيعات والتجارة السريعة' : 'Ecommerce Control Hub'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                onClick={() => setActiveTab('coupons')}
                className="p-3.5 bg-black/40 rounded-xl border border-white/5 hover:border-indigo-500 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">{coupons.length} {isArabic ? 'كوبونات خصم مسجلة' : 'Promotional Coupons'}</p>
                  <p className="text-[11px] text-slate-400">{isArabic ? 'إضافة وتعديل قسائم الخصم' : 'Manage discount codes & usage'}</p>
                </div>
                <Tag className="w-4 h-4 text-amber-400" />
              </div>

              <div
                onClick={() => setActiveTab('shipping')}
                className="p-3.5 bg-black/40 rounded-xl border border-white/5 hover:border-indigo-500 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">{shippingRates.length} {isArabic ? 'محافظات في شبكة الشحن' : 'Governorates Configured'}</p>
                  <p className="text-[11px] text-slate-400">{isArabic ? 'تعديل أسعار الشحن العادي والسريع' : 'Standard & Express 2-4h rates'}</p>
                </div>
                <Truck className="w-4 h-4 text-indigo-400" />
              </div>

              <div
                onClick={() => setActiveTab('dealers')}
                className="p-3.5 bg-black/40 rounded-xl border border-white/5 hover:border-indigo-500 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">{pendingVerifications.length || 1} {isArabic ? 'وكلاء بانتظار التوثيق' : 'Dealers awaiting verification'}</p>
                  <p className="text-[11px] text-slate-400">{isArabic ? 'مراجعة السجل التجاري' : 'Review commercial licenses'}</p>
                </div>
                <Store className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COUPONS & DISCOUNTS */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-400" />
                <span>{isArabic ? 'إدارة الكوبونات وقسائم الخصم' : 'Coupons & Discount Promotions'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isArabic
                  ? 'إنشاء حملات الخصم، تحديد سقف الاستخدام، وتطبيق الخصم على مستوى المدن'
                  : 'Create promotional voucher codes, minimum spend rules, and city-targeted discounts'}
              </p>
            </div>

            <button
              onClick={() => setIsCreatingCoupon(!isCreatingCoupon)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreatingCoupon ? (isArabic ? 'إغلاق النموذج' : 'Cancel') : (isArabic ? 'إنشاء كوبون جديد' : 'Create New Coupon')}</span>
            </button>
          </div>

          {/* Create New Coupon Form */}
          {isCreatingCoupon && (
            <form onSubmit={handleCreateCouponSubmit} className="bg-[#0e1424] rounded-2xl border border-indigo-500/30 p-5 shadow-xl space-y-4 animate-in fade-in duration-200">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>{isArabic ? 'بيانات الكوبون الجديد' : 'New Promotion Configuration'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">
                    {isArabic ? 'رمز الكوبون (Code):' : 'Coupon Code (Unique):'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER25"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-xs uppercase"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">
                    {isArabic ? 'نوع الخصم:' : 'Discount Type:'}
                  </label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs cursor-pointer"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed_usd">Fixed USD Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">
                    {isArabic ? 'قيمة الخصم:' : 'Discount Value:'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white font-black text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">
                    {isArabic ? 'الحد الأدنى للطلب ($):' : 'Min. Order Amount ($):'}
                  </label>
                  <input
                    type="number"
                    value={newCouponMinOrder}
                    onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">
                    {isArabic ? 'الحد الأقصى للخصم ($):' : 'Max Discount Cap ($):'}
                  </label>
                  <input
                    type="number"
                    value={newCouponMaxDiscount}
                    onChange={(e) => setNewCouponMaxDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">
                    {isArabic ? 'العدد المتاح للاستخدام:' : 'Total Usage Limit:'}
                  </label>
                  <input
                    type="number"
                    value={newCouponUsageLimit}
                    onChange={(e) => setNewCouponUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">
                    {isArabic ? 'تاريخ الانتهاء:' : 'Expiry Date:'}
                  </label>
                  <input
                    type="date"
                    value={newCouponExpiresAt}
                    onChange={(e) => setNewCouponExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">
                    {isArabic ? 'الوصف بالإنجليزية:' : 'English Description:'}
                  </label>
                  <input
                    type="text"
                    value={newCouponDesc}
                    onChange={(e) => setNewCouponDesc(e.target.value)}
                    placeholder="e.g. 15% discount on cooling system parts"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">
                    {isArabic ? 'الوصف بالعربية:' : 'Arabic Description:'}
                  </label>
                  <input
                    type="text"
                    value={newCouponDescAr}
                    onChange={(e) => setNewCouponDescAr(e.target.value)}
                    placeholder="مثال: خصم 15% على قطع التبريد"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingCoupon(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-colors cursor-pointer"
                >
                  {isArabic ? 'حفظ ونشر الكوبون ✓' : 'Save & Publish Coupon ✓'}
                </button>
              </div>
            </form>
          )}

          {/* Coupons Table */}
          <div className="bg-[#0e1424] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-white tracking-wider">
                {isArabic ? 'قائمة الكوبونات النشطة والمنتهية' : 'Active & Scheduled Coupon Campaigns'}
              </h4>
              <span className="text-xs text-slate-400 font-mono">{coupons.length} total codes</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left rtl:text-right">
                <thead className="bg-black/40 text-[10px] uppercase text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">Discount</th>
                    <th className="p-3.5">Min. Order</th>
                    <th className="p-3.5">Max Cap</th>
                    <th className="p-3.5">Usage / Limit</th>
                    <th className="p-3.5">Expiry</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {coupons.map((cpn) => {
                    const usagePercent = Math.round((cpn.usedCount / (cpn.usageLimit || 1)) * 100);
                    return (
                      <tr key={cpn.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5">
                          <div className="font-mono font-bold text-amber-300 text-sm">{cpn.code}</div>
                          <div className="text-[11px] text-slate-400">{isArabic ? cpn.descriptionAr : cpn.description}</div>
                        </td>
                        <td className="p-3.5 font-bold text-white">
                          {cpn.discountType === 'percentage' ? `${cpn.discountValue}% OFF` : `$${cpn.discountValue} OFF`}
                        </td>
                        <td className="p-3.5 text-slate-300 font-mono">${cpn.minOrderUSD || 0}</td>
                        <td className="p-3.5 text-slate-300 font-mono">${cpn.maxDiscountUSD || 'No Cap'}</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-white">{cpn.usedCount} / {cpn.usageLimit}</span>
                            <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${Math.min(100, usagePercent)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono">{cpn.expiresAt || '2027-12-31'}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cpn.isActive ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {cpn.isActive ? 'ACTIVE' : 'PAUSED'}
                          </span>
                        </td>
                        <td className="p-3.5 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => updateCoupon(cpn.id, { isActive: !cpn.isActive })}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                                cpn.isActive ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {cpn.isActive ? (isArabic ? 'إيقاف' : 'Pause') : (isArabic ? 'تفعيل' : 'Activate')}
                            </button>
                            <button
                              onClick={() => deleteCoupon(cpn.id)}
                              className="p-1 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                              title="Delete coupon"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CITY SHIPPING RATES & LOGISTICS */}
      {activeTab === 'shipping' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-400" />
                <span>{isArabic ? 'أسعار وسرعات الشحن لجميع المحافظات' : 'City Shipping Matrix & Logistics SLAs'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isArabic
                  ? 'ضبط أسعار الشحن العادي والسريع (2-4 ساعات) وحد الشحن المجاني لكل محافظة في العراق'
                  : 'Configure Standard & Express same-day courier rates, SLA delivery windows, and free shipping thresholds for Iraqi governorates'}
              </p>
            </div>

            {/* City Search Bar */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={shippingCitySearch}
                onChange={(e) => setShippingCitySearch(e.target.value)}
                placeholder={isArabic ? 'بحث عن محافظة...' : 'Filter governorates...'}
                className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 bg-[#0e1424] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {shippingSaveSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{shippingSaveSuccess}</span>
            </div>
          )}

          {/* City Shipping Rates Table */}
          <div className="bg-[#0e1424] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left rtl:text-right">
                <thead className="bg-black/40 text-[10px] uppercase text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Governorate (City)</th>
                    <th className="p-3.5">Standard Rate ($)</th>
                    <th className="p-3.5">Standard SLA</th>
                    <th className="p-3.5">Express 2-4h Rate ($)</th>
                    <th className="p-3.5">Express SLA</th>
                    <th className="p-3.5">Free Shipping Min ($)</th>
                    <th className="p-3.5 text-end">Edit / Save</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredShippingRates.map((rate) => {
                    const isEditing = editingRateId === rate.id;
                    return (
                      <tr key={rate.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5 font-bold text-white">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>{rate.city}</span>
                            <span className="text-slate-400 font-normal">({rate.cityAr})</span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editStandardUSD}
                              onChange={(e) => setEditStandardUSD(Number(e.target.value))}
                              className="w-16 px-2 py-1 bg-black/60 border border-indigo-500 rounded-lg text-white font-mono text-xs"
                            />
                          ) : (
                            <span className="font-mono font-bold text-white">${rate.standardShippingUSD}</span>
                          )}
                        </td>

                        <td className="p-3.5">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editStandardDays}
                              onChange={(e) => setEditStandardDays(e.target.value)}
                              className="w-24 px-2 py-1 bg-black/60 border border-indigo-500 rounded-lg text-white text-xs"
                            />
                          ) : (
                            <span className="text-slate-300">{rate.standardDeliveryDays}</span>
                          )}
                        </td>

                        <td className="p-3.5">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editExpressUSD}
                              onChange={(e) => setEditExpressUSD(Number(e.target.value))}
                              className="w-16 px-2 py-1 bg-black/60 border border-amber-500 rounded-lg text-amber-300 font-mono text-xs"
                            />
                          ) : (
                            <span className="font-mono font-bold text-amber-300">${rate.expressShippingUSD}</span>
                          )}
                        </td>

                        <td className="p-3.5">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editExpressHours}
                              onChange={(e) => setEditExpressHours(e.target.value)}
                              className="w-28 px-2 py-1 bg-black/60 border border-amber-500 rounded-lg text-white text-xs"
                            />
                          ) : (
                            <span className="text-amber-400/90 font-medium">{rate.expressDeliveryHours}</span>
                          )}
                        </td>

                        <td className="p-3.5">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editThresholdUSD}
                              onChange={(e) => setEditThresholdUSD(Number(e.target.value))}
                              className="w-20 px-2 py-1 bg-black/60 border border-emerald-500 rounded-lg text-emerald-300 font-mono text-xs"
                            />
                          ) : (
                            <span className="font-mono text-emerald-400 font-bold">${rate.freeShippingThresholdUSD}</span>
                          )}
                        </td>

                        <td className="p-3.5 text-end">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSaveRate(rate.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Save className="w-3 h-3" />
                                <span>{isArabic ? 'حفظ' : 'Save'}</span>
                              </button>
                              <button
                                onClick={() => setEditingRateId(null)}
                                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg text-xs cursor-pointer"
                              >
                                {isArabic ? 'إلغاء' : 'Cancel'}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEditRate(rate)}
                              className="px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold rounded-lg text-xs flex items-center gap-1 ml-auto rtl:mr-auto cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>{isArabic ? 'تعديل' : 'Edit'}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DEALER VERIFICATION QUEUE (Section 20) */}
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

      {/* TAB 5: USERS & MODERATION (Section 47) */}
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

      {/* TAB 6: IMMUTABLE AUDIT LOGS (Section 43) */}
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

      {/* TAB 7: COMMERCIAL MODEL CONFIGURATION (Section 27) */}
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

      {/* TAB 8: DISPUTES */}
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
