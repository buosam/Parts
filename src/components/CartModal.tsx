/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [activeTab, setActiveTab] = useState<'cart' | 'orders'>('cart');

  // Checkout form state
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'supplier_delivery'>('supplier_delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('Erbil, Gulan Street, Building 42');
  const [customerName, setCustomerName] = useState('Ahmed Al-Tikriti');
  const [customerPhone, setCustomerPhone] = useState('+964 770 551 2299');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'pay_at_pickup' | 'zain_cash'>('cash_on_delivery');
  const [orderCreatedSuccess, setOrderCreatedSuccess] = useState<string | null>(null);

  if (activeModal !== 'cart') return null;

  const subtotalUSD = cart.reduce((sum, item) => sum + item.offer.priceUSD * item.quantity, 0);
  const deliveryFeeUSD = deliveryMethod === 'supplier_delivery' ? (subtotalUSD > 100 ? 0 : 8) : 0;
  const totalUSD = subtotalUSD + deliveryFeeUSD;
  const totalIQD = Math.round(totalUSD * 1500);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const newOrd = createOrder({
      customerId: 'cust-1',
      customerName,
      customerPhone,
      deliveryMethod,
      deliveryAddress: deliveryMethod === 'supplier_delivery' ? deliveryAddress : 'Pickup from Dealer Counter',
      paymentMethod,
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

    setOrderCreatedSuccess(newOrd.orderNumber);
    setActiveTab('orders');
    setTimeout(() => {
      setOrderCreatedSuccess(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-white/15 flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base sm:text-lg">
                {isArabic ? 'سلة الطلبات وإدارة المشتريات' : 'Order Basket & Active Deliveries'}
              </h2>
              <p className="text-xs text-slate-400">
                {isArabic
                  ? 'الدفع عند الاستلام أو عند المحل، وتتبع التوصيل'
                  : 'Cash on delivery, warehouse pickup & order tracking'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 px-5 pt-2 gap-4 text-xs font-bold bg-white/[0.02]">
          <button
            onClick={() => setActiveTab('cart')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cart'
                ? 'border-indigo-500 text-indigo-400 font-black'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>{isArabic ? 'سلة المشتريات' : 'My Cart'}</span>
            <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded-full">
              {cart.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-indigo-500 text-indigo-400 font-black'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>{isArabic ? 'الطلبات السابقة والتتبع' : 'Active Orders & Tracking'}</span>
            <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded-full">
              {orders.length}
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {orderCreatedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 shadow-sm">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold block">
                  {isArabic ? `تم تأكيد طلبك بنجاح! رقم الطلب: #${orderCreatedSuccess}` : `Order placed successfully! PO #${orderCreatedSuccess}`}
                </span>
                <span className="text-[11px] text-emerald-200/80">
                  {isArabic ? 'تم إشعار المورد لتجهيز الشحنة والتوصيل.' : 'Dealer has been alerted to prepare your items for immediate dispatch.'}
                </span>
              </div>
            </div>
          )}

          {/* TAB 1: CART */}
          {activeTab === 'cart' && (
            <div>
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-sm">
                    {isArabic ? 'سلة المشتريات فارغة' : 'Your cart is empty'}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    {isArabic ? 'ابحث في الكتالوج المباشر وأضف القطع المتوافقة لتنفيذ الشراء.' : 'Browse the live catalog to add genuine parts with verified fitment.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cart Items List */}
                  <div className="space-y-2.5">
                    {cart.map((item) => (
                      <div
                        key={item.offer.id}
                        className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-indigo-300 text-[11px]">
                              {item.masterPart.partNumber}
                            </span>
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {item.offer.quality}
                            </span>
                          </div>
                          <h4 className="font-bold text-white truncate mt-0.5">
                            {item.masterPart.partName}
                          </h4>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>Supplier: <strong className="text-slate-200">{item.offer.supplierName}</strong></span>
                            <span>•</span>
                            <span>Qty: <strong className="text-white">{item.quantity}</strong></span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-black text-emerald-400 text-sm">
                            {formatPrice(item.offer.priceUSD * item.quantity, item.offer.priceIQD * item.quantity)}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.offer.id)}
                            className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center gap-1 mt-1 font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{isArabic ? 'حذف' : 'Remove'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout Form */}
                  <form onSubmit={handlePlaceOrder} className="pt-4 border-t border-white/10 space-y-4 text-xs">
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-indigo-400" />
                      <span>{isArabic ? 'بيانات التوصيل والاستلام' : 'Delivery & Recipient Details'}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">{isArabic ? 'اسم المستلم' : 'Recipient Name'}</label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">{isArabic ? 'رقم الهاتف' : 'Phone Number'}</label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">{isArabic ? 'طريقة الاستلام' : 'Delivery Method'}</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod('supplier_delivery')}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            deliveryMethod === 'supplier_delivery'
                              ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold'
                              : 'border-white/10 bg-white/[0.02] text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{isArabic ? 'توصيل كوريير للعنوان' : 'Express Courier Delivery'}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1">2-4 Hours in City</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeliveryMethod('pickup')}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            deliveryMethod === 'pickup'
                              ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold'
                              : 'border-white/10 bg-white/[0.02] text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{isArabic ? 'استلام من كاونتر المورد' : 'Warehouse Counter Pickup'}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1">Free & Instant</span>
                        </button>
                      </div>
                    </div>

                    {deliveryMethod === 'supplier_delivery' && (
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">{isArabic ? 'عنوان التوصيل' : 'Delivery Address'}</label>
                        <input
                          type="text"
                          required
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-hidden"
                        />
                      </div>
                    )}

                    {/* Pricing Summary */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                      <div className="flex justify-between text-slate-400">
                        <span>{isArabic ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                        <span className="font-bold text-white">{formatPrice(subtotalUSD)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{isArabic ? 'رسوم التوصيل:' : 'Delivery Fee:'}</span>
                        <span className="font-bold text-emerald-400">{deliveryFeeUSD === 0 ? 'FREE' : formatPrice(deliveryFeeUSD)}</span>
                      </div>
                      <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/10">
                        <span>{isArabic ? 'الإجمالي النهائي:' : 'Total Amount:'}</span>
                        <span className="text-emerald-400">{formatPrice(totalUSD, totalIQD)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/25 cursor-pointer"
                    >
                      {isArabic ? 'تأكيد الطلب وحجز المخزون (الدفع عند الاستلام)' : 'Place Order & Reserve Inventory (Cash on Delivery)'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  {isArabic ? 'لا توجد طلبات سابقة.' : 'No active or completed orders found.'}
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono font-bold text-indigo-300">{ord.orderNumber}</span>
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {ord.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {ord.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-slate-300">
                          <span>{item.partName} ({item.brand}) x{item.quantity}</span>
                          <span className="font-bold text-white">{formatPrice(item.unitPriceUSD * item.quantity, item.unitPriceIQD * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-slate-400">Total: <strong className="text-emerald-400">{formatPrice(ord.totalUSD, ord.totalIQD)}</strong></span>
                      <button
                        onClick={() => {
                          setSelectedOrderForRating(ord);
                          setActiveModal('rate_dealer');
                        }}
                        className="text-amber-300 hover:text-amber-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
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
