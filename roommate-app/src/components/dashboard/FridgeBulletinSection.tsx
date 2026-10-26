import { Pin, Radio, Plus } from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import { getInitials } from '@/utils/utils';

export function FridgeBulletinSection() {
  const { activeHousehold } = useHousehold();
  const members = activeHousehold?.members || [];

  // Presence and vibe tags for members
  const memberPresence = members.map((member, index) => {
    const statuses = [
      { status: 'At Home', pip: 'bg-phosphor', tag: 'In Kitchen' },
      { status: 'Focus', pip: 'bg-amber-400', tag: 'Quiet Study' },
      { status: 'Away', pip: 'bg-slate-400', tag: 'At Work' },
    ];
    const curr = statuses[index % statuses.length];
    return {
      ...member,
      ...curr,
    };
  });

  // Pastel fridge notes
  const notes = [
    {
      id: 'note-1',
      bg: 'bg-amber-100/90 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100',
      pin: 'bg-red-400',
      rotation: '-rotate-1',
      text: 'Quiet study hours tonight from 8pm - 11pm! Midterms this week 📚',
      author: 'Alex',
    },
    {
      id: 'note-2',
      bg: 'bg-sky-100/90 dark:bg-sky-900/30 border-sky-200 dark:border-sky-800 text-sky-950 dark:text-sky-100',
      pin: 'bg-blue-400',
      rotation: 'rotate-1',
      text: 'Trash pickup is tomorrow morning. Please tie the bag tonight! 🗑️',
      author: 'Sam',
    },
  ];

  return (
    <div className="rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-xs select-none space-y-5">
      {/* 1. Flatmate Presence & Vibe Radar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary animate-pulse" />
            <h2 className="text-sm font-bold text-foreground font-display">
              Roommate Presence Radar
            </h2>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Live Vibe
          </span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {memberPresence.length === 0 ? (
            <div className="text-xs text-muted-foreground py-2">
              Invite roommates to see live presence.
            </div>
          ) : (
            memberPresence.map((member) => (
              <div
                key={member.user?.userId || member.householdMemberId}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-container border border-border/50 shrink-0"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                    {getInitials(member.user?.name || 'RM')}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface-container ${member.pip}`}
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-foreground truncate max-w-[90px]">
                    {member.user?.name?.split(' ')[0] || 'Roomie'}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">{member.tag}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Fridge Sticky Bulletin */}
      <div>
        <div className="flex items-center justify-between mb-3 pt-3 border-t border-dashed border-border/60">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-terracotta -rotate-45" />
            <h2 className="text-sm font-bold text-foreground font-display">
              Fridge Sticky Bulletin
            </h2>
          </div>
          <button
            type="button"
            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer min-h-[44px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Memo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`relative p-3.5 rounded-xl border shadow-sm transition-transform hover:scale-[1.02] ${note.bg} ${note.rotation}`}
            >
              {/* Pushpin motif */}
              <div
                className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-black/20 shadow-xs ${note.pin}`}
              />
              <p className="text-xs font-medium leading-relaxed mt-1">"{note.text}"</p>
              <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono opacity-70">
                <span>— {note.author}</span>
                <span>Pinned</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FridgeBulletinSection;
