export type NavItem = {
  title: string;
  url: string;
  iconName: string;
  badge?: number;
};

/** Lightweight metadata — CSS owns all the actual token values */
export type ThemeConfig = {
  name: string;
  label: string;
  className: string; // e.g. '' (default whiteboard) | 'theme-ocean' | 'theme-forest'
  swatch: string; // hex for UI preview
  fontLabel: string;
};

export type ThemeContextType = {
  themeName: string;
  setTheme: (name: string) => void;
  availableThemes: ThemeConfig[];
};
