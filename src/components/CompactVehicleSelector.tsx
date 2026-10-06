import React, { useState } from "react";
import { useLang } from "@/i18n";
import { Vehicle, VEHICLE_OPTIONS } from "@/data/parts";
import { Car, CheckCircle2, Search, SlidersHorizontal } from "lucide-react";

interface Props {
  vehicle: Vehicle;
  onVehicleChange: (v: Vehicle) => void;
  onVinSearch?: (vin: string) => void;
}

export default function CompactVehicleSelector({
  vehicle,
  onVehicleChange,
  onVinSearch,
}: Props) {
  const { lang } = useLang();
  const [vinInput, setVinInput] = useState("");
  const [showVinInput, setShowVinInput] = useState(false);

  const availableMakes = Object.keys(VEHICLE_OPTIONS);
  const selectedMake = vehicle.make in VEHICLE_OPTIONS ? vehicle.make : availableMakes[0];
  const availableModels = Object.keys(VEHICLE_OPTIONS[selectedMake] || {});
  const selectedModel = vehicle.model in (VEHICLE_OPTIONS[selectedMake] || {}) ? vehicle.model : availableModels[0] || "";

  const modelData = VEHICLE_OPTIONS[selectedMake]?.[selectedModel];
  const availableYears = modelData?.years || ["2023", "2022", "2021", "2020"];
  const availableTrims = modelData?.trims || [{ name: "Standard", engine: "4.0L V6" }];

  const handleMakeChange = (make: string) => {
    const models = Object.keys(VEHICLE_OPTIONS[make] || {});
    const firstModel = models[0] || "";
    const mData = VEHICLE_OPTIONS[make]?.[firstModel];
    const firstYear = mData?.years[0] || "2021";
    const firstTrim = mData?.trims[0] || { name: "Base", engine: "Engine" };

    onVehicleChange({
      make,
      model: firstModel,
      year: firstYear,
      trim: firstTrim.name,
      engine: firstTrim.engine,
    });
  };

  const handleModelChange = (model: string) => {
    const mData = VEHICLE_OPTIONS[vehicle.make]?.[model];
    const firstYear = mData?.years[0] || "2021";
    const firstTrim = mData?.trims[0] || { name: "Base", engine: "Engine" };

    onVehicleChange({
      ...vehicle,
      model,
      year: firstYear,
      trim: firstTrim.name,
      engine: firstTrim.engine,
    });
  };

  const handleYearChange = (year: string) => {
    onVehicleChange({ ...vehicle, year });
  };

  const handleEngineChange = (engine: string) => {
    const trim = availableTrims.find((t) => t.engine === engine)?.name || vehicle.trim;
    onVehicleChange({ ...vehicle, engine, trim });
  };

  const handleVinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vinInput.trim() && onVinSearch) {
      onVinSearch(vinInput.trim());
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-line p-3 sm:p-4 mb-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-3 border-b border-line">
        <div className="flex items-center gap-2">
          <Car className="size-4 text-terra" />
          <h2 className="font-bold text-xs sm:text-sm text-ink">
            {lang === "ar" ? "حدد سيارتك لعرض القطع المطابقة" : "Find parts for your vehicle"}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setShowVinInput(!showVinInput)}
          className="text-xs text-terra hover:underline font-medium flex items-center gap-1"
        >
          {showVinInput
            ? (lang === "ar" ? "اختيار بالماركة والموديل" : "Select by Make/Model")
            : (lang === "ar" ? "أو ادخل رقم الشاصي (VIN)" : "Or enter VIN")}
        </button>
      </div>

      {showVinInput ? (
        <form onSubmit={handleVinSubmit} className="flex gap-2 max-w-xl">
          <input
            type="text"
            value={vinInput}
            onChange={(e) => setVinInput(e.target.value)}
            placeholder={lang === "ar" ? "ادخل رقم الشاصي (17 حرف)..." : "Enter 17-digit VIN number..."}
            className="flex-1 h-9 px-3 rounded border border-line text-xs font-mono uppercase focus:ring-1 focus:ring-terra outline-none bg-white"
          />
          <button
            type="submit"
            className="h-9 px-4 bg-terra text-white rounded font-medium text-xs hover:bg-terra-hover flex items-center gap-1 shrink-0"
          >
            <Search className="size-3.5" />
            <span>{lang === "ar" ? "مطابقة" : "Decode VIN"}</span>
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
          {/* Make */}
          <div>
            <label className="block text-[10px] text-ink-faint uppercase font-mono mb-1">
              {lang === "ar" ? "الشركة" : "Make"}
            </label>
            <select
              value={vehicle.make}
              onChange={(e) => handleMakeChange(e.target.value)}
              className="w-full h-9 rounded border border-line bg-white px-2 text-ink font-medium focus:ring-1 focus:ring-terra outline-none"
            >
              {availableMakes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="block text-[10px] text-ink-faint uppercase font-mono mb-1">
              {lang === "ar" ? "الموديل" : "Model"}
            </label>
            <select
              value={vehicle.model}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full h-9 rounded border border-line bg-white px-2 text-ink font-medium focus:ring-1 focus:ring-terra outline-none"
            >
              {availableModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[10px] text-ink-faint uppercase font-mono mb-1">
              {lang === "ar" ? "السنة" : "Year"}
            </label>
            <select
              value={vehicle.year}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-full h-9 rounded border border-line bg-white px-2 text-ink font-medium focus:ring-1 focus:ring-terra outline-none"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Engine */}
          <div>
            <label className="block text-[10px] text-ink-faint uppercase font-mono mb-1">
              {lang === "ar" ? "المحرك" : "Engine"}
            </label>
            <select
              value={vehicle.engine}
              onChange={(e) => handleEngineChange(e.target.value)}
              className="w-full h-9 rounded border border-line bg-white px-2 text-ink font-medium focus:ring-1 focus:ring-terra outline-none truncate"
            >
              {availableTrims.map((t, idx) => (
                <option key={idx} value={t.engine}>
                  {t.engine}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Vehicle Compatibility Indicator */}
      <div className="mt-3 pt-2 border-t border-line/60 flex items-center justify-between text-xs text-forest font-medium">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="size-4 text-forest shrink-0" />
          <span>
            {lang === "ar"
              ? `عرض القطع المطابقة لسيارتك: ${vehicle.make} ${vehicle.model} ${vehicle.year} (${vehicle.engine})`
              : `Showing parts compatible with your vehicle (${vehicle.make} ${vehicle.model} ${vehicle.year} ${vehicle.engine}).`}
          </span>
        </div>
      </div>
    </div>
  );
}
