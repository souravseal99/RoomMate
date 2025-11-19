import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import AddExpenseForm from "./AddExpenseForm";
import SelectHouseholdAlert from "./SelectHouseholdAlert";
import type { HouseholdOptions } from "@/types/householdTypes";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { }, [selectedHousehold]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Add Expense</Button>
      </SheetTrigger>
      <SheetContent onCloseAutoFocus={getExpenses}>
        <SheetHeader>
          <SheetTitle>Add Expenses</SheetTitle>
          <SheetDescription>
            Add your expense details here for the household{" "}
            {selectedHousehold?.value}.
          </SheetDescription>
        </SheetHeader>

        {selectedHousehold?.key ? (
          <AddExpenseForm
            householdMemberOptions={householdMemberOptions}
            getExpenses={getExpenses}
            setIsSubmitting={setIsSubmitting}
          />
        ) : (
          <SelectHouseholdAlert />
        )}

        <SheetFooter>
          <Button
            form="add-expense-form"
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
