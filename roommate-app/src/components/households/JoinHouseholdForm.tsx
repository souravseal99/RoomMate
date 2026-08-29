import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DoorOpen, Loader2 } from 'lucide-react';
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
import { joinHouseholdSchema, type JoinHouseholdInput } from '@/schemas/householdSchemas';
import { useJoinHouseholdMutation } from '@/hooks/queries/useHouseholdQueries';
import useHousehold from '@/hooks/useHousehold';
import { useToast } from '@/hooks/use-toast';

type Props = {
  onSuccess?: () => void;
};

export default function JoinHouseholdForm({ onSuccess }: Props) {
  const { switchActiveHousehold } = useHousehold();
  const { toast } = useToast();
  const joinMutation = useJoinHouseholdMutation();

  const form = useForm<JoinHouseholdInput>({
    resolver: zodResolver(joinHouseholdSchema),
    defaultValues: {
      inviteCode: '',
    },
  });

  const onSubmit = async (values: JoinHouseholdInput) => {
    const formattedCode = values.inviteCode.trim().toUpperCase();
    try {
      const response = await joinMutation.mutateAsync(formattedCode);
      const joinedHousehold = response?.data?.household;

      toast({
        title: 'Joined Household!',
        description: 'You are now a member of the shared space.',
      });

      if (joinedHousehold?.householdId) {
        switchActiveHousehold(joinedHousehold.householdId);
      }

      form.reset();
      onSuccess?.();
    } catch (err: any) {
      const status = err?.response?.status;
      let errorMessage = 'Failed to join household. Please check the code.';

      if (status === 404) {
        errorMessage = 'Household not found with this invite code.';
      } else if (status === 409) {
        errorMessage = 'You are already a member of this household.';
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      form.setError('inviteCode', { message: errorMessage });
      toast({
        title: 'Join Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="bg-surface-container border border-border p-card-padding flex flex-col h-full relative rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
          <DoorOpen className="w-5 h-5 text-primary" />
          Join Existing
        </h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Got an invite code? Enter it below to join your roommates instantly.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col flex-1">
          <FormField
            control={form.control}
            name="inviteCode"
            render={({ field }) => (
              <FormItem className="flex-1 flex flex-col justify-center">
                <FormLabel className="text-xs font-bold text-foreground text-center block">
                  Enter Invite Code
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. HGnIiO9q"
                    className="bg-surface border-border text-foreground text-center font-mono font-bold tracking-widest text-lg uppercase py-5 rounded focus:ring-primary"
                    disabled={joinMutation.isPending}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value.toUpperCase().replace(/\s+/g, ''));
                    }}
                  />
                </FormControl>
                <FormMessage className="text-xs text-destructive font-medium text-center" />
              </FormItem>
            )}
          />

          <div className="pt-4 mt-auto">
            <Button
              type="submit"
              disabled={joinMutation.isPending}
              className="w-full bg-surface hover:bg-surface-container-high border border-border text-foreground font-bold py-2.5 rounded active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              {joinMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Space'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
