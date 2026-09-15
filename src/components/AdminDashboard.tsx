/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Users,
  Layers,
  Search,
  CheckCircle,
  Plus,
  BarChart3,
  Flame,
  ArrowUpRight,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const AdminDashboard: React.FC = () => {
  const {
    masterParts,
    suppliers,
    updateSupplierVerification,
    demandIntelligence,
    disputes,
    addMasterPart,
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [activeTab, setActiveTab] = useState<'demand' | 'suppliers' | 'catalogue' | 'disputes'>('demand');

  // New Master Part state
  const [showAddPart, setShowAddPart] = useState(false);
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newPartName, setNewPartName] = useState('');
  const [newCategory, setNewCategory] = useState('Engine');
  const [newBrand, setNewBrand] = useState('Toyota Genuine');

  const handleCreateMasterPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartNumber || !newPartName) return;

    addMasterPart({
      partNumber: newPartNumber,
      partName: newPartName,
      brand: newBrand,
      manufacturer: newBrand,
      category: newCategory,
      description: `Official master part record for ${newPartName}. Verified fitment.`,
      specifications: { 'Part Number': newPartNumber, 'Verification Status': 'Platform Certified' },
      imageUrl: 'https://images.unsplash.com/photo-1558441719-8b489c63f7d1?auto=format&fit=crop&w=600&q=80',
      compatibleVehicles: [
        {
          make: 'Toyota',
          model: 'Prado',
          yearStart: 2018,
          yearEnd: 2024,
          engine: '4.0L V6',
        },
      ],
      offers: [],
    });

    setShowAddPart(false);
    setNewPartNumber('');
    setNewPartName('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-xl font-black text-neutral-900 tracking-tight">
              {isArabic ? 'لوحة تحكم إدارة المنصة' : 'Marketplace Admin & Intelligence Suite'}
            </h2>
            <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
              PRD Sections 20 & 21
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isArabic
              ? 'إدارة الكتالوج المركزي، نظام ذكاء الطلب (Demand Intelligence)، توثيق الموردين، وفض النزاعات'
              : 'Master catalogue normalization, demand intelligence, supplier verification & disputes'}
          </p>
        </div>

        {/* Quick stat counters */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl">
            <span className="text-neutral-400 block text-[10px]">Master Parts</span>
            <span className="font-bold text-neutral-900">{masterParts.length} Active</span>
          </div>
          <div className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl">
            <span className="text-neutral-400 block text-[10px]">Dealers</span>
            <span className="font-bold text-neutral-900">{suppliers.length} Verified</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 mt-6 mb-6 gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('demand')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'demand'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Demand Intelligence (PRD Section 21)</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'suppliers'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Supplier Verification Levels</span>
        </button>

        <button
          onClick={() => setActiveTab('catalogue')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'catalogue'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Master Parts Database</span>
        </button>
      </div>

      {/* TAB 1: Demand Intelligence System (PRD Section 21) */}
      {activeTab === 'demand' && (
        <div className="space-y-6">
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 flex items-start gap-3">
            <Flame className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Automated Regional Demand Intelligence</div>
              <div className="text-amber-800 mt-0.5">
                Tracks zero-result search queries, workshop procurement shortages, and seasonal replacement spikes in Erbil, Baghdad, and Basra.
                Dealers receive stock advisories to import these high-margin parts.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demandIntelligence.map((item, idx) => {
              const trend = item.trend || (item.opportunityLevel === 'HIGH SUPPLY SHORTAGE' ? 'surging' : item.opportunityLevel === 'MODERATE' ? 'high' : 'stable');
              const partNum = item.partNumber || item.searchTerm;
              const partTitle = item.partName || item.searchTerm;
              const weeklySearches = item.searchVolumeWeekly ?? Math.round((item.searchVolume30d || 1000) / 4);
              const unmetCount = item.unmetRequestsCount ?? Math.round(weeklySearches * 0.25);
              const targetRegion = item.region || item.topDemandedCity || 'Regional';
              const suppliersCount = item.activeSuppliersCount ?? item.availableSuppliersCount ?? 2;

              return (
                <div
                  key={item.id || item.partNumber || item.searchTerm || idx}
                  className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs space-y-3 flex flex-col justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-neutral-500">
                        {partNum}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          trend === 'surging'
                            ? 'bg-red-100 text-red-900'
                            : trend === 'high'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {String(trend).toUpperCase()} DEMAND
                      </span>
                    </div>

                    <h4 className="font-bold text-neutral-900 text-sm mt-1">{partTitle}</h4>
                    <div className="text-neutral-500 font-medium">Vehicle: {item.targetVehicle}</div>

                    <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Weekly Searches</span>
                        <span className="font-black text-neutral-900 text-sm">
                          {weeklySearches}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Unfulfilled Searches</span>
                        <span className="font-black text-red-700 text-sm">
                          {unmetCount}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-neutral-600">
                      Active Suppliers in {targetRegion}:{' '}
                      <strong className="text-neutral-900">{suppliersCount} dealers</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100">
                    <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                      Actionable Insight: High opportunity for dealers to stock {partNum} in {targetRegion}.
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Supplier Verification Management (PRD Section 15 & 20) */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="text-xs text-neutral-500">
            Control dealer trust tiers and verify automotive import licenses:
          </div>

          <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-white text-xs divide-y divide-neutral-200">
            {suppliers.map((sup) => (
              <div
                key={sup.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 text-sm">{sup.companyName}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        sup.verificationLevel === 'level_3_genuine_partner'
                          ? 'bg-emerald-100 text-emerald-900'
                          : sup.verificationLevel === 'level_2_trade_verified'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      {sup.verificationLevel.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-neutral-500 mt-1">
                    {sup.city} • {sup.address} • Phone: {sup.phone}
                  </div>
                  <div className="text-neutral-600 font-medium mt-0.5">
                    Specializations: {(sup.authorizedBrands || sup.specializationBrands || []).join(', ')} • Rating: {sup.rating} ★ (
                    {sup.verifiedInteractionsCount} ratings)
                  </div>
                </div>

                {/* Verification Control */}
                <div className="flex items-center gap-2">
                  <select
                    value={sup.verificationLevel}
                    onChange={(e) => updateSupplierVerification(sup.id, e.target.value as any)}
                    className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value="level_1_registered">Level 1: Registered</option>
                    <option value="level_2_trade_verified">Level 2: Trade Verified</option>
                    <option value="level_3_genuine_partner">Level 3: Genuine Partner</option>
                    <option value="suspended">Suspended (Disputed)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Master Parts Catalogue */}
      {activeTab === 'catalogue' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-500">
              Centralized normalized master catalogue preventing duplicated duplicate listings:
            </span>
            <button
              onClick={() => setShowAddPart(true)}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Master Part Record</span>
            </button>
          </div>

          {showAddPart && (
            <form onSubmit={handleCreateMasterPart} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3 text-xs">
              <h4 className="font-bold text-neutral-900">Add New Master Part to Platform Catalogue</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Part Number (e.g. 27060-31210)"
                  value={newPartNumber}
                  onChange={(e) => setNewPartNumber(e.target.value)}
                  className="p-2 border border-neutral-300 rounded-lg font-mono bg-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Part Name"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  className="p-2 border border-neutral-300 rounded-lg bg-white"
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="p-2 border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="Brake">Brake</option>
                  <option value="Engine">Engine</option>
                  <option value="Suspension">Suspension</option>
                  <option value="Filters">Filters</option>
                  <option value="Electrical">Electrical</option>
                </select>
                <input
                  type="text"
                  placeholder="Brand (e.g. Toyota Genuine)"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  className="p-2 border border-neutral-300 rounded-lg bg-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPart(false)}
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg text-neutral-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold"
                >
                  Save Master Record
                </button>
              </div>
            </form>
          )}

          <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-white text-xs divide-y divide-neutral-200">
            {masterParts.map((part) => (
              <div key={part.id} className="p-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                      {part.partNumber}
                    </span>
                    <span className="font-bold text-neutral-900">{part.partName}</span>
                    <span className="text-neutral-500 font-medium">({part.brand})</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    Compatible: {(part.compatibleVehicles || []).map((v) => `${v.make} ${v.model} (${v.yearStart}-${v.yearEnd})`).join(', ')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {part.offers.length} Active Supplier Offers
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
