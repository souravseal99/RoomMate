import { useLocation } from 'react-router-dom';
import { SidebarBrand } from './sidebar/SidebarBrand';
import { SidebarNavGroup } from './sidebar/SidebarNavGroup';
import { SidebarNavItem } from './sidebar/SidebarNavItem';
import { SidebarQuickSettle } from './sidebar/SidebarQuickSettle';
import { SidebarUserProfile } from './sidebar/SidebarUserProfile';
import useHousehold from '@/hooks/useHousehold';

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { hasActiveHousehold } = useHousehold();

  const mainNavItems = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      iconName: 'LayoutDashboard',
      disabled: !hasActiveHousehold,
    },
    {
      title: 'Households',
      url: '/households',
      iconName: 'Home',
      badgeText: !hasActiveHousehold ? 'Setup' : undefined,
    },
  ];

  const manageNavItems = [
    {
      title: 'Chores',
      url: '/chores',
      iconName: 'Broom',
      disabled: !hasActiveHousehold,
    },
    {
      title: 'Expenses',
      url: '/expenses',
      iconName: 'Coins',
      disabled: !hasActiveHousehold,
    },
    {
      title: 'Inventory',
      url: '/inventory',
      iconName: 'ShoppingBag',
      disabled: !hasActiveHousehold,
    },
  ];

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

        {hasActiveHousehold && <SidebarQuickSettle />}

        <div className="h-px w-full bg-sidebar-border my-1" />

        <SidebarUserProfile />
      </div>
    </aside>
  );
}
