# Test Refactoring Summary

## ✅ COMPLETED: ApiResponse.test.ts
**Before:** 23 tests  
**After:** 5 tests  
**Reduced by:** 18 tests (-78%)

### What Was Kept:
- ✅ Success response with data
- ✅ Custom status code handling
- ✅ Null data handling
- ✅ Error response with default status
 # Test Refactoring & Coverage Summary

This document summarizes the test suites we created and refactored for the RoomMate backend. It lists the production modules we covered, the exact tests implemented, totals, and a few notes about how the tests are structured and how to run them.

Summary snapshot
- Total test files: 12
- Total tests: 90 (all passing locally)
- Test framework: Vitest (v4), globals enabled, Node environment

Per-module test coverage (what we wrote)

- `src/common/utils/ApiResponse.ts` — 5 tests
  - success responses (with data)
  - support for custom status codes
  - null-data handling
  - error responses (default and custom status with data)

- `src/common/utils/jwtHandler.ts` — 8 tests
  - generateTokens (access + refresh)
  - getNewAccessToken
  - validateAccessToken (valid, invalid, expired)
  - validateRefreshToken (valid, invalid)
  - end-to-end token workflow

- `src/expenses/calculateBalance.ts` — 9 tests
  - single expense split
  - payer included in splits (equal split)
  - multiple expenses between same users
  - three-way splitting
  - unequal split amounts
  - decimal rounding behavior
  - empty/ no-splits edge cases
  - conservation test: total balance sums to zero

- `src/auth/session.repo.ts` — 6 tests
  - createSession (success)
  - getSession (with user relation / not found)
  - deleteSession (by sessionId)
  - deleteUserSessions (deleteMany, count)

- `src/users/user.repo.ts` — 8 tests
  - getUserById (found / null / error path)
  - getUserByEmail (found / null / error path)
  - createUser (success and duplicate-email P2002 error)
  - getAllUsers (list / empty / error)

- `src/households/household.service.ts` — 11 tests
  - create household (unique name)
  - create with numbered suffix when duplicate exists
  - reject creation when user not found
  - trim whitespace on names
  - getHouseholdsByUser (success / user not found)
  - delete household (cascade; transaction return)
  - join household (invite code flow, already-a-member, not-found)

- `src/households/household.repo.ts` — 9 tests
  - create (nanoid invite code, create members with ADMIN or default MEMBER)
  - getHouseholdByInviteCode (found / null)
  - getHouseholdsByUser (includes members.user select)
  - getHouseholdById (found / null)
  - findNamesLikeByUser (duplicate-name search for ADMINs)
  - delete (transaction for cascade and rollback test)

- `src/household-members/householdMember.repo.ts` — 6 tests
  - create member (custom data)
  - isExistingUser (composite unique lookup)
  - join (defaults to MEMBER role)
  - getByHouseholdId (include user details / empty)

- `src/expenses/expense.repo.ts` — 7 tests
  - create expense (from DTO)
  - getExpensesByHouseholdId (with paidBy select)
  - getExpenseByExpenseId (found / null)
  - delete (transaction deleting splits then expense; rollback)
  - getExpensesWithSplits (include splits.user and paidBy)

- `src/expense-split/expenseSplit.repo.ts` — 2 tests
  - bulkCreate (createMany) with multiple splits
  - bulkCreate with single split

- `src/expenses/expense.service.ts` — 9 tests
  - create: solo expense (no splits)
  - create: shared expense (split creation via ExpenseSplitService)
  - equal split calculation test (amount / sharedWith.length)
  - reject if payer not a household member
  - error handling when repo.create rejects (simulated DB error)
  - getExpensesByHousehold (fetch & return)
  - delete (verify getById then delete)
  - getBalances (calls ExpenseRepo.getExpensesWithSplits and calculateBalance)

How tests are structured / key patterns

- Layered approach: utilities → repositories → services. Service tests mock repos; repo tests mock Prisma.
- Mocks: `vi.mock()` for external deps (Prisma, bcrypt, jwtHandler, nanoid, etc.).
- Each repo test focuses on one Prisma query shape and expected `include/select` or transaction usage.
- Business logic tests check both happy paths and one critical error path per feature (e.g., DB failure
  simulated by `mockRejectedValue(new Error(...))`).
- Critical financial logic (calculateBalance) has conservation checks and multiple edge cases.

Quick commands — run tests / coverage (PowerShell)

```powershell
# run all tests once
npx vitest run

# run a single file
npx vitest run src/__tests__/expenses/expense.service.test.ts

# run in watch mode (fast feedback)
npx vitest watch

# run with coverage
npx vitest run --coverage

# type-check
npx tsc --noEmit

# type-check
npm test

# type-check
npm run test:watch


# type-check
npm run test:ui
```



