import { useLang } from "@/i18n";
import { HomeIcon, SearchIcon, TagIcon, UserIcon, WrenchIcon } from "@/components/icons";

interface Props {
  active: string;
  onNavigate: (id: string) => void;
  cartCount: number;
}

export default function MobileTabBar({ active, onNavigate, cartCount }: Props) {
  const { t } = useLang();
  const tabs = [
    { id: "top", label: t("navHome"), icon: HomeIcon },
    { id: "catalog", label: t("navSearch"), icon: SearchIcon },
    { id: "offers", label: t("navOffers"), icon: TagIcon, badge: cartCount },
    { id: "garage", label: t("navGarage"), icon: WrenchIcon },
    { id: "account", label: t("navAccount"), icon: UserIcon },
  ];

  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 w-full max-w-full border-t border-line bg-paper/95 backdrop-blur-[14px] backdrop-saturate-150 md:hidden overflow-hidden"
      aria-label="Primary"
    >
      <div className="grid grid-cols-5 w-full max-w-full">
        {tabs.map((tab) => {
          const on = active === tab.id || (tab.id === 'offers' && active === 'rfq');
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`relative flex min-h-[52px] sm:min-h-[56px] flex-col items-center justify-center gap-0.5 sm:gap-1 px-1 transition-colors min-w-0 w-full cursor-pointer select-none ${
                on ? "text-terra font-semibold" : "text-ink-faint hover:text-ink"
              }`}
              aria-current={on ? "page" : undefined}
            >
              <tab.icon className="size-4.5 sm:size-5 shrink-0" />
              <span className="text-[10px] font-medium truncate max-w-full leading-tight">{tab.label}</span>
              {tab.badge ? (
                <span className="absolute end-2 sm:end-4 top-1 grid min-w-4 place-items-center rounded-full bg-terra px-1 font-mono text-[9px] font-semibold text-paper">
                  {tab.badge}
                </span>
              ) : null}
              {on && (
                <span className="absolute top-0 h-0.5 w-6 sm:w-8 rounded-full bg-terra" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
