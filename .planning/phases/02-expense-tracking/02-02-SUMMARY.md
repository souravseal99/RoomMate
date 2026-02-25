---
phase: 02-expense-tracking
plan: 02
subsystem: expense-tracking
tags: [expense, settlement, payment, balance]
dependency_graph:
  requires:
    - 02-01 (balance calculation)
  provides:
    - Settlement model in database
    - Settlement API endpoints
    - Frontend settlement types and API
    - Settlement UI in BalanceSummary
    - Settled status indicator in ExpenseViewer
  affects:
    - BalanceSummary component
    - ExpenseViewer component
    - expenseApi
    - expenseTypes
tech_stack:
  added model (Prisma)
   :
    - Settlement - Settlement repository
    - Settlement service
    - createSettlement API method
    - fetchSettlements API method
    - Settlement types (Request/Response)
    - JWT decoding utility
key_files:
  created:
    - roommate-server/src/expenses/settlement.repo.ts
    - roommate-server/src/expenses/settlement.service.ts
    - roommate-app/src/utils/jwt.ts
  modified:
    - roommate-server/prisma/schema.prisma
    - roommate-server/src/expenses/expense.routes.ts
    - roommate-server/src/expenses/expense.controller.ts
    - roommate-server/src/expenses/expense.service.ts
    - roommate-app/src/api/expenseApi.ts
    - roommate-app/src/types/expenseTypes.ts
    - roommate-app/src/components/expenses/BalanceSummary.tsx
    - roommate-app/src/components/expenses/ExpenseViewer.tsx
decisions:
  - "Users can only settle their own debts (validated on server)"
  - "Settlement is a balance-level payment, not expense-level"
  - "JWT decoded on frontend to get current userId"
metrics:
  duration: "~5 minutes"
  completed: "2026-02-25"
---

# Phase 2 Plan 2: Settlement Feature (Mark as Paid) Summary

**One-liner:** Mark debts as paid with settlement recording, balance recalculation, and status indicators

## Completed Tasks

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add Settlement model to Prisma schema | c87c993 | schema.prisma |
| 2 | Add settlement API endpoints | 8cf2ab6 | expense.routes.ts, expense.controller.ts, expense.service.ts, settlement.repo.ts, settlement.service.ts |
| 3 | Add settlement methods to frontend API | 950bd8c | expenseApi.ts |
| 4 | Add settlement types | 666ac2b | expenseTypes.ts |
| 5 | Add settlement UI to BalanceSummary | 39bd68e | BalanceSummary.tsx, jwt.ts |
| 6 | Update ExpenseViewer to show Settled status | 9ef5b2a | ExpenseViewer.tsx |

## What Was Built

### Backend
- **Settlement model** in Prisma with relations to User (from/to) and Household
- **POST /expense/settlement** endpoint to create settlement records
- **GET /expense/settlement/for/:householdId** endpoint to list settlements
- Server-side validation: users can only settle their own debts
- Updated balance calculation to subtract settlements from balances
- Recalculates settlement suggestions after settlements are recorded

### Frontend
- **createSettlement** API method
- **fetchSettlements** API method  
- **SettlementRequest** and **SettlementResponse** types
- **JWT utility** to decode token and get current userId
- **Settle button** in BalanceSummary - only shown for user's own debts
- **Settled status badge** in ExpenseViewer (green = settled, yellow = pending)

## Verification

- Settlement model exists in database after `npx prisma db push`
- API endpoints created: POST /settlement, GET /settlement/for/:householdId
- Frontend shows Settle button only for current user's debts
- Expense list shows Settled status when balance is paid

## Success Criteria Met

- [x] User can settle their own debts (button shown only for fromUserId === currentUserId)
- [x] Settlement is recorded in database (Settlement model)
- [x] Balance recalculates after settlement (updated getBalances)
- [x] Expense shows Settled status when paid (ExpenseViewer status badge)

## Deviations from Plan

None - plan executed exactly as written.
