# Requirements: RoomMate

**Defined:** 2026-02-25
**Core Value:** Enable roommates to seamlessly manage their shared household through a unified platform for tracking expenses, chores, and inventory with real-time balance calculations.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User can log in and stay logged in across sessions
AUTH-03**:- [ ] ** User can log out from any page
- [ ] **AUTH-04**: User session persists across browser refresh

### Households

- [ ] **HOUSE-01**: User can create a new household
- [ ] **HOUSE-02**: User can join an existing household via invite code
- [ ] **HOUSE-03**: User can view household members
- [ ] **HOUSE-04**: User can leave a household
- [ ] **HOUSE-05**: User can invite others via shareable link

### Expenses

- [ ] **EXPN-01**: User can add an expense with amount and description
- [ ] **EXPN-02**: User can split expense among household members
- [ ] **EXPN-03**: User can view expense history
- [ ] **EXPN-04**: User can view balance summary (who owes whom)
- [ ] **EXPN-05**: User can mark expense as settled

### Chores

- [ ] **CHOR-01**: User can create a chore with title and assignee
- [ ] **CHOR-02**: User can update chore status (pending/completed)
- [ ] **CHOR-03**: User can view all household chores
- [ ] **CHOR-04**: User can set recurring chores

### Inventory

- [ ] **INVT-01**: User can add inventory item with name and quantity
- [ ] **INVT-02**: User can update item quantity
- [ ] **INVT-03**: User can view all inventory items
- [ ] **INVT-04**: User receives low-stock alerts when quantity is low
- [ ] **INVT-05**: User can delete inventory items

### Dashboard

- [ ] **DASH-01**: User can view household overview on dashboard
- [ ] **DASH-02**: Dashboard shows expense summary
- [ ] **DASH-03**: Dashboard shows pending chores
- [ ] **DASH-04**: Dashboard shows low-stock inventory alerts

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Expenses

- **EXPN-06**: User can categorize expenses (groceries, utilities, rent, etc.)
- **EXPN-07**: User can view expense reports by category
- **EXPN-08**: User can export expense data

### Notifications

- **NOTF-01**: User receives in-app notifications for new expenses
- **NOTF-02**: User receives email reminders for due chores

### Social

- **SOCL-01**: User can mention other members in expenses/chores
- **SOCL-02**: User can view household activity feed

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile app | Web-first approach, mobile deferred |
| Real-time notifications | Batch/email only for v1 |
| OAuth login (Google, GitHub) | Email/password sufficient for v1 |
| Video/image attachments | Storage costs, not core to MVP |
| Payment integration | External payments too complex for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| HOUSE-01 | Phase 1 | Pending |
| HOUSE-02 | Phase 1 | Pending |
| HOUSE-03 | Phase 1 | Pending |
| HOUSE-04 | Phase 1 | Pending |
| HOUSE-05 | Phase 2 | Pending |
| EXPN-01 | Phase 2 | Pending |
| EXPN-02 | Phase 2 | Pending |
| EXPN-03 | Phase 2 | Pending |
| EXPN-04 | Phase 2 | Pending |
| EXPN-05 | Phase 2 | Pending |
| CHOR-01 | Phase 3 | Pending |
| CHOR-02 | Phase 3 | Pending |
| CHOR-03 | Phase 3 | Pending |
| CHOR-04 | Phase 3 | Pending |
| INVT-01 | Phase 4 | Pending |
| INVT-02 | Phase 4 | Pending |
| INVT-03 | Phase 4 | Pending |
| INVT-04 | Phase 4 | Pending |
| INVT-05 | Phase 4 | Pending |
| DASH-01 | Phase 5 | Pending |
| DASH-02 | Phase 5 | Pending |
| DASH-03 | Phase 5 | Pending |
| DASH-04 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-25*
*Last updated: 2026-02-25 after initial definition*
