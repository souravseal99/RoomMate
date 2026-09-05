
import { Minus, Plus, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import type { InventoryItem } from '@/types/inventoryTypes';
import {
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
} from '@/hooks/queries/useInventoryQueries';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function getItemEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('milk')) return '🥛';
  if (lower.includes('egg')) return '🥚';
  if (lower.includes('bread') || lower.includes('toast')) return '🍞';
  if (lower.includes('coffee')) return '☕';
  if (lower.includes('tea')) return '🍵';
  if (lower.includes('paper') || lower.includes('tp') || lower.includes('towel')) return '🧻';
  if (lower.includes('soap') || lower.includes('wash') || lower.includes('clean')) return '🧼';
  if (lower.includes('oil') || lower.includes('olive')) return '🫒';
  if (lower.includes('banana')) return '🍌';
  if (lower.includes('apple')) return '🍎';
  if (lower.includes('pasta') || lower.includes('noodle')) return '🍝';
  if (lower.includes('cheese')) return '🧀';
  if (lower.includes('rice')) return '🍚';
  if (lower.includes('butter')) return '🧈';
  if (lower.includes('water')) return '💧';
  if (lower.includes('snack') || lower.includes('chip') || lower.includes('cookie')) return '🍪';
  if (lower.includes('meat') || lower.includes('chicken') || lower.includes('beef')) return '🥩';
  if (lower.includes('sauce') || lower.includes('ketchup')) return '🥫';
  if (lower.includes('cereal')) return '🥣';
  if (lower.includes('fruit') || lower.includes('berry')) return '🍓';
  return '📦';
}

type Props = {
  item: InventoryItem;
  householdId: string;
  onEdit?: (item: InventoryItem) => void;
};

export default function InventoryStockCard({ item, householdId, onEdit }: Props) {
  const updateMutation = useUpdateInventoryMutation();
  const deleteMutation = useDeleteInventoryMutation();

  const isOutOfStock = item.quantity === 0;
  const isRunningLow = item.quantity > 0 && item.quantity <= item.lowThreshold;
  const isInStock = item.quantity > item.lowThreshold;

  const handleIncrement = () => {
    updateMutation.mutate({
      itemId: item.inventoryItemId,
      householdId,
      data: { quantity: item.quantity + 1 },
    });
  };

  const handleDecrement = () => {
    if (item.quantity <= 0) return;
    updateMutation.mutate({
      itemId: item.inventoryItemId,
      householdId,
      data: { quantity: Math.max(0, item.quantity - 1) },
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate({
      itemId: item.inventoryItemId,
      householdId,
    });
  };

  // Badge styles and icon backgrounds based on status
  const categoryBg = isOutOfStock
    ? 'bg-destructive/10 text-destructive'
    : isRunningLow
    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';

  return (
    <div className="bg-card rounded-2xl p-4 flex items-center justify-between shadow-xs border border-border hover:border-primary/40 transition-all group">
      {/* Left: Thumbnail & Details */}
      <div className="flex items-center gap-3 min-w-0 pr-2">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${categoryBg}`}
        >
          <span>{getItemEmoji(item.name)}</span>
        </div>

        <div className="min-w-0">
          <h4 className="font-extrabold text-sm sm:text-base text-foreground truncate">
            {item.name}
          </h4>

          <div className="flex items-center gap-2 mt-0.5">
            {isOutOfStock && (
              <p className="text-xs font-bold text-destructive flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span>Out of Stock</span>
              </p>
            )}
            {isRunningLow && (
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Running Low (Min: {item.lowThreshold})</span>
              </p>
            )}
            {isInStock && (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>In Stock</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right: Stepper Controls & Context Menu */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Stepper Pill */}
        <div className="flex items-center gap-1.5 bg-surface-container rounded-xl p-1 shadow-2xs border border-border/40">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={item.quantity === 0 || updateMutation.isPending}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-card hover:bg-surface-container-high rounded-lg text-foreground font-bold shadow-2xs active:scale-90 transition-all cursor-pointer disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="w-7 sm:w-8 text-center font-extrabold text-base sm:text-lg text-foreground tabular-nums">
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={updateMutation.isPending}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-card hover:bg-surface-container-high rounded-lg text-primary font-bold shadow-2xs active:scale-90 transition-all cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-container transition-colors cursor-pointer"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-card border-border">
            {onEdit && (
              <DropdownMenuItem
                onClick={() => onEdit(item)}
                className="cursor-pointer text-xs font-semibold flex items-center gap-2"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Item
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleDelete}
              className="cursor-pointer text-xs font-semibold text-destructive focus:text-destructive flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
