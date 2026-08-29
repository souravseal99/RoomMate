import { Download, FileSpreadsheet, FileCode, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  householdName?: string;
  onExport: (format: 'csv' | 'json') => void;
};

export default function DataExportCard({
  householdName = 'Active Household',
  onExport,
}: Props) {
  return (
    <section className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-4 shadow-2xs">
      <div className="flex items-center gap-3 border-b border-border/60 pb-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-foreground">Data Portability &amp; Ledger Export</h3>
          <p className="text-xs text-muted-foreground">
            Download complete records of expenses, settlements, chores, and inventory
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-container/40 p-4 rounded-xl border border-border/60">
        <div>
          <h4 className="text-xs sm:text-sm font-extrabold text-foreground">
            Export Records for: <span className="text-primary">{householdName}</span>
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Download your flat's historical ledger for Excel, personal tax records, or backup
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => onExport('csv')}
            className="flex-1 sm:flex-none text-xs font-extrabold rounded-xl gap-1.5 cursor-pointer bg-card hover:bg-surface-container"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            CSV Spreadsheet
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => onExport('json')}
            className="flex-1 sm:flex-none text-xs font-extrabold rounded-xl gap-1.5 cursor-pointer bg-card hover:bg-surface-container"
          >
            <FileCode className="w-4 h-4 text-sky-500" />
            JSON Backup
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
        <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
        <span>All exports are generated client-side from your authenticated session.</span>
      </div>
    </section>
  );
}
