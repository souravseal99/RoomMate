import { AlertTriangle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Props {
  count?: number;
  itemsSummary?: string;
}

export default function LowStockAlertCard({
  count = 2,
  itemsSummary = 'Milk, Eggs (2 Items)',
}: Props) {
  const navigate = useNavigate();

  if (count <= 0) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs hover:border-amber-500/50 transition-colors">
      <div className="bg-amber-500/20 p-2.5 rounded-xl shrink-0">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-foreground">Low Stock</h4>
        <p className="text-xs text-muted-foreground truncate">{itemsSummary}</p>
      </div>
      <Button
        type="button"
        size="sm"
        onClick={() => navigate('/inventory')}
        className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 h-8 rounded-lg active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1"
      >
        <Plus className="w-3.5 h-3.5" />
        Auto-Add
      </Button>
    </div>
  );
}
