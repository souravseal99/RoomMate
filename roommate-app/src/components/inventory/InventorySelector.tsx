"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { InventoryItem } from "@/types/inventoryTypes";
import { dummyInventoryDetails } from "@/pages/inventory/inventoryDummyData";
import useInventory from "@/hooks/useInventory";

export function InventorySelector() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const { setSelectedItem } = useInventory();

  function getInventoryOptions(
    inventory: InventoryItem[]
  ): { value: string; label: string }[] {
    return inventory.map((item) => ({
      value: item.name.toLowerCase().replace(/\s+/g, "_"),
      label: item.name,
    }));
  }

  React.useEffect(() => {
    setSelectedItem(
      dummyInventoryDetails.filter(
        (item) => item.name.toLowerCase().replace(/\s+/g, "_") === value
      )[0] || null
    );
  }, [value]);

  const items = getInventoryOptions(dummyInventoryDetails);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? items.find((item) => item.value === value)?.label
            : "Search your inventory..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search Items..." className="h-9" />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {item.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
