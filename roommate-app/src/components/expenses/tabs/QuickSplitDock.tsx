import { useState, useId, useEffect } from 'react';
import {
  Loader2,
  Plus,
  Users,
  Check,
  Calculator,
  SlidersHorizontal,
  ShoppingCart,
  Wifi,
  Home,
  Utensils,
  Package,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useCreateExpenseMutation } from '@/hooks/queries/useExpenseQueries';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { HouseholdMember } from '@/types/householdTypes';

interface QuickSplitDockProps {
  householdId: string;
  householdMembers: HouseholdMember[];
  currentUserId: string;
}

interface CategoryItem {
  icon: LucideIcon;
  label: string;
  key: string;
}

const CATEGORIES: CategoryItem[] = [
  { icon: ShoppingCart, label: 'Groceries', key: 'Groceries' },
  { icon: Wifi, label: 'Wi-Fi & Utility', key: 'Wi-Fi' },
  { icon: Home, label: 'Rent', key: 'Rent' },
  { icon: Utensils, label: 'Takeout', key: 'Takeout' },
  { icon: Package, label: 'Supplies', key: 'Supplies' },
  { icon: Sparkles, label: 'Cleaning', key: 'Cleaning' },
];

const QUICK_AMOUNTS = [15, 30, 50, 80];

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
    () =>
      householdMembers
        .map((m) => m.userId || m.user?.userId || m.householdMemberId)
        .filter(Boolean) as string[]
  );

  // Synchronize member selections when household members load or change
  useEffect(() => {
    if (householdMembers.length > 0) {
      setSelectedMemberIds((prev) => {
        const validIds = prev.filter((id) =>
          householdMembers.some((m) => (m.userId || m.user?.userId || m.householdMemberId) === id)
        );
        return validIds.length > 0
          ? validIds
          : (householdMembers
              .map((m) => m.userId || m.user?.userId || m.householdMemberId)
              .filter(Boolean) as string[]);
      });
    }
  }, [householdMembers]);

  const amountInputId = useId();
  const createExpenseMutation = useCreateExpenseMutation();

  const numAmount = parseFloat(amount) || 0;

  // Derive active split count
  const effectiveSplitMembers = splitAll
    ? householdMembers
    : householdMembers.filter((m) => {
        const id = m.userId || m.user?.userId || m.householdMemberId;
        return id && selectedMemberIds.includes(id);
      });

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

    const finalDescription = customDescription.trim() || `${selectedCategory} run`;

    const allMemberIds = householdMembers
      .map((m) => m.userId || m.user?.userId || m.householdMemberId)
      .filter(Boolean) as string[];

    const customMemberIds = effectiveSplitMembers
      .map((m) => m.userId || m.user?.userId || m.householdMemberId)
      .filter(Boolean) as string[];

    const sharedWithIds = splitAll
      ? allMemberIds
      : customMemberIds.length > 0
        ? customMemberIds
        : allMemberIds;

    const finalSharedWith = sharedWithIds.length > 0 ? sharedWithIds : [currentUserId];

    try {
      await createExpenseMutation.mutateAsync({
        householdId,
        paidById: currentUserId,
        amount: numAmount,
        description: finalDescription,
        sharedWith: finalSharedWith,
      });

      const isCurrentUserIncluded = finalSharedWith.includes(currentUserId);
      const otherMembersCount = isCurrentUserIncluded
        ? Math.max(0, finalSharedWith.length - 1)
        : finalSharedWith.length;
      const perPersonNum = numAmount / Math.max(1, finalSharedWith.length);
      const owedToYou = isCurrentUserIncluded ? numAmount - perPersonNum : numAmount;

      const netCreditText =
        otherMembersCount > 0
          ? ` • You are owed +$${owedToYou.toFixed(2)} ($${perPersonAmount} each from ${otherMembersCount} flatmate${otherMembersCount > 1 ? 's' : ''})`
          : '';

      toast.success(
        `Logged $${numAmount.toFixed(2)} split ${splitCount}-ways ($${perPersonAmount} each)${netCreditText} 🎉`
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
    <Card
      aria-label="1-Tap Instant Split Dock"
      className="bg-card rounded-2xl shadow-xs p-5 sm:p-6 border-border relative overflow-hidden flex flex-col gap-4 select-none"
    >
      {/* Subtle warm domestic craft top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-secondary" />

      {/* Header and Quick Picks */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/40">
        <div>
          <h2 className="font-display font-extrabold text-xl text-foreground">Log Shared Bill</h2>
          <p className="text-xs text-muted-foreground">
            Tap amount, pick category, and split across flatmates instantly.
          </p>
        </div>

        {/* Quick Amount Picks */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground font-semibold mr-1">Quick Picks:</span>
          {QUICK_AMOUNTS.map((val) => {
            const isSelected = parseFloat(amount) === val;
            return (
              <Button
                key={val}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => handleSelectQuickAmount(val)}
                className={`px-3 min-h-[38px] rounded-lg text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 h-auto py-1.5 ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-foreground border-transparent'
                }`}
              >
                ${val}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Unified 1-Tap Split Control Deck */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 bg-surface-container p-3 sm:p-4 rounded-xl">
        {/* Top/Left: Amount Input + Mobile/Tablet CTA */}
        <div className="flex items-center gap-2.5 w-full xl:w-auto">
          {/* Odometer Amount Input */}
          <div className="flex-1 xl:w-48 xl:flex-initial flex items-center bg-card px-3.5 py-2.5 rounded-lg border border-border shadow-inner">
            <span className="font-display text-xl text-primary font-bold mr-1">$</span>
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

          {/* Save & Split CTA on Mobile/Tablet (< xl) */}
          <Button
            type="button"
            onClick={handleSaveAndSplit}
            disabled={createExpenseMutation.isPending || numAmount <= 0}
            className="xl:hidden shrink-0 min-h-[44px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm rounded-xl shadow-sm border-b-2 border-primary/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 px-4 sm:px-6 py-2"
          >
            {createExpenseMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 stroke-[2.5]" />
            )}
            <span>Save & Split</span>
          </Button>
        </div>

        {/* Category Selector Pills - Full width scrollable on tablet/mobile, flex-1 on desktop */}
        <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth py-1">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key;
            const Icon = cat.icon;
            return (
              <Button
                key={cat.key}
                type="button"
                variant={isActive ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3 min-h-[40px] rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 h-auto py-2 shrink-0 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-card text-muted-foreground hover:text-foreground hover:bg-card/80 border-border/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{cat.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Save & Split CTA on Desktop (≥ xl) */}
        <Button
          type="button"
          onClick={handleSaveAndSplit}
          disabled={createExpenseMutation.isPending || numAmount <= 0}
          className="hidden xl:flex shrink-0 min-h-[44px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-xl shadow-sm border-b-2 border-primary/30 transition-all items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 px-6 py-2"
        >
          {createExpenseMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 stroke-[2.5]" />
          )}
          <span>Save & Split</span>
        </Button>
      </div>

      {/* Split Mode & Live Calculation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
        {/* Segmented Control for Split Mode */}
        <div className="inline-flex items-center p-1 bg-surface-container rounded-xl border border-border/40 gap-1 self-start sm:self-auto">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setSplitAll(true)}
            className={`px-3 min-h-[36px] rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 h-auto py-1.5 ${
              splitAll
                ? 'bg-card text-foreground font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Split Equally (All {householdMembers.length || 3})</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setSplitAll(false)}
            className={`px-3 min-h-[36px] rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 h-auto py-1.5 ${
              !splitAll
                ? 'bg-card text-foreground font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Custom Split</span>
          </Button>
        </div>

        {/* Real-time Math Output Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container border border-border/40 text-xs self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <Calculator className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>
              Split &nbsp;
              <span className="font-mono font-bold text-primary tabular-nums">{splitCount}</span>
              &nbsp; ways:
            </span>
          </div>
          <span className="font-mono font-bold text-primary tabular-nums">
            ${perPersonAmount} each
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
            const memberId = member.userId || member.user?.userId || member.householdMemberId;
            const isChecked = selectedMemberIds.includes(memberId);
            const initial = (member.user?.name?.[0] || 'U').toUpperCase();

            return (
              <Button
                key={memberId}
                type="button"
                variant={isChecked ? 'default' : 'outline'}
                onClick={() => handleToggleMember(memberId)}
                className={`px-3 min-h-[40px] rounded-full text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer h-auto py-1.5 ${
                  isChecked
                    ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                    : 'bg-surface-container border-border text-muted-foreground opacity-60 hover:opacity-100'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
                  {isChecked ? <Check className="w-3 h-3 stroke-[3]" /> : initial}
                </div>
                <span>{(member.user?.name || 'Roommate').split(' ')[0]}</span>
              </Button>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default QuickSplitDock;
