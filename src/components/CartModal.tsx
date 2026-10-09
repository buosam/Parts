/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Cart & 100% Upfront Payment Checkout
 */

import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Truck,
  Building,
  CheckCircle,
  MapPin,
  Clock,
  Car,
  Star,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Banknote,
  Coins,
  Check,
  Crown,
  Zap,
  Sparkles,
  Lock,
  RefreshCw,
  QrCode,
  Smartphone,
  Receipt,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const CartModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    cart,
    removeFromCart,
    createOrder,
    orders,
    activeVehicle,
    setSelectedOrderForRating,
    formatPrice,
    language,
    activeSubscription,
    calculateCartPerks,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [activeTab, setActiveTab] = useState<'cart' | 'orders'>('cart');

  // Delivery state
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'supplier_delivery'>('supplier_delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('Erbil, Gulan Street, Building 42');
  const [customerName, setCustomerName] = useState('Ahmed Al-Tikriti');
  const [customerPhone, setCustomerPhone] = useState('+964 770 551 2299');

  // 100% Digital Payment State
  const [paymentMethod, setPaymentMethod] = useState<'zain_cash' | 'asia_hawala' | 'fib_bank' | 'credit_card'>('zain_cash');
  const [walletPhone, setWalletPhone] = useState('0770 123 4567');
  const [walletPin, setWalletPin] = useState('••••');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderCreatedSuccess, setOrderCreatedSuccess] = useState<string | null>(null);
  const [lastTxnId, setLastTxnId] = useState<string | null>(null);

  if (activeModal !== 'cart') return null;

  const subtotalUSD = cart.reduce((sum, item) => sum + item.offer.priceUSD * item.quantity, 0);
  const baseShippingUSD = deliveryMethod === 'supplier_delivery' ? 8 : 0;
  const perksResult = calculateCartPerks(subtotalUSD, baseShippingUSD);
  const deliveryFeeUSD = perksResult.finalShippingUSD;
  const discountAmountUSD = perksResult.discountAmountUSD;
  const totalUSD = perksResult.totalUSD;
  const totalIQD = Math.round(totalUSD * 1500);

  const paymentGateways = [
    {
      id: 'zain_cash' as const,
      name: 'ZainCash',
      nameAr: 'محفظة زين كاش',
      icon: '📱',
      badge: 'POPULAR IN IRAQ',
      badgeAr: 'الأكثر استخداماً',
      color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
    },
    {
      id: 'asia_hawala' as const,
      name: 'AsiaHawala',
      nameAr: 'آسيا حوالة',
      icon: '⚡',
      badge: 'INSTANT WALLET',
      badgeAr: 'دفع فوري',
      color: 'border-amber-500/50 bg-amber-500/10 text-amber-300',
    },
    {
      id: 'fib_bank' as const,
      name: 'FIB / QI Card',
      nameAr: 'المصرف الأول FIB / كي كارد',
      icon: '🏦',
      badge: 'DIRECT BANK',
      badgeAr: 'حساب بنكي مباشر',
      color: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300',
    },
    {
      id: 'credit_card' as const,
      name: 'Visa / Mastercard',
      nameAr: 'بطاقة فيزا / ماستركارد',
      icon: '💳',
      badge: '3D SECURE',
      badgeAr: 'حماية بنكية',
      color: 'border-blue-500/50 bg-blue-500/10 text-blue-300',
    },
  ];

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsProcessingPayment(true);

    // Simulate real-time 100% digital payment authorization & escrow reservation
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const txnPrefix =
      paymentMethod === 'zain_cash'
        ? 'TXN-ZC'
        : paymentMethod === 'asia_hawala'
          ? 'TXN-AH'
          : paymentMethod === 'fib_bank'
            ? 'TXN-FIB'
            : 'TXN-CC';
    const txnId = `${txnPrefix}-${Date.now().toString().slice(-6)}`;

    const newOrd = createOrder({
      customerId: 'cust-1',
      customerName,
      customerPhone,
      deliveryMethod,
      deliveryAddress: deliveryMethod === 'supplier_delivery' ? deliveryAddress : 'Pickup from Dealer Counter',
      paymentMethod,
      paymentStatus: 'PAID',
      transactionId: txnId,
      status: 'confirmed',
      items: cart.map((c) => ({
        masterPartId: c.masterPart.id,
        partName: c.masterPart.partName,
        partNumber: c.masterPart.partNumber,
        brand: c.offer.brand,
        quality: c.offer.quality,
        quantity: c.quantity,
        unitPriceUSD: c.offer.priceUSD,
        unitPriceIQD: c.offer.priceIQD || Math.round(c.offer.priceUSD * 1500),
        supplierId: c.offer.supplierId,
        supplierName: c.offer.supplierName,
      })),
      totalUSD,
      totalIQD,
      supplierId: cart[0]?.offer.supplierId,
      supplierName: cart[0]?.offer.supplierName,
    });

    setIsProcessingPayment(false);
    setLastTxnId(txnId);
    setOrderCreatedSuccess(newOrd.orderNumber);
    setActiveTab('orders');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="bg-zinc-950 border border-zinc-800 text-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg">
                {isArabic ? 'سلة المشتريات والدفع الإلكتروني' : 'Cart & 100% Upfront Checkout'}
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>{cart.length} {isArabic ? 'قطع محددة' : 'items'}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isArabic ? 'دفع إلكتروني مؤمن 100% مع ضمان استرداد' : '100% Upfront Payment with Escrow Protection'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800 px-5 pt-2 gap-4 text-xs font-semibold bg-zinc-900/20">
          <button
            onClick={() => setActiveTab('cart')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cart'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <span>{isArabic ? 'سلة المشتريات' : 'My Cart'}</span>
            <span className="bg-zinc-800 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
              {cart.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <span>{isArabic ? 'الطلبات المسددة' : 'Paid Orders'}</span>
            <span className="bg-zinc-800 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
              {orders.length}
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto max-h-[75vh] space-y-4">
          {/* Order Paid Success Receipt Banner */}
          {orderCreatedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs space-y-2 shadow-lg">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-sm text-white block">
                    {isArabic
                      ? `تم سداد المبلغ 100% وتأكيد الطلب #${orderCreatedSuccess}`
                      : `100% Payment Confirmed! PO #${orderCreatedSuccess}`}
                  </span>
                  <span className="text-[11px] text-emerald-300/80">
                    {isArabic
                      ? `رقم الحوالة: ${lastTxnId} • المبلغ محفوظ في حساب الضمان حتى استلام وفحص القطعة`
                      : `Txn ID: ${lastTxnId} • Funds securely held in Escrow until fitment is verified.`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: CART */}
          {activeTab === 'cart' && (
            <div>
              {cart.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-sm">
                    {isArabic ? 'سلة المشتريات فارغة' : 'Your cart is empty'}
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                    {isArabic
                      ? 'ابحث في الكتالوج المباشر وأضف القطع المتوافقة لتنفيذ الشراء والسداد.'
                      : 'Browse the live catalog to add genuine parts with verified fitment.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cart Items List */}
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div
                        key={item.offer.id}
                        className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-indigo-300 text-[11px]">
                              {item.masterPart.partNumber}
                            </span>
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {item.offer.quality}
                            </span>
                          </div>
                          <h4 className="font-bold text-white truncate mt-0.5">
                            {item.masterPart.partName}
                          </h4>
                          <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                            <span>Supplier: <strong className="text-zinc-200">{item.offer.supplierName}</strong></span>
                            <span>•</span>
                            <span>Qty: <strong className="text-white">{item.quantity}</strong></span>
                          </div>
                        </div>

                        <div className="text-end shrink-0">
                          <div className="font-extrabold text-emerald-400 text-sm">
                            {formatPrice(item.offer.priceUSD * item.quantity, item.offer.priceIQD * item.quantity)}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.offer.id)}
                            className="text-red-400 hover:text-red-300 text-[11px] flex items-center gap-1 mt-1 font-semibold cursor-pointer ms-auto"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{isArabic ? 'حذف' : 'Remove'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Subscription Banner & Active Perks */}
                  {activeSubscription && activeSubscription.priceUSD > 0 ? (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <span className="font-bold text-amber-300 block">
                            {activeSubscription.tierName} {isArabic ? 'مفعل' : 'Active Member'}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {isArabic ? 'توصيل مجاني + خصم مشتريات وضمان ممتد' : 'Free Express Shipping + VIP Trade Discount & Warranty'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                        {isArabic ? 'مزايا مطبقة' : 'PERKS APPLIED'}
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <span className="font-bold text-white block">
                            {isArabic ? 'اشترك في IQAutoMarket Prime' : 'Join IQAutoMarket Prime'}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {isArabic ? 'احصل على توصيل مجاني وضمان سنة كاملة على كل طلب' : 'Get 100% Free Shipping + 1-Year Extended Warranty on every order'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveModal('subscription')}
                        className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-[11px] rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        {isArabic ? 'ترقية الآن' : 'Upgrade $9/mo'}
                      </button>
                    </div>
                  )}

                  {/* Checkout & 100% Payment Form */}
                  <form onSubmit={handlePlaceOrder} className="pt-4 border-t border-zinc-800 space-y-4 text-xs">
                    {/* Delivery Details */}
                    <div>
                      <h4 className="font-bold text-white text-xs mb-2 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-indigo-400" />
                        <span>{isArabic ? '1. بيانات التوصيل والاستلام' : '1. Delivery & Recipient Details'}</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder={isArabic ? 'اسم المستلم' : 'Recipient Name'}
                          className="w-full px-3 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 text-xs focus:outline-none focus:border-zinc-500"
                        />
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder={isArabic ? 'رقم الهاتف' : 'Phone Number'}
                          className="w-full px-3 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 text-xs focus:outline-none focus:border-zinc-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod('supplier_delivery')}
                          className={`p-2.5 rounded-xl border text-start cursor-pointer transition-all ${
                            deliveryMethod === 'supplier_delivery'
                              ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold'
                              : 'border-zinc-800 bg-zinc-900/40 text-zinc-400'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs">
                            <Truck className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{isArabic ? 'توصيل كوريير للعنوان' : 'Courier Delivery'}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 block mt-0.5">2-4 Hours in City</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeliveryMethod('pickup')}
                          className={`p-2.5 rounded-xl border text-start cursor-pointer transition-all ${
                            deliveryMethod === 'pickup'
                              ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold'
                              : 'border-zinc-800 bg-zinc-900/40 text-zinc-400'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs">
                            <Building className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{isArabic ? 'استلام من كاونتر المورد' : 'Counter Pickup'}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 block mt-0.5">Instant & Free</span>
                        </button>
                      </div>

                      {deliveryMethod === 'supplier_delivery' && (
                        <input
                          type="text"
                          required
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder={isArabic ? 'عنوان التوصيل في العراق' : 'Delivery Address (City, District, Street)'}
                          className="w-full px-3 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 text-xs focus:outline-none focus:border-zinc-500"
                        />
                      )}
                    </div>

                    {/* 100% Upfront Digital Payment Method Selector */}
                    <div className="pt-3 border-t border-zinc-800">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                          <Lock className="w-4 h-4 text-emerald-400" />
                          <span>{isArabic ? '2. سداد القيمة 100% مقدماً (دفع إلكتروني آمن)' : '2. 100% Upfront Digital Payment'}</span>
                        </h4>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {isArabic ? 'سداد إلزامي 100%' : '100% MANDATORY'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        {paymentGateways.map((gw) => (
                          <button
                            key={gw.id}
                            type="button"
                            onClick={() => setPaymentMethod(gw.id)}
                            className={`p-2.5 rounded-xl border flex flex-col justify-between text-start transition-all cursor-pointer ${
                              paymentMethod === gw.id
                                ? `${gw.color} ring-1 ring-emerald-500/30 font-bold`
                                : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="text-base">{gw.icon}</span>
                              {paymentMethod === gw.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                            </div>
                            <div>
                              <span className="font-bold text-white block text-[11px]">
                                {isArabic ? gw.nameAr : gw.name}
                              </span>
                              <span className="text-[9px] text-zinc-500 block">
                                {isArabic ? gw.badgeAr : gw.badge}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Payment Credential Inputs based on Gateway */}
                      <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-2">
                        {paymentMethod === 'zain_cash' && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-zinc-400 block mb-1">
                                {isArabic ? 'رقم محفظة زين كاش' : 'ZainCash Wallet Number'}
                              </label>
                              <input
                                type="tel"
                                required
                                value={walletPhone}
                                onChange={(e) => setWalletPhone(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-zinc-400 block mb-1">
                                {isArabic ? 'رمز المحفظة (PIN)' : 'Wallet PIN'}
                              </label>
                              <input
                                type="password"
                                required
                                maxLength={4}
                                value={walletPin}
                                onChange={(e) => setWalletPin(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono text-center"
                              />
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'asia_hawala' && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-zinc-400 block mb-1">
                                {isArabic ? 'رقم محفظة آسيا حوالة' : 'AsiaHawala Account'}
                              </label>
                              <input
                                type="tel"
                                required
                                value={walletPhone}
                                onChange={(e) => setWalletPhone(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-zinc-400 block mb-1">
                                {isArabic ? 'رمز التأكيد (OTP/PIN)' : 'Security PIN'}
                              </label>
                              <input
                                type="password"
                                required
                                maxLength={4}
                                value={walletPin}
                                onChange={(e) => setWalletPin(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono text-center"
                              />
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'fib_bank' && (
                          <div className="flex items-center justify-between text-xs text-zinc-300">
                            <div className="flex items-center gap-2">
                              <QrCode className="w-6 h-6 text-indigo-400" />
                              <div>
                                <span className="font-bold text-white block">
                                  {isArabic ? 'مسح QR عبر تطبيق FIB' : 'FIB Quick QR Checkout'}
                                </span>
                                <span className="text-[10px] text-zinc-400">
                                  {isArabic ? 'خصم مباشر 100% من حسابك المصرفي' : 'Direct 100% debit from FIB checking account'}
                                </span>
                              </div>
                            </div>
                            <span className="text-emerald-400 text-[11px] font-mono font-bold">IBAN Linked</span>
                          </div>
                        )}

                        {paymentMethod === 'credit_card' && (
                          <div className="space-y-2">
                            <div>
                              <label className="text-[10px] text-zinc-400 block mb-1">
                                {isArabic ? 'رقم البطاقة (16 رقم)' : 'Card Number'}
                              </label>
                              <input
                                type="text"
                                required
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                required
                                placeholder="MM/YY"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono text-center"
                              />
                              <input
                                type="password"
                                required
                                maxLength={4}
                                placeholder="CVV"
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono text-center"
                              />
                            </div>
                          </div>
                        )}

                        {/* Escrow Protection Notice */}
                        <div className="pt-2 border-t border-zinc-800/80 flex items-start gap-1.5 text-[10px] text-zinc-400">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            {isArabic
                              ? 'حماية الضمان 100%: أموالك تظل محفوظة في حساب الوساطة ولا يتم تسليمها للتاجر إلا بعد استلام وفحص القطعة.'
                              : '100% Escrow Protection: Full payment is held securely in escrow and only released to the supplier after parts inspection & fitment verification.'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Summary */}
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                      <div className="flex justify-between text-zinc-400">
                        <span>{isArabic ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                        <span className="font-bold text-white">{formatPrice(subtotalUSD)}</span>
                      </div>

                      {discountAmountUSD > 0 && (
                        <div className="flex justify-between text-emerald-400 font-bold">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isArabic ? `خصم العضوية (${perksResult.discountPercent}%):` : `Membership Discount (${perksResult.discountPercent}%):`}</span>
                          </span>
                          <span>-{formatPrice(discountAmountUSD)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-zinc-400">
                        <span>{isArabic ? 'رسوم التوصيل:' : 'Delivery Fee:'}</span>
                        <span className="font-bold text-emerald-400">
                          {deliveryFeeUSD === 0 ? (isArabic ? 'مجاناً (Prime)' : 'FREE (Prime Member)') : formatPrice(deliveryFeeUSD)}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm sm:text-base font-extrabold text-white pt-2 border-t border-zinc-800">
                        <span>{isArabic ? 'المبلغ المستحق سداده (100%):' : 'Amount to Pay (100% Upfront):'}</span>
                        <span className="text-emerald-400">{formatPrice(totalUSD, totalIQD)}</span>
                      </div>
                    </div>

                    {/* 100% Upfront Payment Submission Button */}
                    <button
                      type="submit"
                      disabled={isProcessingPayment}
                      className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-60"
                      style={{ color: '#ffffff' }}
                    >
                      {isProcessingPayment ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>{isArabic ? 'جاري سداد المبلغ وتأكيد العملية...' : 'Authorizing 100% Digital Payment...'}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-white" />
                          <span>
                            {isArabic
                              ? `سداد 100% الآن (${formatPrice(totalUSD, totalIQD)})`
                              : `Pay 100% Upfront (${formatPrice(totalUSD, totalIQD)})`}
                          </span>
                          <ArrowRight className="w-4 h-4 rtl:rotate-180 text-white" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PAID ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="py-10 text-center text-zinc-400 text-xs">
                  {isArabic ? 'لا توجد طلبات مسددة سابقة.' : 'No paid orders found.'}
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-300">{ord.orderNumber}</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>{isArabic ? 'مسدد 100%' : '100% PAID'}</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {ord.transactionId || 'TXN-PAID'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {ord.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-zinc-300">
                          <span>{item.partName} ({item.brand}) x{item.quantity}</span>
                          <span className="font-bold text-white font-mono">
                            {formatPrice(item.unitPriceUSD * item.quantity, item.unitPriceIQD * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-zinc-400">
                      <span>
                        Paid via: <strong className="text-white capitalize">{ord.paymentMethod?.replace('_', ' ') || 'Digital Wallet'}</strong>
                      </span>
                      <span className="text-white font-extrabold text-xs">
                        Total: <strong className="text-emerald-400">{formatPrice(ord.totalUSD, ord.totalIQD)}</strong>
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'أموالك مؤمنة بالكامل في حساب الضمان' : 'Funds Escrow Protected'}</span>
                      </span>

                      <button
                        onClick={() => {
                          setSelectedOrderForRating(ord);
                          setActiveModal('rate_dealer');
                        }}
                        className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{isArabic ? 'تقييم التاجر' : 'Review Dealer'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
