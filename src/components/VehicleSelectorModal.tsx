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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-neutral-200 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900 text-base sm:text-lg">
                {isArabic ? 'تحديد وتأكيد المركبة' : 'Vehicle Fitment Confirmation'}
              </h2>
              <p className="text-xs text-neutral-500">
                {isArabic
                  ? 'اختر سيارتك لعرض القطع المتوافقة 100% فقط'
                  : 'Filters catalogue to show guaranteed compatible spare parts only'}
              </p>
            </div>
          </div>
          <button
            id="close-vehicle-picker-btn"
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-lg hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-neutral-200 px-4 pt-2 gap-2 bg-white text-xs font-semibold">
          <button
            id="garage-tab-btn"
            onClick={() => setActiveTab('garage')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'garage'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {isArabic ? 'كراجي المحفوظ' : 'My Saved Garage'} ({userVehicles.length})
          </button>
          <button
            id="add-vehicle-tab-btn"
            onClick={() => setActiveTab('add')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'add'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <span className="flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              {isArabic ? 'إضافة مركبة' : 'Select Make & Model'}
            </span>
          </button>
          <button
            id="vin-tab-btn"
            onClick={() => setActiveTab('vin')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'vin'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <span className="flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-indigo-600" />
              {isArabic ? 'البحث برقم الشاصي (VIN)' : 'VIN Search'}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'garage' && (
            <div className="space-y-3">
              <div className="text-xs font-medium text-neutral-500 mb-2">
                {isArabic
                  ? 'انقر على السيارة لتفعيل فلترة التوافق التلقائية:'
                  : 'Select an active vehicle to verify part fitment instantly:'}
              </div>

              {userVehicles.map((veh) => {
                const isCurrent = activeVehicle?.id === veh.id;
                return (
                  <div
                    key={veh.id}
                    id={`garage-veh-card-${veh.id}`}
                    onClick={() => handleSelectVehicle(veh)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isCurrent
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 text-sm">
                            {veh.make} {veh.model} {veh.year}
                          </span>
                          {veh.trim && (
                            <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded">
                              {veh.trim}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                          <span>{veh.engine}</span>
                          {veh.vin && (
                            <span className="font-mono text-[10px] text-neutral-400">
                              VIN: {veh.vin.slice(0, 7)}...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                          {isArabic ? 'محدد حالياً' : 'Active'}
                        </span>
                      ) : (
                        <button className="text-xs font-medium text-neutral-500 hover:text-neutral-900 px-2 py-1">
                          {isArabic ? 'تحديد' : 'Select'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <button
                id="modal-add-another-vehicle-btn"
                onClick={() => setActiveTab('add')}
                className="w-full mt-3 py-2.5 border border-dashed border-neutral-300 hover:border-neutral-400 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {isArabic ? 'إضافة مركبة جديدة إلى الكراج' : 'Add Another Vehicle to My Garage'}
              </button>
            </div>
          )}

          {activeTab === 'add' && (
            <form onSubmit={handleSaveNewVehicle} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">
                    {isArabic ? 'الشركة المصنعة (Make)' : 'Vehicle Make'}
                  </label>
                  <select
                    id="vehicle-make-select"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-emerald-600 font-medium bg-white"
                  >
                    <option value="Toyota">Toyota (تويوتا)</option>
                    <option value="Nissan">Nissan (نيسان)</option>
                    <option value="Hyundai">Hyundai (هيونداي)</option>
                    <option value="Kia">Kia (كيا)</option>
                    <option value="Lexus">Lexus (لكزس)</option>
                    <option value="Mercedes-Benz">Mercedes-Benz (مرسيدس)</option>
                    <option value="BMW">BMW (بي إم دبليو)</option>
                    <option value="Ford">Ford (فورد)</option>
                    <option value="Chevrolet">Chevrolet (شيفروليه)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">
                    {isArabic ? 'الموديل (Model)' : 'Vehicle Model'}
                  </label>
                  <select
                    id="vehicle-model-select"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-emerald-600 font-medium bg-white"
                  >
                    {make === 'Toyota' && (
                      <>
                        <option value="Prado">Prado (برادو)</option>
                        <option value="Land Cruiser">Land Cruiser (لاندكروزر)</option>
                        <option value="Hilux">Hilux (هايلوكس)</option>
                        <option value="Camry">Camry (كامري)</option>
                        <option value="Corolla">Corolla (كورولا)</option>
                        <option value="RAV4">RAV4</option>
                        <option value="FJ Cruiser">FJ Cruiser</option>
                      </>
                    )}
                    {make === 'Nissan' && (
                      <>
                        <option value="Patrol">Patrol Y62 (باترول)</option>
                        <option value="Sunny">Sunny (صني)</option>
                        <option value="X-Trail">X-Trail</option>
                        <option value="Altima">Altima</option>
                      </>
                    )}
                    {make === 'Hyundai' && (
                      <>
                        <option value="Tucson">Tucson (توسان)</option>
                        <option value="Elantra">Elantra (النترا)</option>
                        <option value="Santa Fe">Santa Fe (سنتافي)</option>
                        <option value="Sonata">Sonata (سوناتا)</option>
                      </>
                    )}
                    {make !== 'Toyota' && make !== 'Nissan' && make !== 'Hyundai' && (
                      <option value="Universal Model">Standard Regional Model</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">
                    {isArabic ? 'سنة الصنع (Year)' : 'Production Year'}
                  </label>
                  <select
                    id="vehicle-year-select"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-emerald-600 font-medium bg-white"
                  >
                    {Array.from({ length: 16 }, (_, i) => 2025 - i).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">
                    {isArabic ? 'سعة المحرك (Engine)' : 'Engine Variant'}
                  </label>
                  <input
                    type="text"
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                    placeholder="e.g. 4.0L V6 / 2.7L"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  {isArabic ? 'الفئة / التريم (Trim / Spec)' : 'Trim / Specification'}
                </label>
                <input
                  type="text"
                  value={trim}
                  onChange={(e) => setTrim(e.target.value)}
                  placeholder="e.g. TX-L, VXR, GXR, Platinum"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <button
                type="submit"
                id="save-new-vehicle-btn"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-xs"
              >
                {isArabic ? 'حفظ وتعيين كسيارة حالية' : 'Save & Set as Active Vehicle'}
              </button>
            </form>
          )}

          {activeTab === 'vin' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">
                    {isArabic ? 'تأكيد التوافق التام بنسبة 100%' : 'Guaranteed 100% Part Fitment via VIN'}
                  </div>
                  <div className="text-indigo-700 mt-0.5">
                    {isArabic
                      ? 'أدخل رقم الشاصي (17 حرفاً ورقم) المطبوع على زجاج السيارة أو السنوية لتحديد الكتالوج الرسمي.'
                      : 'Enter your 17-character vehicle identification number from your registration document or dashboard plate.'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-700">
                  {isArabic ? 'رقم الشاصي (VIN)' : 'Chassis / VIN Number (17 Characters)'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="vin-input-field"
                    maxLength={17}
                    value={vinInput}
                    onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                    placeholder="e.g. JTEBU29J700148921"
                    className="flex-1 font-mono uppercase px-3 py-2 border border-neutral-300 rounded-xl focus:outline-emerald-600 text-sm tracking-wider"
                  />
                  <button
                    type="button"
                    id="decode-vin-btn"
                    onClick={handleVinDecode}
                    disabled={isDecoding || vinInput.length < 5}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    {isDecoding ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>{isArabic ? 'فك الشفرة' : 'Decode'}</span>
                  </button>
                </div>
                <div className="flex gap-2 pt-1">
                  <span className="text-[11px] text-neutral-400">Quick Test VINs:</span>
                  <button
                    type="button"
                    onClick={() => setVinInput('JTEBU29J700148921')}
                    className="text-[11px] text-emerald-700 hover:underline font-mono"
                  >
                    Prado 2021
                  </button>
                  <button
                    type="button"
                    onClick={() => setVinInput('JN8AY29Y809312845')}
                    className="text-[11px] text-emerald-700 hover:underline font-mono"
                  >
                    Patrol Y62
                  </button>
                </div>
              </div>

              {vinDecoded && (
                <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      {isArabic ? 'تم التعرف على السيارة بنجاح' : 'Vehicle Successfully Decoded'}
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                      {vinDecoded.vin}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-neutral-900">
                    {vinDecoded.make} {vinDecoded.model} ({vinDecoded.year})
                  </div>
                  <div className="text-xs text-neutral-600">
                    {vinDecoded.engine} • {vinDecoded.trim}
                  </div>

                  <button
                    type="button"
                    id="apply-decoded-vin-btn"
                    onClick={() => {
                      addUserVehicle(vinDecoded);
                      setActiveModal(null);
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                  >
                    {isArabic ? 'تأكيد وحفظ السيارة' : 'Confirm & Set as Active Vehicle'}
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
