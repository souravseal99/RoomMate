import { SidebarNavItem } from './SidebarNavItem';
import type { NavItem } from '@/types/themeTypes';

export type SidebarNavGroupProps = {
  label?: string;
  items: NavItem[];
  currentPath: string;
};

export function SidebarNavGroup({ label, items, currentPath }: SidebarNavGroupProps) {
  return (
    <div className="flex flex-col gap-1 mb-6">
      {label && (
        <span className="text-[11px] font-bold text-sidebar-muted tracking-wider uppercase px-4 mb-2">
          {label}
        </span>
      )}
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <SidebarNavItem
            key={item.url}
            title={item.title}
            url={item.url}
            iconName={item.iconName}
            badge={item.badge}
            isActive={currentPath === item.url}
          />
        ))}
      </div>
    </div>
  );
}
