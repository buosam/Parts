/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Wrench,
  Car,
  FileText,
  Plus,
  CheckCircle,
  Truck,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Building,
  Layers,
  Zap,
  Clock,
  Coins,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { RepairOrder } from '../types';

export const WorkshopDashboard: React.FC = () => {
  const {
    repairOrders,
    createRepairOrder,
    activeVehicle,
    masterParts,
    createOrder,
    setActiveModal,
    formatPrice,
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [selectedRoId, setSelectedRoId] = useState<string | null>(
    repairOrders[0]?.id || null
  );

  // New RO form state
  const [isCreatingRo, setIsCreatingRo] = useState(false);
  const [clientName, setClientName] = useState('');
  const [newPartName, setNewPartName] = useState('');
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [itemsList, setItemsList] = useState<
    { partName: string; partNumber?: string; quantity: number; preferredQuality: string }[]
  >([
    { partName: 'Front Brake Pad Set', partNumber: '04465-60290', quantity: 1, preferredQuality: 'genuine' },
    { partName: 'Engine Oil Filter', partNumber: '04152-YZZA1', quantity: 1, preferredQuality: 'genuine' },
  ]);

  const [procurementStrategy, setProcurementStrategy] = useState<'lowest_cost' | 'single_supplier' | 'fastest'>('lowest_cost');
  const [procurementSuccess, setProcurementSuccess] = useState(false);

  const selectedRo = repairOrders.find((ro) => ro.id === selectedRoId);

  const handleAddItemToForm = () => {
    if (!newPartName.trim()) return;
    setItemsList([
      ...itemsList,
      {
        partName: newPartName.trim(),
        partNumber: newPartNumber.trim() || undefined,
        quantity: Number(newQty),
        preferredQuality: 'genuine',
      },
    ]);
    setNewPartName('');
    setNewPartNumber('');
    setNewQty(1);
  };

  const handleCreateROSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehicle || itemsList.length === 0) return;

    const created = createRepairOrder({
      workshopName: 'Al-Mansour Automotive Care (Certified Workshop)',
      vehicle: activeVehicle,
      clientName: clientName || 'Client Vehicle Repair',
      items: itemsList as any,
    });

    setIsCreatingRo(false);
    setSelectedRoId(created.id);
  };

  const handleExecuteSmartProcurement = () => {
    if (!selectedRo) return;

    // Resolve each item to a master part offer
    const orderedItems = selectedRo.items.map((item) => {
      const matchedMaster = masterParts.find(
        (mp) =>
          (item.partNumber && mp.partNumber === item.partNumber) ||
          mp.partName.toLowerCase().includes(item.partName.toLowerCase())
      );
      const offer = matchedMaster?.offers[0];

      return {
        masterPartId: matchedMaster?.id || 'ro-part',
        partName: item.partName,
        partNumber: item.partNumber || 'OEM-REF',
        brand: offer?.brand || 'Genuine OEM',
        quality: (offer?.quality as any) || 'genuine',
        quantity: item.quantity,
        unitPriceUSD: offer?.priceUSD || 95,
        unitPriceIQD: offer?.priceIQD || 142500,
        supplierId: offer?.supplierId || 'sup-1',
        supplierName: offer?.supplierName || 'ABC Genuine Parts',
      };
    });

    const totalUSD = orderedItems.reduce((s, i) => s + i.unitPriceUSD * i.quantity, 0);
    const totalIQD = orderedItems.reduce((s, i) => s + i.unitPriceIQD * i.quantity, 0);

    createOrder({
      customerId: 'workshop-user-1',
      customerName: selectedRo.workshopName,
      customerPhone: '+964 770 992 1100',
      vehicleInfo: `${selectedRo.vehicle.make} ${selectedRo.vehicle.model} ${selectedRo.vehicle.year}`,
      items: orderedItems,
      totalUSD,
      totalIQD,
      deliveryMethod: 'supplier_delivery',
      deliveryAddress: 'Al-Mansour Automotive Care, Workshop Bay 4, Erbil Industrial Zone',
      supplierName: orderedItems[0]?.supplierName,
      supplierId: orderedItems[0]?.supplierId,
    });

    setProcurementSuccess(true);
    setTimeout(() => {
      setProcurementSuccess(false);
      setActiveModal('cart');
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Wrench className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isArabic ? 'بوابة الورش والشراء الذكي' : 'Workshop Portal & Smart Procurement'}
            </h2>
            <span className="text-xs font-bold text-blue-300 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              B2B Certified
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic
              ? 'إدارة أوامر التصليح (RO)، تجميع السلة من عدة موردين، وحساب أفضل مسار للتوفير أو السرعة'
              : 'Multi-part smart aggregation, split/single supplier optimization & wholesale procurement'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="workshop-upload-quote-btn"
            onClick={() => setActiveModal('quote_upload')}
            className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors bg-white/[0.04] hover:bg-white/[0.08] cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>{isArabic ? 'استخراج تسعيرة (AI)' : 'Scan Quote (AI)'}</span>
          </button>

          <button
            id="workshop-new-ro-btn"
            onClick={() => setIsCreatingRo(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isArabic ? 'أمر تصليح جديد (RO)' : 'New Repair Order'}</span>
          </button>
        </div>
      </div>

      {/* New RO Modal / Form Drawer */}
      {isCreatingRo && (
        <div className="my-6 p-6 rounded-3xl glass-panel border border-blue-500/30 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-400" />
              <span>{isArabic ? 'إنشاء أمر تصليح جديد' : 'Create New Repair Order (RO)'}</span>
            </h3>
            <button
              onClick={() => setIsCreatingRo(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer px-2 py-1 rounded bg-white/[0.05]"
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </button>
          </div>

          <form onSubmit={handleCreateROSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">{isArabic ? 'اسم العميل / المرجع' : 'Client Name / Reference'}</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Tariq Al-Jubouri (Prado Service)"
                  className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl bg-white/[0.04] text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">{isArabic ? 'المركبة المستهدفة' : 'Target Vehicle'}</label>
                <div className="px-3.5 py-2.5 border border-white/10 rounded-xl bg-white/[0.04] font-medium flex justify-between items-center text-white">
                  <span>{activeVehicle ? `${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year}` : 'Select in header'}</span>
                  <button
                    type="button"
                    onClick={() => setActiveModal('vehicle_picker')}
                    className="text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
                  >
                    {isArabic ? 'تغيير' : 'Change'}
                  </button>
                </div>
              </div>
            </div>

            {/* Add Part to RO */}
            <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/10 space-y-3">
              <span className="font-bold text-slate-200 block">{isArabic ? 'إضافة قطع الغيار المطلوبة للعمل' : 'Add Required Parts for Job'}</span>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder={isArabic ? 'اسم القطعة (مثل سفايف أمامية)' : 'Part Name (e.g. Brake Disc)'}
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  className="flex-1 min-w-[140px] px-3.5 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="OEM Part #"
                  value={newPartNumber}
                  onChange={(e) => setNewPartNumber(e.target.value)}
                  className="w-36 px-3.5 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white text-xs font-mono placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  min={1}
                  value={newQty}
                  onChange={(e) => setNewQty(Number(e.target.value))}
                  className="w-16 px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white text-xs text-center focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddItemToForm}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm"
                >
                  {isArabic ? 'إضافة' : 'Add Part'}
                </button>
              </div>

              {/* Items in form */}
              <div className="divide-y divide-white/5 pt-1">
                {itemsList.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">
                      {item.partName} {item.partNumber && <span className="font-mono text-indigo-300">({item.partNumber})</span>} x{item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setItemsList(itemsList.filter((_, i) => i !== idx))}
                      className="text-rose-400 hover:text-rose-300 font-bold text-[11px] cursor-pointer"
                    >
                      {isArabic ? 'حذف' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-blue-600/20"
            >
              {isArabic ? 'حفظ أمر التصليح وتشغيل خوارزمية التوريد الذكي' : 'Save Repair Order & Run Smart Procurement Solver'}
            </button>
          </form>
        </div>
      )}

      {/* Main Grid: RO List & Procurement Solver */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* RO Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            {isArabic ? 'أوامر التصليح النشطة' : 'Active Repair Orders'} ({repairOrders.length})
          </div>

          {repairOrders.map((ro) => {
            const isSelected = ro.id === selectedRoId;

            return (
              <div
                key={ro.id}
                id={`ro-card-${ro.id}`}
                onClick={() => setSelectedRoId(ro.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500/80 bg-slate-900/90 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/40'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                    {ro.orderNumber}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {ro.status}
                  </span>
                </div>

                <div className="font-extrabold text-white text-sm mt-1">{ro.clientName}</div>

                <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <Car className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {ro.vehicle.make} {ro.vehicle.model} ({ro.vehicle.year})
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-white/5 flex justify-between">
                  <span>{ro.items.length} {isArabic ? 'قطع مطلوبة' : 'Required Parts'}</span>
                  <span>{ro.date}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected RO Procurement Engine */}
        <div className="lg:col-span-8">
          {selectedRo ? (
            <div className="glass-panel rounded-3xl border border-white/10 p-6 shadow-2xl space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-white/[0.05] px-2.5 py-1 rounded-lg border border-white/10 text-blue-300">
                      {selectedRo.orderNumber}
                    </span>
                    <span className="text-xs text-slate-400">Date: {selectedRo.date}</span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1.5">
                    {selectedRo.clientName}
                  </h3>
                  <div className="text-xs text-slate-300 mt-1">
                    {isArabic ? 'المركبة:' : 'Vehicle:'}{' '}
                    <strong className="text-white">
                      {selectedRo.vehicle.make} {selectedRo.vehicle.model} {selectedRo.vehicle.year} ({selectedRo.vehicle.engine})
                    </strong>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isArabic ? 'توافق القطع موثق 100%' : 'All Fitments Verified'}</span>
                  </span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div>
                <h4 className="font-bold text-white text-sm mb-3">
                  {isArabic ? 'القطع المطلوبة لأمر التصليح' : 'Parts Required for this Repair Job'} ({selectedRo.items.length})
                </h4>
                <div className="border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5 text-xs bg-white/[0.02]">
                  {selectedRo.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-white">{item.partName}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Ref: <span className="text-indigo-300">{item.partNumber || 'Auto-matched'}</span> • Spec: {item.preferredQuality}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold bg-white/[0.05] px-2.5 py-1 rounded-lg border border-white/10 text-slate-200">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Procurement Strategies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <h4 className="font-bold text-white text-sm">
                      {isArabic ? 'محرك التوريد وحساب أفضل مسار للشراء' : 'Smart Procurement Optimization Engine'}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400">{isArabic ? 'اختر الإستراتيجية' : 'Select Strategy'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Strategy 1: Lowest Total Price */}
                  <div
                    onClick={() => setProcurementStrategy('lowest_cost')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      procurementStrategy === 'lowest_cost'
                        ? 'border-emerald-500/80 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="font-bold text-emerald-300 text-xs mb-1">
                      {isArabic ? 'الخيار أ: أقل تكلفة إجمالية' : 'Option A: Lowest Total Cost'}
                    </div>
                    <div className="text-lg font-black text-emerald-400">{formatPrice(238)}</div>
                    <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                      {isArabic
                        ? 'تقسيم الطلب بين ABC Genuine + الرافدين. يوفر $45.'
                        : 'Splits order between ABC Genuine Parts + Al-Rafidain OEM. Saves $45.'}
                    </p>
                    <div className="mt-2 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md inline-block border border-emerald-500/30">
                      Max Margin Savings
                    </div>
                  </div>

                  {/* Strategy 2: Single Supplier */}
                  <div
                    onClick={() => setProcurementStrategy('single_supplier')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      procurementStrategy === 'single_supplier'
                        ? 'border-blue-500/80 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="font-bold text-blue-300 text-xs mb-1">
                      {isArabic ? 'الخيار ب: مورد واحد مجمع' : 'Option B: Single Supplier'}
                    </div>
                    <div className="text-lg font-black text-blue-400">{formatPrice(265)}</div>
                    <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                      {isArabic
                        ? 'تجميع الشحنة من ABC Genuine. فاتورة واحدة وشحنة واحدة.'
                        : 'All parts bundled from ABC Genuine Parts. Single invoice, 1 box.'}
                    </p>
                    <div className="mt-2 text-[10px] font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-md inline-block border border-blue-500/30">
                      Simplified Logistics
                    </div>
                  </div>

                  {/* Strategy 3: Fastest Arrival */}
                  <div
                    onClick={() => setProcurementStrategy('fastest')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      procurementStrategy === 'fastest'
                        ? 'border-amber-500/80 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="font-bold text-amber-300 text-xs mb-1">
                      {isArabic ? 'الخيار ج: التوصيل الأسرع' : 'Option C: Fastest Delivery'}
                    </div>
                    <div className="text-lg font-black text-amber-400">{formatPrice(255)}</div>
                    <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                      {isArabic
                        ? 'توصيل كوريير فوري خلال 90 دقيقة مباشرة لكراج الصيانة.'
                        : 'Immediate courier dispatch within 90 minutes directly to bay.'}
                    </p>
                    <div className="mt-2 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md inline-block border border-amber-500/30">
                      Rapid Bay Turnaround
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  id="execute-smart-procurement-btn"
                  onClick={handleExecuteSmartProcurement}
                  disabled={procurementSuccess}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {procurementSuccess
                      ? (isArabic ? 'تم التحويل إلى صفحة الدفع وتأكيد الطلب!' : 'Dispatched to Wholesale Checkout!')
                      : (isArabic ? 'شراء كافة قطع أمر التصليح بنقرة واحدة (1-Click PO)' : 'Procure All Parts for Repair Order (1-Click PO)')}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl border border-white/10 p-12 text-center text-slate-400 text-xs">
              {isArabic ? 'اختر أمر تصليح من القائمة لتشغيل محرك التوريد الذكي.' : 'Select or create a repair order to run smart procurement optimization.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
