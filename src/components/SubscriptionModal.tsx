/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Subscription & Membership Modal
 * Minimalist, Modern, High-Conversion Subscription Interface
 */

import React, { useState } from 'react';
import {
  X,
  Check,
  Zap,
  ShieldCheck,
  Truck,
  Sparkles,
  Store,
  Wrench,
  UserCheck,
  RefreshCw,
  Crown,
  CreditCard,
  Building2,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '../data/subscriptionPlans';
import { UserRole } from '../types';

export const SubscriptionModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    currentUser,
    activeSubscription,
    subscribeToPlan,
    language,
    formatPrice,
  } = useMarketplace();

  const isArabic = language === 'ar';

  const defaultTab: UserRole =
    currentUser?.role === 'supplier'
      ? 'supplier'
      : currentUser?.role === 'workshop'
        ? 'workshop'
        : 'customer';

  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultTab);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('ZainCash');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (activeModal !== 'subscription') return null;

  const currentRolePlans = SUBSCRIPTION_PLANS.filter((p) => p.roleTarget === selectedRole);

  const paymentOptions = [
    { id: 'ZainCash', label: 'ZainCash', labelAr: 'زين كاش', icon: '📱' },
    { id: 'AsiaHawala', label: 'AsiaHawala', labelAr: 'آسيا حوالة', icon: '⚡' },
    { id: 'FIB', label: 'FIB Bank', labelAr: 'المصرف العراقي الأول FIB', icon: '🏦' },
    { id: 'Card', label: 'Credit/Debit Card', labelAr: 'بطاقة مصرفية / ماستركارد', icon: '💳' },
  ];

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (plan.priceMonthlyUSD === 0) {
      setStatusMessage({
        type: 'success',
        text: isArabic ? 'أنت بالفعل على الباقة الأساسية المجانية' : 'You are on the standard free tier.',
      });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const res = await subscribeToPlan(plan.id, billingCycle, paymentMethod);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: res.message || (isArabic ? 'تم تفعيل الاشتراك بنجاح!' : 'Subscription activated successfully!'),
        });
        setTimeout(() => {
          setActiveModal(null);
        }, 1500);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || (isArabic ? 'فشل إتمام الاشتراك' : 'Failed to complete subscription.'),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="bg-zinc-950 border border-zinc-800 text-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {isArabic ? 'عضويات وباقات IQAutoMarket' : 'IQAutoMarket Memberships & Subscriptions'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400">
                  {isArabic ? 'وفّر حتى 50%' : 'Save Up to 50%'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {isArabic
                  ? 'باقات مخصصة للمشترين، ورش الصيانة، وتجار قطع الغيار في العراق'
                  : 'Tailored premium privileges for Buyers, Garages, and Automotive Distributors'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls: Segment Selector & Monthly/Yearly Switch */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Target Audience Segment Tabs */}
          <div className="flex items-center bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 w-full sm:w-auto">
            <button
              onClick={() => {
                setSelectedRole('customer');
                setStatusMessage(null);
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedRole === 'customer'
                  ? 'bg-zinc-800 text-amber-300 shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isArabic ? 'المشترين (Prime)' : 'Buyers (Prime)'}</span>
            </button>

            <button
              onClick={() => {
                setSelectedRole('workshop');
                setStatusMessage(null);
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedRole === 'workshop'
                  ? 'bg-zinc-800 text-indigo-300 shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{isArabic ? 'ورش الصيانة (Fleet Pass)' : 'Workshops (Fleet Pass)'}</span>
            </button>

            <button
              onClick={() => {
                setSelectedRole('supplier');
                setStatusMessage(null);
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedRole === 'supplier'
                  ? 'bg-zinc-800 text-emerald-300 shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تجار القطع (Pro Dealer)' : 'Dealers (Pro DMS)'}</span>
            </button>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center gap-2 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {isArabic ? 'شهري' : 'Monthly'}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                billingCycle === 'yearly'
                  ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>{isArabic ? 'سنوي' : 'Yearly'}</span>
              <span className="text-[10px] font-bold text-emerald-400 px-1 rounded bg-emerald-500/10">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-red-950/40 border-red-800 text-red-300'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Plans Grid */}
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentRolePlans.map((plan) => {
            const isYearly = billingCycle === 'yearly';
            const priceUSD = isYearly ? plan.priceYearlyUSD : plan.priceMonthlyUSD;
            const priceIQD = isYearly ? plan.priceYearlyIQD : plan.priceMonthlyIQD;
            const isCurrentPlan = activeSubscription?.planId === plan.id;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-5 flex flex-col justify-between transition-all border ${
                  isCurrentPlan
                    ? 'bg-zinc-900/90 border-emerald-500/50 ring-1 ring-emerald-500/30'
                    : isPopular
                      ? 'bg-zinc-900/60 border-amber-500/40 ring-1 ring-amber-500/20'
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Popular / Current Badges */}
                {isPopular && (
                  <div className="absolute -top-2.5 start-4 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-[10px] font-black rounded-full shadow-sm tracking-wider uppercase">
                    {isArabic ? plan.badgeAr || 'الأكثر طلباً' : plan.badge || 'POPULAR'}
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-2.5 end-4 px-2 py-0.5 bg-emerald-500 text-zinc-950 text-[10px] font-black rounded-full shadow-sm">
                    {isArabic ? 'باقتك الحالية' : 'CURRENT PLAN'}
                  </div>
                )}

                {/* Plan Header */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    {isArabic ? plan.nameAr : plan.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 mb-4 min-h-[32px] leading-relaxed">
                    {isArabic ? plan.taglineAr : plan.tagline}
                  </p>

                  {/* Pricing Box */}
                  <div className="mb-4 pb-4 border-b border-zinc-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-white">
                        {priceUSD === 0 ? (isArabic ? 'مجاناً' : 'Free') : `$${priceUSD}`}
                      </span>
                      {priceUSD > 0 && (
                        <span className="text-xs text-zinc-400 font-normal">
                          / {isYearly ? (isArabic ? 'سنة' : 'year') : isArabic ? 'شهر' : 'month'}
                        </span>
                      )}
                    </div>
                    {priceIQD > 0 && (
                      <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                        ≈ {priceIQD.toLocaleString()} IQD
                      </p>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 mb-6">
                    {(isArabic ? plan.featuresAr : plan.features).map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-tight text-[11px]">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Action Button */}
                <button
                  type="button"
                  disabled={isProcessing || isCurrentPlan}
                  onClick={() => handleSubscribe(plan)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isCurrentPlan
                      ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30 cursor-default'
                      : isPopular
                        ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-md font-bold'
                        : 'bg-zinc-100 hover:bg-white text-zinc-950'
                  }`}
                  style={
                    !isCurrentPlan
                      ? {
                          backgroundColor: isPopular ? '#fbbf24' : '#f4f4f5',
                          color: '#09090b',
                        }
                      : {}
                  }
                >
                  {isProcessing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : isCurrentPlan ? (
                    <span>{isArabic ? 'الباقة المفعلة الآن' : 'Active Plan'}</span>
                  ) : priceUSD === 0 ? (
                    <span>{isArabic ? 'الباقة الأساسية' : 'Default Basic'}</span>
                  ) : (
                    <span>
                      {isArabic ? `ترقية إلى ${plan.nameAr}` : `Upgrade to ${plan.name}`}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Local Iraqi Payment Methods Footer */}
        <div className="p-4 sm:p-5 bg-zinc-900/50 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300">
              {isArabic ? 'طرق الدفع المحلية المدعومة في العراق:' : 'Supported Iraqi Payment Methods:'}
            </span>
            <div className="flex items-center gap-1.5">
              {paymentOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`px-2 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === opt.id
                      ? 'bg-zinc-800 border-zinc-600 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{isArabic ? opt.labelAr : opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{isArabic ? 'إلغاء فوري في أي وقت دون شروط' : 'Instant cancellation anytime'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
