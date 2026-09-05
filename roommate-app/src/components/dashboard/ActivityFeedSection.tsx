import { Receipt, CheckCircle2 } from 'lucide-react';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { formatTimeAgo } from '@/utils/utils';
import type {
  RecentExpenseActivity,
  RecentChoreActivity,
  ActivityFeedFilter,
} from '@/types/dashboardTypes';

interface Props {
  expenses: RecentExpenseActivity[];
  chores: RecentChoreActivity[];
}

export default function ActivityFeedSection({ expenses, chores }: Props) {
  const { filter, setFilter, filteredActivities } = useActivityFeed(expenses, chores);

  return (
    <section className="space-y-4">
      {/* Header & Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <h3 className="text-lg font-extrabold tracking-tight text-foreground">
          Activity Feed
        </h3>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {(['ALL', 'EXPENSES', 'CHORES'] as ActivityFeedFilter[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer capitalize active:scale-95 ${
                filter === tab
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-surface-container'
              }`}
            >
              {tab.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      {filteredActivities.length > 0 ? (
        <div className="space-y-3 pt-1">
          {filteredActivities.map((item) => {
            if (item.kind === 'EXPENSE') {
              return (
                <div
                  key={`exp-${item.id}`}
                  className="flex items-start gap-3.5 p-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">
                      <span className="font-extrabold">{item.paidBy}</span> added{' '}
                      <span className="font-extrabold text-primary">
                        ${item.amount.toFixed(2)}
                      </span>{' '}
                      for {item.title}
                    </p>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {formatTimeAgo(item.date)} • {item.household}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`chore-${item.id}`}
                className="flex items-start gap-3.5 p-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">
                    <span className="font-extrabold">{item.assignee}</span>{' '}
                    {item.status === 'COMPLETED' ? 'completed' : 'is assigned to'}{' '}
                    <span className="italic">'{item.title}'</span>
                  </p>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {formatTimeAgo(item.dueDate)} • {item.household}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted-foreground text-sm">
          No recent activity for this filter 🍃
        </div>
      )}
    </section>
  );
}
