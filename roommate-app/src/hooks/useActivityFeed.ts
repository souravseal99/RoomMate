import { useMemo, useState } from 'react';
import type {
  RecentExpenseActivity,
  RecentChoreActivity,
  ActivityFeedFilter,
} from '@/types/dashboardTypes';

export type FeedItem =
  | ({ kind: 'EXPENSE' } & RecentExpenseActivity)
  | ({ kind: 'CHORE' } & RecentChoreActivity);

export function useActivityFeed(
  expenses: RecentExpenseActivity[] = [],
  chores: RecentChoreActivity[] = []
) {
  const [filter, setFilter] = useState<ActivityFeedFilter>('ALL');

  // Memoize combining and chronological sorting
  const combinedActivities = useMemo(() => {
    const items: FeedItem[] = [
      ...expenses.map((e) => ({ ...e, kind: 'EXPENSE' as const })),
      ...chores.map((c) => ({ ...c, kind: 'CHORE' as const })),
    ];

    return items.sort((a, b) => {
      const timeA = new Date('date' in a ? a.date : a.dueDate).getTime();
      const timeB = new Date('date' in b ? b.date : b.dueDate).getTime();
      return timeB - timeA;
    });
  }, [expenses, chores]);

  // Memoize filtering by active tab
  const filteredActivities = useMemo(() => {
    if (filter === 'EXPENSES') {
      return combinedActivities.filter((item) => item.kind === 'EXPENSE');
    }
    if (filter === 'CHORES') {
      return combinedActivities.filter((item) => item.kind === 'CHORE');
    }
    return combinedActivities;
  }, [combinedActivities, filter]);

  return {
    filter,
    setFilter,
    filteredActivities,
  };
}
