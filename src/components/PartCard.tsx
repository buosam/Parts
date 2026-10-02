import type { Part } from "@/data/parts";
import { useLang } from "@/i18n";
import {
  ArrowIcon,
  CATEGORY_ICONS,
  CheckIcon,
  PinIcon,
  StarIcon,
} from "@/components/icons";

interface Props {
  part: Part;
  view: "grid" | "list";
  vehicleLabel: string;
  onOrder: (p: Part) => void;
}

export function QualityChip({ q }: { q: Part["quality"] }) {
  const { t } = useLang();
  const label =
    q === "Genuine OEM" ? t("genuine") : q === "OEM Spec" ? t("oemSpec") : t("aftermarket");
  const tone =
    q === "Genuine OEM"
      ? "bg-night text-paper"
      : q === "OEM Spec"
        ? "bg-sand text-ink-soft border border-line"
        : "bg-surface text-ink-faint border border-dashed border-line";
  return (
    <span className={`micro-label rounded-full px-2 py-1 text-[10px] ${tone}`}>{label}</span>
  );
}

export function StockDot({ stock }: { stock: Part["stock"] }) {
  const { t } = useLang();
  const inStock = stock === "in";
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`size-1.5 rounded-full ${inStock ? "bg-forest" : "bg-amberx"}`}
      />
      <span className={`text-[12px] font-medium ${inStock ? "text-forest" : "text-amberx"}`}>
        {inStock ? t("inStock") : t("onDemand")}
      </span>
    </span>
  );
}

export default function PartCard({ part, view, vehicleLabel, onOrder }: Props) {
  const { t } = useLang();
  const Icon = CATEGORY_ICONS[part.category];
  const cta = part.stock === "in" ? t("order") : t("getOffers");

  const actionButton = (
    <button
      onClick={() => onOrder(part)}
      className={`group/btn flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${
        part.stock === "in"
          ? "bg-terra text-paper hover:bg-terra-hover"
          : "border border-terra-line bg-terra-soft text-terra hover:bg-terra-soft/70"
      }`}
    >
      {cta}
      <ArrowIcon className="size-4 transition-transform duration-150 group-hover/btn:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/btn:-translate-x-0.5" />
    </button>
  );

  if (view === "list") {
    return (
      <article className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-3.5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift sm:gap-5 sm:p-4">
        <div className="blueprint-grid grid size-16 shrink-0 place-items-center rounded-xl border border-line bg-sand text-ink sm:size-20">
          <Icon className="size-7 sm:size-9" strokeWidth={1.3} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="font-mono text-[11px] font-semibold tracking-[0.04em] text-terra">
              {part.oem}
            </span>
            <span className="micro-label text-ink-faint">{part.brand}</span>
            {part.fits && (
              <span className="flex items-center gap-1 rounded-full bg-terra-soft px-2 py-0.5">
                <CheckIcon className="size-3 text-terra" />
                <span className="micro-label text-[9px] text-terra">
                  {t("fits")} {vehicleLabel}
                </span>
              </span>
            )}
          </div>
          <h3 className="mt-1 truncate text-[15px] font-semibold tracking-[-0.01em]">
            {part.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-soft">
            <StockDot stock={part.stock} />
            <span className="flex items-center gap-1">
              <PinIcon className="size-3.5" />
              {part.warehouse}
            </span>
            <span className="hidden font-mono text-[11px] text-ink-faint sm:inline">
              {part.leadTime}
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <StarIcon className="size-3 text-amberx" />
              <span className="font-mono text-[11px]">{part.rating.toFixed(1)}</span>
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="font-mono text-lg font-semibold tracking-[-0.02em]">
            ${part.price}
          </div>
          <div className="hidden sm:block">{actionButton}</div>
        </div>
        <div className="sm:hidden">{actionButton}</div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col rounded-2xl border border-line bg-surface shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      {/* glyph tile */}
      <div className="blueprint-grid relative grid h-36 place-items-center rounded-t-2xl border-b border-line bg-sand text-ink">
        <Icon className="size-16 transition-transform duration-300 group-hover:scale-105" strokeWidth={1.1} />
        <div className="absolute start-3 top-3 flex gap-1.5">
          {part.fits && (
            <span className="flex items-center gap-1 rounded-full bg-terra px-2.5 py-1">
              <CheckIcon className="size-3 text-paper" />
              <span className="micro-label text-[9px] text-paper">
                {t("fits")} {vehicleLabel}
              </span>
            </span>
          )}
        </div>
        <div className="absolute end-3 top-3">
          <QualityChip q={part.quality} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] font-semibold tracking-[0.04em] text-terra">
            {part.oem}
          </span>
          <span className="micro-label text-ink-faint">{part.brand}</span>
        </div>
        <h3 className="mt-1.5 text-[15px] font-semibold leading-snug tracking-[-0.01em]">
          {part.name}
        </h3>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-soft">
          <StockDot stock={part.stock} />
          <span className="flex items-center gap-1">
            <PinIcon className="size-3.5" />
            {part.warehouse}
          </span>
          <span className="flex items-center gap-1">
            <StarIcon className="size-3 text-amberx" />
            <span className="font-mono text-[11px]">{part.rating.toFixed(1)}</span>
          </span>
        </div>
        <div className="mt-1 font-mono text-[11px] text-ink-faint">{part.leadTime}</div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="font-mono text-xl font-semibold tracking-[-0.02em]">
            ${part.price}
          </div>
          {actionButton}
        </div>
      </div>
    </article>
  );
}
