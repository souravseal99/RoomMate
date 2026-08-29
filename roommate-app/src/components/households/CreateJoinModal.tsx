import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CreateHouseholdForm from './CreateHouseholdForm';
import JoinHouseholdForm from './JoinHouseholdForm';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'create' | 'join';
};

export default function CreateJoinModal({ open, onOpenChange }: Props) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-2 border-border w-full max-w-2xl p-0 overflow-hidden shadow-tactile rounded-lg sm:max-h-[90vh] flex flex-col">
        <DialogHeader className="border-b border-border p-content-padding bg-surface-container flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-xl md:text-2xl font-bold text-foreground">
            Setup Your Home
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 overflow-y-auto max-h-[calc(85vh-120px)]">
          <CreateHouseholdForm onSuccess={handleSuccess} />
          <JoinHouseholdForm onSuccess={handleSuccess} />
        </div>

        <div className="border-t border-border p-3 bg-surface-container text-center">
          <p className="text-xs text-muted-foreground">
            Questions about shared spaces? Contact your house admin or invite roommates via link.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
