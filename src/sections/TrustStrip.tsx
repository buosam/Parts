import { useLang } from "@/i18n";
import { CashIcon, ShieldIcon, TruckIcon, UsersIcon } from "@/components/icons";

export default function TrustStrip() {
  const { t } = useLang();
  const items = [
    { icon: ShieldIcon, title: t("trust1T"), desc: t("trust1D") },
    { icon: TruckIcon, title: t("trust2T"), desc: t("trust2D") },
    { icon: UsersIcon, title: t("trust3T"), desc: t("trust3D") },
    { icon: CashIcon, title: t("trust4T"), desc: t("trust4D") },
  ];
  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <div
            key={i}
            className={`flex items-start gap-3.5 px-4 py-6 sm:px-6 lg:py-8 ${
              i > 0 ? "border-s border-line" : ""
            } ${i >= 2 ? "border-t border-line lg:border-t-0" : ""} ${
              i === 2 ? "border-s-0 lg:border-s" : ""
            }`}
          >
            <it.icon className="mt-0.5 size-6 shrink-0 text-terra" />
            <div>
              <div className="text-sm font-semibold tracking-[-0.01em]">{it.title}</div>
              <div className="mt-1 text-[13px] leading-snug text-ink-soft">{it.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
