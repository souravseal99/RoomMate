import type { InventoryItem } from "@/types/inventoryTypes";
import { createContext, useMemo, useState, type ReactNode } from "react";

export type InventoryContextType = {
  inventoryItems: InventoryItem[] | undefined;
  selectedItem: InventoryItem | null;
  setInventoryItems: (InventoryItems: InventoryItem[]) => void;
  setSelectedItem: (InventoryItem: InventoryItem) => void;
  refetchInventoryItems: () => void;
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

  console.log("Inventory Items in Provider:", inventoryItems);
  console.log("Selected Item in Provider:", selectedItem);

  const refetchInventoryItems = () => {
    // This will be implemented by the component that fetches inventory items
    console.log('Refetch inventory items called');
  };

  const providerValues = useMemo(
    () => ({
      inventoryItems,
      setInventoryItems,
      selectedItem,
      setSelectedItem,
      refetchInventoryItems,
    }),
    [inventoryItems, setInventoryItems, selectedItem, setSelectedItem]
  );

  return (
    <InventoryContext.Provider value={providerValues as InventoryContextType}>
      {children}
    </InventoryContext.Provider>
  );
};
