import { Palette, Check, Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function AppearanceSettingsCard() {
  const { themeName, setTheme, availableThemes } = useTheme();

  const getThemeIcon = (name: string) => {
    switch (name) {
      case 'dark':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'system':
        return <Laptop className="w-4 h-4 text-sky-500" />;
      default:
        return <Sun className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <section className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-4 shadow-2xs">
      <div className="flex items-center gap-3 border-b border-border/60 pb-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Palette className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-foreground">Appearance &amp; Theming</h3>
          <p className="text-xs text-muted-foreground">
            Choose your preferred workspace vibe and color accents
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {availableThemes.map((theme) => {
          const isSelected = themeName === theme.name;

          return (
            <button
              key={theme.name}
              type="button"
              onClick={() => setTheme(theme.name)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[105px] group ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                  : 'border-border bg-surface-container/30 hover:border-primary/40 hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border border-black/20 shadow-2xs"
                    style={{ backgroundColor: theme.swatch }}
                  />
                  {getThemeIcon(theme.name)}
                </div>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>

              <div className="mt-2">
                <h4 className="text-xs font-extrabold text-foreground leading-tight">
                  {theme.label}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {theme.fontLabel}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
