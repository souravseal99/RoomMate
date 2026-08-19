import { Link, useLocation } from 'react-router-dom';
import { resolveNavIcon } from './SidebarNavItem';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types/themeTypes';

const mobileNavTabs: NavItem[] = [
  { title: 'Dashboard', url: '/dashboard', iconName: 'LayoutDashboard' },
  { title: 'Expenses', url: '/expenses', iconName: 'Coins' },
  { title: 'Chores', url: '/chores', iconName: 'Broom' },
  { title: 'Inventory', url: '/inventory', iconName: 'ShoppingBag' },
  { title: 'Households', url: '/households', iconName: 'Home' },
];

export function MobileBottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-surface border-t-2 border-border px-2 pb-2 h-20 z-40 select-none transition-colors shadow-lg"
    >
      {mobileNavTabs.map((item) => {
        const isActive = currentPath === item.url;
        const Icon = resolveNavIcon(item.iconName);

        return (
          <Link
            key={item.url}
            to={item.url}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl px-3 py-1.5 transition-all cursor-pointer min-w-[56px]',
              isActive
                ? 'text-primary font-bold bg-surface-container-high scale-95 shadow-xs'
                : 'text-border hover:bg-surface-container-low font-medium'
            )}
          >
            <Icon className="w-5 h-5 mb-1 shrink-0" />
            <span className="text-[11px] leading-tight tracking-tight">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
