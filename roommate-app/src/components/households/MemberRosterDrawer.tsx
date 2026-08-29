import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { MemberRosterView } from './MemberRosterView';
import type { HouseholdResponse } from '@/types/householdTypes';

type Props = {
  household: HouseholdResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSettings?: () => void;
  onOpenLeave?: () => void;
};

export default function MemberRosterDrawer({
  household,
  open,
  onOpenChange,
  onOpenSettings,
  onOpenLeave,
}: Props) {
  if (!household) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-card text-card-foreground border-border p-6 overflow-y-auto"
      >
        <MemberRosterView
          household={household}
          onBack={() => onOpenChange(false)}
          onOpenSettings={onOpenSettings}
          onOpenLeave={onOpenLeave}
        />
      </SheetContent>
    </Sheet>
  );
}
