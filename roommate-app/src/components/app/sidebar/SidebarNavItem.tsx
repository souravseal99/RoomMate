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
        className="flex items-center gap-3.5 px-3.5 py-2.5 min-h-[44px] rounded-lg text-sidebar-muted/40 font-medium text-sm cursor-not-allowed select-none opacity-60"
        title="Create or join a household first"
      >
        <Icon className="w-5 h-5 text-sidebar-muted/40 shrink-0" />
        <span className="truncate">{title}</span>
        <Lock className="w-3.5 h-3.5 ml-auto text-sidebar-muted/40 shrink-0" />
      </div>
    );
  }

  return (
    <Link
      to={url}
      className={cn(
        'flex items-center gap-3.5 px-3.5 py-2.5 min-h-[44px] rounded-lg transition-all group cursor-pointer font-medium text-sm active:scale-95',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-2 border-sidebar-primary shadow-xs'
          : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/60'
      )}
    >
      <Icon
        className={cn(
          'w-5 h-5 transition-colors shrink-0',
          isActive ? 'text-sidebar-primary' : 'text-sidebar-muted group-hover:text-sidebar-foreground'
        )}
      />
      <span className="truncate">{title}</span>
      {badgeText && (
        <span className="ml-auto text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-primary text-primary-foreground animate-pulse shadow-xs">
          {badgeText}
        </span>
      )}
      {badge != null && !badgeText && (
        <span
          className={cn(
            'ml-auto text-xs font-mono px-2 py-0.5 rounded-full font-semibold',
            isActive
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'bg-sidebar-accent text-sidebar-muted group-hover:text-sidebar-foreground'
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
