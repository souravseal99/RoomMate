import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import AddExpenseForm from './AddExpenseForm';
import SelectHouseholdAlert from './SelectHouseholdAlert';
import type { HouseholdOptions } from '@/types/householdTypes';
import { Plus, Receipt } from 'lucide-react';

type Props = {
  householdMemberOptions: { key: string; value: string }[];
  selectedHousehold: HouseholdOptions | null;
  getExpenses: () => void;
};

export default function AddExpenseSheet({
  selectedHousehold,
  householdMemberOptions,
  getExpenses,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="bg-primary-container hover:bg-primary-container/90 text-primary-foreground text-xs uppercase tracking-wider font-bold px-4 py-2 rounded-lg cursor-pointer transition-opacity flex items-center gap-1.5 shadow-xs">
          <Plus className="w-4 h-4" /> Add Expense
        </Button>
      </SheetTrigger>
      <SheetContent
        className="bg-card text-foreground border-l border-border w-full sm:max-w-md p-6 flex flex-col justify-between overflow-y-auto"
        onCloseAutoFocus={getExpenses}
      >
        <div className="space-y-4">
          <SheetHeader className="border-b border-border/40 pb-4">
            <SheetTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Receipt className="w-5 h-5 text-primary-container" />
              Add Household Expense
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Record a new shared expense for{' '}
              <span className="font-semibold text-foreground">{selectedHousehold?.value ?? 'your household'}</span>.
            </SheetDescription>
          </SheetHeader>

          {selectedHousehold?.key ? (
            <AddExpenseForm
              householdMemberOptions={householdMemberOptions}
              getExpenses={getExpenses}
              setIsSubmitting={setIsSubmitting}
              onSuccess={() => setIsOpen(false)}
            />
          ) : (
            <SelectHouseholdAlert />
          )}
        </div>

        <SheetFooter className="border-t border-border/40 pt-4 flex-row gap-3 justify-end sm:justify-end">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-border text-foreground font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            form="add-expense-form"
            type="submit"
            disabled={isSubmitting || !selectedHousehold?.key}
            className="bg-primary-container hover:bg-primary-container/90 text-primary-foreground font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            {isSubmitting ? 'Saving...' : 'Save Expense'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
