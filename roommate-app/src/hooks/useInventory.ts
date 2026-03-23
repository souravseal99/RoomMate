import { useContext } from "react";
import { InventoryContext } from "@/contexts/InventoryContext";

const useInventory = () => {
  const context = useContext(InventoryContext);

  if (!context)
    throw new Error(
      "Inventory context must be present inside InventoryProvider"
    );

  return context;
};

export default useInventory;
