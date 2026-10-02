import { useLang } from "@/i18n";
import { CheckIcon, LockIcon, ScanIcon } from "@/components/icons";

export default function ScannerSection() {
  const { t } = useLang();
  const points = [t("scanPoint1"), t("scanPoint2"), t("scanPoint3")];

  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-20">
        {/* Copy */}
        <div>
          <p className="micro-label flex items-center gap-2 text-terra">
            <ScanIcon className="size-4" />
            {t("scanEyebrow")}
          </p>
          <h2 className="mt-3 text-balance text-[clamp(26px,3.4vw,40px)] font-semibold leading-tight tracking-[-0.03em]">
            {t("scanTitle")}
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
            {t("scanSub")}
          </p>
          <ul className="mt-6 space-y-3">
            {points.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-ink">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-forest-soft text-forest">
                  <CheckIcon className="size-3" strokeWidth={2.4} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Extraction mock */}
        <div className="relative">
          <div className="rounded-2xl border border-line bg-paper p-4 shadow-card sm:p-5">
            {/* card scan frame */}
            <div className="blueprint-grid relative overflow-hidden rounded-xl border border-dashed border-terra-line bg-terra-soft/40 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="micro-label text-terra">REPUBLIC OF IRAQ</div>
                  <div className="mt-1 text-sm font-semibold">Vehicle Registration / إجازة السنوية</div>
                </div>
                <span className="grid size-9 place-items-center rounded-lg bg-surface text-terra shadow-xs">
                  <ScanIcon className="size-5" />
                </span>
              </div>
              {/* scanline */}
              <div className="scanline absolute inset-x-0 h-px bg-terra/70 shadow-[0_0_12px_2px_rgb(194_80_46/0.5)]" aria-hidden />
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Field k="VIN" v="JTFDW02P9M0513247" mono accent />
                <Field k="ENGINE" v="1GR-FE · 3956 CC" mono accent />
                <Field k="PLATE" v="BGD 4-82175" mono />
                <Field k="OWNER" v="••••• ••••••" mono />
              </div>
            </div>

            {/* extraction result */}
            <div className="mt-3 flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-forest" />
                <span className="font-mono text-xs font-medium">
                  1GR-FE → 15 PARTS MATCHED
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-ink-faint">
                <LockIcon className="size-3.5" />
                <span className="micro-label text-[9px]">AES-256</span>
              </span>
            </div>
          </div>

          {/* floating chip */}
          <div className="absolute -end-2 -top-3 hidden rotate-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-lift sm:block">
            <div className="micro-label text-[9px] text-ink-faint">EXTRACTION</div>
            <div className="font-mono text-sm font-semibold text-terra">0.8s</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ k, v, mono, accent }: { k: string; v: string; mono?: boolean; accent?: boolean }) {
  return (
    <div className={`rounded-lg border px-3 py-2.5 ${accent ? "border-terra-line bg-surface" : "border-line/70 bg-surface/60"}`}>
      <div className="micro-label text-[9px] text-ink-faint">{k}</div>
      <div className={`mt-1 text-[13px] font-medium ${mono ? "font-mono" : ""} ${accent ? "text-terra" : ""}`}>
        {v}
      </div>
    </div>
  );
}
