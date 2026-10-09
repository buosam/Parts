/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Auth Modal - Multi-Role Registration, WhatsApp OTP, Reset Password & Demo Switcher
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
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Check,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { UserRole } from '../types';
import { Logo } from './Logo';

type AuthViewMode = 'signin' | 'signup' | 'whatsapp_otp' | 'forgot_password';

export const AuthModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    authModalTab,
    authTargetRole,
    login,
    signup,
    loginWithOtp,
    requestOtp,
    forgotPassword,
    resetPassword,
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';

  const [mode, setMode] = useState<AuthViewMode>(authModalTab || 'signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>(authTargetRole || 'customer');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [city, setCity] = useState<string>('Baghdad');
  const [address, setAddress] = useState<string>('');
  const [businessType, setBusinessType] = useState<string>('Authorized Distributor');
  const [termsAccepted, setTermsAccepted] = useState<boolean>(true);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // WhatsApp OTP State
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpSentPhone, setOtpSentPhone] = useState<string>('');
  const [otpSandboxCode, setOtpSandboxCode] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState<number>(0);

  // Forgot / Reset Password State
  const [resetIdentifier, setResetIdentifier] = useState<string>('');
  const [resetCode, setResetCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetSandboxCode, setResetSandboxCode] = useState<string | null>(null);

  // Synchronize initial state when modal opens
  useEffect(() => {
    if (activeModal === 'auth') {
      setMode(authModalTab || 'signin');
      setSelectedRole(authTargetRole || 'customer');
      setSuccessMessage(null);
      setErrorMessage(null);
      setOtpSandboxCode(null);
      setResetSandboxCode(null);
      setResetStep('request');

      if (authTargetRole === 'customer') {
        setEmail('ahmed@iqautomarket.iq');
        setPassword('buyer1234');
      } else if (authTargetRole === 'supplier') {
        setEmail('sales@mansourparts.iq');
        setPassword('dealer1234');
      } else if (authTargetRole === 'workshop') {
        setEmail('service@babilauto.iq');
        setPassword('workshop1234');
      } else if (authTargetRole === 'admin') {
        setEmail('admin@iqautomarket.iq');
        setPassword('admin1234');
      }
    }
  }, [activeModal, authModalTab, authTargetRole]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

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
      demoUser: { email: string; name: string; pass: string };
    }
  > = {
    customer: {
      title: 'Customer / Buyer',
      titleAr: 'المشتري ومالك المركبة',
      badge: 'INDIVIDUAL',
      desc: 'Order parts, receive dealer bids & live quotes',
      descAr: 'طلب قطع غيار، استلام عروض الأسعار والمزايدة',
      icon: <Car className="w-4 h-4 text-emerald-400" />,
      demoUser: { email: 'ahmed@iqautomarket.iq', name: 'Ahmed Al-Tikriti', pass: 'buyer1234' },
    },
    supplier: {
      title: 'Dealer / Store',
      titleAr: 'الوكلاء ومتاجر قطع الغيار',
      badge: 'COMMERCIAL',
      desc: 'Sync inventory, submit bids & manage store',
      descAr: 'ربط المخزون، تقديم عروض الأسعار وإدارة المتجر',
      icon: <Store className="w-4 h-4 text-amber-400" />,
      demoUser: { email: 'sales@mansourparts.iq', name: 'Al-Mansour Genuine Parts', pass: 'dealer1234' },
    },
    workshop: {
      title: 'Workshop / Garage',
      titleAr: 'الورش ومراكز الصيانة',
      badge: 'B2B FLEET',
      desc: 'Repair orders, fleet procurement & diagnostics',
      descAr: 'أوامر الصيانة، مشتريات الأساطيل والفحص',
      icon: <Wrench className="w-4 h-4 text-blue-400" />,
      demoUser: { email: 'service@babilauto.iq', name: 'Babil Performance Garage', pass: 'workshop1234' },
    },
    admin: {
      title: 'Platform Admin',
      titleAr: 'إدارة المنصة والامتثال',
      badge: 'OPERATIONS',
      desc: 'Compliance, fraud filters & catalog governance',
      descAr: 'إدارة السوق، مطابقة الكتالوج والرقابة المالية',
      icon: <ShieldCheck className="w-4 h-4 text-indigo-400" />,
      demoUser: { email: 'admin@iqautomarket.iq', name: 'IQAutoMarket Admin HQ', pass: 'admin1234' },
    },
  };

  const iraqiCities = [
    'Baghdad',
    'Erbil',
    'Basra',
    'Mosul',
    'Sulaymaniyah',
    'Najaf',
    'Karbala',
    'Kirkuk',
    'Hillah (Babil)',
    'Nasiriyah (Dhi Qar)',
    'Duhok',
    'Ramadi (Anbar)',
    'Amarah (Maysan)',
    'Kut (Wasit)',
    'Diwaniyah (Qadisiyyah)',
  ];

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);

  const handleQuickDemoLogin = async (targetRole: UserRole) => {
    const demo = roleMeta[targetRole].demoUser;
    setEmail(demo.email);
    setPassword(demo.pass);
    setSelectedRole(targetRole);
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(demo.email, demo.pass, targetRole);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage(isArabic ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please provide email/phone and password.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await login(email, password, selectedRole);
      if (res.success) {
        setSuccessMessage(
          isArabic
            ? `مرحباً بك مجدداً!`
            : `Welcome back to IQAutoMarket!`
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || (isArabic ? 'بيانات الدخول غير صحيحة.' : 'Invalid credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMessage(isArabic ? 'يرجى ملء جميع الحقول الإلزامية' : 'Please fill all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage(isArabic ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters.');
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setErrorMessage(isArabic ? 'كلمات المرور غير متطابقة' : 'Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage(isArabic ? 'يرجى الموافقة على الشروط والأحكام' : 'Please agree to the Terms of Service.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signup({
        name,
        email,
        phone: phone || '+964 770 000 0000',
        password,
        role: selectedRole === 'admin' ? 'customer' : selectedRole,
        companyName: companyName || (selectedRole !== 'customer' ? name : undefined),
        city,
        address,
        businessType: selectedRole !== 'customer' ? businessType : undefined,
      });

      if (res.success) {
        setSuccessMessage(
          isArabic
            ? 'تم إنشاء الحساب وتسجيل الدخول بنجاح!'
            : 'Account registered and logged in successfully!'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || (isArabic ? 'فشل إنشاء الحساب.' : 'Signup failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setErrorMessage(isArabic ? 'يرجى إدخال رقم الهاتف' : 'Please enter a valid phone number.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await requestOtp(phone);
      if (res.success) {
        setOtpSentPhone(phone);
        setOtpSandboxCode(res.sandboxCode || null);
        setOtpTimer(60);
        setSuccessMessage(
          isArabic
            ? `تم إرسال رمز التحقق إلى ${phone}`
            : `Verification code dispatched to ${phone}`
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to send OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setErrorMessage(isArabic ? 'يرجى إدخال رمز التحقق كاملاً' : 'Please enter valid OTP code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginWithOtp(otpSentPhone || phone, otpCode, selectedRole);
      if (res.success) {
        setSuccessMessage(
          isArabic ? 'تم التحقق وتسجيل الدخول بنجاح!' : 'Phone verified. Logged in successfully!'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || (isArabic ? 'رمز التحقق غير صحيح أو منتهي الصلاحية.' : 'Invalid or expired OTP.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier) {
      setErrorMessage(isArabic ? 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف' : 'Please enter your email or phone.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await forgotPassword(resetIdentifier);
      if (res.success) {
        setResetStep('verify');
        setResetSandboxCode(res.sandboxCode || null);
        setSuccessMessage(
          isArabic
            ? 'تم إرسال رمز إعادة تعيين كلمة المرور!'
            : 'Password reset code has been dispatched!'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Password reset request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode || !newPassword) {
      setErrorMessage(isArabic ? 'يرجى إدخال رمز التحقق وكلمة المرور الجديدة' : 'Please enter code and new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage(isArabic ? 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' : 'New password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await resetPassword({
        identifier: resetIdentifier,
        code: resetCode,
        newPassword,
      });

      if (res.success) {
        setSuccessMessage(
          isArabic
            ? 'تم تغيير كلمة المرور بنجاح! تم تسجيل دخولك الآن.'
            : 'Password updated successfully! You are now signed in.'
        );
        setTimeout(() => setActiveModal(null), 1500);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || (isArabic ? 'رمز التحقق غير صحيح أو منتهي الصلاحية.' : 'Invalid reset code.'));
    } finally {
      setIsLoading(false);
    }
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
              <h2 className="text-base font-black text-white flex items-center gap-2">
                {isArabic ? 'بوابة دخول منصة IQAutoMarket' : 'IQAutoMarket Portal Gateway'}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {isArabic ? 'آمن وموثق' : 'SECURE 256-BIT'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isArabic
                  ? 'دخول مباشر للمشترين، المتاجر، الورش والإدارة'
                  : 'Single sign-on for Buyers, Dealers, Garages, and Operations'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Success Notification Alert */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Error Notification Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-300 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Mode Switcher Buttons */}
          <div className="flex p-1 bg-slate-950/70 border border-white/10 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isArabic ? 'تسجيل الدخول' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isArabic ? 'إنشاء حساب جديد' : 'Create Account'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('whatsapp_otp');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'whatsapp_otp'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isArabic ? 'واتساب OTP' : 'WhatsApp OTP'}</span>
            </button>
          </div>

          {/* ROLE SELECTOR CARDS (Shown in Sign In & Sign Up) */}
          {(mode === 'signin' || mode === 'signup') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {isArabic ? 'نوع الحساب / البوابة' : 'Select Account Type / Portal'}
                </label>
                {mode === 'signup' && selectedRole === 'admin' && (
                  <span className="text-[10px] text-amber-400 font-bold">
                    {isArabic ? 'تسجيل الإدارة محجوز داخلياً' : 'Admin accounts are invite-only'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['customer', 'supplier', 'workshop', 'admin'] as UserRole[]).map((r) => {
                  const meta = roleMeta[r];
                  const isSelected = selectedRole === r;
                  const isDisabled = mode === 'signup' && r === 'admin';

                  return (
                    <button
                      key={r}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        if (isDisabled) return;
                        setSelectedRole(r);
                        if (mode === 'signin') {
                          setEmail(meta.demoUser.email);
                          setPassword(meta.demoUser.pass);
                        }
                      }}
                      className={`p-2.5 rounded-2xl border text-left rtl:text-right transition-all flex flex-col justify-between ${
                        isDisabled
                          ? 'opacity-40 cursor-not-allowed bg-slate-950/20 border-white/5'
                          : isSelected
                            ? 'bg-slate-800/90 border-blue-500 ring-2 ring-blue-500/40 shadow-md cursor-pointer'
                            : 'bg-slate-950/50 border-white/10 hover:border-white/20 hover:bg-white/[0.04] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="p-1.5 rounded-xl bg-white/[0.06] border border-white/10">
                          {meta.icon}
                        </div>
                        <span className="text-[8px] font-black uppercase text-slate-400 px-1.5 py-0.5 rounded bg-white/5">
                          {meta.badge}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white leading-tight">
                          {isArabic ? meta.titleAr : meta.title}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {isArabic ? meta.descAr : meta.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 1: SIGN IN */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isArabic ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email Address or Phone Number'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@iqautomarket.iq or +964 770 000 0000"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    {isArabic ? 'كلمة المرور' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetIdentifier(email);
                      setMode('forgot_password');
                    }}
                    className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-2.5 pl-10 pr-10 rtl:pl-10 rtl:pr-10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3.5 rtl:pr-0 rtl:pl-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/20 bg-slate-950 text-blue-500 focus:ring-blue-500"
                  />
                  <span>{isArabic ? 'تذكر بيانات الدخول' : 'Remember me on this device'}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>
                      {isArabic
                        ? `دخول كـ ${roleMeta[selectedRole].titleAr}`
                        : `Sign In as ${roleMeta[selectedRole].title}`}
                    </span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </>
                )}
              </button>

              {/* 1-Click Quick Demo Profiles Switcher */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {isArabic ? 'دخول تجريبي سريع بنقرة واحدة' : '1-Click Quick Demo Switcher'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(['customer', 'supplier', 'workshop', 'admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleQuickDemoLogin(r)}
                      className="py-1.5 px-2 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-[10px] font-medium text-slate-300 hover:text-white transition-all text-center cursor-pointer"
                    >
                      {roleMeta[r].badge}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* VIEW 2: SIGN UP */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isArabic ? 'الاسم الكامل' : 'Full Name'} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isArabic ? 'أحمد العراقي' : 'Ahmed Al-Iraqi'}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-2 pl-10 pr-3 rtl:pl-3 rtl:pr-10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isArabic ? 'البريد الإلكتروني' : 'Email Address'} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@domain.iq"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-2 pl-10 pr-3 rtl:pl-3 rtl:pr-10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isArabic ? 'رقم الهاتف (العراق)' : 'Phone Number (Iraq)'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+964 770 123 4567"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-2 pl-10 pr-3 rtl:pl-3 rtl:pr-10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isArabic ? 'المدينة / المحافظة' : 'City / Governorate'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-2 pl-10 pr-3 rtl:pl-3 rtl:pr-10 text-xs text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                    >
                      {iraqiCities.map((c) => (
                        <option key={c} value={c} className="bg-slate-900 text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Business Specific Fields for Supplier & Workshop */}
              {(selectedRole === 'supplier' || selectedRole === 'workshop') && (
                <div className="p-3 bg-white/[0.02] border border-white/10 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-amber-400">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>
                      {selectedRole === 'supplier'
                        ? isArabic
                          ? 'بيانات المتجر والوكالة'
                          : 'Store & Dealer Information'
                        : isArabic
                          ? 'بيانات الورشة ومركز الصيانة'
                          : 'Workshop & Garage Information'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder={
                          selectedRole === 'supplier'
                            ? isArabic
                              ? 'اسم المتجر / الشركة'
                              : 'Store / Company Name'
                            : isArabic
                              ? 'اسم مركز الصيانة'
                              : 'Workshop Center Name'
                        }
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="Authorized Distributor">Authorized Distributor (وكيل معتمد)</option>
                        <option value="OEM Genuine Wholesaler">OEM Genuine Wholesaler (قطع أصلية جملة)</option>
                        <option value="Aftermarket Retailer">Aftermarket Retailer (قطع تجارية ومفرد)</option>
                        <option value="Dismantler / Salvage Yard">Salvage Yard (سوق التشليح والقطع المستعملة)</option>
                        <option value="Specialized Garage">Specialized Garage (مركز صيانة تخصصي)</option>
                        <option value="Fleet Maintenance">Fleet Service (خدمات أساطيل)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isArabic ? 'كلمة المرور' : 'Password'} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 chars"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-2 pl-10 pr-9 rtl:pl-9 rtl:pr-10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3 rtl:pr-0 rtl:pl-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isArabic ? 'تأكيد كلمة المرور' : 'Confirm Password'} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-2 pl-10 pr-9 rtl:pl-9 rtl:pr-10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3 rtl:pr-0 rtl:pl-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{isArabic ? 'قوة كلمة المرور' : 'Password Strength'}</span>
                    <span
                      className={`font-bold ${
                        passwordStrength <= 1
                          ? 'text-red-400'
                          : passwordStrength <= 2
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                      }`}
                    >
                      {passwordStrength <= 1
                        ? isArabic ? 'ضعيفة' : 'Weak'
                        : passwordStrength <= 2
                          ? isArabic ? 'متوسطة' : 'Fair'
                          : isArabic ? 'قوية جداً' : 'Strong'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        passwordStrength >= 1 ? 'bg-red-500' : 'bg-white/10'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        passwordStrength >= 2 ? 'bg-amber-500' : 'bg-white/10'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        passwordStrength >= 3 ? 'bg-emerald-500' : 'bg-white/10'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        passwordStrength >= 4 ? 'bg-emerald-400' : 'bg-white/10'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2 text-xs text-slate-400 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="rounded border-white/20 bg-slate-950 text-blue-500 focus:ring-blue-500 mt-0.5"
                />
                <span>
                  {isArabic
                    ? 'أوافق على شروط الخدمة، سياسة الخصوصية، وقواعد تداول قطع الغيار في العراق.'
                    : 'I agree to the Terms of Service, Privacy Policy, and Automotive Trade Regulations.'}
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>
                      {isArabic
                        ? `إنشاء حساب ${roleMeta[selectedRole].titleAr}`
                        : `Complete Registration for ${roleMeta[selectedRole].title}`}
                    </span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* VIEW 3: WHATSAPP OTP QUICK SIGN-IN */}
          {mode === 'whatsapp_otp' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {isArabic ? 'تسجيل دخول فوري عبر واتساب' : 'Fast WhatsApp OTP Sign-In'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isArabic
                      ? 'أدخل رقم هاتفك العراقي لاستلام رمز تحقق فوري والدخول بدون كلمة مرور.'
                      : 'Enter your phone number to receive a one-time login code without needing a password.'}
                  </p>
                </div>
              </div>

              {!otpSentPhone ? (
                <form onSubmit={handleRequestOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {isArabic ? 'رقم الهاتف العراقي (+964)' : 'Iraqi Phone Number (+964)'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+964 770 123 4567"
                        className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{isArabic ? 'إرسال رمز التحقق عبر واتساب' : 'Send WhatsApp Code'}</span>
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtpLogin} className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        {isArabic ? 'رمز التحقق (6 أرقام)' : '6-Digit Verification Code'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSentPhone('');
                          setOtpSandboxCode(null);
                        }}
                        className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                      >
                        {isArabic ? 'تغيير الرقم' : 'Change Phone'}
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full bg-slate-950/80 border border-emerald-500/50 rounded-2xl py-3 px-4 text-center text-lg font-black tracking-widest text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Sandbox Dev Code Display Helper */}
                  {otpSandboxCode && (
                    <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between text-xs text-blue-300">
                      <span className="font-mono font-bold">Sandbox Code: {otpSandboxCode}</span>
                      <button
                        type="button"
                        onClick={() => setOtpCode(otpSandboxCode)}
                        className="px-2 py-0.5 bg-blue-600/40 hover:bg-blue-600 rounded text-[10px] font-bold text-white transition-all cursor-pointer"
                      >
                        {isArabic ? 'تعبئة تلقائية' : 'Auto Fill'}
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {otpTimer > 0
                        ? isArabic
                          ? `إعادة الإرسال خلال ${otpTimer} ثانية`
                          : `Resend in ${otpTimer}s`
                        : (
                          <button
                            type="button"
                            onClick={handleRequestOtp}
                            className="text-emerald-400 hover:underline cursor-pointer"
                          >
                            {isArabic ? 'إعادة إرسال الرمز' : 'Resend Code'}
                          </button>
                        )}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{isArabic ? 'تأكيد ودخول' : 'Verify & Sign In'}</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* VIEW 4: FORGOT / RESET PASSWORD */}
          {mode === 'forgot_password' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-400" />
                  <span>{isArabic ? 'استعادة كلمة المرور' : 'Password Recovery'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  {isArabic ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
                </button>
              </div>

              {resetStep === 'request' ? (
                <form onSubmit={handleForgotPasswordRequest} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {isArabic ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email Address or Phone Number'}
                    </label>
                    <input
                      type="text"
                      required
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      placeholder="name@domain.iq or +964 770 000 0000"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{isArabic ? 'إرسال رمز إعادة التعيين' : 'Send Reset Code'}</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {isArabic ? 'رمز إعادة التعيين' : 'Reset Code (6 digits)'}
                    </label>
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-slate-950/80 border border-white/10 rounded-2xl py-2 px-4 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {resetSandboxCode && (
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between text-xs text-blue-300">
                      <span className="font-mono">Sandbox Code: {resetSandboxCode}</span>
                      <button
                        type="button"
                        onClick={() => setResetCode(resetSandboxCode)}
                        className="px-2 py-0.5 bg-blue-600/40 hover:bg-blue-600 rounded text-[10px] font-bold text-white transition-all cursor-pointer"
                      >
                        {isArabic ? 'تعبئة تلقائية' : 'Auto Fill'}
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {isArabic ? 'كلمة المرور الجديدة' : 'New Password'}
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-slate-950/80 border border-white/10 rounded-2xl py-2 px-4 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{isArabic ? 'تحديث كلمة المرور والدخول' : 'Update Password & Sign In'}</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-950/80 p-3.5 border-t border-white/10 text-center text-[10px] text-slate-500">
          {isArabic
            ? 'منصة IQAutoMarket مشفرة ومحمية ببروتوكولات TLS 1.3 وحماية RBAC المتقدمة.'
            : 'IQAutoMarket is encrypted with TLS 1.3 & advanced Role-Based Access Controls.'}
        </div>
      </div>
    </div>
  );
};
