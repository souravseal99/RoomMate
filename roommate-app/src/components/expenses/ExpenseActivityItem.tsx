import {
  ShoppingCart,
  Zap,
  Droplet,
  Utensils,
  Home,
  Package,
  Sparkles,
  Receipt,
  Trash2,
  MoreVertical,
  Wifi,
} from 'lucide-react';
import { formatCurrency, formatTimeAgo, dateFormatterUtc } from '@/utils/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ExpenseResponse } from '@/types/expenseTypes';

interface ExpenseActivityItemProps {
  expense: ExpenseResponse;
  currentUserId: string | null;
  onDelete: (expenseId: string) => void;
  isDeleting?: boolean;
}

function resolveCategoryIcon(description: string, category?: string) {
  const text = (category || description).toLowerCase();

  if (text.includes('pizza') || text.includes('food') || text.includes('dinner') || text.includes('lunch') || text.includes('takeout')) {
    return <Utensils className="w-4 h-4 text-primary" />;
  }
  if (text.includes('grocery') || text.includes('groceries') || text.includes('market')) {
    return <ShoppingCart className="w-4 h-4 text-tertiary" />;
  }
  if (text.includes('water') || text.includes('plumbing')) {
    return <Droplet className="w-4 h-4 text-tertiary" />;
  }
  if (text.includes('wifi') || text.includes('internet')) {
    return <Wifi className="w-4 h-4 text-primary-container" />;
  }
  if (text.includes('electric') || text.includes('utility') || text.includes('power') || text.includes('bill')) {
    return <Zap className="w-4 h-4 text-primary-container" />;
  }
  if (text.includes('rent') || text.includes('house') || text.includes('apartment')) {
    return <Home className="w-4 h-4 text-foreground" />;
  }
  if (text.includes('supply') || text.includes('supplies') || text.includes('paper')) {
    return <Package className="w-4 h-4 text-muted-foreground" />;
  }
  if (text.includes('clean') || text.includes('mop') || text.includes('soap')) {
    return <Sparkles className="w-4 h-4 text-primary" />;
  }

  return <Receipt className="w-4 h-4 text-primary" />;
}

export function ExpenseActivityItem({
  expense,
  currentUserId,
  onDelete,
  isDeleting,
}: ExpenseActivityItemProps) {
  const isPaidByCurrentUser = expense.paidById === currentUserId;
  const payerName = isPaidByCurrentUser ? 'you' : expense.paidBy?.name || 'Roommate';

  const splitCount = expense.splits?.length || 2;
  const splitSummary = `Paid by ${payerName} • Split ${splitCount} ways`;

  return (
    <div className="flex items-center justify-between p-3 sm:p-3.5 px-4 hover:bg-surface-container-low/50 transition-colors gap-3 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Category Icon Badge */}
        <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center border border-border shrink-0">
          {resolveCategoryIcon(expense.description, expense.category)}
        </div>

        {/* Expense Info */}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate tracking-tight">
            {expense.description}
          </p>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            {splitSummary}
          </p>
        </div>
      </div>

      {/* Amount & Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right flex flex-col justify-center">
          <p
            className={`text-sm font-bold tracking-tight ${
              isPaidByCurrentUser ? 'text-primary' : 'text-foreground'
            }`}
          >
            {isPaidByCurrentUser ? `+${formatCurrency(expense.amount)}` : formatCurrency(expense.amount)}
          </p>
          <p
            className="text-[10px] text-muted-foreground mt-0.5"
            title={dateFormatterUtc(expense.createdAt)}
          >
            {formatTimeAgo(expense.createdAt)}
          </p>
        </div>

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-container cursor-pointer transition-colors">
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border shadow-md">
            <DropdownMenuItem
              disabled={isDeleting}
              onClick={() => onDelete(expense.expenseId)}
              className="text-destructive hover:bg-destructive/10 cursor-pointer flex items-center gap-2 text-xs font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isDeleting ? 'Deleting...' : 'Delete Expense'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
