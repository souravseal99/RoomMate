import { HandCoins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SidebarQuickSettle() {
  const navigate = useNavigate();

  const handleQuickSettle = () => {
    navigate('/expenses');
  };

  return (
    <button
      type="button"
      onClick={handleQuickSettle}
      className="w-full min-h-[44px] bg-sidebar-primary hover:opacity-95 text-sidebar-primary-foreground font-extrabold uppercase tracking-wider py-3 px-4 rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 border-b-2 border-primary-fixed-dim"
    >
      <HandCoins className="w-4 h-4 shrink-0" />
      <span>Quick Settle</span>
    </button>
  );
}
