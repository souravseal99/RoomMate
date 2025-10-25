"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import AddExpenseForm from "./AddExpenseForm";
import SelectHouseholdAlert from "./SelectHouseholdAlert";
import type { HouseholdOptions } from "@/types/hosueholdTypes";
import { PlusCircle, Save, X } from "lucide-react";

type Props = {
  householdMemberOptions: { key: string; value: string }[];
  selectedHousehold: HouseholdOptions | null;
  getExpenses: () => void;
};

export default function AddExpenseDialog({
  selectedHousehold,
  householdMemberOptions,
  getExpenses,
}: Props) {
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    await getExpenses();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="flex items-center gap-2 font-medium shadow-sm hover:shadow-md transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Add Expense
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primary" />
            Add Expenses
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add expense details for the household{" "}
            <span className="font-medium text-foreground">
              {selectedHousehold?.value ?? "—"}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="space-y-4">
          {selectedHousehold?.key ? (
            <AddExpenseForm
              householdMemberOptions={householdMemberOptions}
              getExpenses={handleSave}
            />
          ) : (
            <SelectHouseholdAlert />
          )}
        </div>

        <Separator className="my-4" />

        <DialogFooter className="flex justify-end gap-2 pt-2">
          <Button
            form="add-expense-form"
            type="submit"
            className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>

          <DialogClose asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
