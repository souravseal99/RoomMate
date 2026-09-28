import { Link, useLocation } from 'react-router-dom';
import { Home, CheckSquare, Receipt, Package, Users, Lock } from 'lucide-react';
import { cn } from '@/utils/utils';
import useHousehold from '@/hooks/useHousehold';

interface NavTab {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mobileNavTabs: NavTab[] = [
  { title: 'Home', url: '/dashboard', icon: Home },
  { title: 'Chores', url: '/chores', icon: CheckSquare },
  { title: 'Expenses', url: '/expenses', icon: Receipt },
  { title: 'Stock', url: '/inventory', icon: Package },
  { title: 'Households', url: '/households', icon: Users },
];

export function MobileBottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { hasActiveHousehold } = useHousehold();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 w-full z-50 bg-surface/95 backdrop-blur-md rounded-t-2xl shadow-[0_-4px_20px_rgba(30,35,40,0.06)] border-t border-border/40 px-2 pt-1.5 pb-safe select-none transition-colors"
    >
      <div className="flex justify-around items-center max-w-md mx-auto w-full">
        {mobileNavTabs.map((item) => {
          const isHouseholds = item.url === '/households';
          const isDisabled = !hasActiveHousehold && !isHouseholds;

          const isActive =
            currentPath === item.url ||
            (item.url !== '/dashboard' && currentPath.startsWith(item.url));
          const Icon = item.icon;

          if (isDisabled) {
            return (
              <div
                key={item.url}
                className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] opacity-40 cursor-not-allowed py-1 select-none"
                title="Create or join a household first"
              >
                <div className="flex items-center justify-center rounded-full px-3 py-1 mb-0.5 text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-[10px] tracking-tight text-muted-foreground font-medium font-mono">
                  {item.title}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.url}
              to={item.url}
              aria-current={isActive ? 'page' : undefined}
              className="nav-btn group flex flex-col items-center justify-center min-w-[48px] min-h-[48px] focus:outline-none transition-transform active:scale-95 cursor-pointer py-1"
            >
              {/* Active Indicator Capsule Pill */}
              <div
                className={cn(
                  'nav-indicator flex items-center justify-center rounded-full px-3.5 py-1 mb-0.5 transition-all duration-200 ease-out',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs scale-105'
                    : 'text-muted-foreground group-hover:bg-surface-container/60'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform duration-150 group-active:scale-90',
                    isActive ? 'stroke-[2.5]' : 'stroke-2'
                  )}
                />
              </div>

              {/* Navigation Label */}
              <span
                className={cn(
                  'text-[10px] tracking-tight transition-colors',
                  isActive ? 'text-primary font-bold' : 'text-muted-foreground font-medium'
                )}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
