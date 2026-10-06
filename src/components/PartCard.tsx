import React from "react";
import type { Part } from "@/data/parts";
import { useLang } from "@/i18n";
import { Star, Check, ShoppingCart, Zap, MapPin } from "lucide-react";
import { CATEGORY_ICONS } from "@/components/icons";

interface Props {
  part: Part;
  view: "grid" | "list";
  vehicleLabel: string;
  onOrder: (p: Part) => void;
  onSelectPart?: (p: Part) => void;
}

export const PartCard: React.FC<Props> = ({
  part,
  view,
  vehicleLabel,
  onOrder,
  onSelectPart,
}) => {
  const { lang } = useLang();
  const Icon = CATEGORY_ICONS[part.category] || CATEGORY_ICONS.brakes;
  const isAvailable = part.stock === "in";

  // Mock review count derived deterministically from ID
  const reviewCount = (parseInt(part.id.replace(/\D/g, "") || "1", 10) * 19) + 42;

  if (view === "list") {
    return (
      <article className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg border border-line bg-surface p-4 transition-all duration-200 hover:border-terra/40 hover:shadow-sm">
        {/* Product Image Box */}
        <div
          onClick={() => onSelectPart?.(part)}
          className={`w-full sm:w-32 h-32 shrink-0 bg-sand/60 rounded border border-line flex items-center justify-center relative p-2 ${
            onSelectPart ? "cursor-pointer" : ""
          }`}
        >
          <Icon className="size-12 text-ink-soft group-hover:scale-105 transition-transform" />
          <span className="absolute top-1.5 start-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface border border-line text-ink-faint">
            {part.quality}
          </span>
        </div>

        {/* Info Area */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-ink-soft">{part.brand}</span>
            <span className="text-ink-faint">·</span>
            <span className="font-mono text-terra font-medium text-[11px]">
              Part #: {part.oem}
            </span>
          </div>

          <h3
            onClick={() => onSelectPart?.(part)}
            className={`font-semibold text-sm sm:text-base text-ink truncate ${
              onSelectPart ? "cursor-pointer hover:text-terra transition-colors" : ""
            }`}
          >
            {part.name}
          </h3>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center text-amber-500">
              <Star className="size-3.5 fill-amber-500 text-amber-500" />
              <span className="font-semibold text-ink ms-1 text-xs">{part.rating.toFixed(1)}</span>
            </div>
            <span className="text-ink-faint text-[11px]">({reviewCount} reviews)</span>
          </div>

          {/* Compatibility */}
          {part.fits && (
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-forest bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              <Check className="size-3 text-forest" />
              <span>
                {lang === "ar" ? `مطابق لـ ${vehicleLabel}` : `Fits: ${vehicleLabel}`}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-ink-faint pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {part.warehouse}
            </span>
            <span>·</span>
            <span>{part.leadTime}</span>
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="w-full sm:w-auto sm:text-end shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-line space-y-2">
          <div>
            <div className="text-lg sm:text-xl font-bold font-mono text-ink">
              ${part.price.toFixed(2)}
            </div>
            <div
              className={`text-[11px] font-semibold ${
                isAvailable ? "text-forest" : "text-amber-600"
              }`}
            >
              {isAvailable
                ? (lang === "ar" ? "متوفر بالمخزن" : "In Stock")
                : (lang === "ar" ? "طلب خاص" : "On Demand")}
            </div>
          </div>

          <div className="flex sm:flex-col gap-2">
            <button
              onClick={() => onOrder(part)}
              className="flex-1 sm:flex-none h-9 px-4 rounded bg-terra hover:bg-terra-hover text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShoppingCart className="size-3.5" />
              <span>{lang === "ar" ? "إضافة للسلة" : "Add to Cart"}</span>
            </button>
            <button
              onClick={() => onOrder(part)}
              className="flex-1 sm:flex-none h-9 px-3 rounded border border-line hover:bg-sand text-ink text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Zap className="size-3 text-terra" />
              <span>{lang === "ar" ? "شراء الآن" : "Buy Now"}</span>
            </button>
          </div>
        </div>
      </article>
    );
  }

  // Modern Amazon-style 4-column Product Grid Card
  return (
    <article className="group flex flex-col h-full rounded-lg border border-line bg-surface p-3 transition-all duration-200 hover:border-terra/40 hover:shadow-md">
      {/* Product Image Area */}
      <div
        onClick={() => onSelectPart?.(part)}
        className={`w-full h-44 bg-sand/40 rounded border border-line/60 flex items-center justify-center relative p-3 ${
          onSelectPart ? "cursor-pointer" : ""
        }`}
      >
        <Icon className="size-16 text-ink-soft group-hover:scale-105 transition-transform" />

        {/* Quality Tag */}
        <span className="absolute top-2 start-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface/90 border border-line text-ink-faint shadow-2xs">
          {part.quality}
        </span>

        {/* Fitment Indicator Badge */}
        {part.fits && (
          <span className="absolute bottom-2 start-2 end-2 flex items-center justify-center gap-1 text-[10px] font-semibold text-forest bg-emerald-50/90 border border-emerald-200 px-2 py-0.5 rounded shadow-2xs truncate">
            <Check className="size-3 text-forest shrink-0" />
            <span className="truncate">
              {lang === "ar" ? `مطابق لـ ${vehicleLabel}` : `Fits: ${vehicleLabel}`}
            </span>
          </span>
        )}
      </div>

      {/* Card Content Body */}
      <div className="flex flex-col flex-1 mt-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-ink-faint uppercase text-[10px] tracking-wider">
            {part.brand}
          </span>
          <span className="font-mono text-[11px] text-terra font-medium">
            #{part.oem}
          </span>
        </div>

        <h3
          onClick={() => onSelectPart?.(part)}
          className={`font-semibold text-sm text-ink leading-snug line-clamp-2 h-10 ${
            onSelectPart ? "cursor-pointer hover:text-terra transition-colors" : ""
          }`}
          title={part.name}
        >
          {part.name}
        </h3>

        {/* Star Rating and Review Count */}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="flex items-center text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`size-3 ${
                  i < Math.floor(part.rating)
                    ? "fill-amber-500 text-amber-500"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="font-bold text-ink text-xs">{part.rating.toFixed(1)}</span>
          <span className="text-ink-faint text-[11px]">({reviewCount})</span>
        </div>

        {/* Price & Stock */}
        <div className="mt-auto pt-2 space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono text-ink">
              ${part.price.toFixed(2)}
            </span>
            <span className="text-[10px] text-ink-faint">USD</span>
          </div>

          <div
            className={`text-[11px] font-semibold ${
              isAvailable ? "text-forest" : "text-amber-600"
            }`}
          >
            {isAvailable
              ? (lang === "ar" ? "متوفر بالمخزن" : "In Stock")
              : (lang === "ar" ? "طلب خاص" : "On Demand")}
          </div>

          <div className="text-[11px] text-ink-faint flex items-center gap-1">
            <MapPin className="size-3" />
            <span>{part.warehouse}</span>
            <span>·</span>
            <span>{part.leadTime}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-2 space-y-1.5">
          <button
            onClick={() => onOrder(part)}
            className="w-full h-9 rounded bg-terra hover:bg-terra-hover text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <ShoppingCart className="size-3.5" />
            <span>{lang === "ar" ? "إضافة للسلة" : "Add to Cart"}</span>
          </button>
          <button
            onClick={() => onOrder(part)}
            className="w-full h-8 rounded border border-line hover:bg-sand text-ink text-xs font-medium flex items-center justify-center gap-1 transition-colors"
          >
            <Zap className="size-3 text-terra" />
            <span>{lang === "ar" ? "شراء الآن" : "Buy Now"}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default PartCard;
