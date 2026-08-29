import * as Icons from 'lucide-react';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Helper: resolve icon from lucide-react safely with fallback
export const resolveNavIcon = (name: string) => {
  const IconComponent = (Icons as Record<string, any>)[name] ?? Icons.Square;
  return IconComponent;
};

export type SidebarNavItemProps = {
  title: string;
  url: string;
  iconName: string;
  badge?: number;
  badgeText?: string;
  isActive: boolean;
  disabled?: boolean;
};

export function SidebarNavItem({
  title,
  url,
  iconName,
  badge,
  badgeText,
  isActive,
  disabled,
}: SidebarNavItemProps) {
  const Icon = resolveNavIcon(iconName);

  if (disabled) {
    return (
      <div
        className="flex items-center gap-4 px-4 py-3 rounded-lg text-sidebar-muted/40 font-medium text-[15px] cursor-not-allowed select-none opacity-60"
        title="Create or join a household first"
      >
        <Icon className="w-5 h-5 text-sidebar-muted/40" />
        <span className="truncate">{title}</span>
        <Lock className="w-3.5 h-3.5 ml-auto text-sidebar-muted/40" />
      </div>
    );
  }

  return (
    <Link
      to={url}
      className={cn(
        'flex items-center gap-4 px-4 py-3 rounded-lg transition-colors group cursor-pointer font-medium text-[15px]',
        isActive
          ? 'bg-sidebar-primary text-sidebar-primary-foreground font-bold shadow-xs'
          : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent'
      )}
    >
      <Icon
        className={cn(
          'w-5 h-5 transition-colors',
          isActive ? 'text-sidebar-primary-foreground' : 'group-hover:text-sidebar-primary'
        )}
      />
      <span className="truncate">{title}</span>
      {badgeText && (
        <span className="ml-auto text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-primary text-primary-foreground animate-pulse shadow-xs">
          {badgeText}
        </span>
      )}
      {badge != null && !badgeText && (
        <span
          className={cn(
            'ml-auto text-xs px-2 py-0.5 rounded-full font-semibold',
            isActive
              ? 'bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground'
              : 'bg-sidebar-accent text-sidebar-foreground'
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
