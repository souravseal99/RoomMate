import { useState } from 'react';
import { Upload, FileText, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';

interface StoredReceipt {
  id: string;
  merchant: string;
  amount: number;
  uploadedBy: string;
  date: string;
  tag: string;
  splitInfo: string;
}

const DEMO_RECEIPTS: StoredReceipt[] = [
  {
    id: 'rc-1',
    merchant: 'Costco Cleaning & Coffee',
    amount: 60.0,
    uploadedBy: 'Alex Chen',
    date: 'Oct 20, 2024',
    tag: 'Bulk run',
    splitInfo: 'Split 4-ways ($15.00 ea)',
  },
  {
    id: 'rc-2',
    merchant: "Trader Joe's Communal Haul",
    amount: 112.4,
    uploadedBy: 'Sarah Lin',
    date: 'Oct 18, 2024',
    tag: 'Groceries',
    splitInfo: 'Split 4-ways ($28.10 ea)',
  },
  {
    id: 'rc-3',
    merchant: 'ConEd Power & Gas',
    amount: 184.2,
    uploadedBy: 'Sourav Seal (You)',
    date: 'Oct 15, 2024',
    tag: 'Utilities',
    splitInfo: 'Split 4-ways ($46.05 ea)',
  },
  {
    id: 'rc-4',
    merchant: 'Whole Foods Market Produce',
    amount: 48.0,
    uploadedBy: 'Sourav Seal (You)',
    date: 'Oct 12, 2024',
    tag: 'Pantry restock',
    splitInfo: 'Split 4-ways ($12.00 ea)',
  },
];

export function ReceiptVaultTab() {
  const [selectedReceipt, setSelectedReceipt] = useState<StoredReceipt | null>(null);

  const handleUploadClick = () => {
    toast.info('OCR receipt parser ready! Select an image or PDF to scan.');
  };

  const handleDownload = (receipt: StoredReceipt) => {
    toast.success(`Receipt for ${receipt.merchant} downloaded.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 select-none">
      {/* 1. Upload Dropzone Banner */}
      <div
        onClick={handleUploadClick}
        className="bg-card rounded-2xl p-6 sm:p-8 border-2 border-dashed border-border hover:border-primary/60 transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer group shadow-xs"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
          <Upload className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="space-y-1">
          <h3 className="font-display font-extrabold text-base text-foreground group-hover:text-primary transition-colors">
            Drop receipts or invoice scans here
          </h3>
          <p className="text-xs text-muted-foreground max-w-md">
            Drag in grocery store receipts, utility statements, or restaurant slips. Automatic itemized OCR will extract totals and flatmate shares.
          </p>
        </div>
        <button
          type="button"
          className="px-4 py-2 min-h-[44px] bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm border-b-2 border-primary-fixed-dim hover:bg-primary/90 transition-all active:scale-95"
        >
          Select File to Scan
        </button>
      </div>

      {/* 2. Stored Receipts Vault Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-border/40">
          <div>
            <h3 className="font-display font-extrabold text-lg text-foreground">
              Stored Domestic Receipts ({DEMO_RECEIPTS.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              Archived digital slips verifying recent shared expenses
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEMO_RECEIPTS.map((receipt) => (
            <div
              key={receipt.id}
              className="bg-card rounded-2xl p-5 border border-border shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0 border border-border/60">
                    <FileText className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">
                      {receipt.merchant}
                    </h4>
                    <p className="text-xs text-muted-foreground pt-0.5">
                      Uploaded by <strong>{receipt.uploadedBy}</strong> • {receipt.date}
                    </p>
                  </div>
                </div>

                <div className="font-mono font-extrabold text-base text-foreground tabular-nums">
                  ${receipt.amount.toFixed(2)}
                </div>
              </div>

              {/* Tag and Split info */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-foreground text-[10px] font-mono font-bold">
                  {receipt.tag}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold">
                  {receipt.splitInfo}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(receipt)}
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer min-h-[38px]"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Slip</span>
                </button>

                <button
                  type="button"
                  aria-label="Download receipt"
                  onClick={() => handleDownload(receipt)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-lg hover:bg-surface-container min-h-[38px] min-w-[38px] flex items-center justify-center"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Slip Modal */}
      {selectedReceipt && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-card rounded-2xl max-w-md w-full p-6 border border-border shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <h4 className="font-bold text-base text-foreground">
                Digital Slip: {selectedReceipt.merchant}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-surface-container rounded-xl p-4 font-mono text-xs space-y-2 border border-border/50">
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span>MERCHANT:</span>
                <span className="font-bold text-foreground">{selectedReceipt.merchant}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span>SUBMITTER:</span>
                <span>{selectedReceipt.uploadedBy}</span>
              </div>
              <div className="flex justify-between">
                <span>SPLIT:</span>
                <span className="text-primary font-bold">{selectedReceipt.splitInfo}</span>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-2 font-extrabold text-sm">
                <span>TOTAL BILLED:</span>
                <span className="text-foreground">${selectedReceipt.amount.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedReceipt(null)}
              className="w-full min-h-[44px] bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
