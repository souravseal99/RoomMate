import useInventory from "@/hooks/useInventory";
import useHousehold from "@/hooks/useHousehold";
import HouseholdSelector from "@/components/expenses/HouseholdSelector";
import { BuySoonPopover } from "@/components/inventory/BuySoonPopover";


import { InventoryItemCard } from "@/components/inventory/InventoryItemCard";
import { ShoppingCartTable } from "@/components/inventory/ShoppingCartTable";
import { AddItemForm } from "@/components/inventory/AddItemForm";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { getInventoryItems } from "@/api/inventoryApi";
import type { InventoryItem } from "@/types/inventoryTypes";



function Inventory() {
  const { inventoryItems, setInventoryItems } = useInventory();
  const { selectedHousehold } = useHousehold();
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  console.log('Current inventoryItems in component:', inventoryItems);
  console.log('Current selectedHousehold:', selectedHousehold);

  const fetchInventoryItems = async () => {
    if (!selectedHousehold?.key) {
      console.log('No household key available');
      return;
    }
    
    try {
      const response = await getInventoryItems(selectedHousehold.key);
      console.log('Raw API response:', response);
      const items = Array.isArray(response) ? response : (response.data?.data || response.data || []);
      console.log('Items from API:', items);
      const mappedItems = items.map((item: any) => ({
        id: item.inventoryItemId,
        name: item.name,
        quantity: item.quantity,
        lowThreshold: item.lowThreshold,
        lastUpdated: item.lastUpdated
      }));
      console.log('Mapped items:', mappedItems);
      setInventoryItems(mappedItems);
      console.log('setInventoryItems called with:', mappedItems);
    } catch (error) {
      console.error('Failed to fetch inventory items:', error);
    }
  };

  useEffect(() => {
    if (selectedHousehold?.key) {
      fetchInventoryItems();
    }
  }, [selectedHousehold?.key]);

  const handleItemAdded = () => {
    console.log('handleItemAdded called - closing modal and refetching');
    setIsAddItemOpen(false);
    fetchInventoryItems();
  };



  return (
    <div className="container mx-auto flex flex-col items-center lg:w-[80rem] mt-4">
      <div className="text-center text-3xl font-stretch-70% mb-6 drop-shadow-lg tracking-wide">
        📋 Inventory
      </div>
      <HouseholdSelector />
      <div className="flex gap-4 justify-evenly ">
        <BuySoonPopover />
        <Sheet open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Item</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <AddItemForm 
                onSuccess={handleItemAdded}
                onCancel={() => setIsAddItemOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="mt-6 w-full max-w-6xl space-y-6">
        {/* Current Supplies Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Current Supplies</h3>
          {!inventoryItems || inventoryItems.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No supplies found
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {inventoryItems.map((item) => (
                <InventoryItemCard 
                  key={item.id} 
                  item={item} 
                  onUpdate={fetchInventoryItems}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="max-w-2xl mx-auto">
          {/* Shopping Cart */}
          <ShoppingCartTable />
        </div>
      </div>
    </div>
  );
}

export default Inventory;
