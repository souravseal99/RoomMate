# Expense & Settlement Module — Essential Features & User Flows

This document details all essential features, user flows, business logic, debt minimization algorithms, and API interactions for the **Expense & Debt Settlement** module in the **RoomMate** application.

It is structured in accordance with [household-design-philosophy.md](file:///Users/souravseal/RoomMate/.agent/household-design-philosophy.md), focusing on the Gen-Z/Millennial target demographic (18–35), zero-mental-math debt optimization, and frictionless settlement logging.

---

## 1. Feature Matrix & Capabilities

### 1.1 Zero-Mental-Math Balances & Debt Minimization
- **Net Balance Snapshot Banner**: Prominently shows user's personal financial position in the active household:
  - **Positive Balance**: *"You are owed $64.50 overall"* (terracotta/green positive indicator).
  - **Negative Balance**: *"You owe $32.00 overall"* (amber alert indicator).
  - **Zero Balance**: *"All settled up! No debts pending ✨"*.
- **Optimized Settlement Instructions (Minimal Transactions)**:
  - Automatically runs graph debt-minimization algorithm (`calculateSettlements`).
  - Instead of multiple circular debts, calculates the absolute fewest payments needed to settle the entire household (e.g., *"Alex pays Sam $25.00"*).
- **Per-Roommate Breakdown**: Visual breakdown of individual balances with 1-tap "Settle" triggers next to each debtor/creditor.

### 1.2 Effortless Expense Logging (Lazy-First UX)
- **Category Preset Chips**: 1-click popular category pills (*"Groceries 🛒"*, *"Electricity / Wi-Fi ⚡"*, *"Rent 🏠"*, *"Takeout 🍕"*, *"Household Supplies 🧻"*, *"Cleaning 🧼"*) to eliminate typing.
- **Smart 1-Tap Equal Split**: Defaults to splitting equally among all roommates (`shareAmount = totalAmount / memberCount`) with a single toggle.
- **Custom Split Selector**: 1-click roommate avatar checkboxes to include or exclude specific roommates from a shared purchase.
- **Payer Pre-selection**: Defaults payer to current user, with 1-tap dropdown to log an expense paid by another flatmate.

### 1.3 1-Tap Debt Settlement
- **Quick Settle Modal**: Pre-fills payer, receiver, and exact owed amount with 1-click confirmation.
- **Settlement History**: Persistent ledger of recorded payments preventing dispute or confusion.
- **Expense Deletion**: Ability to remove mistaken expense records with automated balance recalculation.

---

## 2. End-to-End User Flows

### Flow 1: Logging a Shared Expense (Under 5 Seconds)
1. **Trigger**: User pays for grocery run ($48.00) and clicks "+ Log Expense".
2. **Form Interaction**:
   - User inputs amount: `48`.
   - User taps category chip: *"Groceries"*.
   - Split mode defaults to **"Split Equally with Everyone (4 Roommates)"** ($12.00 / person).
   - User clicks **"Save Expense"**.
3. **API Request**: `POST /expense/add` with `{ description: "Groceries", amount: 48, householdId, paidById: currentUser.userId, sharedWith: [id1, id2, id3, id4] }`.
4. **Server Logic**:
   - Validates payer's membership in the household.
   - Creates `Expense` record.
   - Calculates `shareAmount = 48 / 4 = 12` and bulk creates `ExpenseSplit` records for all 4 members.
5. **Resolution**: Closes modal immediately, updates balance card instantly, and logs entry to feed with toast: *"Added $48.00 Groceries (Split 4 ways)"*.

---

### Flow 2: Custom Split with Specific Roommates
1. **Trigger**: User orders pizza for themselves and 1 other roommate (not the whole flat).
2. **Interaction**:
   - Enters amount: `30.00`, description: *"Pizza"*.
   - Unchecks "All Flatmates", and taps avatars for *You* and *Sam*.
   - UI instantly displays: *"Split 2 ways: $15.00 each"*.
3. **API Request**: `POST /expense/add` with `sharedWith: [yourId, samId]`.
4. **Resolution**: Only Sam owes $15.00; other roommates' balances remain untouched.

---

### Flow 3: 1-Tap Debt Settlement (Settle Up)
1. **Trigger**: User wants to pay off their balance of $25.00 owed to Alex.
2. **Interaction**: User taps **"Settle Up"** button next to Alex's name.
3. **Modal Display**: Opens settlement confirmation pre-filled with:
   - *From*: You
   - *To*: Alex
   - *Amount*: `$25.00`
4. **API Request**: `POST /expense/settlement` with `{ fromUserId, toUserId: alexId, amount: 25.00, householdId }`.
5. **Server Logic**: Records `Settlement` entry and recalibrates net household balance graph.
6. **Resolution**: Balance instantly drops to `$0.00` with celebratory feedback: *"Settlement recorded! You and Alex are all square 🎉"*.

---

### Flow 4: Inspecting Balances & Settlement Graph
1. **Trigger**: User visits `/expenses` and clicks the "Balances" tab.
2. **API Request**: `GET /expense/for/:householdId/balances`.
3. **UI Display**:
   - Renders visual debt minimization cards (e.g. *"Sam owes Alex $18.50"*).
   - Renders individual member balance chips with positive/negative tags.

---

### Flow 5: Deleting an Expense
1. **Trigger**: User made a typo or duplicate expense entry.
2. **Interaction**: User clicks expense item menu -> "Delete Expense".
3. **API Request**: `DELETE /expense/:expenseId`.
4. **Resolution**: Removes expense and all associated `ExpenseSplit` records; balances automatically recalculate.

---

## 3. Backend API Endpoints & Data Contracts

| Operation | HTTP Method & Route | Request Data | Response Data |
| :--- | :--- | :--- | :--- |
| **Fetch Household Expenses** | `GET /expense/for/:householdId` | URL param: `householdId` | `{ data: ExpenseWithSplits[] }` |
| **Fetch Balances & Settlements** | `GET /expense/for/:householdId/balances` | URL param: `householdId` | `{ data: { balances: BalanceEntry[], settlements: OptimizedSettlement[] } }` |
| **Add Expense** | `POST /expense/add` | `{ description: string, amount: number, householdId: string, paidById: string, sharedWith?: string[] }` | `{ data: { createdExpense: Expense, createdSplits: ExpenseSplit[] } }` |
| **Record Settlement** | `POST /expense/settlement` | `{ fromUserId: string, toUserId: string, amount: number, householdId: string }` | `{ data: SettlementResponse }` |
| **Delete Expense** | `DELETE /expense/:expenseId` | URL param: `expenseId` | `{ data: DeletedExpense, message: "Expense Deleted" }` |
