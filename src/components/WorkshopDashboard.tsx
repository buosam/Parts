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
        unitPriceIQD: offer?.priceIQD || 125000,
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-neutral-900 tracking-tight">
              {isArabic ? 'بوابة الورش والشراء الذكي' : 'Workshop Portal & Smart Procurement'}
            </h2>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              PRD Sections 17 & 18
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isArabic
              ? 'إدارة أوامر التصليح (RO)، تجميع السلة من عدة موردين، وحساب أفضل مسار للتوفير أو السرعة'
              : 'Multi-part smart aggregation, split/single supplier optimization & wholesale procurement'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="workshop-upload-quote-btn"
            onClick={() => setActiveModal('quote_upload')}
            className="px-3.5 py-2 rounded-xl border border-neutral-300 hover:border-neutral-400 text-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-colors bg-white"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>{isArabic ? 'استخراج فاتورة (AI)' : 'Upload Quote (AI)'}</span>
          </button>

          <button
            id="workshop-new-ro-btn"
            onClick={() => setIsCreatingRo(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{isArabic ? 'أمر تصليح جديد (RO)' : 'New Repair Order'}</span>
          </button>
        </div>
      </div>

      {/* New RO Modal / Form Drawer */}
      {isCreatingRo && (
        <div className="my-6 p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-blue-950 text-sm">Create New Repair Order (RO)</h3>
            <button
              onClick={() => setIsCreatingRo(false)}
              className="text-xs text-neutral-500 hover:text-neutral-800"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateROSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Client Name / Reference</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Tariq Al-Jubouri (Prado Service)"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Target Vehicle</label>
                <div className="px-3 py-2 border border-neutral-300 rounded-lg bg-white font-medium flex justify-between items-center">
                  <span>{activeVehicle ? `${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year}` : 'Select in header'}</span>
                  <button
                    type="button"
                    onClick={() => setActiveModal('vehicle_picker')}
                    className="text-blue-600 font-bold"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>

            {/* Add Part to RO */}
            <div className="p-3 bg-white rounded-xl border border-neutral-200 space-y-2">
              <span className="font-bold text-neutral-800 block">Add Required Parts for Job</span>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Part Name (e.g. Brake Disc)"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  className="flex-1 min-w-[140px] px-3 py-1.5 border border-neutral-300 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Part # (Optional)"
                  value={newPartNumber}
                  onChange={(e) => setNewPartNumber(e.target.value)}
                  className="w-36 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-mono"
                />
                <input
                  type="number"
                  min={1}
                  value={newQty}
                  onChange={(e) => setNewQty(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 border border-neutral-300 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddItemToForm}
                  className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg font-bold text-xs"
                >
                  Add Part
                </button>
              </div>

              {/* Items in form */}
              <div className="divide-y divide-neutral-100 pt-1">
                {itemsList.map((item, idx) => (
                  <div key={idx} className="py-1.5 flex justify-between items-center text-xs">
                    <span className="font-semibold text-neutral-800">
                      {item.partName} {item.partNumber && `(${item.partNumber})`} x{item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setItemsList(itemsList.filter((_, i) => i !== idx))}
                      className="text-red-600 font-bold text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
            >
              Save Repair Order & Calculate Smart Procurement
            </button>
          </form>
        </div>
      )}

      {/* Main Grid: RO List & Procurement Solver */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* RO Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">
            Active Repair Orders ({repairOrders.length})
          </div>

          {repairOrders.map((ro) => {
            const isSelected = ro.id === selectedRoId;

            return (
              <div
                key={ro.id}
                id={`ro-card-${ro.id}`}
                onClick={() => setSelectedRoId(ro.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-200">
                    {ro.orderNumber}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                    {ro.status}
                  </span>
                </div>

                <div className="font-bold text-neutral-900 text-sm mt-1">{ro.clientName}</div>

                <div className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
                  <Car className="w-3.5 h-3.5 text-neutral-400" />
                  <span>
                    {ro.vehicle.make} {ro.vehicle.model} ({ro.vehicle.year})
                  </span>
                </div>

                <div className="text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-100 flex justify-between">
                  <span>{ro.items.length} Required Parts</span>
                  <span>{ro.date}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected RO Procurement Engine */}
        <div className="lg:col-span-8">
          {selectedRo ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-neutral-100 px-2 py-0.5 rounded">
                      {selectedRo.orderNumber}
                    </span>
                    <span className="text-xs text-neutral-400">Date: {selectedRo.date}</span>
                  </div>
                  <h3 className="text-lg font-black text-neutral-900 mt-1">
                    {selectedRo.clientName}
                  </h3>
                  <div className="text-xs text-neutral-600 mt-0.5">
                    Vehicle:{' '}
                    <strong className="text-neutral-900">
                      {selectedRo.vehicle.make} {selectedRo.vehicle.model} {selectedRo.vehicle.year} ({selectedRo.vehicle.engine})
                    </strong>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    All Fitments Verified
                  </span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div>
                <h4 className="font-bold text-neutral-900 text-sm mb-2.5">
                  Parts Required for this Repair Job ({selectedRo.items.length})
                </h4>
                <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-200 text-xs">
                  {selectedRo.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-neutral-50/50 flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-neutral-900">{item.partName}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          Ref: {item.partNumber || 'Auto-matched'} • Spec: {item.preferredQuality}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold bg-white px-2 py-1 rounded border border-neutral-200">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Procurement Strategies (PRD Section 18) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-neutral-900 text-sm">
                      Smart Procurement Optimization Engine
                    </h4>
                  </div>
                  <span className="text-xs text-neutral-400">Select Procurement Strategy</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Strategy 1: Lowest Total Price */}
                  <div
                    onClick={() => setProcurementStrategy('lowest_cost')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      procurementStrategy === 'lowest_cost'
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="font-bold text-emerald-900 text-xs mb-1">
                      Option A: Lowest Total Cost
                    </div>
                    <div className="text-base font-black text-neutral-900">$238 USD</div>
                    <p className="text-[11px] text-neutral-600 mt-1">
                      Splits order between ABC Genuine Parts + Al-Rafidain OEM. Saves $45.
                    </p>
                    <div className="mt-2 text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded inline-block">
                      Max Margin Savings
                    </div>
                  </div>

                  {/* Strategy 2: Single Supplier */}
                  <div
                    onClick={() => setProcurementStrategy('single_supplier')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      procurementStrategy === 'single_supplier'
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="font-bold text-blue-900 text-xs mb-1">
                      Option B: Single Supplier
                    </div>
                    <div className="text-base font-black text-neutral-900">$265 USD</div>
                    <p className="text-[11px] text-neutral-600 mt-1">
                      All parts bundled from ABC Genuine Parts. Single invoice, 1 delivery box.
                    </p>
                    <div className="mt-2 text-[10px] font-semibold text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded inline-block">
                      Simplified Logistics
                    </div>
                  </div>

                  {/* Strategy 3: Fastest Arrival */}
                  <div
                    onClick={() => setProcurementStrategy('fastest')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      procurementStrategy === 'fastest'
                        ? 'border-amber-600 bg-amber-50/60 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="font-bold text-amber-900 text-xs mb-1">
                      Option C: Fastest Delivery
                    </div>
                    <div className="text-base font-black text-neutral-900">$255 USD</div>
                    <p className="text-[11px] text-neutral-600 mt-1">
                      Immediate courier dispatch within 90 minutes to workshop bay.
                    </p>
                    <div className="mt-2 text-[10px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded inline-block">
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
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <span>
                    {procurementSuccess
                      ? 'Dispatched to Wholesale Checkout!'
                      : 'Procure All Parts for Repair Order (1-Click PO)'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 text-neutral-500 text-xs">
              Select or create a repair order to run smart procurement optimization.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
