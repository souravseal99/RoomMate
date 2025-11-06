import useInventory from "@/hooks/useInventory";
import HouseholdSelector from "@/components/expenses/HouseholdSelector";
import { BuySoonPopover } from "@/components/inventory/BuySoonPopover";
import { InventorySelector } from "@/components/inventory/InventorySelector";
import { ItemDetailsCard } from "@/components/inventory/ItemDetailsCard";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { InventoryItem } from "@/types/inventoryTypes";

function getItemEmoji(name: string): string {
  const emojiMap: Record<string, string> = {
    bread: "🍞", milk: "🥛", eggs: "🥚", cheese: "🧀", butter: "🧈",
    rice: "🍚", pasta: "🍝", chicken: "🍗", beef: "🥩", fish: "🐟",
    apple: "🍎", banana: "🍌", orange: "🍊", tomato: "🍅", potato: "🥔",
    onion: "🧅", garlic: "🧄", carrot: "🥕", broccoli: "🥦", lettuce: "🥬"
  };
  return emojiMap[name.toLowerCase()] || "📦";
}

function getStatusBadge(quantity: number, lowThreshold: number) {
  if (quantity === 0) {
    return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Out</span>;
  }
  if (quantity <= lowThreshold) {
    return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Low</span>;
  }
  if (quantity <= lowThreshold * 1.5) {
    return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">Buy</span>;
  }
  return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">OK</span>;
}

type ShoppingListItem = {
  item: InventoryItem;
  quantity: number;
};

function Inventory() {
  const { selectedItem, inventoryItems } = useInventory();
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

  const addToShoppingList = (item: InventoryItem, quantity: number) => {
    const existingIndex = shoppingList.findIndex(listItem => listItem.item.id === item.id);
    
    if (existingIndex >= 0) {
      const updatedList = [...shoppingList];
      updatedList[existingIndex].quantity += quantity;
      setShoppingList(updatedList);
    } else {
      setShoppingList([...shoppingList, { item, quantity }]);
    }
  };

  const removeFromShoppingList = (itemId: string) => {
    setShoppingList(shoppingList.filter(listItem => listItem.item.id !== itemId));
  };

  const clearShoppingList = () => {
    setShoppingList([]);
  };

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
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getItemEmoji(item.name)}</span>
                    <div>
                      <span className="text-sm font-medium">{item.name}</span>
                      <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                    </div>
                  </div>
                  {getStatusBadge(item.quantity, item.lowThreshold)}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Item Details */}
          <div>
            {!selectedItem ? (
              <div className="mt-2 text-center text-gray-600 dark:text-gray-300">
                Your inventory details will be displayed here.
              </div>
            ) : (
              <ItemDetailsCard 
                itemDetails={selectedItem} 
                onAddToList={addToShoppingList}
              />
            )}
          </div>
          
          {/* Shopping List */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Shopping List</h3>
              {shoppingList.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearShoppingList}
                >
                  Clear All
                </Button>
              )}
            </div>
            
            {shoppingList.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No items in shopping list
              </p>
            ) : (
              <div className="space-y-2">
                {shoppingList.map((listItem) => (
                  <div 
                    key={listItem.item.id} 
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {listItem.item.name} × {listItem.quantity}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromShoppingList(listItem.item.id!)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
