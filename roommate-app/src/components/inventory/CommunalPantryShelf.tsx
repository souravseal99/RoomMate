import { useState, useMemo } from 'react';
import {
  Search,
  History,
  Minus,
  Plus,
  ShoppingCart,
  PackageOpen,
  Edit2,
  Lightbulb,
} from 'lucide-react';
import type { InventoryItem } from '@/types/inventoryTypes';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CommunalPantryShelfProps {
  items: InventoryItem[];
  isLoading?: boolean;
  onUpdateQuantity: (item: InventoryItem, delta: number) => void;
  onAddToCart: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
  onAddNewItem: () => void;
}

type FilterTab = 'all' | 'low' | 'out';
type SortOption = 'urgency' | 'name' | 'recent';

function getItemEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('milk') || lower.includes('oat') || lower.includes('barista') || lower.includes('dairy') || lower.includes('cream')) return '🥛';
  if (lower.includes('egg')) return '🥚';
  if (lower.includes('bread') || lower.includes('sourdough') || lower.includes('toast') || lower.includes('bagel')) return '🍞';
  if (lower.includes('coffee') || lower.includes('espresso') || lower.includes('roast') || lower.includes('bean')) return '☕';
  if (lower.includes('oil') || lower.includes('olive') || lower.includes('sauce') || lower.includes('vinegar')) return '🫒';
  if (lower.includes('paper') || lower.includes('towel') || lower.includes('tissue') || lower.includes('roll')) return '🧻';
  if (lower.includes('soap') || lower.includes('dish') || lower.includes('pod') || lower.includes('detergent') || lower.includes('sponge')) return '🧼';
  if (lower.includes('apple') || lower.includes('banana') || lower.includes('fruit') || lower.includes('berry')) return '🍎';
  if (lower.includes('pasta') || lower.includes('noodle') || lower.includes('rice') || lower.includes('grain')) return '🍝';
  if (lower.includes('snack') || lower.includes('chip') || lower.includes('cookie') || lower.includes('cracker')) return '🍪';
  if (lower.includes('drink') || lower.includes('soda') || lower.includes('water') || lower.includes('tea') || lower.includes('juice')) return '🥤';
  if (lower.includes('salt') || lower.includes('pepper') || lower.includes('spice')) return '🧂';
  return '📦';
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'recently';
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks}w ago`;
  } catch {
    return 'recently';
  }
}

export function CommunalPantryShelf({
  items,
  isLoading = false,
  onUpdateQuantity,
  onAddToCart,
  onEditItem,
  onAddNewItem,
}: CommunalPantryShelfProps) {
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('urgency');

  const lowStockCount = useMemo(() => {
    return items.filter((item) => item.quantity > 0 && item.quantity <= item.lowThreshold).length;
  }, [items]);

  const outOfStockCount = useMemo(() => {
    return items.filter((item) => item.quantity === 0).length;
  }, [items]);

  const filteredAndSortedItems = useMemo(() => {
    const result = items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      if (!matchesSearch) return false;

      if (filterTab === 'low') {
        return item.quantity > 0 && item.quantity <= item.lowThreshold;
      }
      if (filterTab === 'out') {
        return item.quantity === 0;
      }
      return true;
    });

    return result.sort((a, b) => {
      if (sortOption === 'urgency') {
        // Out of stock first, then low stock, then healthy
        const aUrgency = a.quantity === 0 ? 0 : a.quantity <= a.lowThreshold ? 1 : 2;
        const bUrgency = b.quantity === 0 ? 0 : b.quantity <= b.lowThreshold ? 1 : 2;
        if (aUrgency !== bUrgency) return aUrgency - bUrgency;
        return a.name.localeCompare(b.name);
      }
      if (sortOption === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortOption === 'recent') {
        const dateA = new Date(a.updatedAt || a.lastUpdated || 0).getTime();
        const dateB = new Date(b.updatedAt || b.lastUpdated || 0).getTime();
        return dateB - dateA;
      }
      return 0;
    });
  }, [items, searchQuery, filterTab, sortOption]);

  return (
    <Card className="bg-card rounded-2xl border-border/80 shadow-xs overflow-hidden flex flex-col select-none">
      {/* View Controls Bar */}
      <div className="p-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low/40">
        {/* Segmented Filter Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-surface-container border border-border/50 text-xs">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setFilterTab('all')}
            className={`px-3 min-h-[36px] rounded-lg font-semibold transition-all cursor-pointer h-auto py-1.5 ${filterTab === 'all'
                ? 'bg-card text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            All Items ({items.length})
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setFilterTab('low')}
            className={`px-3 min-h-[36px] rounded-lg font-semibold transition-all cursor-pointer h-auto py-1.5 ${filterTab === 'low'
                ? 'bg-amber-500 text-white shadow-2xs hover:bg-amber-600'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Running Low ({lowStockCount})
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setFilterTab('out')}
            className={`px-3 min-h-[36px] rounded-lg font-semibold transition-all cursor-pointer h-auto py-1.5 ${filterTab === 'out'
                ? 'bg-destructive text-destructive-foreground shadow-2xs hover:bg-destructive/90'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Out of Stock ({outOfStockCount})
          </Button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pantry items..."
              className="w-full pl-9 pr-3 min-h-[44px] rounded-xl border border-border text-xs bg-card text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            aria-label="Sort pantry items"
            className="px-3 py-2 min-h-[44px] rounded-xl border border-border text-xs bg-card text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
          >
            <option value="urgency">Sort: Urgency</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="recent">Sort: Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Hairline Divided Pantry Shelf List */}
      <div className="divide-y divide-border/60">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground text-sm space-y-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Loading communal pantry...</p>
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="p-10 text-center space-y-3 bg-surface-container-low/20">
            <PackageOpen className="w-10 h-10 text-muted-foreground/60 mx-auto" />
            <p className="text-sm font-bold text-foreground">
              {searchQuery || filterTab !== 'all' ? 'No matching supplies found' : 'Your pantry is empty'}
            </p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              {searchQuery || filterTab !== 'all'
                ? 'Try adjusting your search terms or filter tab.'
                : 'Start tracking domestic supplies by adding your first household staple.'}
            </p>
            {!(searchQuery || filterTab !== 'all') && (
              <Button
                type="button"
                onClick={onAddNewItem}
                className="inline-flex items-center gap-1.5 px-4 min-h-[44px] bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Supply</span>
              </Button>
            )}
          </div>
        ) : (
          filteredAndSortedItems.map((item) => {
            const isOut = item.quantity === 0;
            const isLow = !isOut && item.quantity <= item.lowThreshold;
            const emoji = getItemEmoji(item.name);

            // Stock percentage gauge calculation
            const maxRef = Math.max(item.lowThreshold * 2, item.quantity, 1);
            const gaugePercent = isOut ? 0 : Math.min(100, Math.round((item.quantity / maxRef) * 100));

            return (
              <div
                key={item.inventoryItemId}
                className={`p-4 hover:bg-surface-container-low/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isOut ? 'bg-destructive/5' : ''
                  }`}
              >
                {/* Left: Item Emoji + Info + Gauge */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border ${isOut
                        ? 'bg-destructive/10 text-destructive border-destructive/20'
                        : isLow
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                      }`}
                  >
                    {emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-semibold text-sm sm:text-base text-foreground truncate">
                        {item.name}
                      </h3>

                      {isOut ? (
                        <Badge
                          variant="destructive"
                          className="px-2 py-0.5 rounded-md text-[11px] font-bold"
                        >
                          Out of Stock (0 remaining)
                        </Badge>
                      ) : isLow ? (
                        <Badge
                          variant="outline"
                          className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[11px] font-semibold"
                        >
                          Running Low ({item.quantity} left · Min {item.lowThreshold})
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-semibold"
                        >
                          In Stock ({item.quantity} left · Min {item.lowThreshold})
                        </Badge>
                      )}
                    </div>

                    {/* Gauge Progress Bar */}
                    <div className="mt-1.5 flex items-center gap-2.5 max-w-xs">
                      <div className="flex-1 h-2 rounded-full bg-surface-container overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${isOut
                              ? 'bg-destructive w-0'
                              : isLow
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          style={{ width: `${gaugePercent}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-muted-foreground font-medium shrink-0">
                        {gaugePercent}% left
                      </span>
                    </div>

                    {/* Metadata: Last Restocked / Updated */}
                    <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-muted-foreground/70" />
                      <span>Updated {formatRelativeTime(item.updatedAt || item.lastUpdated)}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Tactile Stepper [-] [N] [+] & Cart / Edit actions */}
                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  <div className="inline-flex items-center border border-border rounded-xl bg-card shadow-2xs overflow-hidden">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={item.quantity === 0}
                      onClick={() => onUpdateQuantity(item, -1)}
                      aria-label={`Decrease ${item.name} quantity`}
                      className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-none flex items-center justify-center text-muted-foreground hover:bg-surface-container hover:text-foreground active:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4 stroke-[2.5]" />
                    </Button>

                    <span className="w-9 text-center text-xs sm:text-sm font-bold text-foreground select-none">
                      {item.quantity}
                    </span>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onUpdateQuantity(item, 1)}
                      aria-label={`Increase ${item.name} quantity`}
                      className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-none flex items-center justify-center text-muted-foreground hover:bg-surface-container hover:text-foreground active:bg-surface-container-high transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onAddToCart(item)}
                    title="Add to shopping cart"
                    aria-label={`Add ${item.name} to shopping cart`}
                    className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl text-primary bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditItem(item)}
                    title="Edit supply details"
                    aria-label={`Edit ${item.name}`}
                    className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl text-muted-foreground hover:bg-surface-container flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Subtle Domestic Memo Banner */}
      <div className="p-3.5 bg-surface-container-low border-t border-border/60 flex items-center gap-2 text-xs text-muted-foreground">
        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          <strong className="text-foreground font-semibold">Pantry Protocol:</strong> Tapping{' '}
          <code className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-[11px] text-foreground">[-]</code>{' '}
          automatically triggers restock alerts when quantity drops below minimum threshold. Zero manual spreadsheets.
        </span>
      </div>
    </Card>
  );
}

export default CommunalPantryShelf;
