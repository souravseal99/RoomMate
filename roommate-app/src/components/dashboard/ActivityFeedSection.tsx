import { useState } from 'react';
import { Rss } from 'lucide-react';

interface FeedItem {
  id: string;
  category: 'expense' | 'chore';
  user: string;
  userInitial: string;
  userBadgeColor?: string;
  actionHtml: React.ReactNode;
  subtitle: string;
  reactionEmoji: string;
  reactionCount: number;
}

export function ActivityFeedSection() {
  const [filter, setFilter] = useState<'all' | 'expense' | 'chore'>('all');
  const [reactions, setReactions] = useState<Record<string, number>>({
    '1': 3,
    '2': 4,
    '3': 2,
  });
  const [userReacted, setUserReacted] = useState<Record<string, boolean>>({});

  const feedItems: FeedItem[] = [
    {
      id: '1',
      category: 'expense',
      user: 'Alex',
      userInitial: 'A',
      actionHtml: (
        <span>
          <strong className="font-semibold text-foreground">Alex</strong> logged{' '}
          <strong className="font-mono text-primary font-bold">$42.50</strong> Whole Foods
        </span>
      ),
      subtitle: '8m ago · Groceries & coffee',
      reactionEmoji: '❤️',
      reactionCount: 3,
    },
    {
      id: '2',
      category: 'chore',
      user: 'Sarah',
      userInitial: 'S',
      actionHtml: (
        <span>
          <strong className="font-semibold text-foreground">Sarah</strong> stamped Brita Refill
        </span>
      ),
      subtitle: '+10 House Karma awarded · 45m ago',
      reactionEmoji: '👏',
      reactionCount: 4,
    },
    {
      id: '3',
      category: 'expense',
      user: 'Sourav',
      userInitial: 'S',
      actionHtml: (
        <span>
          <strong className="font-semibold text-foreground">Sourav</strong> settled $25.00 with Alex
        </span>
      ),
      subtitle: 'Yesterday · ACH Transfer',
      reactionEmoji: '🤝',
      reactionCount: 2,
    },
  ];

  const handleToggleReaction = (id: string) => {
    const isReacted = userReacted[id];
    setUserReacted((prev) => ({ ...prev, [id]: !isReacted }));
    setReactions((prev) => ({
      ...prev,
      [id]: isReacted ? prev[id] - 1 : prev[id] + 1,
    }));
  };

  const filteredItems = feedItems.filter(
    (item) => filter === 'all' || item.category === filter
  );

  return (
    <section
      aria-label="Household Pulse Activity Feed"
      className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-xs space-y-3 select-none"
    >
      {/* Header with Segmented Filter Tabs */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-container text-primary-foreground flex items-center justify-center">
            <Rss className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h3 className="text-xs font-semibold tracking-wider uppercase text-foreground font-mono">
            Pulse Activity
          </h3>
        </div>

        <div className="inline-flex bg-surface-container border border-border p-0.5 rounded-lg">
          {(['all', 'expense', 'chore'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer font-mono ${
                filter === tab
                  ? 'bg-card text-foreground shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Feed List */}
      <div className="divide-y divide-border/60">
        {filteredItems.map((item) => {
          const count = reactions[item.id] ?? item.reactionCount;
          const isClicked = userReacted[item.id];

          return (
            <div
              key={item.id}
              className="py-2.5 flex items-start justify-between gap-3 transition-colors"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded bg-surface-container border border-border text-foreground font-mono font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                  {item.userInitial}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-foreground leading-tight truncate">
                    {item.actionHtml}
                  </p>
                  <p className="text-muted-foreground text-[10px] mt-0.5 font-mono">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleReaction(item.id)}
                aria-label={`React ${item.reactionEmoji}`}
                className={`min-h-[44px] px-2.5 py-1 text-xs rounded-lg border transition-all active:scale-95 shrink-0 flex items-center gap-1 cursor-pointer font-mono ${
                  isClicked
                    ? 'bg-primary/10 border-primary/40 text-primary font-bold'
                    : 'bg-card border-border hover:bg-surface-container text-foreground'
                }`}
              >
                <span>{item.reactionEmoji}</span>
                <span>{count}</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ActivityFeedSection;
