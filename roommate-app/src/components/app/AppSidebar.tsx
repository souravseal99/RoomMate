import { useLocation } from 'react-router-dom';
import { SidebarBrand } from './sidebar/SidebarBrand';
import { SidebarNavGroup } from './sidebar/SidebarNavGroup';
import { SidebarNavItem } from './sidebar/SidebarNavItem';
import { SidebarQuickSettle } from './sidebar/SidebarQuickSettle';
import { SidebarUserProfile } from './sidebar/SidebarUserProfile';
import type { NavItem } from '@/types/themeTypes';

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', url: '/dashboard', iconName: 'LayoutDashboard' },
  { title: 'Households', url: '/households', iconName: 'Home' },
];

const manageNavItems: NavItem[] = [
  { title: 'Chores', url: '/chores', iconName: 'Broom' },
  { title: 'Expenses', url: '/expenses', iconName: 'Coins' },
  { title: 'Inventory', url: '/inventory', iconName: 'ShoppingBag' },
];

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside
      aria-label="Sidebar Navigation"
      className="hidden md:flex w-[280px] h-screen bg-sidebar text-sidebar-foreground flex-col pt-8 pb-6 px-6 overflow-y-auto border-r border-sidebar-border shrink-0 select-none"
    >
      {/* Brand Header */}
      <SidebarBrand />

      {/* Primary Navigation Sections */}
      <div className="flex-1 flex flex-col">
        <SidebarNavGroup label="Main" items={mainNavItems} currentPath={currentPath} />
        <SidebarNavGroup label="Manage" items={manageNavItems} currentPath={currentPath} />
      </div>

      {/* Bottom Section: Settings + Quick Settle + User Profile */}
      <div className="flex flex-col gap-4 mt-auto pt-4 border-t border-sidebar-border/60">
        <SidebarNavItem
          title="Settings"
          url="/settings"
          iconName="Settings"
          isActive={currentPath === '/settings'}
        />

        <SidebarQuickSettle />

        <div className="h-px w-full bg-sidebar-border my-1" />

        <SidebarUserProfile />
      </div>
    </aside>
  );
}
