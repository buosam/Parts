/**
 * Code-drawn "exploded diagram" hero visual: line-art parts on a dotted
 * drafting grid, connected by animated dashed leader lines to mono
 * callout labels with real OEM numbers.
 */
export default function BlueprintVisual() {
  return (
    <div className="relative overflow-hidden rounded-[20px] border border-line bg-surface shadow-card">
      <div className="blueprint-grid absolute inset-0" aria-hidden />
      {/* corner registration marks */}
      <div className="pointer-events-none absolute inset-3 rounded-[14px] border border-dashed border-ink/10" aria-hidden />

      <svg viewBox="0 0 560 460" className="relative block h-auto w-full" role="img" aria-label="Exploded diagram of indexed parts">
        {/* ── leader lines (animated dashes) ── */}
        <g stroke="#C2502E" strokeWidth="1.4" strokeDasharray="5 5" className="animate-dash-flow">
          <path d="M150 128 L236 96" fill="none" />
          <path d="M412 118 L330 96" fill="none" />
          <path d="M120 330 L210 300" fill="none" />
          <path d="M448 336 L356 306" fill="none" />
          <path d="M280 410 L280 336" fill="none" />
        </g>

        {/* ── brake disc (top-left) ── */}
        <g stroke="#262219" strokeWidth="1.8" fill="none" strokeLinecap="round">
          <circle cx="150" cy="180" r="62" />
          <circle cx="150" cy="180" r="46" strokeDasharray="2 6" />
          <circle cx="150" cy="180" r="16" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <circle
              key={a}
              cx={150 + 30 * Math.cos((a * Math.PI) / 180)}
              cy={180 + 30 * Math.sin((a * Math.PI) / 180)}
              r="4.5"
            />
          ))}
        </g>

        {/* ── piston (top-right) ── */}
        <g stroke="#262219" strokeWidth="1.8" fill="none" strokeLinecap="round">
          <path d="M382 148 h60 v52 h-60 z" />
          <path d="M382 160 h60 M382 170 h60" />
          <path d="M382 200 l8 22 h44 l8 -22" strokeDasharray="3 4" />
          <circle cx="412" cy="134" r="8" />
          <path d="M412 142 v6" />
        </g>

        {/* ── gear (center) ── */}
        <g stroke="#262219" strokeWidth="1.8" fill="none" strokeLinecap="round">
          <circle cx="280" cy="250" r="52" />
          <circle cx="280" cy="250" r="18" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return (
              <path
                key={i}
                d={`M${280 + 52 * Math.cos(a)} ${250 + 52 * Math.sin(a)} L${280 + 62 * Math.cos(a)} ${250 + 62 * Math.sin(a)}`}
              />
            );
          })}
          <circle cx="280" cy="250" r="34" strokeDasharray="2 5" />
        </g>

        {/* ── spark plug (bottom-left) ── */}
        <g stroke="#262219" strokeWidth="1.8" fill="none" strokeLinecap="round">
          <path d="M108 300 h34 v14 h-34 z" />
          <path d="M112 314 h26 v10 h-26 z M116 324 h18 v10 h-18 z" />
          <path d="M120 334 h10 v12 M125 346 h8" />
          <path d="M116 300 v-12 h18 v12" strokeDasharray="3 4" />
        </g>

        {/* ── filter cartridge (bottom-right) ── */}
        <g stroke="#262219" strokeWidth="1.8" fill="none" strokeLinecap="round">
          <rect x="420" y="286" width="46" height="72" rx="8" />
          <path d="M420 304 h46 M420 322 h46 M420 340 h46" />
          <path d="M432 286 v-10 h22 v10" />
        </g>

        {/* ── dimension marks ── */}
        <g stroke="#9A938A" strokeWidth="1" fill="none">
          <path d="M84 128 v104 M80 128 h8 M80 232 h8" />
          <path d="M494 286 v72 M490 286 h8 M490 358 h8" />
        </g>
        <g fill="#9A938A" fontFamily="Geist Mono, monospace" fontSize="10" letterSpacing="1">
          <text x="66" y="184" transform="rotate(-90 66 184)">Ø 338 MM</text>
          <text x="504" y="326" transform="rotate(-90 504 326)">H 192</text>
        </g>
      </svg>

      {/* ── callout chips ── */}
      <Callout className="left-[38%] top-[13%]" code="43512-60190" label="VENTED ROTOR" />
      <Callout className="right-[4%] top-[13%]" code="13101-31030" label="PISTON SET" />
      <Callout className="left-[2%] bottom-[16%]" code="90919-01191" label="SPARK PLUG" />
      <Callout className="right-[3%] bottom-[16%]" code="04152-YZZA1" label="OIL FILTER" />
      <Callout className="left-[38%] bottom-[4%]" code="13523-31010" label="TIMING GEAR" />

      {/* fitment stamp */}
      <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-forest/30 bg-forest-soft px-3 py-1.5">
        <span className="size-1.5 rounded-full bg-forest" />
        <span className="micro-label text-forest">1GR-FE · MATCHED</span>
      </div>
    </div>
  );
}

function Callout({
  code,
  label,
  className = "",
}: {
  code: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute rounded-lg border border-line bg-paper/95 px-2.5 py-1.5 shadow-xs backdrop-blur-sm ${className}`}
    >
      <div className="font-mono text-[11px] font-semibold leading-none text-terra">{code}</div>
      <div className="micro-label mt-1 text-[9px] leading-none text-ink-faint">{label}</div>
    </div>
  );
}
