# Phase 2: Expense Tracking - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Financial management with expense splitting and balance tracking. Users can add expenses, split among household members, view balances, and mark debts as settled. This phase covers EXPN-01 through EXPN-05 and HOUSE-05 (invite link is deferred).

</domain>

<decisions>
## Implementation Decisions

### Expense Splitting
- Equal split by default
- Users can edit split after creation
- Split among selected members (including payer)
- Equal among selected members

### Balance Calculation
- Settlement suggestion approach — calculate minimum transactions to settle debts
- Simple summary display — "Alice owes Bob $20, Bob owes Charlie $10"
- Real-time recalculation — balances update immediately when expense is added
- Show all members — including those with $0 balance

### Settlement
- Mark as paid — record that the debt has been paid
- Only own debts — users can only settle their own debts
- Show all expenses — keep settled expenses in history for audit trail
- Status indicator — display "Settled" badge on settled expenses

### Household Invites
- Use existing invite code functionality (from Phase 1)

### Claude's Discretion
- Exact UI placement of balance summary
- Balance summary design (popup, sidebar, dedicated section)
- Settlement button placement and interaction

</decisions>

<specifics>
## Specific Ideas

- "I want to see who owes whom at a glance"
- "Settle button should be obvious but not aggressive"
- Expense history should be clear about what's settled vs pending

</specifics>

<deferred>
## Deferred Ideas

- Invite link feature — deferred to future phase (not in Phase 2 scope)

</deferred>

---

*Phase: 02-expense-tracking*
*Context gathered: 2026-02-25*
