import api from '@/api/axios';

export interface UserPreferences {
  theme: string;
  currency: string;
  dateFormat: string;
  measurementUnit: string;
  notifications: {
    choreAssigned: boolean;
    choreDue: boolean;
    expenseAdded: boolean;
    settlementConfirmed: boolean;
    lowStockAlerts: boolean;
    frequency: 'instant' | 'daily' | 'muted';
  };
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'bento-terracotta',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  measurementUnit: 'Metric',
  notifications: {
    choreAssigned: true,
    choreDue: true,
    expenseAdded: true,
    settlementConfirmed: true,
    lowStockAlerts: true,
    frequency: 'instant',
  },
};

export const getSavedPreferences = (): UserPreferences => {
  try {
    const raw = localStorage.getItem('roommate_notification_prefs');
    const currency = localStorage.getItem('roommate_currency') || 'USD';
    const dateFormat = localStorage.getItem('roommate_date_format') || 'MM/DD/YYYY';
    const measurementUnit = localStorage.getItem('roommate_measurement_unit') || 'Metric';
    const theme = localStorage.getItem('roommate_theme') || 'bento-terracotta';

    const notifications = raw ? JSON.parse(raw) : DEFAULT_PREFERENCES.notifications;

    return {
      theme,
      currency,
      dateFormat,
      measurementUnit,
      notifications,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

export const savePreferencesLocally = (prefs: UserPreferences) => {
  localStorage.setItem('roommate_theme', prefs.theme);
  localStorage.setItem('roommate_currency', prefs.currency);
  localStorage.setItem('roommate_date_format', prefs.dateFormat);
  localStorage.setItem('roommate_measurement_unit', prefs.measurementUnit);
  localStorage.setItem('roommate_notification_prefs', JSON.stringify(prefs.notifications));
};

export const exportHouseholdLedger = async (
  householdId: string,
  format: 'csv' | 'json',
  householdName = 'Household'
) => {
  if (format === 'csv') {
    const response = await api.get(`/household/export/${householdId}?format=csv`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    const sanitizedName = householdName.toLowerCase().replace(/\s+/g, '-');
    link.setAttribute(
      'download',
      `ledger-${sanitizedName}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return;
  }

  const response = await api.get(`/household/export/${householdId}?format=json`);
  const dataStr =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(response.data.data, null, 2));
  const link = document.createElement('a');
  link.href = dataStr;
  const sanitizedName = householdName.toLowerCase().replace(/\s+/g, '-');
  link.setAttribute(
    'download',
    `ledger-${sanitizedName}-${new Date().toISOString().slice(0, 10)}.json`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const checkHealthLatency = async (): Promise<{ status: string; latencyMs: number }> => {
  const start = performance.now();
  try {
    const res = await api.get('/health');
    const end = performance.now();
    return {
      status: res.data.status || 'healthy',
      latencyMs: Math.round(end - start),
    };
  } catch {
    const end = performance.now();
    return {
      status: 'unhealthy',
      latencyMs: Math.round(end - start),
    };
  }
};
