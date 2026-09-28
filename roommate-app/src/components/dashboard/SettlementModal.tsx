import { Banknote, Building2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName?: string;
  recipientSubtext?: string;
  amount?: number;
  paymentMethod?: string;
}

export function SettlementModal({
  isOpen,
  onClose,
  recipientName = 'Alex Chen',
  recipientSubtext = 'Downtown #4B',
  amount = 15.0,
  paymentMethod = 'Default House Checking',
}: SettlementModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onClose();
    toast.success(`Settled $${amount.toFixed(2)} with ${recipientName}! Ledger updated.`, {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settlement-modal-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-card text-foreground rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-container text-primary-foreground flex items-center justify-center shadow-xs">
              <Banknote className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 id="settlement-modal-title" className="font-bold text-base text-foreground tracking-tight">
                Settle with {recipientName}
              </h3>
              <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Direct Household Transfer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settlement modal"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-container transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transfer Breakdown Card */}
        <div className="p-4 rounded-xl bg-surface-container border border-border/80 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase font-mono">
              Recipient
            </span>
            <span className="font-bold text-foreground">
              {recipientName} <span className="font-normal text-muted-foreground">({recipientSubtext})</span>
            </span>
          </div>

          <div className="flex justify-between items-center text-xs pt-1 border-t border-border/40">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase font-mono">
              Outstanding Tab
            </span>
            <span className="font-mono font-bold text-primary text-lg tabular-nums">
              ${amount.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs pt-1 border-t border-border/40">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase font-mono">
              Payment Method
            </span>
            <span className="font-semibold text-secondary flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>{paymentMethod}</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:bg-primary/90 active:scale-95 transition-all shadow-xs cursor-pointer border-b-2 border-primary-fixed-dim"
          >
            Confirm Transfer ${amount.toFixed(2)}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-surface-container border border-border text-foreground font-semibold text-xs hover:bg-surface-container-high transition-all cursor-pointer active:scale-95"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettlementModal;
