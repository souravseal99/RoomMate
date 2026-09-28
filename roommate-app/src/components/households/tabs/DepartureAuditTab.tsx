import { useState } from 'react';
import { AlertTriangle, CheckSquare, Square, LogOut, Trash2 } from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import { toast } from 'sonner';

interface DepartureAuditTabProps {
  onOpenLeaveModal?: () => void;
  onOpenDeleteModal?: () => void;
}

export function DepartureAuditTab({
  onOpenLeaveModal,
  onOpenDeleteModal,
}: DepartureAuditTabProps) {
  const { activeHousehold } = useHousehold();
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
    4: false,
  });

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleInitiateMoveOut = () => {
    if (onOpenLeaveModal) {
      onOpenLeaveModal();
    } else {
      toast.info('Departure pre-flight verified. Proceeding with safe exit.');
    }
  };

  const handleInitiateDissolve = () => {
    if (onOpenDeleteModal) {
      onOpenDeleteModal();
    } else {
      toast.warning('Admin dissolution authorization required.');
    }
  };

  return (
    <div className="bg-card rounded-2xl p-5 sm:p-6 shadow-xs border border-border flex flex-col gap-6 w-full animate-in fade-in duration-200 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h2 className="font-bold text-lg text-foreground font-display tracking-tight">
            Tenant Departure &amp; Pre-Flight Audit
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Orderly, zero-friction transition protocols for moving out or dissolving the household.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-destructive/10 text-destructive font-mono text-[10px] font-bold uppercase self-start">
          Audit Checklist
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Moving Out Step-by-Step Checklist (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <span className="font-bold text-xs text-foreground font-display">
            Your Departure Pre-Flight (Moving out of {activeHousehold?.name || 'Unit 4B'})
          </span>

          <div className="bg-surface-container p-4 rounded-xl border border-border/80 flex flex-col gap-3.5">
            {/* Item 1 */}
            <button
              type="button"
              onClick={() => toggleCheck(1)}
              className="flex items-start gap-3 text-left cursor-pointer group"
            >
              {checkedItems[1] ? (
                <CheckSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div className="flex flex-col">
                <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                  1. Financial Ledger Settlement
                </span>
                <span className="text-[11px] text-muted-foreground leading-relaxed">
                  Current balance is positive (+$24.50). You need to receive funds before archive.
                </span>
              </div>
            </button>

            {/* Item 2 */}
            <button
              type="button"
              onClick={() => toggleCheck(2)}
              className="flex items-start gap-3 text-left cursor-pointer group"
            >
              {checkedItems[2] ? (
                <CheckSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div className="flex flex-col">
                <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                  2. Sublease / Successor Nomination
                </span>
                <span className="text-[11px] text-muted-foreground leading-relaxed">
                  Transfer lease agreement and introduce new flatmate candidate to current roster.
                </span>
              </div>
            </button>

            {/* Item 3 */}
            <button
              type="button"
              onClick={() => toggleCheck(3)}
              className="flex items-start gap-3 text-left cursor-pointer group"
            >
              {checkedItems[3] ? (
                <CheckSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div className="flex flex-col">
                <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                  3. Physical Key Fob &amp; Garage Remote Handover
                </span>
                <span className="text-[11px] text-muted-foreground leading-relaxed">
                  Return 2 sets of Medeco high-security keys to primary host admin.
                </span>
              </div>
            </button>

            {/* Item 4 */}
            <button
              type="button"
              onClick={() => toggleCheck(4)}
              className="flex items-start gap-3 text-left cursor-pointer group"
            >
              {checkedItems[4] ? (
                <CheckSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div className="flex flex-col">
                <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                  4. Pantry &amp; Storage Clear-Out Inspection
                </span>
                <span className="text-[11px] text-muted-foreground leading-relaxed">
                  Verify personal shelf, crisper bin, and basement locker are cleared.
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleInitiateMoveOut}
              className="px-5 py-2.5 min-h-[44px] bg-destructive text-white rounded-full font-bold text-xs hover:bg-destructive/90 active:scale-95 transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Initiate Move-Out</span>
            </button>
          </div>
        </div>

        {/* Right Column: Admin Zone: Household Dissolution (5 cols) */}
        <div className="lg:col-span-5 bg-destructive/5 border border-destructive/20 p-5 rounded-xl flex flex-col gap-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-bold text-xs font-display">
              Admin Zone: Household Dissolution
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            When the master lease expires and all flatmates vacate simultaneously.
          </p>

          <div className="bg-card p-3 rounded-lg border border-border/80 flex flex-col gap-1 text-[11px] text-muted-foreground">
            <span className="font-bold text-destructive">Cascade Archive:</span>
            <span>• Exports full 12-month expense history to PDF/CSV</span>
            <span>• Releases locked security deposit calculation ledger</span>
            <span>• Revokes shared smart-lock access passkeys</span>
          </div>

          <button
            type="button"
            onClick={handleInitiateDissolve}
            className="w-full mt-2 bg-destructive/10 hover:bg-destructive text-destructive hover:text-white py-2.5 min-h-[44px] rounded-xl font-bold text-xs transition-colors text-center cursor-pointer border border-destructive/30 flex items-center justify-center gap-2 active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>Dissolve Household</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DepartureAuditTab;
