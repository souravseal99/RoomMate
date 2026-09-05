import { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  ShoppingCart,
  PackageOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useHousehold from '@/hooks/useHousehold';
import { useInventoryQuery } from '@/hooks/queries/useInventoryQueries';
import { useShoppingCartQuery } from '@/hooks/queries/useShoppingCartQueries';
import type { InventoryItem } from '@/types/inventoryTypes';
import {
  AutoRestockHeroCard,
  QuickAddCarousel,
  InventoryStockCard,
  WeeklyShoppingList,
  AddInventoryItemDrawer,
  InventoryPantrySkeleton,
  InventoryShoppingSkeleton,
} from '@/components/inventory';

type TabView = 'pantry' | 'shopping';
type FilterStatus = 'all' | 'low' | 'out';

export default function Inventory() {
  const { activeHousehold } = useHousehold();
  const householdId = activeHousehold?.householdId || '';

  const [activeTab, setActiveTab] = useState<TabView>('pantry');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Queries
  const { data: inventoryItems = [], isLoading: isInventoryLoading } =
    useInventoryQuery(householdId);
  const { data: cartItems = [], isLoading: isCartLoading } =
    useShoppingCartQuery(householdId);

  // Derived low stock items count
  const lowStockCount = useMemo(() => {
    return inventoryItems.filter((item) => item.quantity <= item.lowThreshold).length;
  }, [inventoryItems]);

  // Filtered inventory list
  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());
      if (!matchesSearch) return false;

      if (filterStatus === 'low') {
        return item.quantity > 0 && item.quantity <= item.lowThreshold;
      }
      if (filterStatus === 'out') {
        return item.quantity === 0;
      }
      return true;
    });
  }, [inventoryItems, searchQuery, filterStatus]);

  const handleOpenAddDrawer = () => {
    setEditingItem(null);
    setIsDrawerOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsDrawerOpen(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-24">
      {/* Top Header Ribbon */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-2.5 tracking-tight">
            <Package className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            {activeHousehold?.name ? `${activeHousehold.name} - Stock` : 'Stock & Inventory'}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Track household supplies, automate groceries, and never run out of essentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenAddDrawer}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </Button>
        </div>
      </header>

      {/* Tab Switcher Segmented Control */}
      <div className="flex justify-center">
        <div className="flex bg-surface-container p-1 rounded-2xl w-full max-w-md shadow-xs border border-border/40">
          <button
            type="button"
            onClick={() => setActiveTab('pantry')}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'pantry'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Pantry Stock</span>
            {inventoryItems.length > 0 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-surface-container-high text-muted-foreground font-bold">
                {inventoryItems.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shopping')}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'shopping'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Shopping Cart</span>
            {cartItems.length > 0 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-extrabold">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'pantry' ? (
        <div className="space-y-6">
          {/* Auto-Restock Assistant Hero */}
          <AutoRestockHeroCard
            householdId={householdId}
            lowStockCount={lowStockCount}
            onNavigateToCart={() => setActiveTab('shopping')}
          />

          {/* Quick Add Essentials Carousel */}
          <QuickAddCarousel householdId={householdId} />

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pantry items..."
                className="pl-10 h-10 bg-surface border-border text-foreground text-xs sm:text-sm rounded-xl focus:border-primary"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === 'all'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-surface-container text-muted-foreground hover:text-foreground border border-border/40'
                }`}
              >
                All ({inventoryItems.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('low')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === 'low'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-surface-container text-muted-foreground hover:text-foreground border border-border/40'
                }`}
              >
                Running Low ({lowStockCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('out')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === 'out'
                    ? 'bg-destructive text-destructive-foreground shadow-xs'
                    : 'bg-surface-container text-muted-foreground hover:text-foreground border border-border/40'
                }`}
              >
                Out of Stock ({inventoryItems.filter((i) => i.quantity === 0).length})
              </button>
            </div>
          </div>

          {/* Items List */}
          {isInventoryLoading ? (
            <InventoryPantrySkeleton />
          ) : filteredItems.length === 0 ? (
            <div className="p-10 bg-surface-container-low rounded-2xl border border-dashed border-border text-center space-y-3">
              <PackageOpen className="w-10 h-10 text-muted-foreground/60 mx-auto" />
              <p className="text-sm font-extrabold text-foreground">
                {searchQuery || filterStatus !== 'all'
                  ? 'No matching supplies found'
                  : 'Your pantry is empty'}
              </p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search terms or filter status.'
                  : 'Add supplies using Quick Add chips above or click "Add Item" to customize.'}
              </p>
              {!(searchQuery || filterStatus !== 'all') && (
                <Button
                  onClick={handleOpenAddDrawer}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-xs"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add First Supply
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <InventoryStockCard
                  key={item.inventoryItemId}
                  item={item}
                  householdId={householdId}
                  onEdit={handleEditItem}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Shopping Cart View */
        <div>
          {isCartLoading ? (
            <InventoryShoppingSkeleton />
          ) : (
            <WeeklyShoppingList householdId={householdId} />
          )}
        </div>
      )}

      {/* Floating Action Button (FAB) for rapid addition */}
      <button
        type="button"
        onClick={handleOpenAddDrawer}
        aria-label="Add supply item"
        className="fixed bottom-20 md:bottom-8 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-xl flex items-center justify-center z-40 active:scale-95 transition-all cursor-pointer group"
      >
        <Plus className="w-7 h-7 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* Slide-over Drawer for Add/Edit */}
      <AddInventoryItemDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        householdId={householdId}
        itemToEdit={editingItem}
      />
    </div>
  );
}
