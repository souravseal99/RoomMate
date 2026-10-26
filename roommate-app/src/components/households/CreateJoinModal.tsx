import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, KeyRound } from 'lucide-react';
import CreateHouseholdForm from './CreateHouseholdForm';
import JoinHouseholdForm from './JoinHouseholdForm';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'create' | 'join';
};

export default function CreateJoinModal({ open, onOpenChange, defaultTab = 'create' }: Props) {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>(defaultTab);

  // Sync activeTab whenever defaultTab or modal open changes
  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
    }
  }, [open, defaultTab]);

  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-foreground border-border w-full max-w-lg p-0 overflow-hidden shadow-2xl rounded-2xl flex flex-col max-h-[92vh]">
        <DialogTitle className="sr-only">
          {activeTab === 'create' ? 'Create a Living Space' : 'Join an Existing Living Space'}
        </DialogTitle>

        {/* Top Tab Bar */}
        <div className="p-4 pb-0 flex items-center justify-center border-b border-border/40 bg-surface-container/50">
          <div className="flex bg-surface-container-high p-1 rounded-xl w-full max-w-xs mb-3 shadow-xs gap-1">
            <Button
              type="button"
              variant={activeTab === 'create' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('create')}
              className={`flex-1 min-h-[44px] h-auto py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-card text-foreground shadow-xs hover:bg-card hover:text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-container'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Space</span>
            </Button>
            <Button
              type="button"
              variant={activeTab === 'join' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('join')}
              className={`flex-1 min-h-[44px] h-auto py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'join'
                  ? 'bg-card text-foreground shadow-xs hover:bg-card hover:text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-container'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Join Space</span>
            </Button>
          </div>
        </div>

        {/* Form Body Container with safe bottom padding */}
        <div className="px-5 py-5 sm:px-8 sm:py-6 overflow-y-auto max-h-[calc(92vh-90px)] overscroll-contain">
          {activeTab === 'create' ? (
            <CreateHouseholdForm
              onSuccess={handleSuccess}
              onSwitchToJoin={() => setActiveTab('join')}
            />
          ) : (
            <JoinHouseholdForm onSuccess={handleSuccess} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
