import { Receipt, GitFork, PieChart, FileText } from 'lucide-react';

export type ExpensesTabId =
  | 'tab-active-ledger'
  | 'tab-payback-routes'
  | 'tab-spend-caps'
  | 'tab-receipts';

interface ExpensesTabBarProps {
  activeTab: ExpensesTabId;
  onTabChange: (tabId: ExpensesTabId) => void;
  badgeCount?: {
    ledgerCount?: number;
    debtsCount?: number;
    receiptsCount?: number;
  };
}

export function ExpensesTabBar({
  activeTab,
  onTabChange,
  badgeCount = {},
}: ExpensesTabBarProps) {
  const tabs = [
    {
      id: 'tab-active-ledger' as ExpensesTabId,
      label: 'Active Ledger',
      icon: Receipt,
      badge: badgeCount.ledgerCount,
    },
    {
      id: 'tab-payback-routes' as ExpensesTabId,
      label: 'Payback Routes & Graph',
      icon: GitFork,
      badge: badgeCount.debtsCount,
    },
    {
      id: 'tab-spend-caps' as ExpensesTabId,
      label: 'Spend Caps & Budgets',
      icon: PieChart,
    },
    {
      id: 'tab-receipts' as ExpensesTabId,
      label: 'Receipts Vault',
      icon: FileText,
      badge: badgeCount.receiptsCount,
    },
  ];

  return (
    <nav
      aria-label="Expenses & Settlement Navigation Tabs"
      className="w-full bg-card rounded-2xl p-1.5 border border-border shadow-xs overflow-x-auto select-none"
    >
      <div className="flex items-center gap-1.5 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 min-h-[44px] rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm font-bold border-b-2 border-primary-fixed-dim'
                  : 'text-muted-foreground hover:bg-surface-container-high hover:text-foreground font-semibold'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0 stroke-[2.2]" />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none ${
                    isActive
                      ? 'bg-primary-foreground text-primary'
                      : 'bg-surface-container-high text-muted-foreground'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
