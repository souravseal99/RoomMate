import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { themes, DEFAULT_THEME, getTheme } from '@/lib/themes';
import type { ThemeContextType } from '@/types/themeTypes';

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [themeName, setThemeName] = useState<string>(
    () => localStorage.getItem('roommate_theme') ?? DEFAULT_THEME
  );

  useEffect(() => {
    const theme = getTheme(themeName);
    const html = document.documentElement;

    // Remove all defined theme classes
    themes.forEach((t) => {
      if (t.className) {
        html.classList.remove(t.className);
      }
    });

    // Add current theme class if defined
    if (theme.className) {
      html.classList.add(theme.className);
    }

    localStorage.setItem('roommate_theme', themeName);
  }, [themeName]);

  const value = useMemo<ThemeContextType>(
    () => ({
      themeName,
      setTheme: setThemeName,
      availableThemes: themes,
    }),
    [themeName]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
