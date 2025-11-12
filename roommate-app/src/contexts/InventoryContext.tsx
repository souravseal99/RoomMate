import type { InventoryItem } from "@/types/inventoryTypes";
import { createContext, useMemo, useState, type ReactNode } from "react";

export type InventoryContextType = {
  inventoryItems: InventoryItem[] | undefined;
  selectedItem: InventoryItem | null;
  setInventoryItems: (InventoryItems: InventoryItem[]) => void;
  setSelectedItem: (InventoryItem: InventoryItem) => void;
};

export const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export const InventoryProvider = ({
  children,
}: Readonly<{ children: ReactNode }>) => {
  const [inventoryItems, setInventoryItems] = useState<
    InventoryItem[] | undefined
  >(undefined);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>();

  const providerValues = useMemo(
    () => ({
      inventoryItems,
      setInventoryItems,
      selectedItem,
      setSelectedItem,
    }),
    [inventoryItems, setInventoryItems, selectedItem, setSelectedItem]
  );

  return (
    <InventoryContext.Provider value={providerValues as InventoryContextType}>
      {children}
    </InventoryContext.Provider>
  );
};
