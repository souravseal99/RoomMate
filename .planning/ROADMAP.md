# Roadmap: RoomMate

**Created:** 2026-02-25
**Project:** RoomMate
**Core Value:** Enable roommates to seamlessly manage their shared household through a unified platform for tracking expenses, chores, and inventory with real-time balance calculations.

## Phase Overview

| Phase | Name | Goal | Requirements | Success Criteria |
|-------|------|------|--------------|------------------|
| 1 | Authentication & Households | Core user system | 8 | 5 |
| 2 | Expense Tracking | Financial management | 5 | 4 |
| 3 | Chore Management | Task coordination | 4 | 3 |
| 4 | Inventory Management | Shared物品 tracking | 5 | 4 |
| 5 | Dashboard & Notifications | Overview and alerts | 4 | 4 |

**Total: 5 phases | 26 requirements | 20 success criteria**

---

## Phase 1: Authentication & Households

**Goal:** Core user system with authentication and household management

### Requirements

- [AUTH-01] User can sign up with email and password
- [AUTH-02] User can log in and stay logged in across sessions
- [AUTH-03] User can log out from any page
- [AUTH-04] User session persists across browser refresh
- [HOUSE-01] User can create a new household
- [HOUSE-02] User can join an existing household via invite code
- [HOUSE-03] User can view household members
- [HOUSE-04] User can leave a household

### Success Criteria

1. **User can register** — New user can create account with email/password and receives confirmation
2. **User can log in** — Returning user can authenticate and access dashboard
3. **User can create household** — Authenticated user can create a new household and becomes its first member
4. **User can join household** — User can join existing household using invite code
5. **User can manage membership** — Users can view members and leave household

**Plans:**

- [ ] 01-01-PLAN.md — Backend: Leave household functionality
- [ ] 01-02-PLAN.md — Frontend: Auth UI (login, signup, logout)
- [ ] 01-03-PLAN.md — Frontend: Household management UI

---

## Phase 2: Expense Tracking

**Goal:** Financial management with expense splitting and balance tracking

### Requirements

- [HOUSE-05] User can invite others via shareable link
- [EXPN-01] User can add an expense with amount and description
- [EXPN-02] User can split expense among household members
- [EXPN-03] User can view expense history
- [EXPN-04] User can view balance summary (who owes whom)
- [EXPN-05] User can mark expense as settled

### Success Criteria

1. **User can add expenses** — Expense is saved with payer, amount, and split details
2. **Expenses are splittable** — User can divide equally or custom amounts among members
3. **Balance calculation works** — System calculates who owes whom accurately
4. **Settlement is possible** — Users can mark debts as settled

---

## Phase 3: Chore Management

**Goal:** Task coordination through chore assignment and tracking

### Requirements

- [CHOR-01] User can create a chore with title and assignee
- [CHOR-02] User can update chore status (pending/completed)
- [CHOR-03] User can view all household chores
- [CHOR-04] User can set recurring chores

### Success Criteria

1. **Chores are assignable** — Users can create chores and assign to household members
2. **Status tracking works** — Chores can be marked complete/incomplete
3. **Recurring chores function** — Recurring schedule creates new chore instances

---

## Phase 4: Inventory Management

**Goal:** Shared物品 tracking with low-stock alerts

### Requirements

- [INVT-01] User can add inventory item with name and quantity
- [INVT-02] User can update item quantity
- [INVT-03] User can view all inventory items
- [INVT-04] User receives low-stock alerts when quantity is low
- [INVT-05] User can delete inventory items

### Success Criteria

1. **Items are trackable** — Users can add and manage shared household items
2. **Quantity updates work** — Changes to item quantities are persisted
3. **Low-stock alerts trigger** — System notifies when item falls below threshold
4. **Items can be removed** — Users can delete items no longer tracked

---

## Phase 5: Dashboard & Notifications

**Goal:** Overview dashboard with household summaries and alerts

### Requirements

- [DASH-01] User can view household overview on dashboard
- [DASH-02] Dashboard shows expense summary
- [DASH-03] Dashboard shows pending chores
- [DASH-04] Dashboard shows low-stock inventory alerts

### Success Criteria

1. **Dashboard loads** — Overview page displays with household data
2. **Expense summary displays** — Current expense totals and balances shown
3. **Chore summary displays** — Pending chores count and details visible
4. **Inventory alerts display** — Low-stock items prominently shown

---

## Notes

- **Build Order:** Dependencies between phases ensure working foundation
- **Phase 5 can be combined** with earlier phases if timeline requires
- **v2 features** (notifications, categories) deferred to post-MVP
