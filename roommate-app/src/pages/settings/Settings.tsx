import { useState, useEffect } from 'react';
import {
  Palette,
  Bell,
  Globe,
  Download,
  Activity,
  RotateCcw,
  Check,
  FileSpreadsheet,
  FileCode,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import useHousehold from '@/hooks/useHousehold';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getSavedPreferences,
  savePreferencesLocally,
  exportHouseholdLedger,
  checkHealthLatency,
  type UserPreferences,
} from '@/api/settingsApi';
import { toast } from 'sonner';

const CURRENCY_OPTIONS = [
  { code: 'USD', label: 'USD ($) — US Dollar' },
  { code: 'EUR', label: 'EUR (€) — Euro' },
  { code: 'GBP', label: 'GBP (£) — British Pound' },
  { code: 'INR', label: 'INR (₹) — Indian Rupee' },
  { code: 'CAD', label: 'CAD (C$) — Canadian Dollar' },
  { code: 'AUD', label: 'AUD (A$) — Australian Dollar' },
];

export default function Settings() {
  const queryClient = useQueryClient();
  const { themeName, setTheme, availableThemes } = useTheme();
  const { activeHousehold } = useHousehold();
  const activeHouseholdId = activeHousehold?.householdId || '';
  const householdName = activeHousehold?.name || 'Household';

  // Local preferences state
  const [preferences, setPreferences] = useState<UserPreferences>(() => getSavedPreferences());
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{ status: string; latencyMs: number } | null>(
    null
  );
  const [isCheckingPing, setIsCheckingPing] = useState(false);

  // Sync theme changes with preferences state
  useEffect(() => {
    setPreferences((prev) => {
      const updated = { ...prev, theme: themeName };
      savePreferencesLocally(updated);
      return updated;
    });
  }, [themeName]);

  const handleUpdatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: value };
      savePreferencesLocally(updated);
      return updated;
    });
    toast.success('Preference saved');
  };

  const handleToggleNotification = (key: keyof UserPreferences['notifications']) => {
    setPreferences((prev) => {
      const updatedNotifications = {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      };
      const updated = { ...prev, notifications: updatedNotifications };
      savePreferencesLocally(updated);
      return updated;
    });
    toast.success('Notification settings updated');
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (!activeHouseholdId) {
      toast.error('Please select an active household first');
      return;
    }

    if (format === 'csv') setIsExportingCsv(true);
    else setIsExportingJson(true);

    try {
      await exportHouseholdLedger(activeHouseholdId, format, householdName);
      toast.success(`Household records downloaded as ${format.toUpperCase()}`);
    } catch {
      toast.error(`Failed to export ${format.toUpperCase()}`);
    } finally {
      if (format === 'csv') setIsExportingCsv(false);
      else setIsExportingJson(false);
    }
  };

  const handleCheckPing = async () => {
    setIsCheckingPing(true);
    try {
      const res = await checkHealthLatency();
      setHealthStatus(res);
      toast.info(`API Response Latency: ${res.latencyMs}ms (${res.status})`);
    } catch {
      toast.error('Failed to ping server');
    } finally {
      setIsCheckingPing(false);
    }
  };

  const handleClearCache = () => {
    queryClient.clear();
    toast.success('Query cache cleared. Refreshing app...');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-28 animate-in fade-in duration-300">
      {/* 1. Header Hero Card */}
      <Card className="rounded-3xl p-6 sm:p-8 bg-card border-border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-foreground tracking-tight">
              Settings &amp; Preferences
            </h1>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 text-xs font-bold px-2.5 py-0.5 rounded-full"
            >
              Workspace v1.5.0
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Customize visual themes, notification routing, financial currency, and ledger backups
            for {householdName}.
          </p>
        </div>

        <Badge
          variant="secondary"
          className="px-3 py-1.5 rounded-xl bg-surface-container text-foreground text-xs font-bold border border-border/60 shrink-0 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Active Space: {householdName}</span>
        </Badge>
      </Card>

      {/* 2. Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Appearance, Notifications & House Charter (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Section 1: Appearance & Theme Engine */}
          <Card className="rounded-3xl p-6 bg-card border-border shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border/50 pb-3">
              <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Palette className="w-4 h-4 stroke-[2.2]" />
              </span>
              <div>
                <h2 className="font-display font-bold text-base text-foreground">
                  Appearance &amp; Theme Engine
                </h2>
                <p className="text-xs text-muted-foreground">
                  Instant zero-flash visual theming across all screens
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
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-95 flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-primary/10 border-primary shadow-xs'
                        : 'bg-surface-container-low border-border/60 hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className="w-5 h-5 rounded-full border border-black/20 shadow-2xs"
                        style={{ backgroundColor: theme.swatch }}
                      />
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-display font-bold text-xs text-foreground leading-tight">
                        {theme.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{theme.fontLabel}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Section 2: Notification Channels */}
          <Card className="rounded-3xl p-6 bg-card border-border shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border/50 pb-3">
              <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 stroke-[2.2]" />
              </span>
              <div>
                <h2 className="font-display font-bold text-base text-foreground">
                  Notification Channels &amp; Alerts
                </h2>
                <p className="text-xs text-muted-foreground">
                  Control which flatmate activities trigger alerts
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold text-foreground">
                    Chore Assignment Alerts
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Get notified when a roommate assigns you a chore or swaps duties
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.choreAssigned}
                  onCheckedChange={() => handleToggleNotification('choreAssigned')}
                />
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border/40 pt-3">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold text-foreground">Due Date Reminders</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Gentle nudge 24 hours and 2 hours before your chore is due
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.choreDue}
                  onCheckedChange={() => handleToggleNotification('choreDue')}
                />
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border/40 pt-3">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold text-foreground">
                    New Shared Expense Alerts
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Instant alert whenever a flatmate logs an expense with your owed split
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.expenseAdded}
                  onCheckedChange={() => handleToggleNotification('expenseAdded')}
                />
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border/40 pt-3">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold text-foreground">
                    Settlement Confirmations
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Notify you immediately when someone records a balance payment
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.settlementConfirmed}
                  onCheckedChange={() => handleToggleNotification('settlementConfirmed')}
                />
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border/40 pt-3">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold text-foreground">
                    Low Stock &amp; Pantry Warnings
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Alert when pantry items drop below their minimum restock threshold
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.lowStockAlerts}
                  onCheckedChange={() => handleToggleNotification('lowStockAlerts')}
                />
              </div>
            </div>
          </Card>

          {/* Section 6: House Charter & Co-Living Etiquette */}
          <Card className="rounded-3xl p-6 bg-card border-border shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border/50 pb-3">
              <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 stroke-[2.2]" />
              </span>
              <div>
                <h2 className="font-display font-bold text-base text-foreground">
                  House Charter &amp; Etiquette Guidelines
                </h2>
                <p className="text-xs text-muted-foreground">
                  Shared standards for frictionless co-living in {householdName}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed pt-1">
              <div className="p-3 rounded-xl bg-surface-container-low border border-border/50 space-y-1">
                <p className="font-bold text-foreground">🌙 Quiet Hours Rhythm</p>
                <p>
                  11:00 PM – 8:00 AM on weekdays. Keep shared spaces peaceful before morning coffee.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-border/50 space-y-1">
                <p className="font-bold text-foreground">🍽️ 24-Hour Kitchen Sink Rule</p>
                <p>Dishes unloaded into dishwasher or hand-washed within 24 hours of meal prep.</p>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-border/50 space-y-1">
                <p className="font-bold text-foreground">🧾 Transparent Expense Logging</p>
                <p>
                  Log shared groceries or utilities within 48 hours with receipt photo for karma
                  credit.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Currency Localization, Data Export & Diagnostics (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Section 3: Regional & Financial Localization */}
          <Card className="rounded-3xl p-6 bg-card border-border shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border/50 pb-3">
              <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 stroke-[2.2]" />
              </span>
              <div>
                <h2 className="font-display font-bold text-base text-foreground">
                  Financial Localization
                </h2>
                <p className="text-xs text-muted-foreground">Currency symbol and date formatting</p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Display Currency</Label>
                <Select
                  value={preferences.currency}
                  onValueChange={(val) => handleUpdatePreference('currency', val)}
                >
                  <SelectTrigger className="min-h-[44px] bg-surface-container border-border rounded-xl text-xs">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    {CURRENCY_OPTIONS.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Date Format</Label>
                <Select
                  value={preferences.dateFormat}
                  onValueChange={(val) => handleUpdatePreference('dateFormat', val)}
                >
                  <SelectTrigger className="min-h-[44px] bg-surface-container border-border rounded-xl text-xs">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (e.g. 11/18/2026)</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (e.g. 18/11/2026)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Pantry Units</Label>
                <Select
                  value={preferences.measurementUnit}
                  onValueChange={(val) => handleUpdatePreference('measurementUnit', val)}
                >
                  <SelectTrigger className="min-h-[44px] bg-surface-container border-border rounded-xl text-xs">
                    <SelectValue placeholder="Select units" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    <SelectItem value="Metric">Metric (kg, L, pack)</SelectItem>
                    <SelectItem value="Imperial">Imperial (lbs, gal, oz)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Section 4: Data Export & Ledger Portability */}
          <Card className="rounded-3xl p-6 bg-card border-border shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border/50 pb-3">
              <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Download className="w-4 h-4 stroke-[2.2]" />
              </span>
              <div>
                <h2 className="font-display font-bold text-base text-foreground">
                  Data Portability &amp; Backups
                </h2>
                <p className="text-xs text-muted-foreground">
                  Download historical household records
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
              Download your complete communal ledger including expenses, splits, settlements, and
              chores history for {householdName}.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                disabled={isExportingCsv || !activeHouseholdId}
                onClick={() => handleExport('csv')}
                className="min-h-[44px] rounded-xl font-bold text-xs gap-2 border-border bg-card hover:bg-surface-container cursor-pointer active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>{isExportingCsv ? 'Exporting...' : 'Export CSV'}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isExportingJson || !activeHouseholdId}
                onClick={() => handleExport('json')}
                className="min-h-[44px] rounded-xl font-bold text-xs gap-2 border-border bg-card hover:bg-surface-container cursor-pointer active:scale-95"
              >
                <FileCode className="w-4 h-4 text-primary" />
                <span>{isExportingJson ? 'Exporting...' : 'Export JSON'}</span>
              </Button>
            </div>
          </Card>

          {/* Section 5: System Diagnostics & Cache Troubleshooting */}
          <Card className="rounded-3xl p-6 bg-card border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 stroke-[2.2]" />
                </span>
                <div>
                  <h2 className="font-display font-bold text-base text-foreground">
                    Diagnostics &amp; Cache
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    System health and local state troubleshooting
                  </p>
                </div>
              </div>

              {healthStatus && (
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${
                    healthStatus.status === 'healthy'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                      : 'bg-destructive/10 text-destructive border-destructive/30'
                  }`}
                >
                  {healthStatus.latencyMs}ms Ping
                </Badge>
              )}
            </div>

            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-border/50 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-foreground">API Server Latency</p>
                  <p className="text-[11px] text-muted-foreground">
                    Check connection responsiveness
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isCheckingPing}
                  onClick={handleCheckPing}
                  className="min-h-[36px] px-3 rounded-lg text-xs font-semibold cursor-pointer active:scale-95"
                >
                  {isCheckingPing ? 'Pinging...' : 'Check Ping'}
                </Button>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-border/50 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-foreground">Clear Local Cache</p>
                  <p className="text-[11px] text-muted-foreground">
                    Purge cached records &amp; reload fresh data
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearCache}
                  className="min-h-[36px] px-3 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 border-border cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Purge &amp; Reload
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
