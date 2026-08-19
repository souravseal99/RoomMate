'use client';

import { useEffect, useMemo, useState, type FormEvent, type ChangeEvent } from 'react';
import { X, DollarSign, FileText, UserCheck, Users } from 'lucide-react';
import expenseApi from '@/api/expenseApi';
import useHousehold from '@/hooks/useHousehold';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PayerDropdown } from '@/components/expenses/PaidByDropdown';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Props = {
  householdMemberOptions: { key: string; value: string }[];
  getExpenses: () => void;
  setIsSubmitting?: (v: boolean) => void;
  onSuccess?: () => void;
};

export default function AddExpenseForm({
  householdMemberOptions,
  getExpenses,
  setIsSubmitting,
  onSuccess,
}: Props) {
  const { selectedHousehold } = useHousehold();
  const ExpenseApi = useMemo(expenseApi, []);

  const [formData, setFormData] = useState({
    householdId: selectedHousehold?.key,
    description: '',
    amount: 0,
    paidById: '',
    sharedWith: [] as string[],
  });

  const [localSubmitting, setLocalSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleAddShared = (memberId: string) => {
    if (!formData.sharedWith.includes(memberId)) {
      setFormData((prev) => ({
        ...prev,
        sharedWith: [...prev.sharedWith, memberId],
      }));
    }
  };

  const handleRemoveShared = (memberId: string) => {
    setFormData((prev) => ({
      ...prev,
      sharedWith: prev.sharedWith.filter((id) => id !== memberId),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (localSubmitting) return;
    setLocalSubmitting(true);
    setIsSubmitting?.(true);

    try {
      const resp = await ExpenseApi.create({
        ...formData,
        householdId: selectedHousehold?.key,
      });

      if (resp && (resp.status === 201 || resp.status === 200)) {
        toast.success('Expense added successfully!', {
          position: 'top-center',
        });
        getExpenses();
        onSuccess?.();
      } else {
        toast.error('Failed to add expense. Please try again.', {
          position: 'top-center',
        });
      }
    } catch (error: unknown) {
      toast.error('Failed to add expense. Please try again.', {
        position: 'top-center',
      });
      console.error('Error adding expense:', error);
    } finally {
      setLocalSubmitting(false);
      setIsSubmitting?.(false);
    }
  };

  const handleSelectPayer = (payerId: string) => {
    setFormData((prev) => ({ ...prev, paidById: payerId }));
  };

  return (
    <>
      {selectedHousehold?.key ? (
        <form id="add-expense-form" onSubmit={handleSubmit} className="grid gap-5 py-2">
          {/* Description Input */}
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary-container" /> Description
            </Label>
            <Input
              id="description"
              name="description"
              placeholder="Dinner, groceries, utilities..."
              value={formData.description}
              onChange={handleChange}
              className="bg-background border-input text-foreground focus:border-primary-container"
              required
            />
          </div>

          {/* Amount Input */}
          <div className="grid gap-2">
            <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-primary-container" /> Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-bold">$</span>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount || ''}
                onChange={handleChange}
                className="pl-7 bg-background border-input text-foreground font-semibold focus:border-primary-container"
                required
              />
            </div>
          </div>

          {/* Paid By Dropdown */}
          <div className="grid gap-2">
            <Label htmlFor="paidById" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-primary-container" /> Paid By
            </Label>
            <PayerDropdown
              onSelectPayer={handleSelectPayer}
              householdMemberOptions={householdMemberOptions}
              selectedPayer={formData.paidById}
            />
          </div>

          {/* Shared With Multi-Select */}
          <div className="grid gap-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary-container" /> Shared With
            </Label>

            {/* Selected Member Badges */}
            <div className="flex flex-wrap gap-2 mb-1 min-h-[32px] p-2 bg-background border border-border/60 rounded-md">
              {formData.sharedWith.length > 0 ? (
                formData.sharedWith.map((id) => {
                  const member = householdMemberOptions.find((m) => m.key === id);
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="bg-primary-container/10 text-primary-container border border-primary-container/20 px-2.5 py-1 text-xs font-medium flex items-center gap-1.5"
                    >
                      <span>{member?.value ?? id}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveShared(id)}
                        className="hover:text-destructive transition-colors cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  Select members below to split this expense...
                </span>
              )}
            </div>

            {/* Member Selector Command Dropdown */}
            <div className="bg-card border border-border rounded-md overflow-hidden">
              <Command className="bg-transparent">
                <CommandInput placeholder="Search household members..." className="text-xs h-9" />
                <CommandList className="max-h-36">
                  <CommandEmpty className="py-2 text-xs text-center text-muted-foreground">
                    No members found.
                  </CommandEmpty>
                  <CommandGroup>
                    {householdMemberOptions.map((member) => (
                      <CommandItem
                        key={member.key}
                        value={member.value}
                        onSelect={() => handleAddShared(member.key)}
                        className="text-xs cursor-pointer hover:bg-background"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{member.value}</span>
                          {formData.sharedWith.includes(member.key) && (
                            <span className="text-[10px] text-primary-container font-bold">Selected</span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 text-center text-xs text-muted-foreground italic">
          Please select a household to add expenses.
        </div>
      )}
    </>
  );
}
