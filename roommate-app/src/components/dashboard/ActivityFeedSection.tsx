import { useState, useMemo } from 'react';
import { Rss, SmilePlus, Bell } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useHousehold from '@/hooks/useHousehold';
import { useTheme } from '@/contexts/ThemeContext';
import {
  useActivityFeedQuery,
  useToggleReactionMutation,
} from '@/hooks/queries/useActivityQueries';
import type { ActivityItem } from '@/types/activityTypes';
import { cn } from '@/utils/utils';

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

export function ActivityFeedSection() {
  const { activeHousehold } = useHousehold();
  const householdId = activeHousehold?.householdId;
  const { themeName } = useTheme();
  const isDark =
    themeName === 'dark' ||
    (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  const [filter, setFilter] = useState<'all' | 'expense' | 'chore'>('all');
  const [openPickerId, setOpenPickerId] = useState<string | null>(null);

  const { data: activities = [], isLoading } = useActivityFeedQuery(householdId, filter);
  const toggleReactionMutation = useToggleReactionMutation(householdId);

  const handleSelectEmoji = (activityId: string, emoji: string) => {
    toggleReactionMutation.mutate({ activityId, emoji });
    setOpenPickerId(null);
  };

  const filteredItems = useMemo(() => {
    if (!activities) return [];
    if (filter === 'all') return activities;
    if (filter === 'expense')
      return activities.filter((a) => a.type === 'EXPENSE' || a.type === 'SETTLEMENT');
    if (filter === 'chore')
      return activities.filter((a) => a.type === 'CHORE_COMPLETED' || a.type === 'NUDGE');
    return activities;
  }, [activities, filter]);

  const getAvatarStyle = (item: ActivityItem) => {
    if (item.type === 'CHORE_COMPLETED') {
      return 'bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-200 border-sky-200/50';
    }
    if (item.type === 'SETTLEMENT') {
      return 'bg-primary text-primary-foreground border-transparent';
    }
    if (item.type === 'NUDGE') {
      return 'bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border-purple-200/50';
    }
    // Expense default
    return 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-200/50';
  };

  const renderActionContent = (item: ActivityItem) => {
    const rawName = item.user?.name || 'Flatmate';
    const userName = rawName.split(' ')[0];

    if (item.type === 'EXPENSE') {
      const amount =
        item.metadata?.amount !== undefined ? `$${Number(item.metadata.amount).toFixed(2)}` : '';
      const desc = item.metadata?.merchant || item.description || '';
      return (
        <span>
          <strong className="font-semibold text-foreground">{userName}</strong> logged{' '}
          {amount && <strong className="font-mono text-foreground font-bold">{amount} </strong>}
          <span>{desc}</span>
        </span>
      );
    }

    if (item.type === 'CHORE_COMPLETED') {
      const choreName = item.metadata?.choreName || item.metadata?.choreDescription || 'a chore';
      return (
        <span>
          <strong className="font-semibold text-foreground">{userName}</strong> stamped{' '}
          <span className="font-medium text-foreground">{choreName}</span>
        </span>
      );
    }

    if (item.type === 'SETTLEMENT') {
      const amount =
        item.metadata?.amount !== undefined ? `$${Number(item.metadata.amount).toFixed(2)}` : '';
      const recipient = item.metadata?.recipientName || 'Alex';
      return (
        <span>
          <strong className="font-semibold text-foreground">{userName}</strong> settled{' '}
          {amount && <strong className="font-mono text-foreground font-bold">{amount} </strong>}
          with <span className="font-medium text-foreground">{recipient}</span>
        </span>
      );
    }

    if (item.type === 'NUDGE') {
      const choreName = item.metadata?.choreDescription || 'overdue chore';
      return (
        <span>
          <strong className="font-semibold text-foreground">{userName}</strong> nudged you for{' '}
          <span className="font-medium text-foreground">{choreName}</span>
        </span>
      );
    }

    // Fallback for custom activities
    return (
      <span>
        <strong className="font-semibold text-foreground">{userName}</strong> {item.title}
      </span>
    );
  };

  const renderSubtitle = (item: ActivityItem) => {
    const timeStr = formatRelativeTime(item.createdAt);

    if (item.type === 'CHORE_COMPLETED') {
      const karma = item.metadata?.karma || 10;
      return (
        <div className="flex items-center gap-1.5 text-[11px] mt-0.5 font-mono">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            +{karma} House Karma awarded
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{timeStr}</span>
        </div>
      );
    }

    if (item.type === 'NUDGE') {
      return (
        <div className="flex items-center gap-1.5 text-[11px] mt-0.5 font-mono">
          <span className="text-purple-600 dark:text-purple-400 font-semibold inline-flex items-center gap-1">
            <Bell className="w-3 h-3 stroke-[2.5]" /> Action required
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{timeStr}</span>
        </div>
      );
    }

    if (item.type === 'SETTLEMENT') {
      const method = item.metadata?.method || 'ACH Transfer';
      return (
        <p className="text-muted-foreground text-[11px] mt-0.5 font-mono">
          {timeStr} · {method}
        </p>
      );
    }

    // Expense
    const notes = item.metadata?.category || item.description || 'Groceries & coffee';
    return (
      <p className="text-muted-foreground text-[11px] mt-0.5 font-mono">
        {timeStr} · {notes}
      </p>
    );
  };

  return (
    <Card
      id="activity-pulse-feed"
      aria-label="Household Pulse Activity Feed"
      className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-xs space-y-3 select-none"
    >
      {/* Header with Segmented Filter Tabs */}
      <CardHeader className="p-0 flex flex-row items-center justify-between border-b border-border/60 pb-3 space-y-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <Rss className="w-4 h-4 stroke-[2.2]" />
          </div>
          <CardTitle className="text-xl tracking-widest font-semibold tracking-wider uppercase text-foreground font-mono">
            Activity Pulse
          </CardTitle>
        </div>

        <div className="inline-flex bg-surface-container border border-border p-0.5 rounded-lg">
          {(['all', 'expense', 'chore'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={cn(
                'px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer font-mono',
                filter === tab
                  ? 'bg-card text-foreground shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </CardHeader>

      {/* Feed List */}
      <CardContent className="p-0">
        <div className="flex flex-col">
          {isLoading && filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground font-mono">
              Loading household activity...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground font-mono">
              No recent household activities found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const displayEmoji = item.userReactedEmoji || item.dominantEmoji || '❤️';
              const reactionCount = item.totalReactionCount;
              const userInitial = (item.user?.name || 'F').charAt(0).toUpperCase();

              return (
                <div key={item.id}>
                  <div className="py-3 sm:py-3.5 flex items-center justify-between gap-3 transition-colors">
                    {/* Left: Squircle Avatar + Content */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        className={cn(
                          'w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-xs',
                          getAvatarStyle(item)
                        )}
                      >
                        <AvatarFallback className="rounded-xl font-bold text-xs sm:text-sm bg-transparent">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="text-xs sm:text-[13px] text-foreground leading-snug truncate">
                          {renderActionContent(item)}
                        </p>
                        {renderSubtitle(item)}
                      </div>
                    </div>

                    {/* Right: Reaction Pill Button with Emoji Picker Popover */}
                    <Popover
                      open={openPickerId === item.id}
                      onOpenChange={(open) => setOpenPickerId(open ? item.id : null)}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label={`Reaction ${displayEmoji} ${reactionCount}. Click to pick or change emoji reaction.`}
                          className={cn(
                            'min-h-[44px] h-auto px-2.5 py-1 text-xs rounded-full border transition-all active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer font-mono shadow-xs',
                            item.userReacted
                              ? 'bg-primary/10 border-primary/40 text-primary font-bold hover:bg-primary/20'
                              : 'bg-card border-border hover:bg-surface-container text-foreground'
                          )}
                        >
                          <span className="text-sm leading-none">{displayEmoji}</span>
                          <span className="text-xs font-semibold">{reactionCount}</span>
                          <SmilePlus className="w-3 h-3 opacity-40 hover:opacity-100 transition-opacity ml-0.5" />
                        </button>
                      </PopoverTrigger>

                      <PopoverContent
                        className="p-0 border-none shadow-2xl z-50 w-auto bg-transparent"
                        align="end"
                        side="top"
                      >
                        <EmojiPicker
                          theme={isDark ? Theme.DARK : Theme.LIGHT}
                          onEmojiClick={(emojiData) => handleSelectEmoji(item.id, emojiData.emoji)}
                          lazyLoadEmojis
                          previewConfig={{ showPreview: false }}
                          searchPlaceholder="Search emoji..."
                          width={300}
                          height={350}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {idx < filteredItems.length - 1 && <Separator className="bg-border/60" />}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ActivityFeedSection;
