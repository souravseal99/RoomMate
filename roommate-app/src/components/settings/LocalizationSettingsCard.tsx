import { Globe, DollarSign, Calendar, Scale } from 'lucide-react';
import {
  CURRENCY_OPTIONS,
  type CurrencyCode,
  type DateFormatOption,
  type UnitSystemOption,
} from '@/hooks/useSettings';

type Props = {
  currency: CurrencyCode;
  onCurrencyChange: (code: CurrencyCode) => void;
  dateFormat: DateFormatOption;
  onDateFormatChange: (format: DateFormatOption) => void;
  unitSystem: UnitSystemOption;
  onUnitSystemChange: (unit: UnitSystemOption) => void;
};

export default function LocalizationSettingsCard({
  currency,
  onCurrencyChange,
  dateFormat,
  onDateFormatChange,
  unitSystem,
  onUnitSystemChange,
}: Props) {
  return (
    <section className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-5 shadow-2xs">
      <div className="flex items-center gap-3 border-b border-border/60 pb-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-foreground">Localization &amp; Regional</h3>
          <p className="text-xs text-muted-foreground">
            Configure currency formats, date conventions, and measurement units
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Currency Selector */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-primary" />
            Preferred Currency
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {CURRENCY_OPTIONS.map((item) => {
              const isSelected = currency === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => onCurrencyChange(item.code)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left flex items-center justify-between ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-surface-container/40 text-foreground border-border hover:bg-surface-container'
                  }`}
                >
                  <span>{item.code}</span>
                  <span className="opacity-80 text-[11px]">{item.symbol}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Format */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Date Format
          </label>
          <div className="flex flex-col gap-1.5">
            {(['MM/DD/YYYY', 'DD/MM/YYYY'] as DateFormatOption[]).map((fmt) => {
              const isSelected = dateFormat === fmt;
              return (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => onDateFormatChange(fmt)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left flex items-center justify-between ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-surface-container/40 text-foreground border-border hover:bg-surface-container'
                  }`}
                >
                  <span>{fmt}</span>
                  <span className="text-[10px] opacity-75">
                    {fmt === 'MM/DD/YYYY' ? 'e.g. 08/30/2026' : 'e.g. 30/08/2026'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Unit System */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-primary" />
            Measurement Units
          </label>
          <div className="flex flex-col gap-1.5">
            {[
              { id: 'metric', label: 'Metric (kg, L)' },
              { id: 'imperial', label: 'Imperial (lbs, gal)' },
            ].map((u) => {
              const isSelected = unitSystem === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onUnitSystemChange(u.id as UnitSystemOption)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left flex items-center justify-between ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-surface-container/40 text-foreground border-border hover:bg-surface-container'
                  }`}
                >
                  <span>{u.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
