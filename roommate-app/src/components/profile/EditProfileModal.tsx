import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, User } from 'lucide-react';
import { useUpdateProfileMutation } from '@/hooks/queries/useUserQueries';
import type { UserProfile } from '@/api/userApi';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  livingHabits: z.string().max(300, 'Bio is too long').optional(),
});

type FormValues = z.infer<typeof profileSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: UserProfile;
  livingHabits: string;
  onSaveHabits: (habits: string) => void;
};

export default function EditProfileModal({
  open,
  onOpenChange,
  profile,
  livingHabits,
  onSaveHabits,
}: Props) {
  const updateMutation = useUpdateProfileMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || '',
      livingHabits: livingHabits || '',
    },
  });

  useEffect(() => {
    if (open && profile) {
      form.reset({
        name: profile.name,
        livingHabits: livingHabits,
      });
    }
  }, [open, profile, livingHabits, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await updateMutation.mutateAsync({ name: values.name.trim() });
      if (values.livingHabits) {
        onSaveHabits(values.livingHabits.trim());
      }
      onOpenChange(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-foreground border-border max-w-md p-6 rounded-2xl">
        <DialogHeader className="pb-3 border-b border-border/60">
          <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Edit Profile Details
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Alex Johnson"
                      className="bg-surface border-border text-foreground text-sm font-semibold rounded-xl focus:border-primary"
                      disabled={updateMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="livingHabits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Living Habits &amp; Roommate Bio
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Share your schedule, kitchen habits, or weekend routines with flatmates..."
                      className="bg-surface border-border text-foreground text-xs sm:text-sm font-medium rounded-xl focus:border-primary resize-none"
                      disabled={updateMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive font-medium" />
                </FormItem>
              )}
            />

            <div className="pt-4 flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
                className="font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold rounded-xl shadow-xs"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
