import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, ArrowLeft } from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import { useSettings } from '@/hooks/useSettings';
import {
  AppearanceSettingsCard,
  LocalizationSettingsCard,
  NotificationSettingsCard,
  DataExportCard,
  DiagnosticsCard,
  HouseCharterModal,
} from '@/components/settings';

export default function Settings() {
  const navigate = useNavigate();
  const { activeHousehold } = useHousehold();
  const {
    currency,
    setCurrency,
    dateFormat,
    setDateFormat,
    unitSystem,
    setUnitSystem,
    notifications,
    updateNotifications,
    clearAppCache,
    exportHouseholdData,
  } = useSettings();

  const [isCharterOpen, setIsCharterOpen] = useState(false);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-7 animate-in fade-in duration-300 pb-20">
      {/* Top Header Ribbon */}
      <header className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-container transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2 tracking-tight">
              <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              Settings &amp; Preferences
            </h1>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {/* 1. Appearance & Theming */}
        <AppearanceSettingsCard />

        {/* 2. Financial & Regional Localization */}
        <LocalizationSettingsCard
          currency={currency}
          onCurrencyChange={setCurrency}
          dateFormat={dateFormat}
          onDateFormatChange={setDateFormat}
          unitSystem={unitSystem}
          onUnitSystemChange={setUnitSystem}
        />

        {/* 3. Notification Preferences */}
        <NotificationSettingsCard
          notifications={notifications}
          onUpdate={updateNotifications}
        />

        {/* 4. Data Portability & Ledger Export */}
        <DataExportCard
          householdName={activeHousehold?.name || 'Active Household'}
          onExport={(format) => exportHouseholdData(activeHousehold?.name, format)}
        />

        {/* 5. Diagnostics & System Controls */}
        <DiagnosticsCard
          onClearCache={clearAppCache}
          onOpenCharter={() => setIsCharterOpen(true)}
        />
      </div>

      {/* House Rules & Charter Modal */}
      <HouseCharterModal
        open={isCharterOpen}
        onOpenChange={setIsCharterOpen}
      />
    </div>
  );
}
