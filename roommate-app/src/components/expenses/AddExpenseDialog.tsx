import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, UserCheck, Users, Sparkles, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createExpenseSchema,
  EXPENSE_CATEGORIES,
  type CreateExpenseFormInput,
} from '@/schemas/expenseSchemas';
import { useCreateExpenseMutation } from '@/hooks/queries/useExpenseQueries';
import { formatCurrency, getInitials } from '@/utils/utils';
import { toast } from 'sonner';
import type { HouseholdMember } from '@/types/householdTypes';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: string;
  householdMembers: HouseholdMember[];
  currentUserId: string | null;
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  householdId,
  householdMembers,
  currentUserId,
}: AddExpenseDialogProps) {
  const createExpenseMutation = useCreateExpenseMutation();

  const allMemberIds = householdMembers.map(
    (m) => m.userId || m.householdMemberId
  );

  const [isSplitEqually, setIsSplitEqually] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateExpenseFormInput>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      description: '',
      amount: undefined as any,
      paidById: currentUserId || allMemberIds[0] || '',
      sharedWith: allMemberIds,
      category: '',
    },
  });

  const watchedAmount = watch('amount') || 0;
  const watchedPaidById = watch('paidById');
  const watchedSharedWith = watch('sharedWith') || [];

  // Sync default payer and members when dialog opens or members load
  useEffect(() => {
    if (open) {
      const defaultPayer = currentUserId || allMemberIds[0] || '';
      setValue('paidById', defaultPayer);
      setValue('sharedWith', allMemberIds);
      setIsSplitEqually(true);
      setSelectedCategory('');
      reset({
        description: '',
        amount: undefined as any,
        paidById: defaultPayer,
        sharedWith: allMemberIds,
        category: '',
      });
    }
  }, [open, householdId, currentUserId]);

  const handleCategorySelect = (cat: (typeof EXPENSE_CATEGORIES)[number]) => {
    setSelectedCategory(cat.id);
    setValue('category', cat.id);
    const currentDesc = watch('description');
    if (!currentDesc || EXPENSE_CATEGORIES.some((c) => c.label === currentDesc)) {
      setValue('description', cat.label, { shouldValidate: true });
    }
  };

  const handleToggleMember = (memberId: string) => {
    let newShared = [...watchedSharedWith];
    if (newShared.includes(memberId)) {
      // Don't allow empty
      if (newShared.length > 1) {
        newShared = newShared.filter((id) => id !== memberId);
      } else {
        toast.error('At least 1 flatmate must be included in the split');
        return;
      }
    } else {
      newShared.push(memberId);
    }
    setValue('sharedWith', newShared, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateExpenseFormInput) => {
    if (!householdId) return;

    try {
      await createExpenseMutation.mutateAsync({
        description: data.description,
        amount: Number(data.amount),
        paidById: data.paidById,
        householdId: householdId,
        sharedWith: data.sharedWith,
        category: data.category,
      });

      toast.success(
        `Added ${formatCurrency(Number(data.amount))} ${data.description} (Split ${data.sharedWith.length} ways)`
      );
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to log expense:', error);
      toast.error(error?.response?.data?.message || 'Failed to log expense');
    }
  };

  const activeSplitCount = watchedSharedWith.length || 1;
  const perPersonShare = watchedAmount > 0 ? watchedAmount / activeSplitCount : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-foreground border-border max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/40 pb-3">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Log Shared Expense
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Amount Field (Large digits) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-primary" /> Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-lg font-bold text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
                className="pl-8 text-xl font-extrabold bg-surface-container-low border-input text-foreground h-12 focus-visible:ring-primary"
                autoFocus
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-destructive font-medium">{errors.amount.message}</p>
            )}
          </div>

          {/* Category Preset Chips */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Quick Categories
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {EXPENSE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium flex items-center gap-1 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-surface-container text-foreground border-border hover:bg-surface-container-high'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Description
            </Label>
            <Input
              placeholder="e.g. Grocery run, Pizza night, Electricity bill"
              {...register('description')}
              className="bg-surface-container-low border-input text-foreground text-sm"
            />
            {errors.description && (
              <p className="text-xs text-destructive font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Paid By Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-primary" /> Paid By
            </Label>
            <Select
              value={watchedPaidById}
              onValueChange={(val) => setValue('paidById', val, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full bg-surface-container-low border-input text-sm">
                <SelectValue placeholder="Select payer" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {householdMembers.map((member) => {
                  const mId = member.userId || member.householdMemberId;
                  const isCurrent = mId === currentUserId;
                  return (
                    <SelectItem key={mId} value={mId} className="text-xs cursor-pointer">
                      {member.user?.name || 'Roommate'} {isCurrent ? '(You)' : ''}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.paidById && (
              <p className="text-xs text-destructive font-medium">{errors.paidById.message}</p>
            )}
          </div>

          {/* Split Mode & Member Selection */}
          <div className="space-y-2 pt-1 border-t border-border/40">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" /> Split Breakdown
              </Label>
              <button
                type="button"
                onClick={() => {
                  if (!isSplitEqually) {
                    setValue('sharedWith', allMemberIds);
                  }
                  setIsSplitEqually((prev) => !prev);
                }}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                {isSplitEqually ? 'Customize Split' : 'Split with Everyone'}
              </button>
            </div>

            {/* Split preview indicator */}
            <div className="p-2.5 bg-surface-container rounded-lg flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">
                Split {activeSplitCount} ways
              </span>
              <span className="font-bold text-primary">
                {perPersonShare > 0 ? `${formatCurrency(perPersonShare)} / person` : '—'}
              </span>
            </div>

            {/* Member Checkbox Pills if Custom Split */}
            {!isSplitEqually && (
              <div className="flex flex-wrap gap-2 pt-1">
                {householdMembers.map((member) => {
                  const mId = member.userId || member.householdMemberId;
                  const name = member.user?.name || 'Roommate';
                  const isSelected = watchedSharedWith.includes(mId);

                  return (
                    <button
                      key={mId}
                      type="button"
                      onClick={() => handleToggleMember(mId)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-surface-container text-muted-foreground border-border hover:text-foreground'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-surface text-[10px] font-bold flex items-center justify-center border text-foreground">
                        {getInitials(name)}
                      </span>
                      <span>{name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-border/40 flex-row gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border text-foreground font-semibold text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createExpenseMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider px-5 cursor-pointer shadow-xs active:scale-98"
            >
              {createExpenseMutation.isPending ? 'Saving...' : 'Save Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
