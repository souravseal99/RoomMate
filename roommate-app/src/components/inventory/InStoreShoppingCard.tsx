import { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Users,
  Share2,
  ShoppingBag,
  Trash2,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import type { ShoppingCartItem } from '@/types/inventoryTypes';
import { toast } from 'sonner';

interface InStoreShoppingCardProps {
  cartItems: ShoppingCartItem[];
  householdName?: string;
  shopperName?: string;
  shopperInitials?: string;
  memberCount?: number;
  isLoading?: boolean;
  onDeleteItem: (cartItemId: string) => void;
  onInlineAddItem: (name: string, quantity: number) => void;
  onCheckout: (purchasedItemIds: string[]) => void;
}

export function InStoreShoppingCard({
  cartItems,
  householdName = 'Unit #4B',
  shopperName = 'Sarah',
  shopperInitials = 'SL',
  memberCount = 4,
  isLoading = false,
  onDeleteItem,
  onInlineAddItem,
  onCheckout,
}: InStoreShoppingCardProps) {
  // Local state for checked/crossed off items during shopping run
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [inlineInput, setInlineInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inlineInput.trim();
    if (!trimmed) return;
    onInlineAddItem(trimmed, 1);
    setInlineInput('');
  };

  // Simulated average staple price for realistic flatmate ledger totals
  const estimatedTotal = useMemo(() => {
    if (cartItems.length === 0) return 0;
    // Weighted estimated calculation
    return cartItems.reduce((acc, item) => {
      const unitEst = item.itemName.toLowerCase().includes('coffee')
        ? 14.5
        : item.itemName.toLowerCase().includes('oil')
        ? 12.99
        : item.itemName.toLowerCase().includes('paper')
        ? 18.0
        : item.itemName.toLowerCase().includes('soap')
        ? 5.2
        : item.itemName.toLowerCase().includes('egg')
        ? 4.5
        : 3.89;
      return acc + unitEst * (item.quantity || 1);
    }, 0);
  }, [cartItems]);

  const splitPerPerson = memberCount > 0 ? (estimatedTotal / memberCount).toFixed(2) : '0.00';

  const handleBulkCheckout = async () => {
    if (cartItems.length === 0) {
      toast.info('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    try {
      // If some items are checked, checkout checked items; otherwise checkout all
      const itemsToCheckout = checkedIds.size > 0
        ? Array.from(checkedIds)
        : cartItems.map((item) => item.shoppingCartId);

      await onCheckout(itemsToCheckout);
      setCheckedIds(new Set());
      toast.success(
        `Checked out ${itemsToCheckout.length} item${itemsToCheckout.length > 1 ? 's' : ''}! Pantry restocked.`
      );
    } catch {
      toast.error('Checkout failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareList = async () => {
    const listText = cartItems
      .map((item) => `• ${item.itemName} (x${item.quantity})`)
      .join('\n');
    const shareMessage = `🛒 ${householdName} Grocery List:\n${listText}\n\nEstimated Total: $${estimatedTotal.toFixed(2)}`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareMessage);
      toast.success('Shopping list copied to clipboard for flatmates!');
    } else {
      toast.info('List ready: ' + shareMessage);
    }
  };

  return (
    <aside className="w-full">
      <div className="bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden sticky top-24 flex flex-col">
        {/* Checklist Header */}
        <div className="p-4 border-b border-border/60 bg-surface-container-low/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">
              <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
            </span>
            <div>
              <h2 className="font-display font-bold text-sm sm:text-base text-foreground leading-tight">
                In-Store Grocery Run
              </h2>
              <span className="text-[11px] text-muted-foreground">
                {cartItems.length} items queued for {householdName}
              </span>
            </div>
          </div>

          {/* Assigned Flatmate Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-xs font-medium text-foreground border border-border/50">
            <div className="w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-[10px] flex items-center justify-center font-bold">
              {shopperInitials}
            </div>
            <span>{shopperName}</span>
          </div>
        </div>

        {/* Tap-to-Cross Checklist Rows */}
        <div className="divide-y divide-border/50 p-2 text-sm max-h-[380px] overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-xs space-y-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Loading grocery items...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground space-y-1">
              <CheckCircle2 className="w-8 h-8 text-primary/40 mx-auto" />
              <p className="text-xs font-bold text-foreground">Shopping cart is clear</p>
              <p className="text-[11px] text-muted-foreground">
                Sync low stock supplies or add items below for your next store run.
              </p>
            </div>
          ) : (
            cartItems.map((item) => {
              const isChecked = checkedIds.has(item.shoppingCartId);
              return (
                <div
                  key={item.shoppingCartId}
                  className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low transition-colors"
                >
                  <label
                    htmlFor={`cart-item-${item.shoppingCartId}`}
                    className="flex items-start gap-2.5 min-w-0 flex-1 cursor-pointer select-none"
                  >
                    <input
                      id={`cart-item-${item.shoppingCartId}`}
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCheck(item.shoppingCartId)}
                      className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer shrink-0 accent-primary"
                    />
                    <div className="min-w-0 flex-1">
                      <div
                        className={`font-medium text-xs sm:text-sm text-foreground flex items-center gap-1.5 flex-wrap transition-opacity ${
                          isChecked ? 'line-through opacity-50' : ''
                        }`}
                      >
                        <span>{item.itemName}</span>
                        <span className="text-muted-foreground font-normal">
                          x{item.quantity}
                        </span>
                      </div>
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-surface-container text-muted-foreground text-[10px] font-medium">
                        Staple item
                      </span>
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.shoppingCartId)}
                    title="Remove item from cart"
                    aria-label={`Remove ${item.itemName}`}
                    className="p-1.5 min-h-[44px] min-w-[44px] rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Inline Quick-Add Item */}
        <form
          onSubmit={handleInlineSubmit}
          className="p-3 border-t border-border/60 bg-card flex items-center gap-2"
        >
          <input
            type="text"
            value={inlineInput}
            onChange={(e) => setInlineInput(e.target.value)}
            placeholder="+ Add one-off grocery item..."
            className="flex-1 px-3 py-2 min-h-[44px] rounded-xl border border-border text-xs bg-surface-container-low focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary transition-colors text-foreground placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!inlineInput.trim()}
            className="px-4 py-2 min-h-[44px] rounded-xl bg-surface-container text-foreground hover:bg-surface-container-high text-xs font-semibold shrink-0 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Communal Split Summary */}
        <div className="p-4 bg-surface-container-low/60 border-t border-border/70 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Estimated Total:</span>
            <span className="font-bold text-foreground text-sm">
              ${estimatedTotal.toFixed(2)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-card border border-border/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{memberCount}-Way Flatmate Split:</span>
            </div>
            <span className="font-semibold text-primary">${splitPerPerson} / flatmate</span>
          </div>

          <p className="text-[10px] text-muted-foreground italic text-center">
            Auto-split to {householdName} Ledger upon checkout
          </p>
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-2 bg-card flex flex-col gap-2">
          <button
            type="button"
            disabled={cartItems.length === 0 || isSubmitting}
            onClick={handleBulkCheckout}
            className="w-full py-2.5 px-4 min-h-[44px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              Checkout Selected & Restock (${estimatedTotal.toFixed(2)})
            </span>
          </button>

          <button
            type="button"
            onClick={handleShareList}
            className="w-full py-2.5 px-4 min-h-[44px] rounded-xl border border-border hover:bg-surface-container text-foreground font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Share2 className="w-4 h-4 text-muted-foreground" />
            <span>Share List via SMS / WhatsApp</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
