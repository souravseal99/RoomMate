import { useState } from 'react';
import { UtensilsCrossed, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import useAuth from '@/hooks/useAuth';

export function KitchenTableCard() {
  const [isAttending, setIsAttending] = useState(false);
  const { name } = useAuth();
  const chefName = name || 'Sourav';
  const chefInitial = chefName.charAt(0).toUpperCase();

  const handleToggleRSVP = () => {
    if (!isAttending) {
      setIsAttending(true);
      toast.success('RSVP confirmed! See you at 8:00 PM for Thai curry 🍲');
    } else {
      setIsAttending(false);
      toast.info('RSVP cancelled.');
    }
  };

  return (
    <Card
      aria-label="Commons & Kitchen Table Coordination"
      className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-xs space-y-3 select-none"
    >
      {/* Header */}
      <CardHeader className="p-0 flex flex-row items-center justify-between border-b border-border/60 pb-3 space-y-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <UtensilsCrossed className="w-4 h-4 stroke-[2.2]" />
          </div>
          <CardTitle className="text-xs font-semibold tracking-wider uppercase text-foreground font-mono">
            Tonight's Kitchen Table
          </CardTitle>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] font-mono text-muted-foreground bg-surface-container border border-border px-2 py-0.5 rounded"
        >
          {isAttending ? '4 RSVP\'d' : '3 RSVP\'d'}
        </Badge>
      </CardHeader>

      <CardContent className="p-0 space-y-3">
        {/* Chef & Meal Coordination Box */}
        <div className="p-3.5 rounded-xl bg-surface-container border border-border space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <Avatar className="w-7 h-7 rounded-lg bg-primary text-primary-foreground shrink-0 mt-0.5">
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-mono font-bold text-xs">
                  {chefInitial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-xs text-foreground tracking-tight">{chefName}</span>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 border-primary/20 text-primary font-mono"
                  >
                    Chef
                  </Badge>
                </div>
                <p className="text-xs text-foreground mt-1 leading-snug">
                  Thai curry w/ jasmine rice at <strong className="text-primary font-bold">8:00 PM</strong>.{' '}
                  <span className="text-muted-foreground">3 extra portions ready!</span>
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleToggleRSVP}
              className={`min-h-[44px] px-3.5 py-2 h-auto rounded-xl font-bold text-xs tracking-tight transition-all active:scale-95 shrink-0 cursor-pointer shadow-xs border-0 ${
                isAttending
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 border-b-2 border-primary-fixed-dim'
              }`}
            >
              {isAttending ? (
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Attending! 🍲</span>
                </span>
              ) : (
                <span>RSVP</span>
              )}
            </Button>
          </div>

          {/* Roommate Meal Presence Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-xs">
            <div className="p-2 bg-card rounded-lg border border-border">
              <p className="font-semibold text-foreground text-xs leading-tight">Sarah</p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">Fresh bread 7:30</p>
            </div>
            <div className="p-2 bg-card rounded-lg border border-border">
              <p className="font-semibold text-foreground text-xs leading-tight">Alex</p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">Library till 9</p>
            </div>
            <div className="p-2 bg-card rounded-lg border border-border">
              <p className="font-semibold text-foreground text-xs leading-tight">Leo</p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">Reading tea</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default KitchenTableCard;
