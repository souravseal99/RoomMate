import { HandCoins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SidebarQuickSettle() {
  const navigate = useNavigate();

  const handleQuickSettle = () => {
    navigate('/expenses');
  };

  return (
    <button
      onClick={handleQuickSettle}
      className="w-full bg-sidebar-primary hover:opacity-90 text-sidebar-primary-foreground font-extrabold uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-2 shadow-xs active:scale-98"
    >
      <HandCoins className="w-4 h-4" />
      <span>Quick Settle</span>
    </button>
  );
}
