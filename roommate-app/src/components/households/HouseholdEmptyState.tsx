import { Home, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  onCreateClick: () => void;
  onJoinClick: () => void;
};

export default function HouseholdEmptyState({ onCreateClick, onJoinClick }: Props) {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center max-w-lg mx-auto my-auto bg-card border-2 border-border rounded-xl shadow-tactile animate-in fade-in zoom-in duration-500">
      <div className="w-16 h-16 rounded-full bg-primary-container/20 border-2 border-border flex items-center justify-center mb-4 text-primary">
        <Home className="w-8 h-8" />
      </div>

      <h3 className="text-2xl font-bold text-foreground mb-2">No Households Yet</h3>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        You are not part of any shared living space yet. Start fresh by setting up your own space,
        or enter an invite code from your roommates.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        <Button
          onClick={onCreateClick}
          className="w-full bg-primary-container hover:opacity-90 text-primary-foreground font-bold py-2.5 rounded active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Space
        </Button>
        <Button
          onClick={onJoinClick}
          variant="outline"
          className="w-full bg-surface hover:bg-surface-container-high border-border text-foreground font-bold py-2.5 rounded active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <Users className="w-4 h-4" />
          Join Existing
        </Button>
      </div>
    </div>
  );
}
