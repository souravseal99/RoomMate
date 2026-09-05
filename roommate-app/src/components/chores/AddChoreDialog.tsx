import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sparkles, Loader2, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateChoreMutation } from '@/hooks/queries/useChoreQueries';
import useHousehold from '@/hooks/useHousehold';
import { useToast } from '@/hooks/use-toast';
import { getInitials } from '@/utils/utils';
import type { ChoreFrequency, ChorePriority } from '@/types/choreTypes';

const choreSchema = z.object({
  description: z
    .string()
    .min(2, 'Task title must be at least 2 characters')
    .max(100, 'Task title is too long'),
  frequency: z.enum([
    'daily',
    'twice-weekly',
    'weekly',
    'bi-weekly',
    'monthly',
  ] as const),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'] as const),
  assignedToId: z.string().optional(),
  notes: z.string().max(200, 'Notes are too long').optional(),
});

type ChoreFormData = z.infer<typeof choreSchema>;

const PRESET_TASKS = [
  { label: 'Take Out Trash', emoji: '🗑️' },
  { label: 'Wash Dishes', emoji: '🍽️' },
  { label: 'Clean Kitchen', emoji: '🧼' },
  { label: 'Vacuum Living Room', emoji: '🧹' },
  { label: 'Wipe Counters', emoji: '✨' },
  { label: 'Mop Floors', emoji: '🪣' },
];

interface AddChoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddChoreDialog({ open, onOpenChange }: AddChoreDialogProps) {
  const { toast } = useToast();
  const { activeHousehold, selectedHousehold, householdMembers } = useHousehold();
  const activeHouseholdId = activeHousehold?.householdId || selectedHousehold?.key;
  const createMutation = useCreateChoreMutation();
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChoreFormData>({
    resolver: zodResolver(choreSchema),
    defaultValues: {
      description: '',
      frequency: 'weekly',
      priority: 'MEDIUM',
      assignedToId: '',
      notes: '',
    },
  });

  const onSubmit = async (data: ChoreFormData) => {
    if (!activeHouseholdId) {
      toast({
        title: 'Household Required',
        description: 'Please select a household before adding chores.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        householdId: activeHouseholdId,
        description: data.description,
        frequency: data.frequency as ChoreFrequency,
        priority: data.priority as ChorePriority,
        assignedToId: selectedAssignee || undefined,
        notes: data.notes || '',
        nextDue: new Date().toLocaleDateString('en-GB'),
      });

      toast({
        title: 'Chore Created! ✨',
        description: `"${data.description}" added to the chore board.`,
      });

      reset();
      setSelectedAssignee('');
      onOpenChange(false);
    } catch {
      toast({
        title: 'Error Creating Chore',
        description: 'Failed to save chore. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSelectPreset = (title: string) => {
    setValue('description', title, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card text-card-foreground border-border rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Add New Chore
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Create a shared household task with 1-click presets and automated scheduling.
          </p>
        </DialogHeader>

        {/* 1-Click Preset Chips */}
        <div className="space-y-2 pt-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Quick Presets
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TASKS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleSelectPreset(preset.label)}
                className="px-3 py-1 text-xs font-semibold rounded-full bg-surface-container hover:bg-surface-container-high text-foreground border border-border/50 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
              >
                <span>{preset.emoji}</span>
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Task Title */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-bold text-foreground">
              Chore Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="description"
              placeholder="e.g., Clean living room whiteboard"
              {...register('description')}
              className={`bg-surface-container border-border rounded-xl ${
                errors.description ? 'border-destructive' : ''
              }`}
            />
            {errors.description && (
              <p className="text-destructive text-xs font-semibold">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Roommate Assignment Avatar Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground">
              Assign Roommate (Optional)
            </Label>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                type="button"
                onClick={() => setSelectedAssignee('')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                  selectedAssignee === ''
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-surface-container text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Anyone</span>
              </button>

              {householdMembers.map((member) => {
                const memberId = member.userId || member.householdMemberId;
                const isSelected = selectedAssignee === memberId;
                const memberName = member.user?.name || 'Roommate';

                return (
                  <button
                    key={memberId}
                    type="button"
                    onClick={() => setSelectedAssignee(memberId)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-surface-container text-foreground border-border hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-surface text-[10px] font-bold flex items-center justify-center border">
                      {getInitials(memberName)}
                    </span>
                    <span className="truncate max-w-[90px]">{memberName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Frequency & Priority Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Cadence</Label>
              <Select
                defaultValue="weekly"
                onValueChange={(val) => setValue('frequency', val as ChoreFrequency)}
              >
                <SelectTrigger className="bg-surface-container border-border rounded-xl">
                  <SelectValue placeholder="Select cadence" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="twice-weekly">Twice Weekly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Priority</Label>
              <Select
                defaultValue="MEDIUM"
                onValueChange={(val) => setValue('priority', val as ChorePriority)}
              >
                <SelectTrigger className="bg-surface-container border-border rounded-xl">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High 🔥</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-bold text-foreground">
              Notes (Optional)
            </Label>
            <Input
              id="notes"
              placeholder="e.g., Use the green microfiber cloth"
              {...register('notes')}
              className="bg-surface-container border-border rounded-xl"
            />
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full px-5 cursor-pointer border-border hover:bg-surface-container"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className="rounded-full px-6 bg-primary text-primary-foreground font-bold active:scale-95 shadow-md shadow-primary/20 cursor-pointer"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Chore'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddChoreDialog;
