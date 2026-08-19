import { useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { getInitials } from './SidebarUserProfile';
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
import { Check, LogOut, Palette, User } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const routeTitleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/households': 'Households',
  '/chores': 'Chores Board',
  '/expenses': 'Expenses Ledger',
  '/inventory': 'Inventory',
  '/settings': 'Settings',
};

export function AppBar() {
  const location = useLocation();
  const { name, email, logout } = useAuth();
  const { themeName, setTheme, availableThemes } = useTheme();

  const title = routeTitleMap[location.pathname] || 'Roommate';
  const displayName = name || 'Roommate User';
  const displayEmail = email || 'user@example.com';
  const initials = getInitials(displayName);

  return (
    <header className="md:hidden w-full top-0 sticky bg-surface border-b-2 border-border flex justify-between items-center px-4 h-16 shrink-0 z-40 transition-colors">
      <div className="flex items-center gap-2">
        <h1 className="font-bold text-lg text-foreground tracking-tight">{title}</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="w-10 h-10 rounded-full border-2 border-border bg-surface-container flex items-center justify-center font-bold text-muted-foreground cursor-pointer hover:bg-surface-container-high transition-colors">
            <span className="text-xs font-bold tracking-wider">{initials}</span>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-60 rounded-xl p-2 bg-card text-card-foreground border-border shadow-xl"
          align="end"
          sideOffset={8}
        >
          <DropdownMenuLabel className="p-2 font-normal">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                {initials}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="text-muted-foreground truncate text-xs">{displayEmail}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1 bg-border/20" />

          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer gap-2 py-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>Profile</span>
            </DropdownMenuItem>

            {/* Submenu for Theme Switcher */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer gap-2 py-2">
                <Palette className="w-4 h-4 text-primary" />
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-52 p-1 bg-card text-card-foreground border-border shadow-lg">
                {availableThemes.map((theme) => {
                  const isSelected = themeName === theme.name;
                  return (
                    <DropdownMenuItem
                      key={theme.name}
                      onClick={() => setTheme(theme.name)}
                      className="cursor-pointer flex items-center justify-between py-2 px-2.5 rounded-lg"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: theme.swatch }}
                        />
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-semibold">{theme.label}</span>
                          <span className="text-[10px] text-muted-foreground">{theme.fontLabel}</span>
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
            className="text-destructive cursor-pointer gap-2 py-2 hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
