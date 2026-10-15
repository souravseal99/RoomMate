import type { ThemeConfig } from '@/types/themeTypes';

export const themes: ThemeConfig[] = [
  {
    name: 'bento-terracotta',
    label: 'Warm Terracotta (Bento)',
    className: '',
    swatch: '#D04A1B',
    fontLabel: 'Manrope',
  },
  {
    name: 'bento-teal',
    label: 'Signal Teal (Bento)',
    className: 'theme-bento-teal',
    swatch: '#0F766E',
    fontLabel: 'Manrope',
  },
  {
    name: 'bento-obsidian',
    label: 'Obsidian Cockpit (Dark)',
    className: 'theme-bento-obsidian',
    swatch: '#E2622F',
    fontLabel: 'Manrope',
  },
];

export const DEFAULT_THEME = 'bento-terracotta';

export function getTheme(name: string): ThemeConfig {
  return themes.find((t) => t.name === name) ?? themes[0];
}
