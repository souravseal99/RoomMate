import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, PackagePlus, Sparkles } from 'lucide-react';
import {
  useCreateInventoryMutation,
  useUpdateInventoryMutation,
} from '@/hooks/queries/useInventoryQueries';
import type { InventoryItem } from '@/types/inventoryTypes';

import { inventoryItemSchema, type InventoryItemFormValues } from '@/schemas/inventorySchemas';

type FormValues = InventoryItemFormValues;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: string;
  itemToEdit?: InventoryItem | null;
};

const PRESETS = [
  'Milk 🥛',
  'Eggs 🥚',
  'Bread 🍞',
  'Coffee ☕',
  'Dish Soap 🧼',
  'Olive Oil 🫒',
  'Paper Towels 🧻',
  'Bananas 🍌',
];

export default function AddInventoryItemDrawer({
  open,
  onOpenChange,
  householdId,
  itemToEdit,
}: Props) {
  const createMutation = useCreateInventoryMutation();
  const updateMutation = useUpdateInventoryMutation();

  const isEditing = !!itemToEdit;

  const form = useForm<FormValues>({
    resolver: zodResolver(inventoryItemSchema) as any,
    defaultValues: {
      name: '',
      quantity: 1,
      lowThreshold: 1,
    },
  });

  useEffect(() => {
    if (itemToEdit) {
      form.reset({
        name: itemToEdit.name,
        quantity: itemToEdit.quantity,
        lowThreshold: itemToEdit.lowThreshold,
      });
    } else {
      form.reset({
        name: '',
        quantity: 1,
        lowThreshold: 1,
      });
    }
  }, [itemToEdit, open, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && itemToEdit) {
        await updateMutation.mutateAsync({
          itemId: itemToEdit.inventoryItemId,
          householdId,
          data: {
            name: values.name.trim(),
            quantity: values.quantity,
            lowThreshold: values.lowThreshold,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: values.name.trim(),
          quantity: values.quantity,
          lowThreshold: values.lowThreshold,
          householdId,
        });
      }
      form.reset();
      onOpenChange(false);
    } catch {
      // Error handled by mutation
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-card text-foreground border-border p-6 flex flex-col justify-between"
      >
        <div className="space-y-6">
          <SheetHeader className="pb-4 border-b border-border/60">
            <SheetTitle className="text-xl font-extrabold flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-primary" />
              {isEditing ? 'Edit Supply Details' : 'Add Pantry Item'}
            </SheetTitle>
          </SheetHeader>

          {/* Preset Chips (only when creating new) */}
          {!isEditing && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Quick Suggestions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      const cleanName = preset.split(' ')[0];
                      form.setValue('name', cleanName);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-container hover:bg-surface-container-high border border-border text-foreground transition-all cursor-pointer active:scale-95"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Item Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Whole Milk"
                        className="bg-surface border-border text-foreground text-sm font-semibold rounded-xl focus:border-primary"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive font-medium" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Current Qty
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          className="bg-surface border-border text-foreground text-sm font-semibold rounded-xl focus:border-primary"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-destructive font-medium" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lowThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Min Threshold
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          className="bg-surface border-border text-foreground text-sm font-semibold rounded-xl focus:border-primary"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-destructive font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-6 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  className="flex-1 border-border font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold rounded-xl shadow-xs cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : isEditing ? (
                    'Update Item'
                  ) : (
                    'Add to Pantry'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
