import { useState, useId } from 'react';
import { Loader2, Plus, Users, Check } from 'lucide-react';
import { useCreateExpenseMutation } from '@/hooks/queries/useExpenseQueries';
import { toast } from 'sonner';
import type { HouseholdMember } from '@/types/householdTypes';

interface QuickSplitDockProps {
  householdId: string;
  householdMembers: HouseholdMember[];
  currentUserId: string;
}

const CATEGORIES = [
  { emoji: '🛒', label: 'Groceries', key: 'Groceries' },
  { emoji: '⚡', label: 'Wi-Fi & Utility', key: 'Wi-Fi' },
  { emoji: '🏠', label: 'Rent', key: 'Rent' },
  { emoji: '🍕', label: 'Takeout', key: 'Takeout' },
  { emoji: '🧻', label: 'Supplies', key: 'Supplies' },
  { emoji: '🧼', label: 'Cleaning', key: 'Cleaning' },
];

const QUICK_AMOUNTS = [15, 30, 48, 80];

export function QuickSplitDock({
  householdId,
  householdMembers,
  currentUserId,
}: QuickSplitDockProps) {
  const [amount, setAmount] = useState<string>('48.00');
  const [selectedCategory, setSelectedCategory] = useState<string>('Groceries');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [splitAll, setSplitAll] = useState(true);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    householdMembers.map((m) => m.userId)
  );

  const amountInputId = useId();
  const createExpenseMutation = useCreateExpenseMutation();

  const numAmount = parseFloat(amount) || 0;

  // Derive active split count
  const effectiveSplitMembers = splitAll
    ? householdMembers
    : householdMembers.filter((m) => selectedMemberIds.includes(m.userId));

  const splitCount = Math.max(1, effectiveSplitMembers.length);
  const perPersonAmount = (numAmount / splitCount).toFixed(2);

  const handleSelectQuickAmount = (val: number) => {
    setAmount(val.toFixed(2));
  };

  const handleToggleMember = (userId: string) => {
    if (selectedMemberIds.includes(userId)) {
      if (selectedMemberIds.length > 1) {
        setSelectedMemberIds(selectedMemberIds.filter((id) => id !== userId));
      } else {
        toast.warning('At least one flatmate must be included in the split');
      }
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const handleSaveAndSplit = async () => {
    if (!householdId) {
      toast.error('No household selected');
      return;
    }
    if (numAmount <= 0) {
      toast.error('Please enter an amount greater than zero');
      return;
    }

    const finalDescription =
      customDescription.trim() || `${selectedCategory} run`;

    const sharedWithIds = splitAll
      ? householdMembers.map((m) => m.userId)
      : effectiveSplitMembers.map((m) => m.userId);

    try {
      await createExpenseMutation.mutateAsync({
        householdId,
        paidById: currentUserId,
        amount: numAmount,
        description: finalDescription,
        sharedWith: sharedWithIds,
      });

      toast.success(
        `Logged $${numAmount.toFixed(2)} split ${splitCount}-ways ($${perPersonAmount} each) 🎉`
      );
      // Reset form
      setCustomDescription('');
      setAmount('48.00');
    } catch (err: any) {
      console.error('Failed to log quick split:', err);
      toast.error(err?.message || 'Failed to save expense');
    }
  };

  return (
    <section
      aria-label="1-Tap Instant Split Dock"
      className="bg-card rounded-2xl shadow-xs p-5 sm:p-6 border border-border relative overflow-hidden flex flex-col gap-4 select-none"
    >
      {/* Subtle warm domestic craft top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-secondary" />

      {/* Header and Quick Picks */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-1 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
              INSTANT SPLIT
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="font-mono text-[10px] text-muted-foreground">
              FAST LOG
            </span>
          </div>
          <h2 className="font-display font-extrabold text-xl text-foreground mt-0.5">
            Log Shared Bill
          </h2>
          <p className="text-xs text-muted-foreground">
            Tap amount, pick category, and split across flatmates instantly.
          </p>
        </div>

        {/* Quick Amount Picks */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground font-semibold mr-1">
            Quick Picks:
          </span>
          {QUICK_AMOUNTS.map((val) => {
            const isSelected = parseFloat(amount) === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => handleSelectQuickAmount(val)}
                className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-foreground'
                }`}
              >
                ${val}
              </button>
            );
          })}
        </div>
      </div>

      {/* Unified 1-Tap Split Control Deck */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-surface-container p-3 sm:p-4 rounded-xl">
        {/* Odometer Amount Input */}
        <div className="md:col-span-3 flex items-center bg-card px-3.5 py-2.5 rounded-lg border border-border shadow-inner">
          <span className="font-display text-xl text-primary font-bold mr-1">
            $
          </span>
          <label htmlFor={amountInputId} className="sr-only">
            Split Amount
          </label>
          <input
            id={amountInputId}
            type="number"
            step="0.50"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent font-mono font-extrabold text-xl text-foreground focus:outline-none tabular-nums"
            placeholder="0.00"
          />
        </div>

        {/* Category Selector Pills */}
        <div className="md:col-span-5 flex items-center gap-1.5 overflow-x-auto py-1">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-card text-muted-foreground hover:text-foreground hover:bg-card/80 border border-border/50'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Save & Split CTA */}
        <div className="md:col-span-4 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveAndSplit}
            disabled={createExpenseMutation.isPending || numAmount <= 0}
            className="w-full min-h-[44px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-sm border-b-2 border-primary-fixed-dim transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {createExpenseMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 stroke-[2.5]" />
            )}
            <span>Save & Split</span>
          </button>
        </div>
      </div>

      {/* Split Mode & Live Calculation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSplitAll(true)}
            className={`px-3 py-1.5 min-h-[38px] rounded-lg font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              splitAll
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-muted-foreground hover:bg-surface-container'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Split Equally (All {householdMembers.length || 4})</span>
          </button>

          <button
            type="button"
            onClick={() => setSplitAll(false)}
            className={`px-3 py-1.5 min-h-[38px] rounded-lg font-semibold cursor-pointer transition-all ${
              !splitAll
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-muted-foreground hover:bg-surface-container'
            }`}
          >
            <span>Custom Split</span>
          </button>
        </div>

        {/* Real-time Math Output */}
        <div className="font-mono text-xs font-bold text-foreground bg-surface-container px-3 py-1.5 rounded-lg border border-border/40 flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-muted-foreground font-sans font-normal">
            Live Math:
          </span>
          <span className="text-primary tabular-nums">
            Split {splitCount} ways • ${perPersonAmount} each
          </span>
        </div>
      </div>

      {/* Custom Avatar Selector (when not splitAll) */}
      {!splitAll && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/40">
          <span className="text-[11px] text-muted-foreground font-semibold mr-1">
            Include flatmates:
          </span>
          {householdMembers.map((member) => {
            const isChecked = selectedMemberIds.includes(member.userId);
            const initial = (member.user.name[0] || 'U').toUpperCase();

            return (
              <button
                key={member.userId}
                type="button"
                onClick={() => handleToggleMember(member.userId)}
                className={`px-3 py-1.5 min-h-[40px] rounded-full text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                    : 'bg-surface-container border-border text-muted-foreground opacity-60 hover:opacity-100'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
                  {isChecked ? <Check className="w-3 h-3 stroke-[3]" /> : initial}
                </div>
                <span>{member.user.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
