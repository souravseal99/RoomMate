import { Minus, Plus, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import type { InventoryItem } from '@/types/inventoryTypes';
import {
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
} from '@/hooks/queries/useInventoryQueries';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

  const categoryBg = isOutOfStock
    ? 'bg-destructive/10 text-destructive'
    : isRunningLow
      ? 'bg-muted text-muted-foreground'
      : 'bg-primary/10 text-primary';

  return (
    <Card className="rounded-2xl p-4 flex items-center justify-between shadow-xs border-border hover:border-primary/40 transition-all group">
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
              <Badge variant="destructive" className="text-[11px] font-bold h-5 px-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Out of Stock</span>
              </Badge>
            )}
            {isRunningLow && (
              <Badge variant="outline" className="text-[11px] font-bold h-5 px-1.5 flex items-center gap-1.5 border-border text-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                <span>Running Low (Min: {item.lowThreshold})</span>
              </Badge>
            )}
            {isInStock && (
              <Badge variant="secondary" className="text-[11px] font-bold h-5 px-1.5 flex items-center gap-1.5 text-primary bg-primary/10 border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>In Stock</span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Right: Stepper Controls & Context Menu */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Stepper Pill */}
        <div className="flex items-center gap-1 bg-muted/60 rounded-xl p-1 shadow-2xs border border-border/40">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDecrement}
            disabled={item.quantity === 0 || updateMutation.isPending}
            className="min-w-[44px] min-h-[44px] bg-card hover:bg-muted rounded-lg text-foreground font-bold shadow-2xs active:scale-90"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </Button>

          <span className="w-7 sm:w-8 text-center font-extrabold text-base sm:text-lg text-foreground tabular-nums font-mono">
            {item.quantity}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleIncrement}
            disabled={updateMutation.isPending}
            className="min-w-[44px] min-h-[44px] bg-card hover:bg-muted rounded-lg text-primary font-bold shadow-2xs active:scale-90"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="min-w-[44px] min-h-[44px] rounded-lg text-muted-foreground hover:text-foreground"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-card border-border">
            {onEdit && (
              <DropdownMenuItem
                onClick={() => onEdit(item)}
                className="cursor-pointer text-xs font-semibold flex items-center gap-2 min-h-[36px]"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Item
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleDelete}
              className="cursor-pointer text-xs font-semibold text-destructive focus:text-destructive flex items-center gap-2 min-h-[36px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
