import { useState } from 'react';
import { Rss } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

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
    <Card
      aria-label="Household Pulse Activity Feed"
      className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-xs space-y-3 select-none"
    >
      {/* Header with Segmented Filter Tabs */}
      <CardHeader className="p-0 flex flex-row items-center justify-between border-b border-border/60 pb-3 space-y-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <Rss className="w-4 h-4 stroke-[2.2]" />
          </div>
          <CardTitle className="text-xs font-semibold tracking-wider uppercase text-foreground font-mono">
            Pulse Activity
          </CardTitle>
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
      </CardHeader>

      {/* Feed List */}
      <CardContent className="p-0">
        <div className="flex flex-col">
          {filteredItems.map((item, idx) => {
            const count = reactions[item.id] ?? item.reactionCount;
            const isClicked = userReacted[item.id];

            return (
              <div key={item.id}>
                <div className="py-2.5 flex items-start justify-between gap-3 transition-colors">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Avatar className="w-6 h-6 rounded bg-surface-container border border-border text-foreground shrink-0 mt-0.5">
                      <AvatarFallback className="rounded bg-surface-container font-mono font-bold text-[10px]">
                        {item.userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs text-foreground leading-tight truncate">
                        {item.actionHtml}
                      </p>
                      <p className="text-muted-foreground text-[10px] mt-0.5 font-mono">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleToggleReaction(item.id)}
                    aria-label={`React ${item.reactionEmoji}`}
                    className={`min-h-[44px] h-auto px-2.5 py-1 text-xs rounded-lg border transition-all active:scale-95 shrink-0 flex items-center gap-1 cursor-pointer font-mono ${
                      isClicked
                        ? 'bg-primary/10 border-primary/40 text-primary font-bold hover:bg-primary/20 hover:text-primary'
                        : 'bg-card border-border hover:bg-surface-container text-foreground'
                    }`}
                  >
                    <span>{item.reactionEmoji}</span>
                    <span>{count}</span>
                  </Button>
                </div>
                {idx < filteredItems.length - 1 && <Separator className="bg-border/60" />}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default ActivityFeedSection;
