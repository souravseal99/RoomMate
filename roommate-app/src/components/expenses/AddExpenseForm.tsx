"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { HouseholdOptions } from "@/types/hosueholdTypes";
import type { HouseholdMemberOptions } from "@/types/householdMemberTypes";
import expenseApi from "@/api/expenseApi";
import { Button } from "../ui/button";

type Props = {
  household: HouseholdOptions;
  members: HouseholdMemberOptions[];
};

export default function AddExpenseForm({ household, members }: Props) {
  const ExpenseApi = useMemo(expenseApi, []);

  //FIXME - fetch members from the selected household
  members = useMemo(
    () => [
      {
        key: "9389284924",
        value: "Jhon",
        userId: "9389284924",
        role: "MEMBER" as const,
      },
      { 
        key: "7294792479", 
        value: "Jane",
        userId: "7294792479",
        role: "ADMIN" as const,
      },
    ],
    []
  );

  const [formData, setFormData] = useState({
    householdId: household.key,
    description: "",
    amount: 0,
    paidById: "",
    sharedWith: [] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const resp = await ExpenseApi.create(formData);

    console.log("Add Expense resp: ", resp);
  };

  return (
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
        <Label htmlFor="paidById">Paid By (memberId)</Label>
        <Input
          id="paidById"
          name="paidById"
          placeholder="Enter member ID"
          value={formData.paidById}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label>Shared With</Label>
        {/* Selected members */}
        <div className="flex flex-wrap gap-2">
          {formData.sharedWith.map((id) => {
            const member = members.find((m) => m.key === id);
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
              {members.map((member) => (
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
  );
}
