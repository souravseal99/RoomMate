import { useState, useMemo, useRef } from 'react';
import { Plus } from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import {
  useInventoryQuery,
  useUpdateInventoryMutation,
} from '@/hooks/queries/useInventoryQueries';
import {
  useShoppingCartQuery,
  useAddToCartMutation,
  useAddLowStockToCartMutation,
  useDeleteCartItemMutation,
  useCheckoutCartMutation,
} from '@/hooks/queries/useShoppingCartQueries';
import type { InventoryItem } from '@/types/inventoryTypes';
import {
  PantrySubHeader,
  RestockCommandApron,
  CommunalPantryShelf,
  InStoreShoppingCard,
  AddInventoryItemDrawer,
} from '@/components/inventory';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Inventory() {
  const { activeHousehold } = useHousehold();
  const householdId = activeHousehold?.householdId || '';
  const householdName = activeHousehold?.name || 'NorthWing #4B';
  const memberCount = 4;

  const shoppingCardRef = useRef<HTMLDivElement>(null);

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // TanStack Queries
  const { data: inventoryItems = [], isLoading: isInventoryLoading } =
    useInventoryQuery(householdId);
  const { data: cartItems = [], isLoading: isCartLoading } =
    useShoppingCartQuery(householdId);

  // TanStack Mutations
  const updateInventoryMutation = useUpdateInventoryMutation();
  const addToCartMutation = useAddToCartMutation();
  const syncLowStockMutation = useAddLowStockToCartMutation();
  const deleteCartItemMutation = useDeleteCartItemMutation();
  const checkoutCartMutation = useCheckoutCartMutation();

  // Low stock items memo
  const lowStockItems = useMemo(() => {
    return inventoryItems.filter(
      (item) => item.quantity <= item.lowThreshold
    );
  }, [inventoryItems]);

  // Stepper quantity update handler with optimistic update
  const handleUpdateQuantity = (item: InventoryItem, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    updateInventoryMutation.mutate({
      itemId: item.inventoryItemId,
      householdId,
      data: { quantity: newQty },
    });
  };

  // Add inventory item to shopping cart
  const handleAddPantryItemToCart = (item: InventoryItem) => {
    addToCartMutation.mutate({
      itemName: item.name,
      quantity: 1,
      householdId,
    });
  };

  // 1-Tap Sync All Low Stock Items to Cart
  const handleSyncAllToCart = () => {
    if (!householdId) {
      toast.error('No active household selected');
      return;
    }
    syncLowStockMutation.mutate(householdId);
  };

  // Quick-Pick Staple handler
  const handleQuickAddStaple = (name: string, quantity: number, _unit?: string) => {
    if (!householdId) {
      toast.error('No active household selected');
      return;
    }
    addToCartMutation.mutate({
      itemName: name,
      quantity,
      householdId,
    });
  };

  // Inline one-off grocery item handler
  const handleInlineAddGroceryItem = (name: string, quantity: number) => {
    if (!householdId) {
      toast.error('No active household selected');
      return;
    }
    addToCartMutation.mutate({
      itemName: name,
      quantity,
      householdId,
    });
  };

  // Delete cart item handler
  const handleDeleteCartItem = (cartItemId: string) => {
    if (!householdId) return;
    deleteCartItemMutation.mutate({
      cartItemId,
      householdId,
    });
  };

  // Bulk Checkout handler
  const handleCheckout = async (purchasedItemIds: string[]) => {
    if (!householdId) return;
    await checkoutCartMutation.mutateAsync({
      householdId,
      purchasedItemIds,
    });
  };

  const handleOpenAddDrawer = () => {
    setEditingItem(null);
    setIsDrawerOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsDrawerOpen(true);
  };

  const handleScrollToCart = () => {
    if (shoppingCardRef.current) {
      shoppingCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full space-y-6 pb-24 animate-in fade-in duration-300">
      {/* 1. Header Sub-bar & Context Bar */}
      <PantrySubHeader
        householdName={householdName}
        memberCount={memberCount}
        cartItemCount={cartItems.length}
        onAddCustomItem={handleOpenAddDrawer}
        onScrollToCart={handleScrollToCart}
      />

      {/* 2. Top Command Apron (Unified Restock Command Strip & Quick Staples) */}
      <RestockCommandApron
        lowStockItems={lowStockItems}
        isSyncing={syncLowStockMutation.isPending}
        onSyncAllToCart={handleSyncAllToCart}
        onQuickAddStaple={handleQuickAddStaple}
      />

      {/* 3. 2-Column Co-Living Split (65% Pantry / 35% Shared Cart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Communal Pantry Shelf (8 cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <CommunalPantryShelf
            items={inventoryItems}
            isLoading={isInventoryLoading}
            onUpdateQuantity={handleUpdateQuantity}
            onAddToCart={handleAddPantryItemToCart}
            onEditItem={handleEditItem}
            onAddNewItem={handleOpenAddDrawer}
          />
        </div>

        {/* Right Column: In-Store Shopping Checklist (4 cols on desktop) */}
        <div ref={shoppingCardRef} className="lg:col-span-4 flex flex-col gap-4">
          <InStoreShoppingCard
            cartItems={cartItems}
            householdName={householdName}
            shopperName="Sarah"
            shopperInitials="SL"
            memberCount={memberCount}
            isLoading={isCartLoading}
            onDeleteItem={handleDeleteCartItem}
            onInlineAddItem={handleInlineAddGroceryItem}
            onCheckout={handleCheckout}
          />
        </div>
      </div>

      {/* Floating Action Button (FAB) for rapid addition on mobile */}
      <Button
        type="button"
        size="icon"
        onClick={handleOpenAddDrawer}
        aria-label="Add custom supply item"
        className="fixed bottom-20 md:bottom-8 right-6 w-14 h-14 min-h-[56px] min-w-[56px] rounded-2xl shadow-xl z-40 active:scale-95 group"
      >
        <Plus className="w-7 h-7 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
      </Button>

      {/* Slide-over Drawer for Add/Edit Supply */}
      <AddInventoryItemDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        householdId={householdId}
        itemToEdit={editingItem}
      />
    </div>
  );
}
