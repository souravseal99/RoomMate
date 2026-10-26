import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateInventoryMutation } from '@/hooks/queries/useInventoryQueries';
import useHousehold from '@/hooks/useHousehold';
import { toast } from 'sonner';

interface AddItemFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddItemForm({ onSuccess, onCancel }: AddItemFormProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [lowThreshold, setLowThreshold] = useState('');
  const { selectedHousehold } = useHousehold();
  const createMutation = useCreateInventoryMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedHousehold) {
      toast.error('Please select a household first');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name,
        quantity: parseInt(quantity),
        lowThreshold: parseInt(lowThreshold),
        householdId: selectedHousehold.key,
      });
      onSuccess();
    } catch (error) {
      console.error('APP:: AddItemForm:: Failed to add item:', error);
    }
  };

  const isLoading = createMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-bold text-foreground">
          Item Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Milk, Bread, Rice"
          className="min-h-[44px] rounded-xl bg-card border-border"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="quantity" className="text-xs font-bold text-foreground">
          Current Quantity
        </Label>
        <Input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="0"
          min="0"
          className="min-h-[44px] rounded-xl bg-card border-border font-mono"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lowThreshold" className="text-xs font-bold text-foreground">
          Low Stock Threshold
        </Label>
        <Input
          id="lowThreshold"
          type="number"
          value={lowThreshold}
          onChange={(e) => setLowThreshold(e.target.value)}
          placeholder="5"
          min="1"
          className="min-h-[44px] rounded-xl bg-card border-border font-mono"
          required
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 min-h-[44px] rounded-xl font-bold"
        >
          {isLoading ? 'Adding...' : 'Add Item'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 min-h-[44px] rounded-xl font-bold"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
