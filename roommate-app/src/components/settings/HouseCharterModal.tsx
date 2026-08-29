import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookOpen, Moon, Utensils, Users, Receipt, CheckCircle } from 'lucide-react';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function HouseCharterModal({ open, onOpenChange }: Props) {
  const rules = [
    {
      icon: <Moon className="w-4 h-4 text-indigo-500" />,
      title: 'Quiet Hours & Focus Time',
      description: 'Quiet hours run from 11:00 PM to 7:00 AM on weekdays. Keep communal areas calm and use headphones for late entertainment.',
    },
    {
      icon: <Utensils className="w-4 h-4 text-amber-500" />,
      title: 'Kitchen Cleanliness & Dishes',
      description: 'Clean pots, pans, and dining ware within 2 hours of cooking. Wipe down stove tops and toss out expired pantry items weekly.',
    },
    {
      icon: <Users className="w-4 h-4 text-primary" />,
      title: 'Overnight Guests & Notice',
      description: 'Give flatmates at least 24 hours heads up in the group chat before hosting overnight guests or dinner visitors.',
    },
    {
      icon: <Receipt className="w-4 h-4 text-emerald-600" />,
      title: 'Fair Expense Settlements',
      description: 'Log shared utility and grocery receipts promptly. Settle up pending balances by the 1st of every month without reminders.',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-foreground border-border max-w-lg p-6 rounded-2xl space-y-4">
        <DialogHeader className="pb-3 border-b border-border/60">
          <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            House Charter &amp; Living Etiquette
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            Standard living guidelines to keep your shared home harmonious and drama-free.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="bg-surface-container/50 p-3.5 rounded-xl border border-border/60 space-y-1"
            >
              <div className="flex items-center gap-2">
                {rule.icon}
                <h4 className="text-xs sm:text-sm font-extrabold text-foreground">
                  {rule.title}
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground pl-6">
                {rule.description}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs px-5"
          >
            <CheckCircle className="w-4 h-4 mr-1.5" />
            Understood
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
