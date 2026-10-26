import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Home,
  Loader2,
  Plus,
  ArrowRight,
  Edit3,
  Users,
  ChevronDown,
  ChevronUp,
  Sliders,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { createHouseholdSchema, type CreateHouseholdInput } from '@/schemas/householdSchemas';
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
  const [showEssentials, setShowEssentials] = useState(false);

  const form = useForm<CreateHouseholdInput>({
    resolver: zodResolver(createHouseholdSchema),
    defaultValues: {
      name: '',
      settings: {
        unitOrApt: '',
        targetRoommates: 4,
        billingCycleDay: 1,
        trashDay: 'Wednesday',
        wifiSsid: '',
        wifiPassword: '',
        currency: 'USD',
      },
    },
  });

  const onSubmit = async (values: CreateHouseholdInput) => {
    try {
      const response = await createMutation.mutateAsync({
        name: values.name,
        settings: values.settings,
      });
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
            <span className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground font-mono">
              Pick a classic:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {CLASSIC_SUGGESTIONS.map((name) => {
                const isSelected = activeChip === name;
                return (
                  <Button
                    key={name}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => handleChipClick(name)}
                    className={`px-3 py-2.5 min-h-[44px] h-auto rounded-xl text-xs sm:text-sm font-bold text-left flex justify-between items-center transition-all cursor-pointer shadow-xs active:scale-95 group ${
                      isSelected
                        ? 'bg-primary/10 border-2 border-primary text-primary hover:bg-primary/15'
                        : 'bg-surface-container border-border text-foreground hover:border-primary/50 hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="truncate">{name}</span>
                    <Plus
                      className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                        isSelected
                          ? 'opacity-100 text-primary'
                          : 'opacity-40 group-hover:opacity-100'
                      }`}
                    />
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Custom Name Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="household-name"
              className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground block font-mono"
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
                        className="h-12 min-h-[44px] px-3.5 bg-surface border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary font-semibold text-sm sm:text-base rounded-xl shadow-xs pr-10"
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

          {/* Progressive Disclosure: Flat Essentials (Optional) */}
          <div className="border border-border/80 rounded-xl overflow-hidden bg-surface-container">
            <button
              type="button"
              onClick={() => setShowEssentials((prev) => !prev)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left cursor-pointer hover:bg-surface-container-high transition-colors min-h-[44px]"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Living Space Essentials</span>
                <Badge
                  variant="outline"
                  className="text-[9px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border-primary/20 px-1.5 py-0.2"
                >
                  Optional
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                <span>{showEssentials ? 'Hide' : 'Configure now'}</span>
                {showEssentials ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </div>
            </button>

            {showEssentials && (
              <div className="p-3.5 pt-2 border-t border-border/60 space-y-3 bg-card/60">
                <p className="text-[11px] text-muted-foreground">
                  Personalize your flat vitals. You can update these anytime in space settings.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Unit or Apt # */}
                  <FormField
                    control={form.control}
                    name="settings.unitOrApt"
                    render={({ field }) => (
                      <FormItem>
                        <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                          Unit / Apt #
                        </label>
                        <FormControl>
                          <Input
                            placeholder="e.g. Unit 4B"
                            className="h-10 min-h-[40px] px-3 bg-surface border-border text-foreground text-xs rounded-lg"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Target Roommates */}
                  <FormField
                    control={form.control}
                    name="settings.targetRoommates"
                    render={({ field }) => (
                      <FormItem>
                        <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                          Target Capacity (Roommates)
                        </label>
                        <FormControl>
                          <select
                            className="w-full h-10 min-h-[40px] px-3 bg-surface border border-border text-foreground text-xs rounded-lg cursor-pointer focus:ring-1 focus:ring-primary"
                            value={field.value ?? 4}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          >
                            {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                              <option key={num} value={num}>
                                {num} Flatmates
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
                        <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                          Billing Rollover Day
                        </label>
                        <FormControl>
                          <select
                            className="w-full h-10 min-h-[40px] px-3 bg-surface border border-border text-foreground text-xs rounded-lg cursor-pointer focus:ring-1 focus:ring-primary"
                            value={field.value ?? 1}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          >
                            <option value={1}>1st of month (Standard)</option>
                            <option value={5}>5th of month</option>
                            <option value={10}>10th of month</option>
                            <option value={15}>15th of month (Mid-month)</option>
                            <option value={20}>20th of month</option>
                            <option value={25}>25th of month</option>
                            <option value={28}>28th of month (End-month)</option>
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
                        <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                          Trash Pickup Night
                        </label>
                        <FormControl>
                          <select
                            className="w-full h-10 min-h-[40px] px-3 bg-surface border border-border text-foreground text-xs rounded-lg cursor-pointer focus:ring-1 focus:ring-primary"
                            value={field.value ?? 'Wednesday'}
                            onChange={(e) => field.onChange(e.target.value)}
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
                        <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                          Wi-Fi Network Name
                        </label>
                        <FormControl>
                          <Input
                            placeholder="e.g. Loft_4B_5G"
                            className="h-10 min-h-[40px] px-3 bg-surface border-border text-foreground text-xs rounded-lg"
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
                        <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                          Wi-Fi Password
                        </label>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="e.g. FiberLoft@2024"
                            className="h-10 min-h-[40px] px-3 bg-surface border-border text-foreground text-xs rounded-lg font-mono"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Connected Roommates Recommendation Preview */}
          {suggestedMembers.length > 0 && (
            <div className="space-y-1.5 pt-0.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 font-mono">
                <Users className="w-3.5 h-3.5 text-primary" /> Your connected flatmates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedMembers.slice(0, 4).map((member) => (
                  <Badge
                    key={member.userId}
                    variant="outline"
                    className="bg-surface-container-low border-border px-2.5 py-1 text-[11px] font-semibold rounded-lg text-foreground flex items-center gap-1.5 shadow-xs"
                    title={`From ${member.sharedHouseholds.join(', ')}`}
                  >
                    <Avatar className="w-4 h-4">
                      <AvatarFallback className="bg-surface text-[9px] font-bold text-foreground">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action CTA */}
          <div className="pt-2 space-y-2.5">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full min-h-[48px] h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-between px-5 shadow-sm active:scale-[0.98] transition-all cursor-pointer border-b-2 border-primary-fixed-dim"
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
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onSwitchToJoin}
                  className="font-bold text-primary hover:underline cursor-pointer p-0 h-auto"
                >
                  Join existing space
                </Button>
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
