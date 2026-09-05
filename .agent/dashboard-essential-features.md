# Dashboard Module — Essential Features & User Flows

This document details all essential features, user flows, business logic, and API interactions for the **Dashboard (Overview Hub)** module in the **RoomMate** application.

It is structured in accordance with [household-design-philosophy.md](file:///Users/souravseal/RoomMate/.agent/household-design-philosophy.md), focusing on Gen-Z/Millennial preferences (18–35), frictionless "lazy-first" glanceability, aesthetic excellence, and progressive disclosure.

---

## 1. Feature Matrix & Capabilities

### 1.1 Glanceable Activity & Health Hub (Zero Friction)
- **Active Workspace Status Ribbon**: Instantly displays the currently active household, member count, and quick switch indicator.
- **Aggregated Metric Snapshot Cards**:
  - **Your Net Balance**: High-contrast card showing whether the user is owed money (green positive balance) or owes money (terracotta/amber balance) with a 1-tap "Settle Up" action.
  - **Pending Chores Due**: Count of pending chores assigned to the user or due today in the active household, with 1-tap direct completion toggle.
  - **Low Stock Inventory Alert**: Count of shared grocery/pantry essentials below minimum threshold with a 1-tap "Add to Cart" trigger.
  - **Active Households Count**: Quick count of joined flat spaces with 1-tap switcher link.
- **Unified Live Activity Feed**: Chronological stream of recent flatmate interactions across all modules (e.g., *"Alex logged $45 for Groceries"*, *"Sarah finished 'Take out Trash'"*, *"Milk is running low"*).

### 1.2 1-Tap Quick Action Bar
- **Quick Log Expense**: 1-click shortcut to the add expense modal with smart flatmate pre-selection.
- **Quick Add Chore**: 1-click shortcut with preset frequency tags (Daily, Weekly, Monthly).
- **Quick Restock**: 1-click button to auto-import all low-stock items into the shared shopping cart.
- **Quick Settle**: 1-click trigger directly opening the optimal settlement debt payoff modal.

---

## 2. End-to-End User Flows

### Flow 1: 0-Click Morning Glance (Dashboard Launch)
1. **Trigger**: User opens the RoomMate app or navigates to `/dashboard`.
2. **Client Action**: Concurrently queries `GET /dashboard/` and active household context.
3. **Data Aggregation**:
   - `householdCount`: Total spaces user is part of.
   - `pendingChoresCount`: Number of incomplete chores assigned to user or due today.
   - `expenses`: User's net financial standing in the active space.
   - `activities`: Combined recent activity log from chores, expenses, inventory, and settlements.
4. **Resolution**: Renders a visually rich whiteboard overview with high-priority alerts pinned at the top (e.g., *"You have 1 chore due today"* or *"Sam paid $30 towards your balance"*).

---

### Flow 2: 1-Tap In-Feed Chore Completion
1. **Trigger**: User sees their assigned chore (e.g. *"Clean Kitchen Counters"*) in the Dashboard Today's Chores widget.
2. **Interaction**: User taps the checkbox icon directly on the card without navigating away to the Chores page.
3. **API Request**: `POST /chore/update/:choreId` with `{ completed: true }`.
4. **Instant Feedback**: Checkbox ticks with a lively spring micro-animation, confetti particles pop, and the pending chores badge decrements from `1` to `0`.

---

### Flow 3: 1-Tap Quick Debt Settle from Dashboard
1. **Trigger**: User notices their balance card shows *"You owe Alex $24.50"*.
2. **Interaction**: User taps the prominent **"Settle Up"** CTA button on the balance card.
3. **Modal Display**: Opens the Settlement Modal with `toUserId: Alex` and `amount: 24.50` pre-filled.
4. **API Request**: `POST /expense/settlement` with `{ fromUserId, toUserId, amount, householdId }`.
5. **Resolution**: Balance instantly updates to `$0.00` ("All Settled Up ✨"), an activity entry is logged in the feed, and a success toast appears.

---

### Flow 4: Auto-Restock Low Inventory from Dashboard
1. **Trigger**: Dashboard alert pill displays *"⚠️ 2 Items Low in Pantry"*.
2. **Interaction**: User taps **"Auto-Add to Cart"** button directly on the dashboard alert card.
3. **API Request**: `POST /shopping-cart/add-low-stock/:householdId`.
4. **Server Logic**: Automatically queries items where `quantity <= lowThreshold` and inserts them into the household shopping cart.
5. **Resolution**: Alert updates to *"Items Added to Cart 🛒"*, and toast confirms: *"2 low stock items imported into shopping list"*.

---

### Flow 5: Filtering & Inspecting Recent Activity
1. **Trigger**: User scrolls through the Recent Activity Feed.
2. **Interaction**: User clicks category filter chips (*All*, *Expenses*, *Chores*, *Groceries*).
3. **Display**: Feed filters dynamically with smooth transitions. Clicking any activity card navigates directly to the relevant record.

---

## 3. Backend API Endpoints & Data Contracts

| Operation | HTTP Method & Route | Request Data | Response Data |
| :--- | :--- | :--- | :--- |
| **Fetch Dashboard Stats** | `GET /dashboard/` | Bearer Token Header | `{ data: { householdCount: number, pendingChoresCount: number, expenses: UserExpenseStats, activities: ActivityItem[] } }` |
| **Quick Complete Chore** | `POST /chore/update/:choreId` | `{ completed: boolean }` | `{ data: ChoreResponse }` |
| **Quick Settle Debt** | `POST /expense/settlement` | `{ fromUserId: string, toUserId: string, amount: number, householdId: string }` | `{ data: SettlementResponse }` |
| **Auto-Import Low Stock** | `POST /shopping-cart/add-low-stock/:householdId` | URL param: `householdId` | `{ data: { count: number, items: CartItem[] } }` |
