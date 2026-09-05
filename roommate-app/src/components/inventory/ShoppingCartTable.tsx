import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import {
  useShoppingCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useDeleteCartItemMutation,
} from '@/hooks/queries/useShoppingCartQueries';
import { toast } from 'sonner';

export function ShoppingCartTable() {
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const { selectedHousehold } = useHousehold();

  const { data: cartItems = [], isLoading: isLoadingCart } = useShoppingCartQuery(
    selectedHousehold?.key
  );
  
  const addMutation = useAddToCartMutation();
  const updateMutation = useUpdateCartItemMutation();
  const deleteMutation = useDeleteCartItemMutation();

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedHousehold) {
      toast.error('Please select a household first');
      return;
    }

    if (!newItemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }

    if (!newItemQuantity || parseInt(newItemQuantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    try {
      await addMutation.mutateAsync({
        itemName: newItemName.trim(),
        quantity: parseInt(newItemQuantity),
        householdId: selectedHousehold.key,
      });

      setNewItemName('');
      setNewItemQuantity('');
    } catch {
      // Error handled by mutation
    }
  };

  const handleUpdateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0 || !selectedHousehold) return;
    updateMutation.mutate({
      cartItemId,
      householdId: selectedHousehold.key,
      data: { quantity },
    });
  };

  const handleRemoveItem = (cartItemId: string) => {
    if (!selectedHousehold) return;
    deleteMutation.mutate({
      cartItemId,
      householdId: selectedHousehold.key,
    });
  };

  const isPending = addMutation.isPending;

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
          disabled={isPending || !selectedHousehold || !newItemName.trim() || !newItemQuantity}
          size="sm"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </form>

      {/* Cart Items */}
      {isLoadingCart ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : cartItems.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No items in shopping cart</p>
      ) : (
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div key={item.shoppingCartId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.itemName}</span>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleUpdateQuantity(item.shoppingCartId, parseInt(e.target.value))}
                  min="1"
                  className="w-16 h-8"
                  disabled={updateMutation.isPending && updateMutation.variables?.cartItemId === item.shoppingCartId}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(item.shoppingCartId)}
                  disabled={deleteMutation.isPending && deleteMutation.variables?.cartItemId === item.shoppingCartId}
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
