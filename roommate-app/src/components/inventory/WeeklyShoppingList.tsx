import { useState } from 'react';
import { CheckCircle2, Trash2, Plus, Loader2, ShoppingBag, History } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useShoppingCartQuery,
  useAddToCartMutation,
  useDeleteCartItemMutation,
  useCheckoutCartMutation,
} from '@/hooks/queries/useShoppingCartQueries';

type Props = {
  householdId: string;
};

export default function WeeklyShoppingList({ householdId }: Props) {
  const { data: cartItems = [] } = useShoppingCartQuery(householdId);
  const addMutation = useAddToCartMutation();
  const deleteMutation = useDeleteCartItemMutation();
  const checkoutMutation = useCheckoutCartMutation();

  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    try {
      await addMutation.mutateAsync({
        itemName: newItemName.trim(),
        quantity: newItemQty,
        householdId,
      });
      setNewItemName('');
      setNewItemQty(1);
    } catch {
      // Error handled by mutation toast
    }
  };

  const handleDeleteItem = (cartItemId: string) => {
    deleteMutation.mutate({ cartItemId, householdId });
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.delete(cartItemId);
      return next;
    });
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    // If specific items are checked, checkout checked items; otherwise checkout all items
    const itemsToCheckout =
      checkedIds.size > 0 ? Array.from(checkedIds) : cartItems.map((item) => item.shoppingCartId);

    try {
      await checkoutMutation.mutateAsync({
        householdId,
        purchasedItemIds: itemsToCheckout,
      });
      setCheckedIds(new Set());
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Weekly List Main Card */}
      <Card className="rounded-2xl p-5 sm:p-6 shadow-xs border border-border space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
              Weekly Procurement List
            </h3>
          </div>
          <Badge
            variant="secondary"
            className="text-xs font-extrabold text-primary bg-primary/10 border-primary/20 px-3 py-1 rounded-full"
          >
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>

        {/* List items */}
        {cartItems.length === 0 ? (
          <div className="p-8 bg-muted/30 rounded-2xl border border-dashed border-border text-center space-y-2">
            <ShoppingBag className="w-8 h-8 text-muted-foreground/60 mx-auto" />
            <p className="text-sm font-bold text-foreground">Shopping list is clear!</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Sync low stock supplies from the Pantry tab or add items manually below.
            </p>
          </div>
        ) : (
          <div className="space-y-3 divide-y divide-border/40">
            {cartItems.map((item) => {
              const isChecked = checkedIds.has(item.shoppingCartId);
              return (
                <div
                  key={item.shoppingCartId}
                  className="pt-3 first:pt-0 flex items-center justify-between gap-3 group min-h-[48px]"
                >
                  <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCheck(item.shoppingCartId)}
                      className="w-5 h-5 rounded-md border-2 border-border text-primary focus:ring-primary/20 cursor-pointer transition-all accent-primary shrink-0"
                    />
                    <span
                      className={`text-sm sm:text-base font-bold text-foreground transition-all truncate ${
                        isChecked ? 'line-through opacity-50 text-muted-foreground' : ''
                      }`}
                    >
                      {item.itemName}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-xs font-mono font-extrabold text-muted-foreground bg-muted px-2 py-0.5 rounded-md shrink-0">
                        x{item.quantity}
                      </span>
                    )}
                  </label>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteItem(item.shoppingCartId)}
                    disabled={deleteMutation.isPending}
                    className="min-w-[44px] min-h-[44px] rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Inline Add Form */}
        <form onSubmit={handleAddItem} className="pt-2 flex gap-2">
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add an item (e.g. Dishwasher pods)..."
            className="flex-1 bg-card border-border text-foreground text-sm font-semibold rounded-xl focus:border-primary min-h-[44px]"
            disabled={addMutation.isPending}
          />
          <Button
            type="submit"
            disabled={!newItemName.trim() || addMutation.isPending}
            className="min-h-[44px] px-5 rounded-xl font-bold gap-2"
          >
            {addMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>Add</span>
          </Button>
        </form>

        {/* Checkout Action Button */}
        {cartItems.length > 0 && (
          <div className="pt-2">
            <Button
              onClick={handleCheckout}
              disabled={checkoutMutation.isPending}
              className="w-full min-h-[50px] font-extrabold text-base rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {checkoutMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Checkout...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {checkedIds.size > 0
                      ? `Checkout Selected (${checkedIds.size}) & Update Stock`
                      : 'Checkout All & Update Stock'}
                  </span>
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* Shopping Trip History Card */}
      <Card className="p-5 bg-muted/20 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-center py-8 space-y-1.5">
        <History className="w-8 h-8 text-muted-foreground/60 mb-1" />
        <p className="text-xs sm:text-sm font-bold text-foreground">
          Recent shopping receipts &amp; trips
        </p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Completed trips and procurement receipts will be archived here.
        </p>
      </Card>
    </div>
  );
}
