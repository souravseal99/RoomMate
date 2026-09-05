# Application Settings & Preferences Module — Essential Features & User Flows

This document details all essential features, user flows, business logic, persistence layers, and API interactions for the **Application Settings & Preferences** module in the **RoomMate** application.

It is structured in accordance with [household-design-philosophy.md](file:///Users/souravseal/RoomMate/.agent/household-design-philosophy.md), ensuring native TailwindCSS v4 theme integration, seamless multi-tab state sync, granular notification controls, financial localization, and transparent data portability.

---

## 1. Feature Matrix & Capabilities

### 1.1 Appearance & Theming Engine
- **Multi-Theme Engine**:
  - **Warm Cream / Tactile Light (Default)**: Soft parchment tones (`#fff9ec`), terracotta accents (`#a43e00`), and paper card elevations.
  - **Sleek Dark Mode**: Deep obsidian surfaces (`#1a1917`), high-contrast muted text, and soft glowing active indicators.
  - **System Auto**: Dynamically follows the user's OS preference (`prefers-color-scheme`).
- **Smooth Theme Transitions**: Instant CSS variable class toggling on the `<html>` root with zero layout flashes or reload penalties.

### 1.2 Notification Channels & Frequency
- **Chore Notifications**:
  - *Assigned Chore Alerts*: Instant notification when a roommate assigns you a task.
  - *Due Date Reminders*: Push/Email alert 24h and 2h before chore deadline.
  - *Completion Celebrations*: Notification when a flatmate completes a shared household chore.
- **Financial & Expense Split Alerts**:
  - *New Expense Added*: Alert with your exact owed share.
  - *Settlement Confirmation*: Immediate notification when someone marks a balance as settled.
- **Stock & Pantry Alerts**:
  - *Low Stock Warnings*: Automatic notification when essential supplies hit `lowThreshold`.
- **Digest Frequency**: Toggle between *Instant*, *Daily Evening Summary*, or *Muted*.

### 1.3 Regional & Financial Localization
- **Currency Configuration**: Global currency selector supporting major living currencies:
  - `USD ($)` | `EUR (€)` | `GBP (£)` | `INR (₹)` | `CAD (C$)` | `AUD (A$)`
- **Date & Time Formatting**: Choose between `MM/DD/YYYY` (US) and `DD/MM/YYYY` (International).
- **Measurement Units**: Metric (`kg, L`) vs Imperial (`lbs, gal`) for pantry stocking.

### 1.4 Household Workspace Defaults
- **Default Space on Login**: Configure which household opens automatically on initial authentication (e.g. *Most recently active* vs *Specific pinned household*).
- **Auto-Join Acceptance**: Setting to automatically activate newly accepted invite codes.

### 1.5 Data Export & Portability (Ledger Backup)
- **Export Household Records**: Download complete historical ledger (Expenses, Settlements, Chores, Inventory) in standard formats:
  - **CSV (Spreadsheet friendly)**
  - **JSON (Machine readable raw backup)**
- **Filterable Date Ranges**: Export all-time or specific billing cycles/months.

### 1.6 House Rules & Shared Living Guidelines
- **House Charter & Etiquette**: Quick reference template for household guidelines (Quiet hours, Guest policies, Kitchen etiquette, Cleaning rotations).
- **App Version & Diagnostics**: System version badge, API latency indicator, and one-click "Clear Local Cache" button.

---

## 2. End-to-End User Flows

### Flow 1: Toggling Visual Theme (Light / Dark / System)
1. **Trigger**: User navigates to `/settings` and clicks a Theme option under "Appearance".
2. **Execution**:
   - Updates `theme` state in UI store.
   - Sets `localStorage.setItem('roommate_theme', theme)`.
   - Modifies `document.documentElement.classList` (`light` vs `dark`).
3. **Multi-Tab Sync**: Broadcasts `APP_EVENTS.THEME_CHANGED` over EventBus to synchronize other open tabs immediately.
4. **Resolution**: UI instantly updates with smooth CSS transitions without page reloads.

---

### Flow 2: Customizing Notification Preferences
1. **Trigger**: User toggles switches under "Notifications" (e.g. toggles *Low Stock Warnings* ON).
2. **Form Interaction**: Toggles individual boolean switches for Chores, Expenses, and Stock.
3. **API Request**: Debounced `PATCH /user/preferences` with payload:
   ```json
   {
     "notifications": {
       "choreAssigned": true,
       "choreDue": true,
       "expenseAdded": true,
       "settlementConfirmed": true,
       "lowStockAlerts": true,
       "frequency": "instant"
     }
   }
   ```
4. **Resolution**: Updates server preferences and displays subtle confirmation toast.

---

### Flow 3: Setting Default Currency & Localization
1. **Trigger**: User selects preferred currency from the Currency dropdown (e.g. `EUR (€)`).
2. **Client Action**:
   - Persists `roommate_currency` to `localStorage`.
   - Updates global currency context.
3. **API Request**: `PATCH /user/preferences` with `{ currency: "EUR" }`.
4. **Global Synchronization**:
   - Expense cards, Net Balance cards, and Chore rewards across all pages immediately re-render amounts with `€` symbol.
5. **Resolution**: Toast confirms (*"Currency updated to EUR (€)"*).

---

### Flow 4: Exporting Household Ledger Data
1. **Trigger**: User clicks "Export Ledger (CSV)" under the Data & Privacy section.
2. **API Request**: `GET /household/export/:householdId?format=csv`.
3. **Server Action**:
   - Gathers all expenses, splits, settlements, and member names for the active household.
   - Formats records into structured RFC 4180 CSV string.
4. **Client Download**: Triggers standard browser file download (`RoomMate_123_Maple_Ave_Ledger_2026-08-29.csv`).
5. **Resolution**: Displays download completion notification.

---

### Flow 5: Clearing Local Cache & Troubleshooting
1. **Trigger**: User clicks "Clear Cache & Refresh" in the Diagnostics section.
2. **Execution**:
   - Calls `queryClient.clear()` to purge all cached TanStack Query entries.
   - Preserves authentication tokens in `TokenStore`.
   - Triggers clean window reload.
3. **Resolution**: App refreshes with fresh network data.

---

## 3. Local Storage & Cache Keys

| Key | Type | Default | Description |
|---|---|---|---|
| `roommate_theme` | `'light' \| 'dark' \| 'system'` | `'light'` | Selected application visual theme |
| `roommate_currency` | `string` | `'USD'` | Preferred currency symbol and code |
| `roommate_date_format` | `'MM/DD/YYYY' \| 'DD/MM/YYYY'` | `'MM/DD/YYYY'` | Preferred date rendering format |
| `roommate_notification_prefs` | `object` | `{ ... }` | Cached notification switch states |

---

## 4. API Endpoints Specification

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/user/preferences` | Yes | Retrieves saved user preferences (theme, currency, notifications) |
| `PATCH` | `/user/preferences` | Yes | Updates user preferences and notification subscriptions |
| `GET` | `/household/export/:householdId` | Yes | Streams CSV or JSON export of household expenses and activity |
| `GET` | `/health` | No | Diagnostics endpoint returning server status and ping latency |

---

## 5. Error Handling & Edge Cases

- **Offline Theme Persistence**: Themes are read from `localStorage` synchronously prior to DOM paint in `index.html` to eliminate FOUC (Flash of Unstyled Content).
- **Currency Mismatch Handling**: Changing the display currency formats existing values gracefully with currency code fallbacks.
- **Graceful Export Failure**: If an export exceeds payload limits, the server returns a signed temporary download URL.
