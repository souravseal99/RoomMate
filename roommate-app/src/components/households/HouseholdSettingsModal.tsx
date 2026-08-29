import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { updateHouseholdSchema, type UpdateHouseholdInput } from '@/schemas/householdSchemas';
import { useUpdateHouseholdMutation } from '@/hooks/queries/useHouseholdQueries';
import { useToast } from '@/hooks/use-toast';
import type { HouseholdResponse } from '@/types/householdTypes';

type Props = {
  household: HouseholdResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function HouseholdSettingsModal({ household, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const updateMutation = useUpdateHouseholdMutation();

  const form = useForm<UpdateHouseholdInput>({
    resolver: zodResolver(updateHouseholdSchema),
    defaultValues: {
      name: household.name,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: household.name });
    }
  }, [open, household.name, form]);

  const onSubmit = async (values: UpdateHouseholdInput) => {
    try {
      await updateMutation.mutateAsync({
        householdId: household.householdId,
        name: values.name,
      });

      toast({
        title: 'Household Renamed',
        description: `Successfully renamed to "${values.name}".`,
      });

      onOpenChange(false);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || 'Failed to update household name. Please try again.';
      form.setError('name', { message: errorMessage });
      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-2 border-border max-w-md p-0 overflow-hidden shadow-tactile rounded-lg">
        <DialogHeader className="p-content-padding bg-surface-container border-b border-border">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" />
            Edit Household
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Change the display name of your shared living space.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-content-padding space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-foreground">Household Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Downtown Apartment"
                      className="bg-surface border-border text-foreground font-medium"
                      disabled={updateMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive font-medium" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
                className="bg-surface border-border hover:bg-surface-container text-foreground cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-primary-container hover:opacity-90 text-primary-foreground font-bold active:scale-95 transition-all cursor-pointer"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
