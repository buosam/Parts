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
  const totalIQD = Math.round(totalUSD * 1320);

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
        unitPriceIQD: c.offer.priceIQD,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-neutral-200 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900 text-base">
                {isArabic ? 'سلة الطلبات وإدارة العمليات' : 'Order Basket & Active Deliveries'}
              </h2>
              <p className="text-xs text-neutral-500">
                {isArabic
                  ? 'الدفع عند الاستلام أو عند المحل، وتتبع التوصيل'
                  : 'Cash on delivery, warehouse pickup & order tracking'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-lg hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-neutral-200 px-5 pt-2 gap-4 text-xs font-bold bg-white">
          <button
            onClick={() => setActiveTab('cart')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'cart'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <span>{isArabic ? 'سلة المشتريات' : 'My Cart'}</span>
            <span className="bg-neutral-100 text-neutral-800 text-[10px] px-2 py-0.5 rounded-full">
              {cart.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <span>{isArabic ? 'طلباتي السابقة والحالية' : 'Active Orders'}</span>
            <span className="bg-neutral-100 text-neutral-800 text-[10px] px-2 py-0.5 rounded-full">
              {orders.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {orderCreatedSuccess && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">
                  Order #{orderCreatedSuccess} Confirmed!
                </span>
                The supplier has received your order and is packing it for dispatch.
              </div>
            </div>
          )}

          {/* TAB 1: Cart Checkout */}
          {activeTab === 'cart' && (
            <div>
              {cart.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500 space-y-2">
                  <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto" />
                  <p className="font-bold text-neutral-700">Your basket is currently empty.</p>
                  <p>Browse the master catalogue or compare supplier offers to add parts.</p>
                </div>
              ) : (
                <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
                  {/* Cart Items List */}
                  <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-200 overflow-hidden">
                    {cart.map((item) => (
                      <div key={item.offer.id} className="p-3 bg-white flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold bg-neutral-100 px-1.5 py-0.5 rounded">
                              {item.masterPart.partNumber}
                            </span>
                            <span className="font-bold text-neutral-900">{item.masterPart.partName}</span>
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            Supplier:{' '}
                            <strong className="text-neutral-800">{item.offer.supplierName}</strong> •{' '}
                            <span className="capitalize font-semibold text-emerald-800">
                              {item.offer.quality}
                            </span>{' '}
                            ({item.offer.brand})
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            Qty: {item.quantity} • Unit: ${item.offer.priceUSD}
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-3">
                          <div>
                            <div className="font-black text-neutral-900 text-sm">
                              ${item.offer.priceUSD * item.quantity}
                            </div>
                            <div className="text-[10px] text-neutral-400">
                              {(item.offer.priceIQD * item.quantity).toLocaleString()} IQD
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.offer.id)}
                            className="text-neutral-400 hover:text-red-600 p-1 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Mode Choice (PRD Section 29) */}
                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">
                      Fulfillment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('supplier_delivery')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          deliveryMethod === 'supplier_delivery'
                            ? 'border-emerald-600 bg-emerald-50/60 font-bold text-emerald-900'
                            : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Truck className="w-3.5 h-3.5" />
                          <span>Supplier Delivery</span>
                        </div>
                        <span className="text-[10px] font-normal text-neutral-500 block">
                          Delivered to your address (2-3 hours)
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('pickup')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          deliveryMethod === 'pickup'
                            ? 'border-emerald-600 bg-emerald-50/60 font-bold text-emerald-900'
                            : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Building className="w-3.5 h-3.5" />
                          <span>Self Pickup (Free)</span>
                        </div>
                        <span className="text-[10px] font-normal text-neutral-500 block">
                          Pickup at dealer warehouse counter
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Address field if delivery */}
                  {deliveryMethod === 'supplier_delivery' && (
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        Delivery Address in Iraq
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="City, Street, Building / Workshop Name"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      />
                    </div>
                  )}

                  {/* Customer Contact */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">Customer Name</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">Phone (for courier)</label>
                      <input
                        type="text"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Payment Method (PRD Section 30) */}
                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">
                      Payment Terms
                    </label>
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-emerald-700" />
                        <div>
                          <div className="font-bold text-neutral-900">
                            Cash on Delivery / Pay at Counter
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            Pay in USD or IQD when you receive & inspect the parts
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                        Standard in Iraq
                      </span>
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="p-3.5 bg-neutral-100 rounded-xl space-y-1.5">
                    <div className="flex justify-between text-neutral-600">
                      <span>Subtotal:</span>
                      <span className="font-bold">${subtotalUSD}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Delivery Fee:</span>
                      <span>{deliveryFeeUSD === 0 ? 'Free' : `$${deliveryFeeUSD}`}</span>
                    </div>
                    <div className="flex justify-between text-neutral-900 text-sm font-black pt-1 border-t border-neutral-200">
                      <span>Total Amount:</span>
                      <div className="text-right">
                        <div>${totalUSD} USD</div>
                        <div className="text-[10px] text-neutral-500 font-normal">
                          ≈ {totalIQD.toLocaleString()} IQD
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="place-order-submit-btn"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>{isArabic ? 'تأكيد وإرسال الطلب للمورد' : 'Confirm Order with Dealer'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: Active Orders List & Rating */}
          {activeTab === 'orders' && (
            <div className="space-y-3 text-xs">
              {orders.map((ord) => {
                const isDelivered = ord.status === 'delivered';

                return (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl border border-neutral-200 bg-white space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-neutral-900 text-sm">
                          {ord.orderNumber}
                        </span>
                        <span className="text-neutral-400 ml-2">
                          ({ord.createdAt.split('T')[0]})
                        </span>
                      </div>

                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-900'
                            : ord.status === 'out_for_delivery'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-neutral-600">
                      <div>
                        Dealer:{' '}
                        <strong className="text-neutral-900">{ord.supplierName}</strong>
                      </div>
                      <div>Vehicle: {ord.vehicleInfo}</div>
                      <div>
                        Items: {ord.items.map((i) => `${i.partName} (${i.brand}) x${i.quantity}`).join(', ')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                      <div>
                        <span className="font-black text-neutral-900 text-sm">
                          ${ord.totalUSD} USD
                        </span>
                        <span className="text-[10px] text-neutral-400 block">
                          {ord.totalIQD.toLocaleString()} IQD (COD)
                        </span>
                      </div>

                      {/* Rate Dealer Button (PRD Section 31) */}
                      {isDelivered && !ord.isRated && (
                        <button
                          onClick={() => {
                            setSelectedOrderForRating(ord);
                            setActiveModal('rate_dealer');
                          }}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>Rate Dealer & Parts</span>
                        </button>
                      )}

                      {ord.isRated && (
                        <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Review Submitted
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
