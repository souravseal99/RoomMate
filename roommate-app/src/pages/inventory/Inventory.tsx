import useInventory from "@/hooks/useInventory";
import HouseholdSelector from "@/components/expenses/HouseholdSelector";
import { BuySoonPopover } from "@/components/inventory/BuySoonPopover";
import { InventorySelector } from "@/components/inventory/InventorySelector";
import { ItemDetailsCard } from "@/components/inventory/ItemDetailsCard";

function Inventory() {
  const { selectedItem } = useInventory();

  return (
    <div className="container mx-auto flex flex-col items-center lg:w-[80rem] mt-4">
      <div className="text-center text-3xl font-stretch-70% mb-6 drop-shadow-lg tracking-wide">
        📋 Inventory
      </div>
      <HouseholdSelector />
      <div className="flex gap-4 justify-evenly ">
        <InventorySelector />
        <BuySoonPopover />
      </div>
      <div className="mt-4">
        {!selectedItem ? (
          <div className="mt-2 text-center text-gray-600 dark:text-gray-300">
            Your inventory details will be displayed here.
          </div>
        ) : (
          <div>
            <ItemDetailsCard itemDetails={selectedItem} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Inventory;
