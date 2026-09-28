import { Receipt, Download, RefreshCw } from 'lucide-react';
import type { HouseholdMember } from '@/types/householdTypes';

interface ExpensesSubHeaderProps {
  householdName: string;
  members: HouseholdMember[];
  onExportCsv: () => void;
  onOpenSundaySquareUp: () => void;
}

export function ExpensesSubHeader({
  householdName,
  members,
  onExportCsv,
  onOpenSundaySquareUp,
}: ExpensesSubHeaderProps) {
  const activeMembersCount = members.length || 4;

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2 pb-1 select-none">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
            <Receipt className="w-4 h-4 stroke-[2.2]" />
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground tracking-tight">
            Expenses & Settlement Hub
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          All balances square •{' '}
          <span className="font-semibold text-primary">
            {activeMembersCount} flatmates active
          </span>{' '}
          in <span className="font-medium text-foreground">{householdName}</span>
        </p>
      </div>

      {/* Mode Action Pills */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onExportCsv}
          className="px-4 py-2 min-h-[44px] bg-surface-container hover:bg-surface-container-high text-foreground font-semibold text-xs rounded-full border border-border/60 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
        >
          <Download className="w-4 h-4 text-muted-foreground" />
          <span>Export CSV</span>
        </button>

        <button
          type="button"
          onClick={onOpenSundaySquareUp}
          className="px-4 py-2 min-h-[44px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-full shadow-sm border-b-2 border-primary-fixed-dim transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sunday Square-Up</span>
        </button>
      </div>
    </div>
  );
}
