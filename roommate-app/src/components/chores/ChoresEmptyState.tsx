import { Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ChoresEmptyStateProps {
  onAddChore?: () => void;
  title?: string;
  description?: string;
}

export function ChoresEmptyState({
  onAddChore,
  title = 'All clean! No chores on your plate right now ✨',
  description = 'There are no active duties matching your filter. Relax or toss a new task on the whiteboard.',
}: ChoresEmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center min-h-[280px] p-8 bg-card rounded-2xl border-dashed border-2 border-border/70 text-center select-none shadow-none space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        <Sparkles className="h-6 w-6 stroke-[2.2]" />
      </div>
      <div>
        <h3 className="text-base sm:text-lg font-bold font-display text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">{description}</p>
      </div>
      {onAddChore && (
        <Button
          type="button"
          onClick={onAddChore}
          className="bg-primary hover:bg-primary/90 text-primary-foreground min-h-[44px] rounded-full font-bold px-6 shadow-xs active:scale-95 transition-all cursor-pointer mt-2"
        >
          + Add Chore
        </Button>
      )}
    </Card>
  );
}

export default ChoresEmptyState;
