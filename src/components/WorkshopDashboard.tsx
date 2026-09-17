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
  CheckCircle2,
  Truck,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Building,
  Layers,
  Zap,
  Clock,
  ChevronRight,
  User,
  Check,
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

  const [procurementStrategy, setProcurementStrategy] = useState<'best_price' | 'fastest_delivery' | 'best_match'>('best_price');
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

  const roStatuses = [
    { id: 'diagnostic', label: isArabic ? 'الفحص' : 'Diagnostic' },
    { id: 'parts_needed', label: isArabic ? 'طلب القطع' : 'Parts Needed' },
    { id: 'parts_ordered', label: isArabic ? 'تم الشراء' : 'Parts Ordered' },
    { id: 'in_repair', label: isArabic ? 'قيد الصيانة' : 'In Repair' },
    { id: 'qc', label: isArabic ? 'فحص الجودة' : 'QC' },
    { id: 'ready', label: isArabic ? 'جاهز للتسليم' : 'Ready' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Top Banner */}
      <div className="bg-[#0e1424] rounded-3xl border border-white/10 p-6 sm:p-8 mb-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/30 shrink-0">
              <Wrench className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {isArabic ? 'بوابة الورش والشراء الذكي' : 'Workshop Portal & Part Procurement'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isArabic
                  ? 'إدارة أوامر الصيانة وتأمين قطع الغيار المتعددة من أفضل الموردين بضغطة زر واحدة.'
                  : 'Manage repair jobs and multi-part batch procurement with automatic supplier routing.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreatingRo(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>{isArabic ? 'أمر صيانة جديد' : 'New Repair Job'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Repair Jobs List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              {isArabic ? 'أوامر الصيانة الحالية' : 'Active Repair Jobs'} ({repairOrders.length})
            </span>
          </div>

          {repairOrders.map((ro) => {
            const isSelected = ro.id === selectedRoId;
            return (
              <div
                key={ro.id}
                onClick={() => setSelectedRoId(ro.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-[#121a30] shadow-md ring-1 ring-indigo-500/50'
                    : 'border-white/10 bg-[#0e1424] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-indigo-300 bg-black/40 px-2 py-0.5 rounded">
                    #{ro.roNumber}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {ro.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white">
                  {ro.vehicle.make} {ro.vehicle.model} ({ro.vehicle.year})
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{ro.clientName || 'Private Client'}</p>

                <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span>{ro.items.length} {isArabic ? 'قطع مطلوبة' : 'parts required'}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isArabic ? 'مطابقة للمركبة' : 'Fit Checked'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Repair Job Detail & Smart Procurement */}
        <div className="lg:col-span-7">
          {selectedRo ? (
            <div className="bg-[#0e1424] rounded-3xl border border-white/10 p-6 shadow-xl space-y-6">
              {/* Job Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
                <div>
                  <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                    #{selectedRo.roNumber}
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">
                    {selectedRo.vehicle.make} {selectedRo.vehicle.model} ({selectedRo.vehicle.year})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isArabic ? 'العميل:' : 'Customer:'} {selectedRo.clientName}
                  </p>
                </div>

                {/* Status Indicator */}
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 self-start">
                  {isArabic ? 'قطع جاهزة للتأمين' : 'Parts Procurement Ready'}
                </span>
              </div>

              {/* Status Pipeline (Section 18) */}
              <div className="p-3 bg-black/30 rounded-2xl border border-white/5 flex items-center justify-between text-[11px] font-bold overflow-x-auto gap-2">
                {roStatuses.map((st, idx) => {
                  const isCurrent = idx <= 1;
                  return (
                    <div key={st.id} className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-indigo-400' : 'bg-white/20'}`} />
                      <span className={isCurrent ? 'text-white' : 'text-slate-500'}>{st.label}</span>
                      {idx < roStatuses.length - 1 && <ChevronRight className="w-3 h-3 text-slate-600" />}
                    </div>
                  );
                })}
              </div>

              {/* Parts Required Table (Section 19) */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  {isArabic ? 'قائمة القطع المطلوبة للصيانة' : 'Required Parts List'} ({selectedRo.items.length})
                </h4>
                <div className="space-y-2">
                  {selectedRo.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{item.partName}</p>
                        {item.partNumber && (
                          <p className="text-[11px] font-mono text-indigo-300">OEM: {item.partNumber}</p>
                        )}
                      </div>
                      <div className="text-right rtl:text-left">
                        <span className="font-bold text-slate-300">{item.quantity} {isArabic ? 'قطع' : 'qty'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Procurement Box (Section 19) */}
              <div className="p-5 bg-black/30 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      {isArabic ? 'البحث الذكي والشراء المتعدد' : 'Smart Multi-Supplier Batch Search'}
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'best_price', label: isArabic ? 'أفضل سعر' : 'Best Price' },
                    { id: 'fastest_delivery', label: isArabic ? 'أسرع توصيل' : 'Fastest Delivery' },
                    { id: 'best_match', label: isArabic ? 'أعلى تطابق' : 'Best Match' },
                  ].map((strat) => (
                    <button
                      key={strat.id}
                      onClick={() => setProcurementStrategy(strat.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] ${
                        procurementStrategy === strat.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-black/40 text-slate-400 hover:text-white'
                      }`}
                    >
                      {strat.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleExecuteSmartProcurement}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isArabic ? 'تأمين جميع القطع من أفضل الموردين' : 'Find & Order All Parts Automatically'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#0e1424] rounded-3xl border border-white/10 p-12 text-center text-slate-400 text-xs">
              {isArabic ? 'اختر أمر صيانة من القائمة.' : 'Select a repair job to inspect.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
