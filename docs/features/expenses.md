# Expense Tracking

## Overview
The Expenses module is the financial heart of RoomMate. it allows users to log shared costs and automatically determine the debt distribution among household members.

## Core Logic: Splitting
When an expense is created, the system requires a `paidBy` user and a list of `splits`.
- **Equal Split**: By default, the app can calculate an equal share for all household members.
- **Custom Split**: Users can manually specify the `shareAmount` for each selected member.
- **Validation**: The backend ensures that the sum of `shareAmount` values in the `ExpenseSplit` records matches the total `amount` of the `Expense`.

## User Interface Flow
1. **Creation**: The user opens the "Add Expense" modal, enters a description, amount, and selects who paid.
2. **Selection**: The user selects which roommates are involved in this specific cost.
3. **Submission**: The frontend sends a `POST` request to `/api/expenses`.
4. **Update**: Upon success, the `HouseholdContext` is refreshed to reflect updated balances and recent activity.

## Data Model
- **`Expense`**: Stores the primary record (amount, category, payer).
- **`ExpenseSplit`**: A join table linking the expense to every user involved and their specific share.
