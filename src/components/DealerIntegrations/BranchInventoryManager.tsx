/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Plus,
  Phone,
  Truck,
  CheckCircle2,
  Package,
  Store,
  Warehouse,
  Edit2,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { DealerBranch } from '../../types';

interface BranchInventoryManagerProps {
  supplierId: string;
  onClose?: () => void;
}

export const BranchInventoryManager: React.FC<BranchInventoryManagerProps> = ({
  supplierId,
  onClose,
}) => {
  const { dealerBranches, addOrUpdateDealerBranch, deleteDealerBranch, language } = useMarketplace();
  const isArabic = language === 'ar';

  const [isEditingModalOpen, setIsEditingModalOpen] = useState<boolean>(false);
  const [editingBranch, setEditingBranch] = useState<Partial<DealerBranch> | null>(null);

  const branches = dealerBranches.filter((b) => b.dealerId === supplierId);

  const handleOpenNewBranch = () => {
    setEditingBranch({
      dealerId: supplierId,
      branchName: '',
      branchNameAr: '',
      city: 'Erbil',
      address: '',
      phone: '+964 750 ',
      isWarehouse: true,
      isShowroom: true,
      offersPickup: true,
      offersLocalDelivery: true,
      avgDeliveryHours: 2,
    });
    setIsEditingModalOpen(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch || !editingBranch.branchName) return;

    addOrUpdateDealerBranch(editingBranch as any);
    setIsEditingModalOpen(false);
    setEditingBranch(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-neutral-900">
              {isArabic ? 'إدارة شبكة الفروع والمستودعات' : 'Multi-Branch & Warehouse Network'}
            </h3>
            <p className="text-xs text-neutral-500">
              {isArabic
                ? 'توزيع المخزون بحسب المحافظات (أربيل، بغداد، السليمانية، البصرة) لتحديد سرعة التوصيل واستلام المشترين.'
                : 'Manage geographical warehouse hubs and showrooms for local pickup and estimated delivery SLAs.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenNewBranch}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isArabic ? 'إضافة فرع / مستودع جديد' : 'Add New Branch'}</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors"
            >
              {isArabic ? 'العودة للوحة' : 'Back to Overview'}
            </button>
          )}
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((b) => (
          <div
            key={b.id}
            className="p-5 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-300 shadow-2xs space-y-3.5 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
                  {b.isWarehouse && b.isShowroom ? (
                    <Building2 className="w-5 h-5" />
                  ) : b.isWarehouse ? (
                    <Warehouse className="w-5 h-5" />
                  ) : (
                    <Store className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-neutral-900">{b.branchName}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                      {b.externalBranchCode || b.id}
                    </span>
                  </div>
                  {b.branchNameAr && (
                    <p className="text-xs text-neutral-500 mt-0.5" dir="rtl">{b.branchNameAr}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingBranch(b);
                    setIsEditingModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteDealerBranch(b.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-neutral-600 pt-2 border-t border-neutral-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                <span>{b.address} ({b.city})</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                <span>{b.phone}</span>
              </div>
            </div>

            {/* Badges & Fulfillment SLA */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold">
              {b.offersPickup && (
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Instant Counter Pickup
                </span>
              )}
              {b.offersLocalDelivery && (
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  Local Delivery ({b.avgDeliveryHours}h SLA)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Branch Modal */}
      {isEditingModalOpen && editingBranch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-neutral-200 shadow-2xl p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h3 className="font-black text-base text-neutral-900">
                {editingBranch.id ? 'Edit Branch Location' : 'Add New Branch Location'}
              </h3>
              <button
                onClick={() => setIsEditingModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Branch Name (English)</label>
                <input
                  type="text"
                  required
                  value={editingBranch.branchName || ''}
                  onChange={(e) => setEditingBranch({ ...editingBranch, branchName: e.target.value })}
                  placeholder="e.g. Baghdad Distribution Hub"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Branch Name (Arabic)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={editingBranch.branchNameAr || ''}
                  onChange={(e) => setEditingBranch({ ...editingBranch, branchNameAr: e.target.value })}
                  placeholder="مثال: مركز توزيع بغداد - السنك"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">City / Governorate</label>
                  <select
                    value={editingBranch.city || 'Erbil'}
                    onChange={(e) => setEditingBranch({ ...editingBranch, city: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium bg-white focus:outline-hidden focus:border-red-500"
                  >
                    <option value="Erbil">Erbil (أربيل)</option>
                    <option value="Baghdad">Baghdad (بغداد)</option>
                    <option value="Sulaymaniyah">Sulaymaniyah (السليمانية)</option>
                    <option value="Basra">Basra (البصرة)</option>
                    <option value="Duhok">Duhok (دهوك)</option>
                    <option value="Najaf">Najaf (النجف)</option>
                    <option value="Karbala">Karbala (كربلاء)</option>
                    <option value="Kirkuk">Kirkuk (كركوك)</option>
                    <option value="Mosul">Mosul (الموصل)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">External Branch Code</label>
                  <input
                    type="text"
                    value={editingBranch.externalBranchCode || ''}
                    onChange={(e) => setEditingBranch({ ...editingBranch, externalBranchCode: e.target.value })}
                    placeholder="e.g. WH-BGD-01"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-mono focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Full Street Address</label>
                <input
                  type="text"
                  required
                  value={editingBranch.address || ''}
                  onChange={(e) => setEditingBranch({ ...editingBranch, address: e.target.value })}
                  placeholder="e.g. Al-Sinak Commercial Hub, Warehouse #14"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingBranch.phone || ''}
                    onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
                    placeholder="+964 770 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-hidden focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Avg Local Delivery (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="48"
                    value={editingBranch.avgDeliveryHours || 2}
                    onChange={(e) => setEditingBranch({ ...editingBranch, avgDeliveryHours: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={editingBranch.offersPickup || false}
                    onChange={(e) => setEditingBranch({ ...editingBranch, offersPickup: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Allow Buyer Pickup</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={editingBranch.offersLocalDelivery || false}
                    onChange={(e) => setEditingBranch({ ...editingBranch, offersLocalDelivery: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Local Express Courier</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 font-bold hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-xs"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
