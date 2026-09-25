/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Store,
  Wrench,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  Building2,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Car,
  Key,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { UserRole } from '../types';
import { Logo } from './Logo';

export const AuthModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    authModalTab,
    authTargetRole,
    login,
    signup,
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';

  const [mode, setMode] = useState<'signin' | 'signup'>(authModalTab || 'signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>(authTargetRole || 'customer');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [city, setCity] = useState<string>('Baghdad');
  const [businessType, setBusinessType] = useState<string>('Authorized Distributor');
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Synchronize when modal opens
  useEffect(() => {
    if (activeModal === 'auth') {
      setMode(authModalTab || 'signin');
      setSelectedRole(authTargetRole || 'customer');
      setSuccessMessage(null);
      setErrorMessage(null);
      if (authTargetRole === 'customer') {
        setEmail('ahmed@iqautomarket.iq');
        setPassword('••••••••••••');
      } else if (authTargetRole === 'supplier') {
        setEmail('sales@mansourparts.iq');
        setPassword('••••••••••••');
      } else if (authTargetRole === 'workshop') {
        setEmail('service@babilauto.iq');
        setPassword('••••••••••••');
      } else if (authTargetRole === 'admin') {
        setEmail('admin@iqautomarket.iq');
        setPassword('••••••••••••');
      }
    }
  }, [activeModal, authModalTab, authTargetRole]);

  if (activeModal !== 'auth') return null;

  const roleMeta: Record<
    UserRole,
    {
      title: string;
      titleAr: string;
      badge: string;
      desc: string;
      descAr: string;
      icon: React.ReactNode;
      demoUser: { email: string; name: string };
    }
  > = {
    customer: {
      title: 'Customer / Buyer',
      titleAr: 'المشتري',
      badge: 'INDIVIDUAL',
      desc: 'Order parts & track bids',
      descAr: 'طلب قطع وتتبع العروض',
      icon: <Car className="w-4 h-4 text-emerald-400" />,
      demoUser: { email: 'ahmed@iqautomarket.iq', name: 'Ahmed Al-Tikriti' },
    },
    supplier: {
      title: 'Dealer / Store',
      titleAr: 'الوكلاء والمتاجر',
      badge: 'COMMERCIAL',
      desc: 'Sync stock & submit bids',
      descAr: 'ربط المخزون وتقديم العروض',
      icon: <Store className="w-4 h-4 text-amber-400" />,
      demoUser: { email: 'sales@mansourparts.iq', name: 'Al-Mansour Genuine Parts' },
    },
    workshop: {
      title: 'Workshop / Garage',
      titleAr: 'الورش ومراكز الصيانة',
      badge: 'B2B FLEET',
      desc: 'Repair Orders & Fleet',
      descAr: 'أوامر الصيانة والمشتريات',
      icon: <Wrench className="w-4 h-4 text-blue-400" />,
      demoUser: { email: 'service@babilauto.iq', name: 'Babil Performance Garage' },
    },
    admin: {
      title: 'Platform Admin',
      titleAr: 'إدارة المنصة',
      badge: 'OPERATIONS',
      desc: 'Compliance & Catalogs',
      descAr: 'إدارة السوق والتحقق',
      icon: <ShieldCheck className="w-4 h-4 text-indigo-400" />,
      demoUser: { email: 'admin@iqautomarket.iq', name: 'IQAutoMarket Admin HQ' },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'signin') {
        const res = await login(email, password, selectedRole);
        if (res.success) {
          setSuccessMessage(
            isArabic
              ? `تم تسجيل الدخول كـ ${roleMeta[selectedRole].titleAr}`
              : `Signed in to ${roleMeta[selectedRole].title}`
          );
        }
      } else {
        const res = await signup({
          name: name || (isArabic ? 'مستخدم جديد' : 'New Member'),
          email,
          phone: phone || '+964 770 000 0000',
          password,
          role: selectedRole,
          companyName,
          city,
          businessType,
        });
        if (res.success) {
          setSuccessMessage(
            isArabic
              ? 'تم إنشاء الحساب بنجاح!'
              : 'Account registered successfully!'
          );
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (targetRole: UserRole) => {
    const demo = roleMeta[targetRole].demoUser;
    setEmail(demo.email);
    setPassword('demopassword2026');
    setSelectedRole(targetRole);
    login(demo.email, 'demopassword2026', targetRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="glass-panel border border-white/10 bg-slate-900/95 text-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header Bar */}
        <div className="bg-slate-950/90 p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center p-2 shadow-lg shadow-blue-900/30 shrink-0">
              <Logo variant="mark" size="sm" showBadge={false} showSubtitle={false} />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                {isArabic ? 'بوابة دخول منصة IQAutoMarket' : 'IQAutoMarket Portal Gateway'}
              </h2>
              <p className="text-xs text-slate-400">
                {isArabic ? 'دخول مباشر للمشترين، المتاجر، الورش والإدارة' : 'Single sign-on for Buyers, Dealers, Garages, and Operations'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {isArabic ? 'نوع الحساب / البوابة' : 'Select Portal'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['customer', 'supplier', 'workshop', 'admin'] as UserRole[]).map((r) => {
                const meta = roleMeta[r];
                const isSelected = selectedRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r);
                      setEmail(meta.demoUser.email);
                    }}
                    className={`p-2.5 rounded-2xl border text-left rtl:text-right transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/40 shadow-md'
                        : 'bg-slate-950/50 border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <div className="p-1.5 rounded-xl bg-white/[0.06] border border-white/10">
                        {meta.icon}
                      </div>
                      <span className="text-[8px] font-black uppercase text-slate-400 px-1 rounded bg-white/5">
                        {meta.badge}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white leading-tight">{isArabic ? meta.titleAr : meta.title}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {isArabic ? meta.descAr : meta.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sign In vs Sign Up Tabs Switcher */}
          <div className="flex bg-slate-950/70 p-1 rounded-2xl border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
                mode === 'signin'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تسجيل الدخول' : 'Sign In'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isArabic ? 'إنشاء حساب جديد' : 'Create Account'}</span>
            </button>
          </div>

          {/* Notification Alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <X className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Registration Additional Fields */}
            {mode === 'signup' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      {isArabic ? 'الاسم الكامل *' : 'Full Name *'}
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute start-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ahmed Al-Tikriti"
                        className="w-full ps-9 pe-3 py-2.5 bg-slate-950/70 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      {isArabic ? 'رقم الهاتف *' : 'Phone Number *'}
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute start-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+964 770 123 4567"
                        className="w-full ps-9 pe-3 py-2.5 bg-slate-950/70 border border-white/10 rounded-xl text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Company / Dealer / Workshop Details */}
                {selectedRole !== 'customer' && (
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">
                          {selectedRole === 'supplier'
                            ? (isArabic ? 'اسم المتجر أو الوكالة *' : 'Store Name *')
                            : selectedRole === 'workshop'
                            ? (isArabic ? 'اسم الورشة *' : 'Workshop Name *')
                            : (isArabic ? 'اسم الإدارة *' : 'Department *')}
                        </label>
                        <div className="relative">
                          <Building2 className="w-3.5 h-3.5 absolute start-3 top-3 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Al-Mansour Genuine Parts"
                            className="w-full ps-9 pe-3 py-2.5 bg-slate-950/70 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1">
                          {isArabic ? 'المحافظة *' : 'City / Governorate *'}
                        </label>
                        <div className="relative">
                          <MapPin className="w-3.5 h-3.5 absolute start-3 top-3 text-slate-400" />
                          <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full ps-9 pe-3 py-2.5 bg-slate-950/70 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                          >
                            <option value="Baghdad" className="bg-slate-900 text-white">Baghdad (بغداد)</option>
                            <option value="Erbil" className="bg-slate-900 text-white">Erbil (أربيل)</option>
                            <option value="Sulaymaniyah" className="bg-slate-900 text-white">Sulaymaniyah (السليمانية)</option>
                            <option value="Basra" className="bg-slate-900 text-white">Basra (البصرة)</option>
                            <option value="Duhok" className="bg-slate-900 text-white">Duhok (دهوك)</option>
                            <option value="Najaf" className="bg-slate-900 text-white">Najaf (النجف)</option>
                            <option value="Karbala" className="bg-slate-900 text-white">Karbala (كربلاء)</option>
                            <option value="Kirkuk" className="bg-slate-900 text-white">Kirkuk (كركوك)</option>
                            <option value="Mosul" className="bg-slate-900 text-white">Mosul (الموصل)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Email & Password */}
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  {isArabic ? 'البريد الإلكتروني *' : 'Email Address *'}
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute start-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@iqautomarket.iq"
                    className="w-full ps-9 pe-3 py-2.5 bg-slate-950/70 border border-white/10 rounded-xl text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-300">{isArabic ? 'كلمة المرور *' : 'Password *'}</label>
                  {mode === 'signin' && (
                    <span className="text-[11px] text-indigo-400 hover:underline cursor-pointer">
                      {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute start-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full ps-9 pe-10 py-2.5 bg-slate-950/70 border border-white/10 rounded-xl text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                <span>{isArabic ? 'تذكر تسجيل الدخول' : 'Remember me'}</span>
              </label>
              <span className="text-[10px] text-slate-500">
                {isArabic ? 'تشفير 256-bit' : '256-bit Encrypted'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Key className="w-4 h-4 text-indigo-200" />
                  <span>
                    {mode === 'signin'
                      ? isArabic
                        ? `دخول إلى ${roleMeta[selectedRole].titleAr}`
                        : `Sign In to ${roleMeta[selectedRole].title}`
                      : isArabic
                      ? `إنشاء حساب ${roleMeta[selectedRole].titleAr}`
                      : `Register ${roleMeta[selectedRole].title}`}
                  </span>
                  <ArrowRight className="w-4 h-4 text-indigo-200 rtl:rotate-180" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Preset Bar */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{isArabic ? 'دخول تجريبي سريع:' : '1-Click Demo Login:'}</span>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['customer', 'supplier', 'workshop', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleQuickDemoLogin(r)}
                  className="px-2 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{r === 'customer' ? 'Buyer' : r === 'supplier' ? 'Dealer' : r === 'workshop' ? 'Garage' : 'Admin'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
