import { useState } from 'react';
import { Card } from '@/components/ui/card';
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
    <Card className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-xs">
      <h3 className="font-extrabold text-foreground text-base sm:text-lg mb-4">Shopping Cart</h3>

      {/* Add Item Form */}
      <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
        <Input
          placeholder="Item name"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-1 min-h-[44px]"
          required
        />
        <Input
          type="number"
          placeholder="Qty"
          value={newItemQuantity}
          onChange={(e) => setNewItemQuantity(e.target.value)}
          min="1"
          className="w-24 min-h-[44px]"
          required
        />
        <Button
          type="submit"
          disabled={isPending || !selectedHousehold || !newItemName.trim() || !newItemQuantity}
          className="min-h-[44px] min-w-[44px] px-4"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </form>

      {/* Cart Items */}
      {isLoadingCart ? (
        <div className="flex justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : cartItems.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-6">No items in shopping cart</p>
      ) : (
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div key={item.shoppingCartId} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-semibold text-foreground truncate">{item.itemName}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleUpdateQuantity(item.shoppingCartId, parseInt(e.target.value))}
                  min="1"
                  className="w-20 min-h-[44px] font-mono text-center"
                  disabled={updateMutation.isPending && updateMutation.variables?.cartItemId === item.shoppingCartId}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(item.shoppingCartId)}
                  disabled={deleteMutation.isPending && deleteMutation.variables?.cartItemId === item.shoppingCartId}
                  className="min-h-[44px] min-w-[44px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  aria-label={`Remove ${item.itemName}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
