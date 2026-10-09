/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Auth Modal - Minimalist, Modern, Streamlined Interface
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

  // Synchronize on modal open
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

  // Resend Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  if (activeModal !== 'auth') return null;

  const demoAccounts: Record<UserRole, { label: string; labelAr: string; email: string; pass: string }> = {
    customer: { label: 'Buyer', labelAr: 'مشتري', email: 'ahmed@iqautomarket.iq', pass: 'buyer1234' },
    supplier: { label: 'Dealer', labelAr: 'تاجر', email: 'sales@mansourparts.iq', pass: 'dealer1234' },
    workshop: { label: 'Workshop', labelAr: 'ورشة', email: 'service@babilauto.iq', pass: 'workshop1234' },
    admin: { label: 'Admin', labelAr: 'إدارة', email: 'admin@iqautomarket.iq', pass: 'admin1234' },
  };

  const handleDemoClick = (role: UserRole) => {
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
      setErrorMessage(isArabic ? 'يرجى ملء جميع الحقول' : 'Please fill all required fields.');
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
      });

      if (res.success) {
        setSuccessMessage(isArabic ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || (isArabic ? 'فشل إنشاء الحساب.' : 'Failed to create account.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !phone.trim()) {
      setErrorMessage(isArabic ? 'يرجى إدخال رقم الهاتف' : 'Please enter your phone number.');
      return;
    }

    const cleanDigits = phone.replace(/\D/g, '');
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      if (cleanDigits.startsWith('964')) {
        formattedPhone = `+${cleanDigits}`;
      } else if (cleanDigits.startsWith('0')) {
        formattedPhone = `+964${cleanDigits.slice(1)}`;
      } else {
        formattedPhone = `+964${cleanDigits}`;
      }
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await requestOtp(formattedPhone);
      if (res.success) {
        setOtpSentPhone(formattedPhone);
        setOtpSandboxCode(res.sandboxCode || null);
        setOtpTimer(60);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to dispatch code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setErrorMessage(isArabic ? 'يرجى إدخال رمز التحقق' : 'Please enter code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginWithOtp(otpSentPhone || phone, otpCode, selectedRole);
      if (res.success) {
        setSuccessMessage(isArabic ? 'تم التحقق بنجاح!' : 'Verified successfully!');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || (isArabic ? 'رمز غير صالح.' : 'Invalid code.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier) {
      setErrorMessage(isArabic ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await forgotPassword(resetIdentifier);
      if (res.success) {
        setResetStep('verify');
        setResetSandboxCode(res.sandboxCode || null);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to send reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode || !newPassword) {
      setErrorMessage(isArabic ? 'يرجى ملء جميع الحقول' : 'Please fill all fields.');
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
        setSuccessMessage(isArabic ? 'تم تحديث كلمة المرور!' : 'Password updated!');
        setTimeout(() => setActiveModal(null), 1200);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || (isArabic ? 'رمز غير صالح.' : 'Invalid code.'));
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase =
    'w-full bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-xl py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/20 transition-all';
  const inputWithIcon = isArabic ? `${inputBase} pr-10 pl-4` : `${inputBase} pl-10 pr-4`;
  const inputWithBoth = isArabic ? `${inputBase} pr-10 pl-10` : `${inputBase} pl-10 pr-10`;
  const iconLeft = isArabic ? 'absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-zinc-500' : 'absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-zinc-500';
  const iconRight = isArabic ? 'absolute inset-y-0 left-3.5 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer' : 'absolute inset-y-0 right-3.5 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div
        className="bg-zinc-950 border border-zinc-800 text-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Minimal Header */}
        <div className="p-5 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1.5 shrink-0">
              <Logo variant="mark" size="sm" showBadge={false} showSubtitle={false} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                {mode === 'signin'
                  ? isArabic ? 'تسجيل الدخول' : 'Sign in to IQAutoMarket'
                  : mode === 'signup'
                    ? isArabic ? 'إنشاء حساب جديد' : 'Create an account'
                    : mode === 'whatsapp_otp'
                      ? isArabic ? 'تسجيل عبر واتساب' : 'WhatsApp Sign-in'
                      : isArabic ? 'استعادة كلمة المرور' : 'Reset password'}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimal Mode Tabs */}
        <div className="px-5 pt-4">
          <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                mode === 'signin' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {isArabic ? 'دخول' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                mode === 'signup' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {isArabic ? 'حساب جديد' : 'Sign Up'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('whatsapp_otp');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 cursor-pointer ${
                mode === 'whatsapp_otp' ? 'bg-zinc-800 text-emerald-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>OTP</span>
            </button>
          </div>
        </div>

        {/* Minimal Role Selector for Sign In / Sign Up */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="px-5 pt-3">
            <div className="flex items-center gap-1.5 p-1 bg-zinc-900/40 border border-zinc-800/50 rounded-xl">
              {(['customer', 'supplier', 'workshop'] as UserRole[]).map((r) => {
                const isSelected = selectedRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r);
                      if (mode === 'signin') {
                        setEmail(demoAccounts[r].email);
                        setPassword(demoAccounts[r].pass);
                      }
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'bg-zinc-800 text-white border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {isArabic ? demoAccounts[r].labelAr : demoAccounts[r].label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-5 space-y-3.5">
          {/* Alerts */}
          {successMessage && (
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/50 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-2.5 bg-red-950/40 border border-red-800/50 rounded-xl flex items-center gap-2 text-red-300 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* VIEW: SIGN IN */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3">
              <div>
                <div className="relative">
                  <div className={iconLeft}>
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isArabic ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email or phone number'}
                    className={inputWithIcon}
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <div className={iconLeft}>
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isArabic ? 'كلمة المرور' : 'Password'}
                    className={inputWithBoth}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={iconRight}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-zinc-800 bg-zinc-900 text-zinc-200 focus:ring-0"
                  />
                  <span>{isArabic ? 'تذكرني' : 'Remember me'}</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setResetIdentifier(email);
                    setMode('forgot_password');
                  }}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2 shadow-sm"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>{isArabic ? 'تسجيل الدخول' : 'Sign In'}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </>
                )}
              </button>

              {/* Minimal Demo Fast Click */}
              <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500">
                <span>{isArabic ? 'تجربة سريعة:' : 'Quick test:'}</span>
                <div className="flex gap-1.5">
                  {(['customer', 'supplier', 'workshop', 'admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleDemoClick(r)}
                      className="px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 hover:text-zinc-200 transition-all cursor-pointer"
                    >
                      {demoAccounts[r].label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* VIEW: SIGN UP */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isArabic ? 'الاسم الكامل' : 'Full name'}
                  className={`${inputBase} px-3`}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isArabic ? 'البريد الإلكتروني' : 'Email'}
                  className={`${inputBase} px-3`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={isArabic ? 'الهاتف (+964)' : 'Phone (+964)'}
                  className={`${inputBase} px-3`}
                />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`${inputBase} px-3 cursor-pointer`}
                >
                  {['Baghdad', 'Erbil', 'Basra', 'Mosul', 'Sulaymaniyah', 'Najaf', 'Karbala'].map((c) => (
                    <option key={c} value={c} className="bg-zinc-900">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRole !== 'customer' && (
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={
                    selectedRole === 'supplier'
                      ? isArabic ? 'اسم المتجر / الشركة' : 'Store name'
                      : isArabic ? 'اسم مركز الصيانة' : 'Garage / Workshop name'
                  }
                  className={`${inputBase} px-3`}
                />
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isArabic ? 'كلمة المرور' : 'Password (6+)'}
                    className={`${inputBase} px-3 pr-8 rtl:pr-3 rtl:pl-8`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-2 rtl:right-auto rtl:left-2 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={isArabic ? 'تأكيد المرور' : 'Confirm'}
                    className={`${inputBase} px-3 pr-8 rtl:pr-3 rtl:pl-8`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-2 rtl:right-auto rtl:left-2 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2 shadow-sm"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>{isArabic ? 'إنشاء الحساب' : 'Create Account'}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* VIEW: WHATSAPP OTP */}
          {mode === 'whatsapp_otp' && (
            <div className="space-y-3">
              {!otpSentPhone ? (
                <form onSubmit={handleRequestOtp} className="space-y-3">
                  <div className="flex items-stretch rounded-xl bg-zinc-900/60 border border-zinc-800 focus-within:border-zinc-500 focus-within:ring-1 focus-within:ring-zinc-400/20 transition-all overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3 py-2.5 bg-zinc-900 border-r border-zinc-800 rtl:border-r-0 rtl:border-l text-zinc-300 select-none shrink-0">
                      <span className="text-sm leading-none">🇮🇶</span>
                      <span className="text-xs font-mono font-medium text-zinc-300" dir="ltr">+964</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="770 123 4567"
                      className="w-full bg-transparent py-2.5 px-3.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none font-mono tracking-wide"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>{isArabic ? 'إرسال رمز الواتساب' : 'Send WhatsApp OTP'}</span>
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtpLogin} className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>{otpSentPhone}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSentPhone('');
                        setOtpSandboxCode(null);
                      }}
                      className="text-zinc-400 hover:text-white underline cursor-pointer text-[11px]"
                    >
                      {isArabic ? 'تغيير' : 'Change'}
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
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-center text-base font-bold tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />

                  {otpSandboxCode && (
                    <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Code: <b className="text-white">{otpSandboxCode}</b></span>
                      <button
                        type="button"
                        onClick={() => setOtpCode(otpSandboxCode)}
                        className="text-emerald-400 hover:underline cursor-pointer"
                      >
                        {isArabic ? 'تعبئة' : 'Auto Fill'}
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>{isArabic ? 'تأكيد ودخول' : 'Verify & Continue'}</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {mode === 'forgot_password' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{isArabic ? 'استعادة كلمة المرور' : 'Password Recovery'}</span>
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="hover:text-white underline cursor-pointer text-[11px]"
                >
                  {isArabic ? 'العودة للدخول' : 'Back to login'}
                </button>
              </div>

              {resetStep === 'request' ? (
                <form onSubmit={handleForgotPasswordRequest} className="space-y-3">
                  <input
                    type="text"
                    required
                    value={resetIdentifier}
                    onChange={(e) => setResetIdentifier(e.target.value)}
                    placeholder={isArabic ? 'البريد الإلكتروني' : 'Email or phone'}
                    className={`${inputBase} px-3`}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>{isArabic ? 'إرسال الرمز' : 'Send Reset Code'}</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-2.5">
                  <input
                    type="text"
                    required
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder={isArabic ? 'رمز التحقق' : '6-digit code'}
                    className={`${inputBase} px-3`}
                  />
                  {resetSandboxCode && (
                    <div className="p-1.5 bg-zinc-900 rounded text-[11px] text-zinc-400 flex justify-between">
                      <span>Code: <b className="text-white">{resetSandboxCode}</b></span>
                      <button
                        type="button"
                        onClick={() => setResetCode(resetSandboxCode)}
                        className="text-zinc-200 underline cursor-pointer"
                      >
                        Auto Fill
                      </button>
                    </div>
                  )}
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={isArabic ? 'كلمة المرور الجديدة' : 'New password'}
                    className={`${inputBase} px-3`}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>{isArabic ? 'تحديث كلمة المرور' : 'Update Password'}</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
