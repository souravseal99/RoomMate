"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { X } from "lucide-react";
import expenseApi from "@/api/expenseApi";
import useHousehold from "@/hooks/useHousehold";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PayerDropdown } from "@/components/expenses/PaidByDropdown";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  householdMemberOptions: { key: string; value: string }[];
  getExpenses: () => void;
};

export default function AddExpenseForm({
  householdMemberOptions,
  getExpenses,
}: Props) {
  const { selectedHousehold } = useHousehold();

  const ExpenseApi = useMemo(expenseApi, []);

  const [formData, setFormData] = useState({
    householdId: selectedHousehold?.key,
    description: "",
    amount: 0,
    paidById: "",
    sharedWith: [] as string[],
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
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

    try {
      const resp = await ExpenseApi.create(formData).then((response) => {
        getExpenses();
        return response;
      });
      if (resp && resp.status == 200) {
        toast.success("Expense added successfully!", {
          position: "top-center",
        });
      } else {
        // Handle unexpected or failed response
        toast.error("Failed to add expense. Please try again.", {
          position: "top-center",
        });
        console.error("Unexpected response:", resp);
      }
    } catch (error: unknown) {
      toast.error("Failed to add expense. Please try again.", {
        position: "top-center",
      });
      console.error("Error adding expense:", error);
    }
  };

  const handleSelectPayer = (payerId: string) => {
    setFormData((prev) => ({ ...prev, paidById: payerId }));
  };

  useEffect(() => {}, [householdMemberOptions]);

  return (
    <>
      {selectedHousehold?.key ? (
        <form
          id="add-expense-form"
          onSubmit={handleSubmit}
          className="grid gap-6 px-4 py-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="Dinner, groceries, etc."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              placeholder="0"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="paidById">Paid By</Label>
            <PayerDropdown
              onSelectPayer={handleSelectPayer}
              householdMemberOptions={householdMemberOptions}
              selectedPayer={formData.paidById}
            />
          </div>

          <div className="grid gap-2">
            <Label>Shared With</Label>
            {/* Selected members */}
            <div className="flex flex-wrap gap-2">
              {formData.sharedWith.map((id) => {
                const member = householdMemberOptions.find((m) => m.key === id);
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="flex items-center gap-1 w-fit"
                  >
                    <span>{member?.value ?? id}</span>

                    <Button
                      className="ml-1 w-fit hover:text-amber-50 hover:bg-primary"
                      variant={"ghost"}
                      onClick={() => handleRemoveShared(id)}
                    >
                      <X className="h-3 w-3 cursor-pointer" />
                    </Button>
                  </Badge>
                );
              })}
            </div>

            {/* Multi-select dropdown */}
            <Command>
              <CommandInput placeholder="Search members..." />
              <CommandList>
                <CommandEmpty>No member found.</CommandEmpty>
                <CommandGroup>
                  {householdMemberOptions.map((member) => (
                    <CommandItem
                      key={member.key}
                      value={member.value}
                      onSelect={() => handleAddShared(member.key)}
                    >
                      {member.value}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </form>
      ) : (
        <div>Please select a household to add expenses.</div>
      )}
    </>
  );
}
