import { Plus } from 'lucide-react';
import { useCreateInventoryMutation } from '@/hooks/queries/useInventoryQueries';

const QUICK_ITEMS = [
  { name: 'Whole Milk', emoji: '🥛', defaultThreshold: 1 },
  { name: 'Large Eggs', emoji: '🥚', defaultThreshold: 2 },
  { name: 'Sourdough Bread', emoji: '🍞', defaultThreshold: 1 },
  { name: 'Coffee Beans', emoji: '☕', defaultThreshold: 1 },
  { name: 'Paper Towels', emoji: '🧻', defaultThreshold: 2 },
  { name: 'Dish Soap', emoji: '🧼', defaultThreshold: 1 },
  { name: 'Olive Oil', emoji: '🫒', defaultThreshold: 1 },
  { name: 'Bananas', emoji: '🍌', defaultThreshold: 2 },
  { name: 'Pasta', emoji: '🍝', defaultThreshold: 1 },
  { name: 'Apples', emoji: '🍎', defaultThreshold: 2 },
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
          <button
            key={item.name}
            type="button"
            onClick={() => handleQuickAdd(item)}
            disabled={createMutation.isPending}
            className="flex shrink-0 items-center gap-2 bg-surface-container hover:bg-surface-container-high border border-border px-3.5 py-2 rounded-full shadow-2xs text-xs sm:text-sm font-bold text-foreground active:scale-95 transition-all cursor-pointer group disabled:opacity-50"
          >
            <span className="text-base">{item.emoji}</span>
            <span>{item.name}</span>
            <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
