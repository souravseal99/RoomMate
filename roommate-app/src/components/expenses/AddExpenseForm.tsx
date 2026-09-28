import { useMemo, useState, type FormEvent, type ChangeEvent } from 'react';
import { DollarSign, FileText, UserCheck, Users, Calculator, Check } from 'lucide-react';
import expenseApi from '@/api/expenseApi';
import useHousehold from '@/hooks/useHousehold';
import { getCurrentUserId } from '@/utils/jwt';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PayerDropdown } from '@/components/expenses/PaidByDropdown';
import { toast } from 'sonner';

type Props = {
  householdMemberOptions: { key: string; value: string }[];
  getExpenses: () => void;
  setIsSubmitting?: (v: boolean) => void;
  onSuccess?: () => void;
};

const CATEGORY_PRESETS = [
  { label: 'Groceries', icon: '🛒' },
  { label: 'Utilities', icon: '⚡' },
  { label: 'Rent', icon: '🏠' },
  { label: 'Takeout', icon: '🍕' },
  { label: 'Supplies', icon: '🧻' },
  { label: 'Cleaning', icon: '🧼' },
];

export default function AddExpenseForm({
  householdMemberOptions,
  getExpenses,
  setIsSubmitting,
  onSuccess,
}: Props) {
  const { selectedHousehold } = useHousehold();
  const currentUserId = useMemo(() => getCurrentUserId(), []);
  const ExpenseApi = useMemo(expenseApi, []);

  // Default payer to current user if found in options
  const defaultPayer =
    householdMemberOptions.find((m) => m.key === currentUserId)?.key ||
    householdMemberOptions[0]?.key ||
    '';

  // Default shared with to all members
  const allMemberKeys = useMemo(
    () => householdMemberOptions.map((m) => m.key),
    [householdMemberOptions]
  );

  const [formData, setFormData] = useState({
    householdId: selectedHousehold?.key,
    description: '',
    amount: 0,
    paidById: defaultPayer,
    sharedWith: allMemberKeys,
  });

  const [splitMode, setSplitMode] = useState<'ALL' | 'CUSTOM'>('ALL');
  const [localSubmitting, setLocalSubmitting] = useState(false);

  // Live split calculation
  const splitCount = formData.sharedWith.length;
  const splitAmount = splitCount > 0 ? (formData.amount / splitCount).toFixed(2) : '0.00';

  const handlePresetClick = (categoryLabel: string) => {
    setFormData((prev) => ({
      ...prev,
      description: categoryLabel,
    }));
  };

  const handleSplitModeChange = (mode: 'ALL' | 'CUSTOM') => {
    setSplitMode(mode);
    if (mode === 'ALL') {
      setFormData((prev) => ({
        ...prev,
        sharedWith: allMemberKeys,
      }));
    }
  };

  const toggleMember = (memberId: string) => {
    setFormData((prev) => {
      const exists = prev.sharedWith.includes(memberId);
      const nextShared = exists
        ? prev.sharedWith.filter((id) => id !== memberId)
        : [...prev.sharedWith, memberId];
      return { ...prev, sharedWith: nextShared };
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleSelectPayer = (payerId: string) => {
    setFormData((prev) => ({ ...prev, paidById: payerId }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (localSubmitting) return;

    if (!formData.description.trim()) {
      toast.error('Please enter an expense description');
      return;
    }
    if (formData.amount <= 0) {
      toast.error('Please enter a valid amount greater than $0');
      return;
    }
    if (formData.sharedWith.length === 0) {
      toast.error('Please split with at least one flatmate');
      return;
    }

    setLocalSubmitting(true);
    setIsSubmitting?.(true);

    try {
      const resp = await ExpenseApi.create({
        ...formData,
        householdId: selectedHousehold?.key || '',
      });

      if (resp && (resp.status === 201 || resp.status === 200)) {
        toast.success('Expense recorded successfully! 🎉');
        getExpenses();
        onSuccess?.();
      } else {
        toast.error('Failed to add expense. Please try again.');
      }
    } catch (error: unknown) {
      toast.error('Failed to add expense. Please try again.');
      console.error('Error adding expense:', error);
    } finally {
      setLocalSubmitting(false);
      setIsSubmitting?.(false);
    }
  };

  return (
    <>
      {selectedHousehold?.key ? (
        <form id="add-expense-form" onSubmit={handleSubmit} className="grid gap-4 py-1 select-none">
          {/* Category Preset Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Quick Preset Category
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_PRESETS.map((preset) => {
                const isSelected = formData.description === preset.label;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePresetClick(preset.label)}
                    className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 border ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-card hover:bg-surface-container border-border/80 text-foreground'
                    }`}
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description Input */}
          <div className="grid gap-1.5">
            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 font-mono">
              <FileText className="w-3.5 h-3.5 text-primary" /> Description
            </Label>
            <Input
              id="description"
              name="description"
              placeholder="e.g. Weekly Trader Joe's run, Wifi bill..."
              value={formData.description}
              onChange={handleChange}
              className="bg-card border-input text-foreground focus:border-primary min-h-[44px] rounded-xl"
              required
            />
          </div>

          {/* Amount Input */}
          <div className="grid gap-1.5">
            <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 font-mono">
              <DollarSign className="w-3.5 h-3.5 text-primary" /> Total Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-muted-foreground text-sm font-bold font-mono">$</span>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount || ''}
                onChange={handleChange}
                className="pl-8 bg-card border-input text-foreground font-bold font-mono text-base focus:border-primary min-h-[44px] rounded-xl tabular-nums"
                required
              />
            </div>
          </div>

          {/* Live Split Math Indicator */}
          {formData.amount > 0 && splitCount > 0 && (
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">
                  Split {splitCount} {splitCount === 1 ? 'way' : 'ways'}:
                </span>
              </div>
              <span className="font-mono font-extrabold text-sm text-primary tabular-nums">
                ${splitAmount} <span className="text-[10px] text-muted-foreground font-normal">/ person</span>
              </span>
            </div>
          )}

          {/* Paid By Dropdown */}
          <div className="grid gap-1.5">
            <Label htmlFor="paidById" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 font-mono">
              <UserCheck className="w-3.5 h-3.5 text-primary" /> Paid By
            </Label>
            <PayerDropdown
              onSelectPayer={handleSelectPayer}
              householdMemberOptions={householdMemberOptions}
              selectedPayer={formData.paidById}
            />
          </div>

          {/* Split Mode Selector */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 font-mono">
                <Users className="w-3.5 h-3.5 text-primary" /> Split With
              </Label>
              <div className="flex rounded-lg bg-surface-container p-0.5 border border-border/50 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => handleSplitModeChange('ALL')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    splitMode === 'ALL'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All Roomies
                </button>
                <button
                  type="button"
                  onClick={() => handleSplitModeChange('CUSTOM')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    splitMode === 'CUSTOM'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {/* Roommate Checklist */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {householdMemberOptions.map((member) => {
                const isChecked = formData.sharedWith.includes(member.key);
                return (
                  <button
                    key={member.key}
                    type="button"
                    onClick={() => toggleMember(member.key)}
                    className={`min-h-[44px] p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer active:scale-95 ${
                      isChecked
                        ? 'bg-primary/10 border-primary/40 text-foreground'
                        : 'bg-card border-border/60 text-muted-foreground hover:bg-surface-container'
                    }`}
                  >
                    <span className="text-xs font-semibold truncate">{member.value}</span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                        isChecked
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-border'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      ) : (
        <div className="p-6 text-center text-xs text-muted-foreground italic">
          Please select a household space first.
        </div>
      )}
    </>
  );
}
