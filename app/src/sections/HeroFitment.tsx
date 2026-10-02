import { useState } from "react";
import { toast } from "sonner";
import { useLang } from "@/i18n";
import {
  DEFAULT_VEHICLE,
  VEHICLE_OPTIONS,
  type Vehicle,
} from "@/data/parts";
import BlueprintVisual from "@/sections/BlueprintVisual";
import { ArrowIcon, CheckIcon, LockIcon, ScanIcon } from "@/components/icons";

interface Props {
  vehicle: Vehicle;
  onVehicle: (v: Vehicle) => void;
  onScan: () => void;
}

export default function HeroFitment({ vehicle, onVehicle, onScan }: Props) {
  const { t } = useLang();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Vehicle>(vehicle);

  const makes = Object.keys(VEHICLE_OPTIONS);
  const models = Object.keys(VEHICLE_OPTIONS[draft.make] ?? {});
  const years = VEHICLE_OPTIONS[draft.make]?.[draft.model]?.years ?? [];
  const trims = VEHICLE_OPTIONS[draft.make]?.[draft.model]?.trims ?? [];

  const patch = (p: Partial<Vehicle>) => {
    setDraft((d) => {
      const next = { ...d, ...p };
      if (p.make) {
        next.model = Object.keys(VEHICLE_OPTIONS[p.make])[0];
      }
      if (p.make || p.model) {
        const m = VEHICLE_OPTIONS[next.make][next.model];
        next.year = m.years[0];
        next.trim = m.trims[0].name;
        next.engine = m.trims[0].engine;
      }
      if (p.trim) {
        const tr = VEHICLE_OPTIONS[next.make][next.model].trims.find(
          (x) => x.name === p.trim
        );
        if (tr) next.engine = tr.engine;
      }
      return next;
    });
  };

  const lock = () => {
    onVehicle(draft);
    setEditing(false);
    toast.success(t("vehicleSet"), {
      description: `${t("vehicleSetD")} ${draft.year} ${draft.make} ${draft.model} ${draft.trim}.`,
    });
  };

  const openEditor = () => {
    setDraft(vehicle);
    setEditing(true);
  };

  const reset = () => {
    setDraft(DEFAULT_VEHICLE);
    onVehicle(DEFAULT_VEHICLE);
  };

  return (
    <section id="top" className="paper-grain">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-24 lg:pt-16">
        {/* ── Copy + fitment module ── */}
        <div className="animate-fade-up">
          <p className="micro-label flex items-center gap-2 text-terra">
            <span className="inline-block size-1.5 rounded-full bg-terra" />
            {t("tagline")}
          </p>
          <h1 className="mt-4 text-balance text-[clamp(38px,6vw,64px)] font-semibold leading-[1.02] tracking-[-0.035em]">
            {t("heroTitleA")}
            <br />
            <span className="italic text-terra rtl:not-italic">{t("heroTitleB")}</span>
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft">
            {t("heroSub")}
          </p>

          {/* Vehicle lock card */}
          <div className="mt-8 rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-terra-soft text-terra">
                  <LockIcon className="size-5" />
                </span>
                <div>
                  <div className="micro-label text-ink-faint">{t("vehicleLocked")}</div>
                  <div dir="ltr" className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em]">
                    {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                    <span className="ms-2 font-mono text-xs font-medium text-ink-soft">
                      {vehicle.engine}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-1.5 rounded-full bg-forest-soft px-3 py-1.5 sm:flex">
                  <CheckIcon className="size-3.5 text-forest" />
                  <span className="micro-label text-forest">{t("fitmentGuaranteed")}</span>
                </span>
                <button
                  onClick={editing ? () => setEditing(false) : openEditor}
                  className="min-h-[44px] rounded-full border border-line px-4 text-sm font-medium text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
                >
                  {editing ? "Cancel" : t("change")}
                </button>
              </div>
            </div>

            {/* Editor */}
            {editing && (
              <div className="mt-4 animate-fade-up border-t border-line pt-4">
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  <Select label="Make" value={draft.make} onChange={(v) => patch({ make: v })} options={makes} />
                  <Select label="Model" value={draft.model} onChange={(v) => patch({ model: v })} options={models} />
                  <Select label="Year" value={draft.year} onChange={(v) => patch({ year: v })} options={years} />
                  <Select label="Trim" value={draft.trim} onChange={(v) => patch({ trim: v })} options={trims.map((x) => x.name)} />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={reset}
                    className="micro-label flex min-h-[44px] items-center text-ink-faint transition-colors hover:text-terra"
                  >
                    Reset to default
                  </button>
                  <span className="font-mono text-xs text-ink-faint">ENG · {draft.engine}</span>
                  <button
                    onClick={lock}
                    className="flex min-h-[44px] items-center gap-2 rounded-full bg-terra px-5 text-sm font-semibold text-paper transition-colors hover:bg-terra-hover"
                  >
                    {t("lockVehicle")}
                    <ArrowIcon className="size-4 rtl:-scale-x-100" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="mt-4 grid gap-2.5 border-t border-line pt-4 sm:grid-cols-2">
              <button
                onClick={onScan}
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-dashed border-terra-line bg-terra-soft/60 px-4 text-sm font-medium text-terra transition-colors hover:bg-terra-soft"
              >
                <ScanIcon className="size-[18px]" />
                {t("scanCard")}
              </button>
              <a
                href="#rfq"
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-night px-4 text-sm font-medium text-paper transition-colors hover:bg-night-deep"
              >
                {t("rfqCta")}
                <ArrowIcon className="size-4 rtl:-scale-x-100" />
              </a>
            </div>
          </div>
        </div>

        {/* ── Blueprint visual ── */}
        <div className="animate-fade-up [animation-delay:120ms]">
          <BlueprintVisual />
          <div className="mt-3 flex items-center justify-between px-1">
            <span className="micro-label text-ink-faint">DWG · PRD-2021-TXL</span>
            <span className="font-mono text-[11px] text-ink-faint">
              {15} {t("indexed")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="micro-label mb-1.5 block text-ink-faint">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-line bg-paper px-3 text-sm font-medium outline-none transition focus:border-terra-line"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
