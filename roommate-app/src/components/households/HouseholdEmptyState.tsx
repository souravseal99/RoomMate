import { Home, Plus, Users, Sparkles, KeyRound } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Props = {
  onCreateClick: () => void;
  onJoinClick: () => void;
};

export default function HouseholdEmptyState({ onCreateClick, onJoinClick }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-2 shadow-xs">
          <Home className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Welcome to RoomMate
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
          To get started with chores, expense tracking, and shared inventory, you need to be part of at least one living space.
        </p>
      </div>

      {/* Two-Column Bento Cards for Onboarding */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Create Space Card */}
        <Card
          onClick={onCreateClick}
          className="bg-surface-container hover:bg-surface-container-high border-2 border-border hover:border-primary/50 rounded-2xl p-6 flex flex-col justify-between space-y-4 group cursor-pointer transition-all duration-200 shadow-md hover:-translate-y-1 select-none"
        >
          <CardContent className="p-0 flex flex-col justify-between h-full space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Create a Space</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-normal">
                  Set up a brand new household for your apartment, dorm, or flat and invite your roommates.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCreateClick();
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider min-h-[44px] h-auto rounded-xl shadow-xs cursor-pointer active:scale-98 flex items-center justify-center gap-2 border-b-2 border-primary-fixed-dim"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Space</span>
            </Button>
          </CardContent>
        </Card>

        {/* Join Space Card */}
        <Card
          onClick={onJoinClick}
          className="bg-surface-container hover:bg-surface-container-high border-2 border-border hover:border-primary/50 rounded-2xl p-6 flex flex-col justify-between space-y-4 group cursor-pointer transition-all duration-200 shadow-md hover:-translate-y-1 select-none"
        >
          <CardContent className="p-0 flex flex-col justify-between h-full space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-surface-container-highest text-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
                <KeyRound className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Join with Code</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-normal">
                  Already have an 8-character invite code from your flatmates? Join their active space instantly.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onJoinClick();
              }}
              className="w-full bg-surface hover:bg-surface-container-high border-border text-foreground font-bold text-xs uppercase tracking-wider min-h-[44px] h-auto rounded-xl shadow-xs cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Join Existing</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
