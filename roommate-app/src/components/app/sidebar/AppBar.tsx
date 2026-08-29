import { useNavigate } from 'react-router-dom';
import { Home, Users, User, Check, LogOut, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import useHousehold from '@/hooks/useHousehold';
import { useTheme } from '@/contexts/ThemeContext';
import { getInitials } from '@/utils/utils';

export function AppBar() {
  const navigate = useNavigate();
  const { name, email, logout } = useAuth();
  const { activeHousehold, selectedHousehold } = useHousehold();
  const { themeName, setTheme, availableThemes } = useTheme();

  const householdName = activeHousehold?.name || selectedHousehold?.value || '123 Maple Ave';
  const memberCount = activeHousehold?.members?.length ?? selectedHousehold?.memberCount ?? 4;

  const displayName = name || 'Roommate User';
  const displayEmail = email || 'user@example.com';
  const initials = getInitials(displayName);

  return (
    <header className="md:hidden sticky top-0 w-full z-40 bg-background/95 backdrop-blur-md border-b border-border/20 px-4 py-3 flex justify-between items-center shrink-0 transition-colors shadow-xs">
      {/* Left: Household Identity Badge & Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary shadow-xs">
          <Home className="w-5 h-5 fill-primary/20 stroke-primary stroke-[2.2]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight text-foreground truncate leading-tight">
            {householdName}
          </h1>
          <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {memberCount} Roommates
            </span>
          </div>
        </div>
      </div>

      {/* Right: Switch Pill Button & User Avatar Dropdown */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Button
          type="button"
          onClick={() => navigate('/households')}
          className="px-4 py-1.5 h-9 text-xs font-bold rounded-full bg-foreground text-background hover:bg-foreground/90 active:scale-95 shadow-sm transition-all cursor-pointer"
        >
          Switch
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-card border border-border shadow-xs flex items-center justify-center text-foreground hover:bg-surface-container active:scale-95 transition-all cursor-pointer focus:outline-none"
              aria-label="User Profile and Settings"
            >
              <User className="w-5 h-5 text-foreground" />
            </button>
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
                  <span className="truncate font-semibold text-foreground">{displayName}</span>
                  <span className="text-muted-foreground truncate text-xs">{displayEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 bg-border/20" />

            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer gap-2 py-2"
                onClick={() => navigate('/households')}
              >
                <User className="w-4 h-4 text-muted-foreground" />
                <span>My Spaces</span>
              </DropdownMenuItem>

              {/* Theme Switcher Submenu */}
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
      </div>
    </header>
  );
}

export default AppBar;
