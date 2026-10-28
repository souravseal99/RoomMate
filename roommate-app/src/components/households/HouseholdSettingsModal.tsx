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
    resolver: zodResolver(updateHouseholdSchema) as any,
    defaultValues: {
      name: household.name,
      settings: {
        unitOrApt: household.settings?.unitOrApt || '',
        targetRoommates: household.settings?.targetRoommates ?? 4,
        billingCycleDay: household.settings?.billingCycleDay ?? 1,
        trashDay: (household.settings?.trashDay as any) || 'Wednesday',
        wifiSsid: household.settings?.wifiSsid || '',
        wifiPassword: household.settings?.wifiPassword || '',
        currency: household.settings?.currency || 'USD',
      },
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: household.name,
        settings: {
          unitOrApt: household.settings?.unitOrApt || '',
          targetRoommates: household.settings?.targetRoommates ?? 4,
          billingCycleDay: household.settings?.billingCycleDay ?? 1,
          trashDay: (household.settings?.trashDay as any) || 'Wednesday',
          wifiSsid: household.settings?.wifiSsid || '',
          wifiPassword: household.settings?.wifiPassword || '',
          currency: household.settings?.currency || 'USD',
        },
      });
    }
  }, [open, household, form]);

  const onSubmit = async (values: UpdateHouseholdInput) => {
    try {
      await updateMutation.mutateAsync({
        householdId: household.householdId,
        name: values.name,
        settings: values.settings,
      });

      toast({
        title: 'Settings Saved',
        description: `Successfully updated settings for "${values.name}".`,
      });

      onOpenChange(false);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || 'Failed to update household settings. Please try again.';
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
      <DialogContent className="bg-card text-foreground border border-border max-w-lg p-0 overflow-hidden shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 bg-surface-container border-b border-border/60">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" />
            Space Settings &amp; Living Vitals
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Update your flat display name, apartment unit, Wi-Fi credentials, and schedules.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Household Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className="text-xs font-bold text-foreground">
                      Household Display Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Downtown Apartment"
                        className="bg-surface border-border text-foreground font-medium min-h-[44px] rounded-xl"
                        disabled={updateMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive font-medium" />
                  </FormItem>
                )}
              />

              {/* Unit / Apt # */}
              <FormField
                control={form.control}
                name="settings.unitOrApt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">
                      Unit / Apartment #
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Unit 4B"
                        className="bg-surface border-border text-foreground font-medium min-h-[44px] rounded-xl"
                        disabled={updateMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Target Roommate Capacity */}
              <FormField
                control={form.control}
                name="settings.targetRoommates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">
                      Target Capacity
                    </FormLabel>
                    <FormControl>
                      <select
                        className="w-full min-h-[44px] px-3 bg-surface border border-border text-foreground text-xs rounded-xl cursor-pointer focus:ring-1 focus:ring-primary"
                        value={field.value ?? 4}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={updateMutation.isPending}
                      >
                        {[2, 3, 4, 5, 6, 7, 8, 10].map((num) => (
                          <option key={num} value={num}>
                            {num} Roommate Slots
                          </option>
                        ))}
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Billing Rollover Day */}
              <FormField
                control={form.control}
                name="settings.billingCycleDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">
                      Billing Rollover Day
                    </FormLabel>
                    <FormControl>
                      <select
                        className="w-full min-h-[44px] px-3 bg-surface border border-border text-foreground text-xs rounded-xl cursor-pointer focus:ring-1 focus:ring-primary"
                        value={field.value ?? 1}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={updateMutation.isPending}
                      >
                        <option value={1}>1st of Month (Standard)</option>
                        <option value={5}>5th of Month</option>
                        <option value={10}>10th of Month</option>
                        <option value={15}>15th of Month</option>
                        <option value={20}>20th of Month</option>
                        <option value={25}>25th of Month</option>
                        <option value={28}>28th of Month</option>
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Trash Night */}
              <FormField
                control={form.control}
                name="settings.trashDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">
                      Trash Pickup Night
                    </FormLabel>
                    <FormControl>
                      <select
                        className="w-full min-h-[44px] px-3 bg-surface border border-border text-foreground text-xs rounded-xl cursor-pointer focus:ring-1 focus:ring-primary"
                        value={field.value ?? 'Wednesday'}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={updateMutation.isPending}
                      >
                        {[
                          'Sunday',
                          'Monday',
                          'Tuesday',
                          'Wednesday',
                          'Thursday',
                          'Friday',
                          'Saturday',
                        ].map((day) => (
                          <option key={day} value={day}>
                            {day} Night
                          </option>
                        ))}
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Wi-Fi SSID */}
              <FormField
                control={form.control}
                name="settings.wifiSsid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">
                      Wi-Fi Network Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Loft_4B_5G"
                        className="bg-surface border-border text-foreground font-medium min-h-[44px] rounded-xl"
                        disabled={updateMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Wi-Fi Password */}
              <FormField
                control={form.control}
                name="settings.wifiPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">
                      Wi-Fi Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="e.g. SecretPassword123"
                        className="bg-surface border-border text-foreground font-mono font-medium min-h-[44px] rounded-xl"
                        disabled={updateMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4 flex items-center justify-end gap-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
                className="bg-surface border-border hover:bg-surface-container text-foreground cursor-pointer min-h-[44px] rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold active:scale-95 transition-all cursor-pointer min-h-[44px] rounded-xl border-b-2 border-primary-fixed-dim"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
