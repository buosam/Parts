import React, { useState } from "react";
import { toast } from "sonner";
import { useLang } from "@/i18n";
import { ArrowIcon, UsersIcon } from "@/components/icons";

interface Props {
  onSendRfq?: (partName: string) => void;
}

export default function RfqBand({ onSendRfq }: Props) {
  const { t } = useLang();
  const [value, setValue] = useState("");

  const send = () => {
    if (!value.trim()) return;
    if (onSendRfq) {
      onSendRfq(value.trim());
    } else {
      toast.success(t("rfqSent"), { description: t("rfqSentD") });
    }
    setValue("");
  };

  return (
    <section id="rfq" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:pb-20">
      <div className="blueprint-grid-dark relative overflow-hidden rounded-[24px] bg-night px-5 py-12 text-paper sm:px-10 lg:px-16 lg:py-16">
        {/* terracotta radial glow */}
        <div
          className="pointer-events-none absolute -top-32 end-[-10%] size-[480px] rounded-full opacity-60"
          style={{
            background: "radial-gradient(circle, rgb(194 80 46 / 0.35), transparent 65%)",
          }}
          aria-hidden
        />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="micro-label flex items-center gap-2 text-terra">
              <UsersIcon className="size-4" />
              {t("rfqEyebrow")}
            </p>
            <h2 className="mt-3 text-balance text-[clamp(26px,3.4vw,40px)] font-semibold leading-tight tracking-[-0.03em]">
              {t("rfqTitle")}
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-paper/65">
              {t("rfqSub")}
            </p>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.08em] text-paper/40">
              {t("rfqNote")}
            </p>
          </div>

          <div>
            <div className="flex flex-col gap-2.5 rounded-2xl border border-paper/15 bg-paper/5 p-3 backdrop-blur-sm sm:flex-row">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={t("rfqPlaceholder")}
                className="min-h-[48px] flex-1 rounded-xl border border-paper/15 bg-night-deep px-4 font-mono text-sm text-paper outline-none placeholder:text-paper/35 focus:border-terra"
                aria-label={t("rfqCta")}
              />
              <button
                onClick={send}
                className="group flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-terra px-6 text-sm font-semibold text-paper transition-colors hover:bg-terra-hover"
              >
                {t("rfqSend")}
                <ArrowIcon className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
              </button>
            </div>
            {/* merchant ticker */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["AL-SINAK AUTO", "ERBIL IND.", "BASRA TRADE", "SULAI PARTS", "+41"].map((m) => (
                <span
                  key={m}
                  className="rounded-full border border-paper/12 px-2.5 py-1 font-mono text-[10px] tracking-[0.06em] text-paper/45"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
