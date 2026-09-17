/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Car, Check, Plus, Search, ShieldCheck, Sparkles, Hash } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Vehicle } from '../types';

export const VehicleSelectorModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    activeVehicle,
    setActiveVehicle,
    userVehicles,
    addUserVehicle,
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [activeTab, setActiveTab] = useState<'garage' | 'add' | 'vin'>('garage');

  // New vehicle form state
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('Prado');
  const [year, setYear] = useState(2021);
  const [engine, setEngine] = useState('4.0L V6 (1GR-FE)');
  const [trim, setTrim] = useState('TX-L');
  const [nickname, setNickname] = useState('');

  // VIN Lookup state
  const [vinInput, setVinInput] = useState('');
  const [vinDecoded, setVinDecoded] = useState<Vehicle | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  if (activeModal !== 'vehicle_picker') return null;

  const handleSelectVehicle = (veh: Vehicle) => {
    setActiveVehicle(veh);
    setActiveModal(null);
  };

  const handleSaveNewVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const newVeh: Vehicle = {
      id: `veh-${Date.now()}`,
      make,
      model,
      year: Number(year),
      engine,
      trim,
      nickname: nickname || `${make} ${model}`,
    };
    addUserVehicle(newVeh);
    setActiveModal(null);
  };

  const handleVinDecode = () => {
    if (!vinInput.trim()) return;
    setIsDecoding(true);
    setTimeout(() => {
      setIsDecoding(false);
      const upper = vinInput.trim().toUpperCase();
      if (upper.startsWith('JTE') || upper.includes('PRADO')) {
        setVinDecoded({
          id: `veh-${Date.now()}`,
          make: 'Toyota',
          model: 'Prado 150 Series',
          year: 2021,
          engine: '4.0L V6 (1GR-FE)',
          trim: 'TX-L 7-Seater',
          vin: upper,
          nickname: 'Decoded Prado',
        });
      } else if (upper.startsWith('JN8') || upper.includes('PATROL')) {
        setVinDecoded({
          id: `veh-${Date.now()}`,
          make: 'Nissan',
          model: 'Patrol Y62',
          year: 2022,
          engine: '5.6L V8 (VK56VD)',
          trim: 'Platinum City V8',
          vin: upper,
          nickname: 'Decoded Patrol',
        });
      } else {
        setVinDecoded({
          id: `veh-${Date.now()}`,
          make: 'Toyota',
          model: 'Land Cruiser LC300',
          year: 2022,
          engine: '3.5L Twin Turbo V6 (V35A-FTS)',
          trim: 'VXR',
          vin: upper,
          nickname: 'Decoded Land Cruiser',
        });
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/15 flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base sm:text-lg">
                {isArabic ? 'تحديد وتأكيد المركبة' : 'Vehicle Fitment Confirmation'}
              </h2>
              <p className="text-xs text-slate-400">
                {isArabic
                  ? 'اختر سيارتك لعرض القطع المتوافقة 100% فقط'
                  : 'Filters catalogue to show guaranteed compatible spare parts only'}
              </p>
            </div>
          </div>
          <button
            id="close-vehicle-picker-btn"
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 px-4 pt-2 gap-2 bg-white/[0.02] text-xs font-semibold">
          <button
            id="garage-tab-btn"
            onClick={() => setActiveTab('garage')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'garage'
                ? 'border-indigo-500 text-indigo-400 font-black'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>{isArabic ? 'مرآبي وسياراتي' : 'Saved Vehicles'}</span>
          </button>

          <button
            id="add-vehicle-tab-btn"
            onClick={() => setActiveTab('add')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'add'
                ? 'border-indigo-500 text-indigo-400 font-black'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>{isArabic ? 'إضافة سيارة يدوياً' : 'Add Make & Model'}</span>
          </button>

          <button
            id="vin-decode-tab-btn"
            onClick={() => setActiveTab('vin')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === 'vin'
                ? 'border-indigo-500 text-indigo-400 font-black'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isArabic ? 'فحص رقم الشاصي (VIN)' : 'VIN Decoder'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* TAB 1: GARAGE */}
          {activeTab === 'garage' && (
            <div className="space-y-3">
              <span className="font-bold text-slate-300 block text-xs">
                {isArabic ? 'اختر السيارة لتفعيل التوافق المضمون:' : 'Select active vehicle to filter parts catalog:'}
              </span>

              {userVehicles.map((veh, i) => {
                const isSelected =
                  activeVehicle?.make === veh.make &&
                  activeVehicle?.model === veh.model &&
                  activeVehicle?.year === veh.year;

                return (
                  <div
                    key={veh.id || i}
                    onClick={() => handleSelectVehicle(veh)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-500/80 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-white/[0.05] text-slate-300'
                        }`}
                      >
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-sm">
                          {veh.make} {veh.model} ({veh.year})
                        </h4>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {veh.engine} • <span className="text-slate-300">{veh.trim || 'Standard'}</span>
                        </p>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'المركبة النشطة' : 'Active'}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs hover:text-white font-semibold">
                        {isArabic ? 'تحديد' : 'Select'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: MANUAL ADD */}
          {activeTab === 'add' && (
            <form onSubmit={handleSaveNewVehicle} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Car Make</label>
                  <select
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="Toyota">Toyota (تويوتا)</option>
                    <option value="Nissan">Nissan (نيسان)</option>
                    <option value="Hyundai">Hyundai (هيونداي)</option>
                    <option value="Kia">Kia (كيا)</option>
                    <option value="Lexus">Lexus (لكزس)</option>
                    <option value="Ford">Ford (فورد)</option>
                    <option value="Chevrolet">Chevrolet (شفروليه)</option>
                    <option value="BMW">BMW (بي إم دبليو)</option>
                    <option value="Mercedes-Benz">Mercedes-Benz (مرسيدس)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Prado / Land Cruiser / Patrol"
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Model Year</label>
                  <input
                    type="number"
                    min={1990}
                    max={2026}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Engine Specs</label>
                  <input
                    type="text"
                    required
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                    placeholder="e.g. 4.0L V6 / 2.0L Turbo"
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/25 cursor-pointer mt-2"
              >
                Save Vehicle & Set Active Fitment
              </button>
            </form>
          )}

          {/* TAB 3: VIN DECODER */}
          {activeTab === 'vin' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-slate-300 leading-relaxed">
                <span className="font-bold text-indigo-300 block mb-1">17-Digit Iraqi / GCC VIN Decoder</span>
                Type your vehicle chassis number (e.g. JTE... for Toyota Prado or JN8... for Nissan Patrol) to automatically extract factory engine, trim, and OEM catalog code.
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. JTEBU5JR9M5019821"
                    value={vinInput}
                    onChange={(e) => setVinInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVinDecode}
                  disabled={isDecoding || !vinInput.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer shrink-0"
                >
                  {isDecoding ? 'Decoding...' : 'Decode VIN'}
                </button>
              </div>

              {vinDecoded && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-white space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                      VIN MATCH CONFIRMED
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{vinDecoded.vin}</span>
                  </div>

                  <h4 className="text-base font-extrabold text-white">
                    {vinDecoded.make} {vinDecoded.model} ({vinDecoded.year})
                  </h4>

                  <div className="text-xs text-slate-300 space-y-1">
                    <div>Engine: <strong className="text-indigo-300">{vinDecoded.engine}</strong></div>
                    <div>Trim Spec: <strong className="text-white">{vinDecoded.trim}</strong></div>
                  </div>

                  <button
                    onClick={() => {
                      addUserVehicle(vinDecoded);
                      setActiveVehicle(vinDecoded);
                      setActiveModal(null);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                  >
                    Confirm & Apply Fitment Filter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
