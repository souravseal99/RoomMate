import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { getShoppingCartItems, addToShoppingCart, updateCartItem, removeFromCart } from "@/api/shoppingCartApi";
import useHousehold from "@/hooks/useHousehold";
import { toast } from "sonner";
import type { ShoppingCartItem } from "@/types/shoppingCartTypes";

export function ShoppingCartTable() {
  const [cartItems, setCartItems] = useState<ShoppingCartItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { selectedHousehold } = useHousehold();

  const fetchCartItems = useCallback(async () => {
    if (!selectedHousehold?.key) {
      console.log('No household key for cart');
      return;
    }
    
    try {
      console.log('Fetching cart items for household:', selectedHousehold.key);
      const response = await getShoppingCartItems(selectedHousehold.key);
      console.log('Cart API response:', response);
      // Now the backend is fixed: actual data is in response.data
      const items = Array.isArray(response.data) ? response.data : [];
      console.log('Cart items extracted:', items);
      const mappedItems = items.map((item: any) => ({
        id: item.shoppingCartId,
        itemName: item.itemName,
        quantity: item.quantity,
        createdAt: item.createdAt
      }));
      console.log('Mapped cart items:', mappedItems);
      setCartItems(mappedItems);
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
    }
  }, [selectedHousehold?.key]);

  useEffect(() => {
    if (selectedHousehold?.key) {
      fetchCartItems();
    }
  }, [selectedHousehold?.key]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchCartItems();
    };
    
    window.addEventListener('refreshShoppingCart', handleRefresh);
    return () => window.removeEventListener('refreshShoppingCart', handleRefresh);
  }, [fetchCartItems]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedHousehold) {
      toast.error("Please select a household first");
      return;
    }
    
    if (!newItemName.trim()) {
      toast.error("Please enter an item name");
      return;
    }
    
    if (!newItemQuantity || parseInt(newItemQuantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Adding to cart:', {
        itemName: newItemName.trim(),
        quantity: parseInt(newItemQuantity),
        householdId: selectedHousehold.key
      });
      
      const result = await addToShoppingCart(newItemName.trim(), parseInt(newItemQuantity), selectedHousehold.key);
      console.log('Cart add result:', result);
      
      setNewItemName("");
      setNewItemQuantity("");
      console.log('Refetching cart items after add');
      fetchCartItems();
      toast.success("Item added to cart");
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error("Failed to add item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) return;
    
    try {
      await updateCartItem(cartItemId, quantity);
      fetchCartItems();
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await removeFromCart(cartItemId);
      fetchCartItems();
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4">Shopping Cart</h3>
      
      {/* Add Item Form */}
      <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
        <Input
          placeholder="Item name"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-1"
          required
        />
        <Input
          type="number"
          placeholder="Qty"
          value={newItemQuantity}
          onChange={(e) => setNewItemQuantity(e.target.value)}
          min="1"
          className="w-20"
          required
        />
        <Button 
          type="submit" 
          disabled={isLoading || !selectedHousehold || !newItemName.trim() || !newItemQuantity} 
          size="sm"
        >
          {isLoading ? "..." : <Plus className="h-4 w-4" />}
        </Button>
      </form>

      {/* Cart Items */}
      {cartItems.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          No items in shopping cart
        </p>
      ) : (
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.itemName}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                  min="1"
                  className="w-16 h-8"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(item.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}