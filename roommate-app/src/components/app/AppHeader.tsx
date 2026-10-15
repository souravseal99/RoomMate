import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Home,
  Building,
  ChevronDown,
  Check,
  LogOut,
  Palette,
  Bell,
  Thermometer,
  Plus,
} from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import useHousehold from '@/hooks/useHousehold';
import { useTheme } from '@/contexts/ThemeContext';
import { getInitials } from '@/utils/utils';

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const { name, email, logout } = useAuth();
  const {
    households,
    activeHousehold,
    switchActiveHousehold,
    hasActiveHousehold,
    householdMembers,
  } = useHousehold();
  const { themeName, setTheme, availableThemes } = useTheme();

  const [isSpaceMenuOpen, setIsSpaceMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notificationCount] = useState(1);

  const spaceMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        spaceMenuRef.current &&
        !spaceMenuRef.current.contains(event.target as Node)
      ) {
        setIsSpaceMenuOpen(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = name || 'Roommate User';
  const displayEmail = email || 'user@example.com';
  const initials = getInitials(displayName);

  const householdName = hasActiveHousehold
    ? activeHousehold?.name || 'My Household'
    : 'Select Household';
  const memberCount = householdMembers?.length || activeHousehold?.members?.length || 1;

  // Stitch Top Navigation Items
  const navItems = [
    { label: 'Overview', path: '/dashboard' },
    { label: 'Household & Spaces', path: '/households' },
    { label: 'Expenses & Ledger', path: '/expenses' },
    { label: 'Chores & Duties', path: '/chores' },
    { label: 'Pantry & Inventory', path: '/inventory' },
  ];

  const isNavActive = (item: (typeof navItems)[0]) => {
    if (item.path === '/dashboard') {
      return currentPath === '/' || currentPath === '/dashboard';
    }
    return currentPath.startsWith(item.path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border/40 shadow-xs transition-colors">
      <div className="h-20 max-w-[1520px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Left Section: Brand Logo + Active Space Switcher + Vitals */}
        <div className="flex items-center gap-4 lg:gap-6 min-w-0">
          {/* Logo & Tagline */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 shrink-0 group focus:outline-none"
            aria-label="RoomMate Home"
          >
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs group-hover:scale-105 active:scale-95 transition-all">
              <Home className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-base tracking-tight text-foreground leading-none font-display">
                RoomMate
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                Household Hub
              </span>
            </div>
          </Link>

          {/* Active Space Switcher Pill Dropdown */}
          <div className="relative shrink-0 hidden md:block" ref={spaceMenuRef}>
            <button
              type="button"
              onClick={() => setIsSpaceMenuOpen(!isSpaceMenuOpen)}
              className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container-high px-3.5 py-1.5 rounded-full border border-border/50 text-foreground transition-all cursor-pointer min-h-[44px] active:scale-95 shadow-xs"
              title="Active Space • Click to switch"
            >
              <Building className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-bold truncate max-w-[140px] sm:max-w-[200px]">
                {householdName}
              </span>
              {hasActiveHousehold && (
                <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
                  · {memberCount} {memberCount === 1 ? 'Flatmate' : 'Flatmates'}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${isSpaceMenuOpen ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {/* Space Switcher Menu */}
            {isSpaceMenuOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-card border border-border shadow-xl p-2 z-50 text-card-foreground animate-in fade-in duration-150">
                <div className="px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Your Living Spaces
                </div>

                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {households.map((h) => {
                    const isCurrent = h.householdId === activeHousehold?.householdId;
                    return (
                      <button
                        key={h.householdId}
                        type="button"
                        onClick={() => {
                          switchActiveHousehold(h.householdId);
                          setIsSpaceMenuOpen(false);
                        }}
                        className={`w-full min-h-[40px] px-2.5 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer text-left ${isCurrent
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'hover:bg-surface-container text-foreground'
                          }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Building className="w-4 h-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{h.name}</span>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-primary shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-border/40 mt-1.5 pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSpaceMenuOpen(false);
                      navigate('/households');
                    }}
                    className="w-full min-h-[36px] px-2.5 py-1.5 rounded-xl hover:bg-surface-container flex items-center gap-2 text-xs font-semibold text-primary transition-colors cursor-pointer text-left"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Manage & Create Spaces</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Environmental Status Badges (Stitch Template - visible on xl+) */}
          <div className="hidden xl:flex items-center gap-2 text-muted-foreground">
            <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-full border border-border/40 text-[11px] font-bold uppercase tracking-wider">
              <Thermometer className="w-3.5 h-3.5 text-secondary" />
              <span>69°F</span>
            </div>
          </div>
        </div>

        {/* Center Section: Stitch Floating Pill Navigation Bar (Desktop) */}
        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-1 p-1 bg-surface-container-low rounded-full border border-border/60 shadow-xs shrink-0"
        >
          {navItems.map((item) => {
            const active = isNavActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[36px] flex items-center justify-center cursor-pointer select-none active:scale-95 ${active
                  ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-container-highest'
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Notification Trigger & User Profile Dock */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Notifications Button */}
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => navigate('/chores')}
            className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-surface-container-low hover:bg-surface-container-high border border-border/50 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors relative cursor-pointer active:scale-95 shadow-xs"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
            )}
          </button>

          {/* User Profile Pill & Settings Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              aria-label="User Profile"
              className="flex items-center gap-2.5 pl-1.5 py-1 pr-3 bg-surface-container-low hover:bg-surface-container-high border border-border/50 rounded-full cursor-pointer transition-all min-h-[44px] active:scale-95 shadow-xs"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-xs shadow-xs">
                {initials}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight min-w-0">
                <span className="text-xs font-bold text-foreground truncate max-w-[100px]">
                  {displayName}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[100px]">
                  {activeHousehold ? 'Active Member' : 'Unit #4B'}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-muted-foreground hidden sm:inline transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {/* Dropdown Menu Container */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-card border border-border shadow-xl p-2 z-50 text-card-foreground animate-in fade-in duration-150">
                {/* Profile Card Header */}
                <div className="p-2 flex items-center gap-2.5 border-b border-border/40 pb-2.5 mb-1.5">
                  <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{displayEmail}</p>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/households');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full min-h-[40px] px-2.5 py-1.5 rounded-xl hover:bg-surface-container flex items-center gap-2 text-xs font-semibold text-foreground transition-colors cursor-pointer text-left"
                  >
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span>My Spaces & Households</span>
                  </button>

                  {/* Theme Selector Section */}
                  <div className="px-2.5 py-2 border-t border-b border-border/40 my-1 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <Palette className="w-3.5 h-3.5 text-primary" />
                      <span>Theme Selection</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {availableThemes.map((theme) => {
                        const isSelected = themeName === theme.name;
                        return (
                          <button
                            key={theme.name}
                            type="button"
                            onClick={() => setTheme(theme.name)}
                            className={`w-full min-h-[36px] px-2 py-1 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${isSelected
                              ? 'bg-primary/10 text-primary font-bold'
                              : 'hover:bg-surface-container text-foreground'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/20"
                                style={{ backgroundColor: theme.swatch }}
                              />
                              <span>{theme.label}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full min-h-[40px] px-2.5 py-1.5 rounded-xl hover:bg-destructive/10 text-destructive flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
