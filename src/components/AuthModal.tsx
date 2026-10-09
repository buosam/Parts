/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Auth Modal - Streamlined, Modern, Premium Login & Signup Experience
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  User,
  Car,
  Wrench,
  Store,
  ShieldCheck,
  Zap,
  Building,
  KeyRound,
  Crown,
  Package,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { UserRole } from '../types';
import { Logo } from './Logo';

type AuthViewMode = 'signin' | 'signup' | 'whatsapp_otp' | 'forgot_password' | 'profile';

export const AuthModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    authModalTab,
    authTargetRole,
    currentUser,
    logout,
    activeSubscription,
    setRole,
    login,
    signup,
    loginWithOtp,
    requestOtp,
    forgotPassword,
    resetPassword,
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';

  const [mode, setMode] = useState<AuthViewMode>(
    currentUser && (!authModalTab || authModalTab === 'profile') ? 'profile' : (authModalTab || 'signin')
  );
  const [selectedRole, setSelectedRole] = useState<UserRole>(authTargetRole || currentUser?.role || 'customer');
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
  const [businessType, setBusinessType] = useState<string>('Independent Garage');

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

  // Sync on modal open
  useEffect(() => {
    if (activeModal === 'auth') {
      if (authModalTab === 'profile' || (currentUser && !authModalTab)) {
        setMode('profile');
      } else {
        setMode(authModalTab || 'signin');
      }
      setSelectedRole(authTargetRole || currentUser?.role || 'customer');
      setSuccessMessage(null);
      setErrorMessage(null);
      setOtpSandboxCode(null);
      setResetSandboxCode(null);
      setResetStep('request');
      setEmail('');
      setPassword('');
    }
  }, [activeModal, authModalTab, authTargetRole, currentUser]);

  // Resend Timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  if (activeModal !== 'auth') return null;

  const demoAccounts: Record<UserRole, { label: string; labelAr: string; email: string; pass: string }> = {
    customer: { label: 'Buyer', labelAr: 'مشتري', email: 'ahmed@iqautomarket.iq', pass: 'buyer1234' },
    workshop: { label: 'Workshop', labelAr: 'ورشة', email: 'service@babilauto.iq', pass: 'workshop1234' },
    supplier: { label: 'Dealer', labelAr: 'تاجر', email: 'sales@mansourparts.iq', pass: 'dealer1234' },
    admin: { label: 'Admin', labelAr: 'إدارة', email: 'admin@iqautomarket.iq', pass: 'admin1234' },
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    const acc = demoAccounts[role];
    setSelectedRole(role);
    setEmail(acc.email);
    setPassword(acc.pass);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage(isArabic ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Email and password are required.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await login(email, password, selectedRole);
      if (res.success) {
        setSuccessMessage(isArabic ? 'تم تسجيل الدخول بنجاح!' : 'Signed in successfully!');
        setTimeout(() => setActiveModal(null), 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || (isArabic ? 'بيانات تسجيل الدخول غير صحيحة' : 'Invalid email or password.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMessage(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage(isArabic ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف' : 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(isArabic ? 'كلمات المرور غير متطابقة' : 'Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const fullPhone = phone.startsWith('+') ? phone : `+964${phone.replace(/^0+/, '')}`;
      const res = await signup({
        name,
        email,
        phone: fullPhone,
        password,
        role: selectedRole,
        companyName: selectedRole !== 'customer' ? companyName : undefined,
        city,
        businessType: selectedRole === 'workshop' ? businessType : undefined,
      });

      if (res.success) {
        setSuccessMessage(isArabic ? 'تم إنشاء الحساب وتسجيل الدخول بنجاح!' : 'Account registered and signed in successfully!');
        setTimeout(() => setActiveModal(null), 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || (isArabic ? 'فشل إنشاء الحساب' : 'Registration failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setErrorMessage(isArabic ? 'يرجى إدخال رقم الهاتف' : 'Please enter your phone number.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    const fullPhone = phone.startsWith('+') ? phone : `+964${phone.replace(/^0+/, '')}`;
    try {
      const res = await requestOtp(fullPhone);
      if (res.success) {
        setOtpSentPhone(fullPhone);
        if (res.sandboxCode) setOtpSandboxCode(res.sandboxCode);
        setOtpTimer(60);
        setMode('whatsapp_otp');
      }
    } catch (err: any) {
      setErrorMessage(err.message || (isArabic ? 'تعذر إرسال رمز التحقق' : 'Failed to send OTP code.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setErrorMessage(isArabic ? 'يرجى إدخال رمز التحقق' : 'Please enter the 6-digit OTP code.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginWithOtp(otpSentPhone, otpCode, selectedRole);
      if (res.success) {
        setSuccessMessage(isArabic ? 'تم التحقق وتسجيل الدخول بنجاح!' : 'WhatsApp OTP verified! Signed in.');
        setTimeout(() => setActiveModal(null), 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || (isArabic ? 'رمز التحقق غير صحيح' : 'Invalid OTP code.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
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
        if (res.sandboxCode) setResetSandboxCode(res.sandboxCode);
        setResetStep('verify');
      }
    } catch (err: any) {
      setErrorMessage(err.message || (isArabic ? 'فشل إرسال رمز الاستعادة' : 'Failed to send reset code.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode || !newPassword) {
      setErrorMessage(isArabic ? 'يرجى إدخال الرمز وكلمة المرور الجديدة' : 'Please enter code and new password.');
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
        setSuccessMessage(isArabic ? 'تم تعيين كلمة المرور بنجاح! تم تسجيل الدخول.' : 'Password reset successful! Signed in.');
        setTimeout(() => setActiveModal(null), 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || (isArabic ? 'رمز الاستعادة غير صحيح' : 'Invalid reset code.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="bg-zinc-950 border border-zinc-800 text-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 relative"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header Bar with Logo */}
        <div className="p-5 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="light" size="sm" showBadge={false} showSubtitle={false} isArabic={isArabic} />
            <div className="border-s border-zinc-700/60 ps-3">
              <h3 className="font-bold text-sm text-white">
                {mode === 'profile'
                  ? (isArabic ? 'الملف الشخصي والحساب' : 'My Account & Profile')
                  : mode === 'signin'
                    ? (isArabic ? 'تسجيل الدخول' : 'Welcome Back')
                    : mode === 'signup'
                      ? (isArabic ? 'إنشاء حساب جديد' : 'Create an Account')
                      : mode === 'whatsapp_otp'
                        ? (isArabic ? 'التحقق عبر واتساب' : 'WhatsApp OTP Login')
                        : (isArabic ? 'استعادة الحساب' : 'Account Recovery')}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {mode === 'profile' && currentUser
                  ? (currentUser.email)
                  : (isArabic ? 'سوق العراق الموحد لقطع الغيار المعتمدة' : 'Iraq’s Unified Auto Parts Network')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {currentUser ? (
          <div className="grid grid-cols-2 p-1.5 bg-zinc-900/60 border-b border-zinc-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('profile');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'profile'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{isArabic ? 'الملف الشخصي' : 'My Profile'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode !== 'profile'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تبديل الحساب' : 'Switch Account'}</span>
            </button>
          </div>
        ) : (
          (mode === 'signin' || mode === 'signup') && (
            <div className="grid grid-cols-2 p-1.5 bg-zinc-900/60 border-b border-zinc-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'signin'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isArabic ? 'تسجيل الدخول' : 'Sign In'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'signup'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{isArabic ? 'حساب جديد' : 'Create Account'}</span>
              </button>
            </div>
          )
        )}

        {/* Body Container */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Notifications */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* VIEW 0: LOGGED IN PROFILE MANAGEMENT */}
          {mode === 'profile' && currentUser && (
            <div className="space-y-4">
              {/* User Identity Card */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-extrabold text-sm text-white truncate">{currentUser.name}</h4>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                      {currentUser.role === 'customer'
                        ? (isArabic ? 'مشتري' : 'Buyer')
                        : currentUser.role === 'workshop'
                        ? (isArabic ? 'ورشة صيانة' : 'Workshop')
                        : currentUser.role === 'supplier'
                        ? (isArabic ? 'تاجر قطع' : 'Dealer')
                        : (isArabic ? 'إدارة' : 'Admin')}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 truncate mt-0.5">{currentUser.email}</div>
                  {currentUser.phone && (
                    <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{currentUser.phone}</div>
                  )}
                  {currentUser.companyName && (
                    <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                      <Building className="w-3 h-3 text-zinc-500" />
                      <span>{currentUser.companyName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Prime & Membership Plan Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs text-amber-300">
                      {isArabic ? 'خطة العضوية الحالية' : 'Membership Plan'}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                    {activeSubscription?.tierName || (isArabic ? 'العضوية الأساسية' : 'Basic Tier')}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mb-3">
                  {isArabic
                    ? 'استمتع بخصومات الشحن السريع وأسعار الجملة وأولوية كونسول Partline AI.'
                    : 'Access instant AI matching, verified suppliers, and discounted governorate express shipping.'}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveModal('subscription')}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'ترقية الاشتراك وإدارة الباقات' : 'Upgrade & Manage Subscription'}</span>
                </button>
              </div>

              {/* Quick Portals Switcher */}
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-2">
                  {isArabic ? 'الانتقال إلى البوابة المخصصة:' : 'Switch Active Portal:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRole('customer');
                      setActiveModal(null);
                    }}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-terra text-center transition-all cursor-pointer flex flex-col items-center gap-1.5"
                  >
                    <Car className="w-5 h-5 text-terra" />
                    <div className="text-xs font-bold text-white">{isArabic ? 'سوق القطع' : 'Marketplace'}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('workshop');
                      setActiveModal(null);
                    }}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5"
                  >
                    <Wrench className="w-5 h-5 text-indigo-400" />
                    <div className="text-xs font-bold text-white">{isArabic ? 'بوابة الورش' : 'Workshop'}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('supplier');
                      setActiveModal(null);
                    }}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5"
                  >
                    <Store className="w-5 h-5 text-emerald-400" />
                    <div className="text-xs font-bold text-white">{isArabic ? 'بوابة التجار' : 'Dealer Portal'}</div>
                  </button>
                </div>
              </div>

              {/* Action Buttons: Sign Out */}
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setActiveModal(null);
                  }}
                  className="w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isArabic ? 'تسجيل الخروج من الحساب' : 'Sign Out of Account'}</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 1: SIGN IN */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="text-xs text-zinc-300 font-bold block mb-1.5">
                  {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus-within:border-indigo-500 transition-colors">
                  <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.iq"
                    className="w-full bg-transparent text-white text-xs placeholder:text-zinc-500 outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-zinc-300 font-bold">
                    {isArabic ? 'كلمة المرور' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setResetStep('request');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus-within:border-indigo-500 transition-colors">
                  <Lock className="w-4 h-4 text-zinc-500 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-white text-xs placeholder:text-zinc-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20 disabled:opacity-60"
                style={{ color: '#ffffff' }}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>{isArabic ? 'تسجيل الدخول' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </>
                )}
              </button>

              {/* WhatsApp Fast OTP Login Option */}
              <div className="pt-3 border-t border-zinc-800 text-center">
                <div className="text-[11px] text-zinc-400 mb-2">
                  {isArabic ? 'أو الدخول السريع بدون كلمة مرور:' : 'Or sign in instantly with OTP:'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('whatsapp_otp');
                    setErrorMessage(null);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>{isArabic ? 'تسجيل الدخول السريع عبر واتساب 📲' : '1-Click WhatsApp OTP Login 📲'}</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW 2: CREATE ACCOUNT (SIGN UP) */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Role Selection Cards */}
              <div>
                <label className="text-xs text-zinc-300 font-bold block mb-2">
                  {isArabic ? 'نوع الحساب الذي ترغب بإنشائه:' : 'Select Your Account Type:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Buyer */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('customer')}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      selectedRole === 'customer'
                        ? 'border-indigo-500 bg-indigo-500/15 text-white font-bold ring-1 ring-indigo-500/30'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Car className="w-5 h-5 text-indigo-400" />
                    <span className="text-[11px] block">{isArabic ? 'مشتري / أفراد' : 'Buyer'}</span>
                    <span className="text-[9px] text-zinc-500 hidden sm:block">Car Owner</span>
                  </button>

                  {/* Workshop */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('workshop')}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      selectedRole === 'workshop'
                        ? 'border-indigo-500 bg-indigo-500/15 text-white font-bold ring-1 ring-indigo-500/30'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Wrench className="w-5 h-5 text-indigo-400" />
                    <span className="text-[11px] block">{isArabic ? 'ورشة وكراج' : 'Workshop'}</span>
                    <span className="text-[9px] text-zinc-500 hidden sm:block">Trade Credit</span>
                  </button>

                  {/* Supplier/Dealer */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('supplier')}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      selectedRole === 'supplier'
                        ? 'border-emerald-500 bg-emerald-500/15 text-white font-bold ring-1 ring-emerald-500/30'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Store className="w-5 h-5 text-emerald-400" />
                    <span className="text-[11px] block">{isArabic ? 'وكيل / تاجر' : 'Dealer'}</span>
                    <span className="text-[9px] text-zinc-500 hidden sm:block">Seller Hub</span>
                  </button>
                </div>
              </div>

              {/* Full Name & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-300 font-bold block mb-1">
                    {isArabic ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus-within:border-indigo-500">
                    <User className="w-4 h-4 text-zinc-500 shrink-0" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isArabic ? 'مثال: علي الشمري' : 'e.g. Ali Al-Shammari'}
                      className="w-full bg-transparent text-white text-xs placeholder:text-zinc-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-300 font-bold block mb-1">
                    {isArabic ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus-within:border-indigo-500">
                    <span className="text-xs font-mono font-bold text-slate-300 shrink-0">🇮🇶 +964</span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="770 123 4567"
                      className="w-full bg-transparent text-white text-xs placeholder:text-zinc-500 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Company Name & City for Workshops & Dealers */}
              {selectedRole !== 'customer' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
                  <div>
                    <label className="text-xs text-zinc-300 font-bold block mb-1">
                      {isArabic ? 'اسم الورشة / الشركة التجارية:' : 'Business / Garage Name:'}
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={isArabic ? 'مثال: شركة المنصور لقطع الغيار' : 'e.g. Al-Mansour Genuine Parts'}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs placeholder:text-zinc-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 font-bold block mb-1">
                      {isArabic ? 'المحافظة:' : 'Governorate:'}
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs outline-none cursor-pointer"
                    >
                      <option value="Baghdad">Baghdad (بغداد)</option>
                      <option value="Erbil">Erbil (أربيل)</option>
                      <option value="Basra">Basra (البصرة)</option>
                      <option value="Sulaymaniyah">Sulaymaniyah (السليمانية)</option>
                      <option value="Najaf">Najaf (النجف)</option>
                      <option value="Karbala">Karbala (كربلاء)</option>
                      <option value="Mosul">Mosul (الموصل)</option>
                      <option value="Kirkuk">Kirkuk (كركوك)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="text-xs text-zinc-300 font-bold block mb-1">
                  {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus-within:border-indigo-500">
                  <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.iq"
                    className="w-full bg-transparent text-white text-xs placeholder:text-zinc-500 outline-none"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-300 font-bold block mb-1">
                    {isArabic ? 'كلمة المرور' : 'Password'}
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus-within:border-indigo-500">
                    <Lock className="w-4 h-4 text-zinc-500 shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-white text-xs placeholder:text-zinc-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-300 font-bold block mb-1">
                    {isArabic ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus-within:border-indigo-500">
                    <Lock className="w-4 h-4 text-zinc-500 shrink-0" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-white text-xs placeholder:text-zinc-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-0.5"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-60"
                style={{ color: '#ffffff' }}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>{isArabic ? 'إنشاء حساب وتأكيد التسجيل ✓' : 'Register Account & Get Started ✓'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* VIEW 3: WHATSAPP OTP FAST LOGIN */}
          {mode === 'whatsapp_otp' && (
            <div className="space-y-4">
              {!otpSentPhone ? (
                /* Step 1: Request Phone Number */
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl text-xs text-emerald-300 space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span>{isArabic ? 'دخول فوري بدون كلمة مرور' : 'Instant 1-Click WhatsApp Login'}</span>
                    </div>
                    <p className="text-[11px] text-emerald-400/90">
                      {isArabic
                        ? 'سنرسل رمز تحقق مكون من 6 أرقام مباشرة إلى رقم الواتساب الخاص بك.'
                        : 'We will dispatch a secure 6-digit verification code directly to your WhatsApp.'}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 font-bold block mb-1.5">
                      {isArabic ? 'رقم هاتف الواتساب' : 'WhatsApp Phone Number'}
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus-within:border-emerald-500">
                      <span className="text-xs font-mono font-bold text-slate-300 shrink-0">🇮🇶 +964</span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="770 123 4567"
                        className="w-full bg-transparent text-white text-xs placeholder:text-zinc-500 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                    style={{ color: '#ffffff' }}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        <span>{isArabic ? 'إرسال رمز التحقق عبر واتساب' : 'Send WhatsApp OTP Code'}</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Enter OTP Code */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs space-y-1">
                    <span className="text-zinc-400 block">{isArabic ? 'تم إرسال الرمز إلى:' : 'OTP Code sent to:'}</span>
                    <span className="font-mono font-bold text-white text-sm">{otpSentPhone}</span>
                  </div>

                  {otpSandboxCode && (
                    <div className="p-2.5 bg-indigo-950/60 border border-indigo-700/80 rounded-xl text-xs text-indigo-300 flex items-center justify-between font-mono">
                      <span>Sandbox OTP Code:</span>
                      <span className="font-bold text-base text-amber-300 bg-black/40 px-2 py-0.5 rounded">{otpSandboxCode}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-zinc-300 font-bold block mb-1.5">
                      {isArabic ? 'رمز التحقق (6 أرقام)' : 'Enter 6-Digit Verification Code'}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-center font-mono font-extrabold text-lg tracking-widest focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                    style={{ color: '#ffffff' }}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isArabic ? 'تأكيد الدخول' : 'Verify & Sign In'}</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setOtpSentPhone('')}
                      className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      {isArabic ? 'تغيير رقم الهاتف' : 'Change Phone Number'}
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setOtpSentPhone('');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  {isArabic ? '← العودة لتسجيل الدخول بالبريد' : '← Back to Email Sign In'}
                </button>
              </div>
            </div>
          )}

          {/* VIEW 4: FORGOT / RESET PASSWORD */}
          {mode === 'forgot_password' && (
            <div className="space-y-4">
              {resetStep === 'request' ? (
                <form onSubmit={handleRequestPasswordReset} className="space-y-4">
                  <p className="text-xs text-zinc-400">
                    {isArabic
                      ? 'أدخل بريدك الإلكتروني أو رقم هاتفك لإرسال رمز استعادة الحساب.'
                      : 'Enter your registered email address or phone number to receive a recovery code.'}
                  </p>

                  <div>
                    <label className="text-xs text-zinc-300 font-bold block mb-1.5">
                      {isArabic ? 'البريد أو رقم الهاتف' : 'Email or Phone'}
                    </label>
                    <input
                      type="text"
                      required
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      placeholder="user@example.iq or +964770..."
                      className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    style={{ color: '#ffffff' }}
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin text-white mx-auto" /> : (isArabic ? 'إرسال رمز الاستعادة' : 'Send Recovery Code')}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPasswordReset} className="space-y-4">
                  {resetSandboxCode && (
                    <div className="p-2.5 bg-indigo-950/60 border border-indigo-700/80 rounded-xl text-xs text-indigo-300 flex items-center justify-between font-mono">
                      <span>Sandbox Reset Code:</span>
                      <span className="font-bold text-base text-amber-300 bg-black/40 px-2 py-0.5 rounded">{resetSandboxCode}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-zinc-300 font-bold block mb-1">
                      {isArabic ? 'رمز الاستعادة (6 أرقام):' : 'Reset Code:'}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono text-center text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 font-bold block mb-1">
                      {isArabic ? 'كلمة المرور الجديدة:' : 'New Password:'}
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    style={{ color: '#ffffff' }}
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin text-white mx-auto" /> : (isArabic ? 'تحديث كلمة المرور والدخول ✓' : 'Update Password & Sign In ✓')}
                  </button>
                </form>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  {isArabic ? '← العودة لتسجيل الدخول' : '← Back to Sign In'}
                </button>
              </div>
            </div>
          )}

          {/* Quick Demo Accounts Helper (Non-intrusive footer for testing) */}
          <div className="pt-4 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
              <span>{isArabic ? 'حسابات تجريبية سريعة (1-Click):' : 'Quick Demo Logins (1-Click):'}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['customer', 'workshop', 'supplier'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    handleQuickDemoLogin(r);
                    setMode('signin');
                  }}
                  className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg text-[10px] font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer text-center truncate"
                >
                  {isArabic ? demoAccounts[r].labelAr : demoAccounts[r].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
