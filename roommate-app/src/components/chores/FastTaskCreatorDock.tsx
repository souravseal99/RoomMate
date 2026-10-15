import { useState } from 'react';
import { Pin, Users } from 'lucide-react';
import type { ChoreFrequency, ChorePriority } from '@/types/choreTypes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FastTaskCreatorDockProps {
  currentUserName?: string;
  members?: Array<{ id: string; name: string }>;
  isSubmitting?: boolean;
  onPinTask: (task: {
    description: string;
    assignedToId: string | null;
    assignedToName: string;
    frequency: ChoreFrequency;
    priority: ChorePriority;
    nextDue: string;
  }) => void;
}

const PRESET_CHORES = [
  { label: '🗑️ Trash', text: 'Take out kitchen trash & replace liner' },
  { label: '🍽️ Dishes', text: 'Unload & run dishwasher cycle' },
  { label: '🧼 Kitchen', text: 'Deep scrub stovetop & sink' },
  { label: '🧹 Vacuum', text: 'Vacuum living room rug & lounge' },
  { label: '✨ Counters', text: 'Wipe quartz kitchen counter & table' },
  { label: '🪣 Mop', text: 'Swiffer damp-mop hardwood floors' },
];

export function FastTaskCreatorDock({
  currentUserName = 'Sourav',
  members = [],
  isSubmitting = false,
  onPinTask,
}: FastTaskCreatorDockProps) {
  const [description, setDescription] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('YOU'); // 'YOU' | memberId | 'OPEN'
  const [cadence, setCadence] = useState<ChoreFrequency>('daily');
  const [priority, setPriority] = useState<ChorePriority>('HIGH');

  const defaultMembers = members.length > 0 ? members : [
    { id: 'sarah', name: 'Sarah Lin' },
    { id: 'leo', name: 'Leo Keller' },
    { id: 'alex', name: 'Alex Chen' },
  ];

  const handleSelectPreset = (text: string) => {
    setDescription(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = description.trim();
    if (!trimmed) return;

    let assignedId: string | null = null;
    let assignedName = 'Open (Any)';

    if (selectedAssignee === 'YOU') {
      assignedName = `${currentUserName} (You)`;
    } else if (selectedAssignee !== 'OPEN') {
      const found = defaultMembers.find((m) => m.id === selectedAssignee);
      if (found) {
        assignedId = found.id;
        assignedName = found.name;
      }
    }

    // Set next due date to today / tonight
    const today = new Date();
    today.setHours(22, 0, 0, 0);

    onPinTask({
      description: trimmed,
      assignedToId: assignedId,
      assignedToName: assignedName,
      frequency: cadence,
      priority,
      nextDue: today.toISOString(),
    });

    setDescription('');
  };

  return (
    <Card className="bg-card p-5 rounded-2xl border-border/70 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <CardHeader className="p-0 flex flex-row items-center justify-between border-b border-border/50 pb-3 space-y-0">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Pin className="w-4 h-4 stroke-[2.2]" />
          </span>
          <CardTitle className="font-display font-bold text-sm sm:text-base text-foreground">
            Toss a Task on the Board
          </CardTitle>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground bg-surface-container px-2 py-0.5 rounded-full border-border/40"
        >
          FAST 1-CLICK DOCK
        </Badge>
      </CardHeader>

      <CardContent className="p-0 flex flex-col gap-4">
        {/* Preset 1-Click Chips */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Quick Presets
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_CHORES.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="outline"
                onClick={() => handleSelectPreset(preset.text)}
                className="px-3 min-h-[36px] rounded-full bg-surface-container-low hover:bg-surface-container text-foreground text-xs font-semibold border-border/50 transition-all cursor-pointer active:scale-95 shadow-2xs h-auto py-1.5"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 pt-1">
          {/* Task Title Input */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="chore-dock-desc" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Chore Details
            </Label>
            <Input
              id="chore-dock-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Clean microwave, wipe coffee maker..."
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-surface-container-low focus:bg-card border-border text-foreground placeholder:text-muted-foreground text-xs sm:text-sm"
            />
          </div>

          {/* Flatmate Assignee Avatar Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Assign To
            </span>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {/* You */}
              <Button
                type="button"
                variant={selectedAssignee === 'YOU' ? 'default' : 'outline'}
                onClick={() => setSelectedAssignee('YOU')}
                className={`p-1.5 min-h-[48px] rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer h-auto ${
                  selectedAssignee === 'YOU'
                    ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                    : 'bg-surface-container-low hover:bg-surface-container text-foreground border-border/40'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                  selectedAssignee === 'YOU' ? 'bg-white/20 text-white' : 'bg-primary text-primary-foreground'
                }`}>
                  {currentUserName.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-[10px] leading-tight">You</span>
              </Button>

              {/* Other flatmates */}
              {defaultMembers.map((member) => {
                const isSelected = selectedAssignee === member.id;
                const initials = member.name.slice(0, 2).toUpperCase();
                return (
                  <Button
                    key={member.id}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => setSelectedAssignee(member.id)}
                    className={`p-1.5 min-h-[48px] rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer h-auto ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                        : 'bg-surface-container-low hover:bg-surface-container text-foreground border-border/40'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {initials}
                    </div>
                    <span className="text-[10px] leading-tight truncate max-w-[48px]">
                      {member.name.split(' ')[0]}
                    </span>
                  </Button>
                );
              })}

              {/* Open / Any */}
              <Button
                type="button"
                variant={selectedAssignee === 'OPEN' ? 'default' : 'outline'}
                onClick={() => setSelectedAssignee('OPEN')}
                className={`p-1.5 min-h-[48px] rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer h-auto ${
                  selectedAssignee === 'OPEN'
                    ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                    : 'bg-surface-container-low hover:bg-surface-container text-foreground border-border/40'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  selectedAssignee === 'OPEN' ? 'bg-white/20 text-white' : 'bg-surface-container text-muted-foreground'
                }`}>
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] leading-tight">Open</span>
              </Button>
            </div>
          </div>

          {/* Cadence & Priority */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Cadence
              </span>
              <div className="flex rounded-xl bg-surface-container p-1 gap-1 border border-border/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCadence('daily')}
                  className={`flex-1 min-h-[36px] text-center text-xs font-bold rounded-lg transition-all cursor-pointer h-auto py-1.5 ${
                    cadence === 'daily'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Daily
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCadence('weekly')}
                  className={`flex-1 min-h-[36px] text-center text-xs font-bold rounded-lg transition-all cursor-pointer h-auto py-1.5 ${
                    cadence === 'weekly'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Weekly
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Priority
              </span>
              <div className="flex rounded-xl bg-surface-container p-1 gap-1 border border-border/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPriority('MEDIUM')}
                  className={`flex-1 min-h-[36px] text-center text-xs font-bold rounded-lg transition-all cursor-pointer h-auto py-1.5 ${
                    priority === 'MEDIUM'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Med
                </Button>
                <Button
                  type="button"
                  variant={priority === 'HIGH' ? 'default' : 'ghost'}
                  onClick={() => setPriority('HIGH')}
                  className={`flex-1 min-h-[36px] text-center text-xs font-bold rounded-lg transition-all cursor-pointer h-auto py-1.5 ${
                    priority === 'HIGH'
                      ? 'bg-primary text-primary-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  High 🔥
                </Button>
              </div>
            </div>
          </div>

          {/* Pin to Board CTA */}
          <Button
            type="submit"
            disabled={!description.trim() || isSubmitting}
            className="w-full py-3 min-h-[44px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            <Pin className="w-4 h-4 stroke-[2.2]" />
            <span>Pin to Household Board 📌</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default FastTaskCreatorDock;
