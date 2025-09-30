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
import type { HouseholdOptions } from "@/types/hosueholdTypes";
import { useEffect } from "react";

type Props = {
  selectedHousehold: HouseholdOptions | null;
  getExpenses: () => void;
};

export default function AddExpenseSheet({
  selectedHousehold,
  getExpenses,
}: Props) {
  useEffect(() => {}, [selectedHousehold]);

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
          <AddExpenseForm household={selectedHousehold} members={[]} />
        ) : (
          <SelectHouseholdAlert />
        )}

        <SheetFooter>
          <Button form="add-expense-form" type="submit">
            Save changes
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
