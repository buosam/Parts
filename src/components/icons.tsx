import type { ReactElement, SVGProps } from "react";
import type { CategoryKey } from "@/data/parts";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

/* ── Brand mark: hex nut with directional thread ───────────────── */
export function LogoMark(props: P) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden {...props}>
      <path
        d="M16 3 27.7 9.75v13.5L16 29 4.3 23.25V9.75L16 3Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="5.4" stroke="currentColor" strokeWidth="2.2" />
      <path d="M13.4 13.4l5.2 5.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/* ── Category glyphs ───────────────────────────────────────────── */
export function BrakeIcon(props: P) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.8v2.4M12 17.8v2.4M3.8 12h2.4M17.8 12h2.4M6.2 6.2l1.7 1.7M16.1 16.1l1.7 1.7M17.8 6.2l-1.7 1.7M7.9 16.1l-1.7 1.7" />
    </svg>
  );
}

export function SuspensionIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M12 2v2.5M12 19.5V22M7.5 4.5h9M7.5 19.5h9" />
      <path d="M9 6.5h6l-6 3h6l-6 3h6l-6 3h6" />
    </svg>
  );
}

export function EngineIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M8.5 10V7h5v3" />
      <path d="M5.5 10h3v3h-3z" />
      <path d="M8.5 10h7l2.5 2.5V18H6v-5h2.5v-3Z" />
      <path d="M15 14.5h3" />
    </svg>
  );
}

export function BodyIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M3 15l2-6.5A2 2 0 0 1 6.9 7h8.2a2 2 0 0 1 1.7.9L19 11h2a2 2 0 0 1 2 2v2h-2.5" />
      <circle cx="7.5" cy="16.5" r="2.2" />
      <circle cx="16.5" cy="16.5" r="2.2" />
      <path d="M9.7 16.5h4.6M3 15v1.5h2.3" />
    </svg>
  );
}

export function CoolingIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M12 2.5v19M12 2.5L9.5 5M12 2.5L14.5 5M12 21.5L9.5 19M12 21.5l2.5-2.5" />
      <path d="M3.8 7.25l16.4 9.5M3.8 7.25l3-.5M3.8 7.25l.5 3M20.2 16.75l-3 .5M20.2 16.75l-.5-3" />
      <path d="M20.2 7.25L3.8 16.75M20.2 7.25l-3-.5M20.2 7.25l-.5 3M3.8 16.75l3 .5M3.8 16.75l.5-3" />
    </svg>
  );
}

export function FilterIcon(props: P) {
  return (
    <svg {...base(props)}>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M7 7.5h10M7 12h10M7 16.5h10" />
    </svg>
  );
}

export const CATEGORY_ICONS: Record<CategoryKey, (p: P) => ReactElement> = {
  brakes: BrakeIcon,
  suspension: SuspensionIcon,
  engine: EngineIcon,
  body: BodyIcon,
  cooling: CoolingIcon,
  filters: FilterIcon,
};

/* ── UI icons ──────────────────────────────────────────────────── */
export const SearchIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20.5 20.5L16 16" />
  </svg>
);

export const ScanIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 8V5.5A2.5 2.5 0 0 1 5.5 3H8M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8M21 16v2.5a2.5 2.5 0 0 1-2.5 2.5H16M8 21H5.5A2.5 2.5 0 0 1 3 18.5V16" />
    <path d="M4 12h16" strokeDasharray="3 3" />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 12.5l5 5 10-11" />
  </svg>
);

export const ShieldIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 2.5l7.5 3v6c0 5-3.2 8.3-7.5 10-4.3-1.7-7.5-5-7.5-10v-6l7.5-3Z" />
    <path d="M8.8 12l2.3 2.3 4.2-4.5" />
  </svg>
);

export const TruckIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 6h11v11h-11zM13.5 10h4l3 3.5V17h-3" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="16.5" cy="17.5" r="1.8" />
    <path d="M8.8 17.5h5.9" />
  </svg>
);

export const UsersIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 5.7M18 14.8c2 .7 3 2.4 3 5.2" />
  </svg>
);

export const CashIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.5" y="6.5" width="19" height="11" rx="2" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

export const ArrowIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12h15M13.5 6l6 6-6 6" />
  </svg>
);

export const CartIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 4h2.4l2.2 11.5h11.7L21.5 8H7" />
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="17" cy="20" r="1.4" />
  </svg>
);

export const GridIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
  </svg>
);

export const ListIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" strokeWidth="2.6" />
  </svg>
);

export const SlidersIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 8h10M18 8h2M4 16h2M10 16h10" />
    <circle cx="16" cy="8" r="2.2" />
    <circle cx="8" cy="16" r="2.2" />
  </svg>
);

export const StarIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 2.8l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.5l-5.8 3.1 1.1-6.4L2.6 9.6l6.5-.9L12 2.8Z" />
  </svg>
);

export const PinIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21.5s7-6.2 7-11.5a7 7 0 1 0-14 0c0 5.3 7 11.5 7 11.5Z" />
    <circle cx="12" cy="10" r="2.4" />
  </svg>
);

export const HomeIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 11.5L12 4l8 7.5" />
    <path d="M6 10v10h12V10" />
  </svg>
);

export const TagIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8L21 12l-8.5 8.5-9-8Z" />
    <circle cx="8" cy="8" r="1.4" />
  </svg>
);

export const WrenchIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M14.5 6.5a4.5 4.5 0 0 1 6 5.2L12 20.2a2.3 2.3 0 0 1-3.2-3.2l8.5-8.5a4.5 4.5 0 0 1-2.8-2Z" transform="scale(0.95) translate(0.5 0.5)" />
    <path d="M21 3l-3.5 3.5M19.5 7.5L16 4" />
  </svg>
);

export const UserIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20.5c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5" />
  </svg>
);

export const XIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 5l14 14M19 5L5 19" />
  </svg>
);

export const ChevronIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 9.5l6 6 6-6" />
  </svg>
);

export const LockIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    <circle cx="12" cy="15.5" r="1.4" />
  </svg>
);

export const GlobeIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.2-3.8-8.5s1.3-6.2 3.8-8.5Z" />
  </svg>
);
