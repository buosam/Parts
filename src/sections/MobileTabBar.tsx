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
    { id: "rfq", label: t("navOffers"), icon: TagIcon, badge: cartCount },
    { id: "garage", label: t("navGarage"), icon: WrenchIcon },
    { id: "account", label: t("navAccount"), icon: UserIcon },
  ];

  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/92 backdrop-blur-[14px] backdrop-saturate-150 md:hidden"
      aria-label="Primary"
    >
      <div className="grid grid-cols-5">
        {tabs.map((tab) => {
          const on = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`relative flex min-h-[56px] flex-col items-center justify-center gap-1 transition-colors ${
                on ? "text-terra" : "text-ink-faint"
              }`}
              aria-current={on ? "page" : undefined}
            >
              <tab.icon className="size-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {tab.badge ? (
                <span className="absolute end-4 top-1.5 grid min-w-4 place-items-center rounded-full bg-terra px-1 font-mono text-[9px] font-semibold text-paper">
                  {tab.badge}
                </span>
              ) : null}
              {on && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-terra" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
