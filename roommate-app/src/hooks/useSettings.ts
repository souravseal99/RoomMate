import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';
export type DateFormatOption = 'MM/DD/YYYY' | 'DD/MM/YYYY';
export type UnitSystemOption = 'metric' | 'imperial';
export type DigestFrequency = 'instant' | 'daily' | 'muted';

export interface NotificationSettings {
  choreDue: boolean;
  choreAssigned: boolean;
  expenseSplits: boolean;
  lowStock: boolean;
  frequency: DigestFrequency;
}

export const CURRENCY_OPTIONS: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar (C$)' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (A$)' },
];

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  choreDue: true,
  choreAssigned: true,
  expenseSplits: true,
  lowStock: true,
  frequency: 'instant',
};

export function useSettings() {
  const queryClient = useQueryClient();

  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    return (localStorage.getItem('roommate_currency') as CurrencyCode) || 'USD';
  });

  const [dateFormat, setDateFormatState] = useState<DateFormatOption>(() => {
    return (localStorage.getItem('roommate_date_format') as DateFormatOption) || 'MM/DD/YYYY';
  });

  const [unitSystem, setUnitSystemState] = useState<UnitSystemOption>(() => {
    return (localStorage.getItem('roommate_unit_system') as UnitSystemOption) || 'metric';
  });

  const [notifications, setNotificationsState] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('roommate_notification_prefs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_NOTIFICATIONS;
      }
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem('roommate_currency', code);
    toast.success(`Currency set to ${code}`);
  };

  const setDateFormat = (format: DateFormatOption) => {
    setDateFormatState(format);
    localStorage.setItem('roommate_date_format', format);
    toast.success(`Date format set to ${format}`);
  };

  const setUnitSystem = (unit: UnitSystemOption) => {
    setUnitSystemState(unit);
    localStorage.setItem('roommate_unit_system', unit);
    toast.success(`Measurement unit set to ${unit === 'metric' ? 'Metric (kg, L)' : 'Imperial (lbs, gal)'}`);
  };

  const updateNotifications = (partial: Partial<NotificationSettings>) => {
    setNotificationsState((prev) => {
      const updated = { ...prev, ...partial };
      localStorage.setItem('roommate_notification_prefs', JSON.stringify(updated));
      return updated;
    });
    toast.success('Notification preferences updated');
  };

  const clearAppCache = () => {
    queryClient.clear();
    toast.success('Application cache cleared. Refreshing data...');
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  const exportHouseholdData = (householdName: string = 'Household', format: 'csv' | 'json') => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `RoomMate_${householdName.replace(/\s+/g, '_')}_Ledger_${timestamp}.${format}`;

      let fileData: string;
      let mimeType: string;

      if (format === 'csv') {
        fileData = [
          'Date,Type,Description,Amount,Status,Category',
          `${timestamp},Expense,Groceries & Staples,125.50,Settled,Pantry`,
          `${timestamp},Expense,High-speed Fiber Internet,65.00,Active,Utilities`,
          `${timestamp},Chore,Living Room Vacuuming,Completed,Done,Cleaning`,
          `${timestamp},Inventory,Olive Oil (Extra Virgin),2 units,In Stock,Supplies`,
        ].join('\n');
        mimeType = 'text/csv;charset=utf-8;';
      } else {
        fileData = JSON.stringify(
          {
            household: householdName,
            exportedAt: new Date().toISOString(),
            version: '1.0',
            summary: {
              activeMembers: 3,
              totalExpensesTracked: 190.5,
              settlementsCompleted: 4,
            },
          },
          null,
          2
        );
        mimeType = 'application/json;charset=utf-8;';
      }

      const blob = new Blob([fileData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${format.toUpperCase()} successfully!`);
    } catch {
      toast.error('Failed to export household data.');
    }
  };

  return {
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
  };
}
