import {
  ChevronDown,
  ChevronUp,
  LogOut,
  Palette,
  User,
  Check,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useAuth from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';

export function getInitials(name?: string | null): string {
  if (!name) return 'RM';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function SidebarUserProfile() {
  const { logout, email: userEmail, name: userName } = useAuth();
  const { themeName, setTheme, availableThemes } = useTheme();

  const displayEmail = userEmail || 'user@example.com';
  const displayName = userName || 'Roommate User';
  const initials = getInitials(displayName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center justify-between p-2 min-h-[44px] rounded-xl hover:bg-sidebar-accent transition-all cursor-pointer group select-none active:scale-98">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-sidebar-foreground text-sidebar flex items-center justify-center font-bold text-xs shadow-xs">
                {initials}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-phosphor border-2 border-sidebar rounded-full" />
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="font-bold text-xs text-sidebar-foreground leading-tight truncate">
                {displayName}
              </span>
              <span className="text-[11px] text-sidebar-muted font-medium truncate">
                {displayEmail}
              </span>
            </div>
          </div>
          <div className="flex flex-col text-sidebar-muted group-hover:text-sidebar-foreground transition-colors shrink-0 ml-2">
            <ChevronUp className="w-3 h-3 -mb-1" />
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 rounded-xl p-2 bg-card text-card-foreground border-border shadow-xl"
        side="right"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-2 font-normal">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
              {initials}
            </div>
            <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
              <span className="truncate font-semibold">{displayName}</span>
              <span className="text-muted-foreground truncate text-[11px]">{displayEmail}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 bg-border/20" />

        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer gap-2 py-2 min-h-[40px] text-xs">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>Profile Details</span>
          </DropdownMenuItem>

          {/* Sub-menu for Theme Switcher */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer gap-2 py-2 min-h-[40px] text-xs">
              <Palette className="w-4 h-4 text-primary" />
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-60 p-1.5 bg-card text-card-foreground border-border shadow-lg">
              {availableThemes.map((theme) => {
                const isSelected = themeName === theme.name;
                return (
                  <DropdownMenuItem
                    key={theme.name}
                    onClick={() => setTheme(theme.name)}
                    className="cursor-pointer flex items-center justify-between py-2 px-2.5 rounded-lg min-h-[40px]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: theme.swatch }}
                      />
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-semibold">{theme.label}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{theme.fontLabel}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary shrink-0 ml-2" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-border/20" />
        <DropdownMenuItem
          className="text-destructive cursor-pointer gap-2 py-2 min-h-[40px] text-xs hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
