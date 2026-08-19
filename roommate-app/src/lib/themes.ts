import type { ThemeConfig } from '@/types/themeTypes';

export const themes: ThemeConfig[] = [
  {
    name: 'whiteboard',
    label: 'Physical Whiteboard',
    className: '',
    swatch: '#a43e00',
    fontLabel: 'Plus Jakarta Sans',
  },
  {
    name: 'ocean',
    label: 'Ocean Depth',
    className: 'theme-ocean',
    swatch: '#0284c7',
    fontLabel: 'Inter',
  },
  {
    name: 'forest',
    label: 'Forest Grove',
    className: 'theme-forest',
    swatch: '#1b8354',
    fontLabel: 'DM Sans',
  },
];

export const DEFAULT_THEME = 'whiteboard';

export function getTheme(name: string): ThemeConfig {
  return themes.find((t) => t.name === name) ?? themes[0];
}
