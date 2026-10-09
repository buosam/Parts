/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Cart, Dynamic City Shipping, Promo Coupons & 100% Upfront Checkout
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
  Tag,
  AlertCircle,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ShippingSpeed } from '../data/ecommerceConfig';

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
    shippingRates,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    calculateCheckoutPricing,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [activeTab, setActiveTab] = useState<'cart' | 'orders'>('cart');

  // Ecommerce Delivery & Location state
  const [selectedCity, setSelectedCity] = useState<string>('Baghdad');
  const [shippingSpeed, setShippingSpeed] = useState<ShippingSpeed>('standard');
  const [deliveryAddress, setDeliveryAddress] = useState('Karrada, District 903, Street 14');
  const [customerName, setCustomerName] = useState('Ahmed Al-Tikriti');
  const [customerPhone, setCustomerPhone] = useState('+964 770 551 2299');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

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
  const pricing = calculateCheckoutPricing(subtotalUSD, selectedCity, shippingSpeed);

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

  const handleApplyCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError(null);
    setCouponSuccessMsg(null);

    const res = await applyCoupon(couponInput.trim(), subtotalUSD, selectedCity);
    setIsApplyingCoupon(false);

    if (res.success) {
      setCouponSuccessMsg(isArabic ? 'تم تطبيق كود الخصم بنجاح!' : res.message || 'Coupon applied successfully!');
      setCouponInput('');
    } else {
      setCouponError(res.message || 'Invalid coupon code');
    }
  };

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

    const deliveryMethod =
      shippingSpeed === 'pickup'
        ? 'pickup'
        : shippingSpeed === 'express'
          ? 'express_delivery'
          : 'supplier_delivery';

    const newOrd = createOrder({
      customerId: 'cust-1',
      customerName,
      customerPhone,
      city: selectedCity,
      shippingSpeed,
      shippingFeeUSD: pricing.finalShippingUSD,
      couponCode: appliedCoupon?.code,
      couponDiscountUSD: pricing.couponDiscountUSD,
      deliveryMethod,
      deliveryAddress: shippingSpeed === 'pickup' ? 'Pickup from Dealer Counter' : `${selectedCity} - ${deliveryAddress}`,
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
      totalUSD: pricing.totalUSD,
      totalIQD: pricing.totalIQD,
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
                      ? `رقم الحوالة: ${lastTxnId} • المدينة: ${selectedCity} • التوصيل: ${pricing.estimatedDelivery}`
                      : `Txn ID: ${lastTxnId} • City: ${selectedCity} • SLA: ${pricing.estimatedDelivery}`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cart' ? (
            cart.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto" />
                <p className="text-zinc-400 text-sm font-medium">
                  {isArabic ? 'سلة التسوق فارغة حالياً' : 'Your cart is empty'}
                </p>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {isArabic ? 'تصفح قطع الغيار' : 'Browse Spare Parts'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cart Items List */}
                <div className="space-y-2.5">
                  {cart.map((item) => (
                    <div
                      key={item.offer.id}
                      className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white truncate text-sm">
                          {item.masterPart.partName}
                        </div>
                        <div className="text-[11px] text-zinc-400 flex flex-wrap gap-2 mt-0.5">
                          <span className="font-mono text-indigo-400 font-semibold">{item.masterPart.partNumber}</span>
                          <span>•</span>
                          <span>{item.offer.brand}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">{item.offer.quality}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {isArabic ? 'المورد:' : 'Supplier:'} {item.offer.supplierName} ({item.offer.city})
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-end">
                          <div className="font-extrabold text-white text-sm">
                            {formatPrice(item.offer.priceUSD * item.quantity)}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {item.quantity} x {formatPrice(item.offer.priceUSD)}
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.offer.id)}
                          className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Prime Subscription Perk Banner */}
                {activeSubscription ? (
                  <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-xl flex items-center justify-between text-xs text-indigo-200">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="font-bold text-white block">
                          {activeSubscription.tierName} {isArabic ? 'مفعل' : 'Active'}
                        </span>
                        <span className="text-[10px] text-indigo-300">
                          {pricing.membershipDiscountPercent}% {isArabic ? 'خصم على القطع + توصيل مجاني/مخفض' : 'parts discount + free/discounted shipping'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-400 text-zinc-950 px-2 py-0.5 rounded">
                      VIP
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="font-bold text-white block">
                          {isArabic ? 'وفر أكثر مع اشتراك Prime' : 'Upgrade to Buyer Prime'}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {isArabic ? 'احصل على توصيل مجاني وضمان سنة كاملة' : 'Get Free Courier Shipping + 1-Year Extended Warranty'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveModal('subscription')}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-[11px] rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      {isArabic ? 'ترقية $9/شهر' : 'Upgrade $9/mo'}
                    </button>
                  </div>
                )}

                {/* Checkout & 100% Payment Form */}
                <form onSubmit={handlePlaceOrder} className="pt-4 border-t border-zinc-800 space-y-4 text-xs">
                  {/* Step 1: Location & Governorate */}
                  <div>
                    <h4 className="font-bold text-white text-xs mb-2 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      <span>{isArabic ? '1. المحافظة وعنوان التوصيل' : '1. Governorate & Delivery Address'}</span>
                    </h4>

                    {/* City Selector Dropdown */}
                    <div className="mb-2">
                      <label className="text-[11px] text-zinc-400 block mb-1">
                        {isArabic ? 'المحافظة / المدينة (تحدد تكلفة وسرعة التوصيل):' : 'Select City / Governorate (Calculates Shipping Rate & SLA):'}
                      </label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {shippingRates.map((rate) => (
                          <option key={rate.id} value={rate.city} className="bg-zinc-900 text-white">
                            {isArabic ? rate.cityAr : rate.city} — Standard: ${rate.standardShippingUSD} ({rate.standardDeliveryDays}) | Express: ${rate.expressShippingUSD}
                          </option>
                        ))}
                      </select>
                    </div>

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

                    {/* Step 2: Shipping Tier Speed Selector */}
                    <div className="mt-3">
                      <label className="text-[11px] text-zinc-400 block mb-1 font-bold">
                        {isArabic ? 'اختر طريقة وسرعة التوصيل:' : 'Choose Shipping Speed & Method:'}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {/* Standard Delivery */}
                        <button
                          type="button"
                          onClick={() => setShippingSpeed('standard')}
                          className={`p-2.5 rounded-xl border text-start cursor-pointer transition-all ${
                            shippingSpeed === 'standard'
                              ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold ring-1 ring-indigo-500/30'
                              : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="flex items-center gap-1.5 text-xs text-indigo-300">
                              <Truck className="w-3.5 h-3.5" />
                              <span>{isArabic ? 'توصيل قياسي' : 'Standard Delivery'}</span>
                            </span>
                            <span className="font-extrabold text-white text-xs">
                              {pricing.freeShippingApplied ? (
                                <span className="text-emerald-400">FREE</span>
                              ) : (
                                `$${pricing.selectedCityRate?.standardShippingUSD || 5}`
                              )}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400 block">
                            ⏱ {pricing.selectedCityRate?.standardDeliveryDays || '1-2 Days'}
                          </span>
                        </button>

                        {/* Express Delivery */}
                        <button
                          type="button"
                          onClick={() => setShippingSpeed('express')}
                          className={`p-2.5 rounded-xl border text-start cursor-pointer transition-all ${
                            shippingSpeed === 'express'
                              ? 'border-amber-500 bg-amber-500/10 text-white font-bold ring-1 ring-amber-500/30'
                              : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="flex items-center gap-1.5 text-xs text-amber-300">
                              <Zap className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isArabic ? 'توصيل سريع فوري' : 'Express Rush'}</span>
                            </span>
                            <span className="font-extrabold text-amber-300 text-xs">
                              ${pricing.selectedCityRate?.expressShippingUSD || 12}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400 block">
                            ⚡ {pricing.selectedCityRate?.expressDeliveryHours || '2-4 Hours'}
                          </span>
                        </button>

                        {/* Counter Pickup */}
                        <button
                          type="button"
                          onClick={() => setShippingSpeed('pickup')}
                          className={`p-2.5 rounded-xl border text-start cursor-pointer transition-all ${
                            shippingSpeed === 'pickup'
                              ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold ring-1 ring-emerald-500/30'
                              : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="flex items-center gap-1.5 text-xs text-emerald-300">
                              <Building className="w-3.5 h-3.5" />
                              <span>{isArabic ? 'استلام من الكاونتر' : 'Counter Pickup'}</span>
                            </span>
                            <span className="font-extrabold text-emerald-400 text-xs">FREE</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 block">
                            {isArabic ? 'جاهز خلال ساعة' : 'Ready in 1 Hour'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {shippingSpeed !== 'pickup' && (
                      <div className="mt-2">
                        <input
                          type="text"
                          required
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder={isArabic ? 'المنطقة، الحي، رقم الشارع، أقرب نقطة دالة' : 'District, Street Name, Nearest Landmark'}
                          className="w-full px-3 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 text-xs focus:outline-none focus:border-zinc-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Step 3: Promo Codes & Coupons */}
                  <div className="pt-3 border-t border-zinc-800">
                    <h4 className="font-bold text-white text-xs mb-2 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-indigo-400" />
                      <span>{isArabic ? '2. كوبونات وقسائم الخصم' : '2. Promo Coupons & Discounts'}</span>
                    </h4>

                    {appliedCoupon ? (
                      <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/80 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <span className="font-mono font-bold text-emerald-300 uppercase">
                              {appliedCoupon.code}
                            </span>
                            <span className="text-[10px] text-emerald-400/90 block">
                              {isArabic ? appliedCoupon.descriptionAr : appliedCoupon.description} (-${pricing.couponDiscountUSD})
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="text-[11px] font-bold text-red-400 hover:text-red-300 underline cursor-pointer"
                        >
                          {isArabic ? 'إلغاء الكوبون' : 'Remove'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            placeholder={isArabic ? 'أدخل كود الكوبون (مثل WELCOME10)' : 'Enter Coupon Code (e.g. WELCOME10)'}
                            className="flex-1 px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-white font-mono placeholder:text-zinc-500 text-xs focus:outline-none focus:border-indigo-500 uppercase"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCouponSubmit}
                            disabled={isApplyingCoupon || !couponInput.trim()}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                          >
                            {isApplyingCoupon ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : isArabic ? (
                              'تطبيق'
                            ) : (
                              'Apply'
                            )}
                          </button>
                        </div>

                        {couponError && (
                          <p className="text-[11px] text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{couponError}</span>
                          </p>
                        )}
                        {couponSuccessMsg && (
                          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>{couponSuccessMsg}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Step 4: 100% Upfront Digital Payment Method Selector */}
                  <div className="pt-3 border-t border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span>{isArabic ? '3. سداد القيمة 100% مقدماً (دفع إلكتروني آمن)' : '3. 100% Upfront Digital Payment'}</span>
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
                      <span className="font-bold text-white">{formatPrice(pricing.subtotalUSD)}</span>
                    </div>

                    {pricing.membershipDiscountUSD > 0 && (
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span className="flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isArabic ? `خصم العضوية (${pricing.membershipDiscountPercent}%):` : `Membership Discount (${pricing.membershipDiscountPercent}%):`}</span>
                        </span>
                        <span>-{formatPrice(pricing.membershipDiscountUSD)}</span>
                      </div>
                    )}

                    {pricing.couponDiscountUSD > 0 && (
                      <div className="flex justify-between text-amber-400 font-bold">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isArabic ? `كود الخصم (${appliedCoupon?.code}):` : `Promo Code (${appliedCoupon?.code}):`}</span>
                        </span>
                        <span>-{formatPrice(pricing.couponDiscountUSD)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-zinc-400">
                      <span>{isArabic ? `رسوم التوصيل (${selectedCity} - ${pricing.estimatedDelivery}):` : `Delivery Fee (${selectedCity} - ${pricing.estimatedDelivery}):`}</span>
                      <span className="font-bold text-emerald-400">
                        {pricing.finalShippingUSD === 0
                          ? isArabic
                            ? 'مجاناً (Prime / Threshold)'
                            : 'FREE (Prime/Free Threshold)'
                          : formatPrice(pricing.finalShippingUSD)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm sm:text-base font-extrabold text-white pt-2 border-t border-zinc-800">
                      <span>{isArabic ? 'المبلغ المستحق سداده (100%):' : 'Amount to Pay (100% Upfront):'}</span>
                      <span className="text-emerald-400">{formatPrice(pricing.totalUSD, pricing.totalIQD)}</span>
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
                            ? `سداد 100% مقدماً (${formatPrice(pricing.totalUSD, pricing.totalIQD)}) وتأكيد الطلب`
                            : `Pay 100% Upfront (${formatPrice(pricing.totalUSD, pricing.totalIQD)}) & Confirm`}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )
          ) : (
            /* Paid Orders Tab */
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="py-8 text-center text-zinc-400 text-xs">
                  {isArabic ? 'لا توجد طلبات سابقة مسجلة' : 'No previous orders found'}
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div>
                        <div className="font-extrabold text-white text-sm font-mono flex items-center gap-1.5">
                          <span>#{ord.orderNumber}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            100% PAID
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {ord.createdAt?.slice(0, 10) || 'Recent'} • {ord.deliveryAddress || ord.city || 'Standard Delivery'}
                        </div>
                      </div>

                      <div className="text-end">
                        <span className="font-extrabold text-white text-sm block">
                          {formatPrice(ord.totalUSD, ord.totalIQD)}
                        </span>
                        <span className="text-[10px] text-zinc-400 uppercase font-mono">
                          {ord.paymentMethod?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-zinc-300">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[11px]">
                          <span>
                            {item.quantity}x {item.partName} ({item.brand})
                          </span>
                          <span className="text-zinc-400 font-mono">
                            {formatPrice(item.unitPriceUSD * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {ord.couponCode && (
                      <div className="text-[10px] text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded">
                        <Tag className="w-3 h-3" />
                        <span>Promo Code: {ord.couponCode} (-${ord.couponDiscountUSD || 0})</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Escrow: Funds Secured</span>
                      </span>

                      {!ord.isRated && (
                        <button
                          onClick={() => {
                            setSelectedOrderForRating(ord);
                            setActiveModal('rate_dealer');
                          }}
                          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{isArabic ? 'تقييم الوكيل' : 'Rate Dealer'}</span>
                        </button>
                      )}
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
