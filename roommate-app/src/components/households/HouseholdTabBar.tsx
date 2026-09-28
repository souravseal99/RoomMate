import { Gauge, Scale, Users, Share2, LogOut } from 'lucide-react';

export type HouseholdTabId =
  | 'tab-vitals'
  | 'tab-fairness'
  | 'tab-roster'
  | 'tab-invites'
  | 'tab-offboarding';

interface HouseholdTabBarProps {
  activeTab: HouseholdTabId;
  onTabChange: (tab: HouseholdTabId) => void;
}

export function HouseholdTabBar({ activeTab, onTabChange }: HouseholdTabBarProps) {
  const tabs = [
    {
      id: 'tab-vitals' as const,
      label: 'Overview & Living Vitals',
      icon: Gauge,
    },
    {
      id: 'tab-fairness' as const,
      label: 'Fairness & Ledger',
      icon: Scale,
    },
    {
      id: 'tab-roster' as const,
      label: 'Roster & Governance',
      icon: Users,
    },
    {
      id: 'tab-invites' as const,
      label: 'Invites & Networks',
      icon: Share2,
    },
    {
      id: 'tab-offboarding' as const,
      label: 'Departure & Exit',
      icon: LogOut,
    },
  ];

  return (
    <div className="w-full bg-surface-container p-1 rounded-full overflow-x-auto no-scrollbar border border-border select-none">
      <div className="flex items-center gap-1 min-w-max" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 min-h-[44px] rounded-full text-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm font-bold border-b-2 border-primary-fixed-dim'
                  : 'text-muted-foreground hover:bg-surface-container-high hover:text-foreground font-semibold'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[2.2]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default HouseholdTabBar;
