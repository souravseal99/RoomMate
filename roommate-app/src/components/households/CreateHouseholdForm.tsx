import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Home, Loader2, Sparkles, Users } from 'lucide-react';
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
import {
  createHouseholdSchema,
  type CreateHouseholdInput,
  SUGGESTED_HOUSEHOLD_NAMES,
} from '@/schemas/householdSchemas';
import {
  useCreateHouseholdMutation,
  useSuggestedMembersQuery,
} from '@/hooks/queries/useHouseholdQueries';
import useHousehold from '@/hooks/useHousehold';
import { toast } from 'sonner';
import { getInitials } from '@/utils/utils';

type Props = {
  onSuccess?: () => void;
};

export default function CreateHouseholdForm({ onSuccess }: Props) {
  const navigate = useNavigate();
  const { switchActiveHousehold } = useHousehold();
  const createMutation = useCreateHouseholdMutation();
  const { data: suggestedMembers = [] } = useSuggestedMembersQuery();

  const form = useForm<CreateHouseholdInput>({
    resolver: zodResolver(createHouseholdSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (values: CreateHouseholdInput) => {
    try {
      const response = await createMutation.mutateAsync({ name: values.name });
      const created = response?.data?.household;

      if (created?.householdId) {
        switchActiveHousehold(created.householdId);
      }

      toast.success(`Welcome to "${values.name}"! You are the space admin.`);

      form.reset();
      onSuccess?.();
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || 'Failed to create household. Please try again.';
      form.setError('name', { message: errorMessage });
      toast.error(errorMessage);
    }
  };

  const handleChipClick = (name: string) => {
    form.setValue('name', name, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <div className="bg-surface-container border border-border p-5 flex flex-col h-full relative rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
          <Home className="w-5 h-5 text-primary" />
          Create Space
        </h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        Start fresh. Set up a new shared living space and invite roommates.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col flex-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-foreground">Household Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. The Penthouse"
                    className="bg-surface border-border text-foreground focus:ring-primary font-medium"
                    disabled={createMutation.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-destructive font-medium" />
              </FormItem>
            )}
          />

          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Quick suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_HOUSEHOLD_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleChipClick(name)}
                  className="bg-surface hover:bg-surface-container-high border border-border/70 px-2.5 py-1 text-xs font-medium rounded-lg transition-all active:scale-95 cursor-pointer text-foreground"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Connected Roommates Preview */}
          {suggestedMembers.length > 0 && (
            <div className="pt-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-2">
                <Users className="w-3.5 h-3.5 text-primary" /> Your connected flatmates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedMembers.slice(0, 4).map((member) => (
                  <div
                    key={member.userId}
                    className="bg-surface-container-low border border-border px-2.5 py-1 text-[11px] font-medium rounded-lg text-foreground flex items-center gap-1.5 shadow-xs"
                    title={`From ${member.sharedHouseholds.join(', ')}`}
                  >
                    <span className="w-4 h-4 rounded-full bg-surface text-[9px] font-bold flex items-center justify-center">
                      {getInitials(member.name)}
                    </span>
                    <span>{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 mt-auto">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 rounded-xl active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Space'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
