import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Home, Loader2, Plus, ArrowRight, Edit3, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  createHouseholdSchema,
  type CreateHouseholdInput,
} from '@/schemas/householdSchemas';
import {
  useCreateHouseholdMutation,
  useSuggestedMembersQuery,
} from '@/hooks/queries/useHouseholdQueries';
import useHousehold from '@/hooks/useHousehold';
import { toast } from 'sonner';
import { getInitials } from '@/utils/utils';

const CLASSIC_SUGGESTIONS = [
  'The Penthouse',
  'Baker St Crew',
  'Flat 204',
  'Casa de Amigos',
  'The Hub',
  'The Sunny Loft',
] as const;

type Props = {
  onSuccess?: () => void;
  onSwitchToJoin?: () => void;
};

export default function CreateHouseholdForm({ onSuccess, onSwitchToJoin }: Props) {
  const navigate = useNavigate();
  const { switchActiveHousehold } = useHousehold();
  const createMutation = useCreateHouseholdMutation();
  const { data: suggestedMembers = [] } = useSuggestedMembersQuery();
  const [activeChip, setActiveChip] = useState<string | null>(null);

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
    setActiveChip(name);
    form.setValue('name', name, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <div className="w-full flex flex-col justify-between space-y-4 pb-2">
      {/* Hero Section */}
      <div className="flex flex-col items-start space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
          <Home className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
            Name your space.
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pick a classic name or type your own to start collaborating.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col flex-1">
          {/* Classic Suggestion Grid */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">
              Pick a classic:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {CLASSIC_SUGGESTIONS.map((name) => {
                const isSelected = activeChip === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleChipClick(name)}
                    className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-left flex justify-between items-center transition-all cursor-pointer shadow-xs active:scale-95 group ${
                      isSelected
                        ? 'bg-primary/10 border-2 border-primary text-primary'
                        : 'bg-surface-container border border-border text-foreground hover:border-primary/50 hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="truncate">{name}</span>
                    <Plus
                      className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                        isSelected ? 'opacity-100 text-primary' : 'opacity-40 group-hover:opacity-100'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Name Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="household-name"
              className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground block"
            >
              Or type your own
            </label>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <FormControl>
                      <Input
                        id="household-name"
                        placeholder="e.g. The Sunny Loft"
                        className="h-12 px-3.5 bg-surface border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary font-semibold text-sm sm:text-base rounded-xl shadow-xs pr-10"
                        disabled={createMutation.isPending}
                        {...field}
                        onChange={(e) => {
                          setActiveChip(null);
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                      <Edit3 className="w-4 h-4" />
                    </div>
                  </div>
                  <FormMessage className="text-xs text-destructive font-medium mt-1" />
                </FormItem>
              )}
            />
          </div>

          {/* Connected Roommates Recommendation Preview */}
          {suggestedMembers.length > 0 && (
            <div className="space-y-1.5 pt-0.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-primary" /> Your connected flatmates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedMembers.slice(0, 4).map((member) => (
                  <div
                    key={member.userId}
                    className="bg-surface-container-low border border-border px-2.5 py-1 text-[11px] font-semibold rounded-lg text-foreground flex items-center gap-1.5 shadow-xs"
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

          {/* Action CTA */}
          <div className="pt-2 space-y-2.5">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-between px-5 shadow-md shadow-primary/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              {createMutation.isPending ? (
                <div className="flex items-center gap-2 mx-auto">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Space...</span>
                </div>
              ) : (
                <>
                  <span className="tracking-wide">Create &amp; Get Invite Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            {onSwitchToJoin && (
              <p className="text-center text-xs text-muted-foreground">
                Already have an invite code?{' '}
                <button
                  type="button"
                  onClick={onSwitchToJoin}
                  className="font-bold text-primary hover:underline cursor-pointer"
                >
                  Join existing space
                </button>
              </p>
            )}

            <p className="text-center text-[10px] sm:text-[11px] text-muted-foreground/80 max-w-xs mx-auto leading-normal">
              By creating a household, you agree to our Shared Space Guidelines.
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
