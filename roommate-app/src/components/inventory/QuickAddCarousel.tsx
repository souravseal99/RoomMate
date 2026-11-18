import { Plus } from 'lucide-react';
import { useCreateInventoryMutation } from '@/hooks/queries/useInventoryQueries';
import { Button } from '@/components/ui/button';

const QUICK_ITEMS = [
  { name: 'Whole Milk', defaultThreshold: 1 },
  { name: 'Large Eggs', defaultThreshold: 2 },
  { name: 'Sourdough Bread', defaultThreshold: 1 },
  { name: 'Coffee Beans', defaultThreshold: 1 },
  { name: 'Paper Towels', defaultThreshold: 2 },
  { name: 'Dish Soap', defaultThreshold: 1 },
  { name: 'Olive Oil', defaultThreshold: 1 },
  { name: 'Bananas', defaultThreshold: 2 },
  { name: 'Pasta', defaultThreshold: 1 },
  { name: 'Apples', defaultThreshold: 2 },
] as const;

type Props = {
  householdId: string;
};

export default function QuickAddCarousel({ householdId }: Props) {
  const createMutation = useCreateInventoryMutation();

  const handleQuickAdd = async (item: (typeof QUICK_ITEMS)[number]) => {
    if (createMutation.isPending) return;
    try {
      await createMutation.mutateAsync({
        name: item.name,
        quantity: 1,
        lowThreshold: item.defaultThreshold,
        householdId,
      });
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
          Quick Add Essentials
        </h3>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar -mx-1 px-1">
        {QUICK_ITEMS.map((item) => (
          <Button
            key={item.name}
            type="button"
            variant="outline"
            onClick={() => handleQuickAdd(item)}
            disabled={createMutation.isPending}
            className="flex shrink-0 items-center gap-2 bg-muted/40 hover:bg-muted border-border min-h-[44px] px-3.5 py-2 rounded-full shadow-2xs text-xs sm:text-sm font-bold text-foreground active:scale-95 transition-all group disabled:opacity-50"
          >
            <span>{item.name}</span>
            <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Button>
        ))}
      </div>
    </div>
  );
}
