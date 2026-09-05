# RoomMate - User Flows & API Interactions

This document details all user flows implemented across `roommate-server` and `roommate-app`. Each flow describes the user interactions, business logic, endpoints involved, and database state transitions.

---

## Table of Contents

1. [Authentication & Session Management](#1-authentication--session-management)
2. [Household Management & Membership](#2-household-management--membership)
3. [Expense Management & Debt Settlement](#3-expense-management--debt-settlement)
4. [Chore Management](#4-chore-management)
5. [Inventory Management](#5-inventory-management)
6. [Shopping Cart Management](#6-shopping-cart-management)
7. [Dashboard & Activity Aggregation](#7-dashboard--activity-aggregation)

---

## 1. Authentication & Session Management

### 1.1 User Registration
* **Description**: A new user registers for a RoomMate account.
* **Pre-conditions**: User provides `name`, `email`, and `password`.
* **Flow**:
  1. Client sends request to `POST /auth/register`.
  2. Server validates user input (`registerUserValidator`).
  3. Server checks if email already exists in `User` model.
  4. Password is hashed using bcrypt.
  5. User record created in `User` table.
  6. Access Token and Refresh Token are generated; a session is saved in `Session`.
  7. Client receives HTTP-only refresh token cookie and JSON response with user details and access token.

### 1.2 User Login
* **Description**: An existing user authenticates into the application.
* **Pre-conditions**: User provides valid `email` and `password`.
* **Flow**:
  1. Client sends credentials to `POST /auth/login`.
  2. Server validates credentials against `User` table.
  3. On success, a new `Session` record is created (storing `sessionId`, `userId`, `refreshToken`, `expiresAt`).
  4. Access Token & Refresh Token are returned to the client.

### 1.3 Token Refresh & Session Validation
* **Description**: Maintains user authentication across app sessions or multi-tab usage.
* **Flow**:
  1. Client sends request to `GET /auth/refresh` with refresh token cookie.
  2. Server verifies `Session` record in database and validates token expiration.
  3. New access token is generated and returned to client.

### 1.4 User Logout
* **Description**: User logs out of their session.
* **Flow**:
  1. Client requests `GET /auth/logout`.
  2. Server invalidates the session record in `Session` table and clears authentication cookies.

---

## 2. Household Management & Membership

### 2.1 Create Household
* **Description**: A user creates a new shared living space (Household).
* **Flow**:
  1. Authenticated user sends `POST /household/create` with household `name`.
  2. Server generates a unique `inviteCode` (short UUID/nanoid).
  3. Server creates `Household` record and adds the creating user as `ADMIN` in `HouseholdMember`.
  4. Created household details are returned.

### 2.2 Join Household via Invite Code
* **Description**: A user joins an existing household using an invite code.
* **Flow**:
  1. User submits invite code via `POST /household/join/:inviteCode`.
  2. Server looks up `Household` by `inviteCode`.
  3. Server checks if user is already a member (`HouseholdMember`).
  4. If not a member, server creates a `HouseholdMember` record with role `MEMBER`.

### 2.3 List User Households & Members
* **Flow**:
  - `GET /household/all`: Fetches all households the current user belongs to.
  - `GET /household-member/all/:householdId`: Fetches all members of a specific household including member profile details (name, email, role).

### 2.4 Leave / Delete Household
* **Flow**:
  - `POST /household-member/leave/:householdId`: Removes current user from household.
  - `POST /household/delete`: (Admin only) Deletes the household record.

---

## 3. Expense Management & Debt Settlement

### 3.1 Create Expense & Split
* **Description**: A user logs a shared expense paid for the household.
* **Flow**:
  1. User submits expense via `POST /expense/add` containing `description`, `amount`, `householdId`, `paidById`, and optional `sharedWith` array of user IDs.
  2. Server verifies paying user belongs to household (`HouseholdMemberRepo`).
  3. `Expense` record created.
  4. If `sharedWith` user IDs are provided, server calculates `shareAmount = amount / sharedWith.length` and creates `ExpenseSplit` records for each specified user.

### 3.2 List Expenses
* **Flow**:
  - `GET /expense/for/:householdId`: Retrieves all expenses associated with a household, including who paid and split allocations.

### 3.3 Calculate Balances & Debt Minimization
* **Description**: Calculates net balance per user and suggests minimal settlement payments.
* **Flow**:
  1. Client calls `GET /expense/for/:householdId/balances`.
  2. Server fetches all expenses and splits for the household.
  3. Server computes net balance per member: `Balance = Total Paid - Total Share Owed`.
  4. Server factors in existing `Settlement` records to adjust net balances.
  5. Server runs debt minimization algorithm (`calculateSettlements`) to produce optimized settlement instructions (who owes whom how much).

### 3.4 Create Settlement (Settle Debt)
* **Description**: A user pays off debt to another roommate.
* **Flow**:
  1. User submits payment details via `POST /expense/settlement` with `fromUserId`, `toUserId`, `amount`, and `householdId`.
  2. Server records `Settlement` entry.
  3. Future balance calculations automatically adjust balances based on recorded settlements.

---

## 4. Chore Management

### 4.1 Create Chore
* **Flow**:
  1. User sends `POST /chore/add` with `description`, `frequency`, `nextDue`, `householdId`, optional `assignedToId`, `priority`, and `notes`.
  2. Server creates `Chore` record linked to household and assigned user.

### 4.2 List Household Chores
* **Flow**:
  - `GET /chore/household/:householdId`: Returns all chores for a household sorted/filtered by due date and assignment.

### 4.3 Complete / Update Chore
* **Flow**:
  - `POST /chore/update/:choreId`: Toggles `completed` status of a chore.

### 4.4 Delete Chore
* **Flow**:
  - `DELETE /chore/:choreId`: Deletes a chore entry.

---

## 5. Inventory Management

### 5.1 Track Household Inventory Items
* **Flow**:
  1. `POST /inventory/add`: Adds new `InventoryItem` with `name`, `quantity`, `lowThreshold`, and `householdId`.
  2. `GET /inventory/:householdId`: Retrieves all inventory items for a household.
  3. `PATCH /inventory/:itemId`: Updates quantity or low stock threshold.
  4. `DELETE /inventory/:itemId`: Removes item from inventory.

---

## 6. Shopping Cart Management

### 6.1 Manage Shopping Cart Items
* **Flow**:
  1. `GET /shopping-cart/:householdId`: Fetches current shopping cart items.
  2. `POST /shopping-cart/add`: Manually adds an item (`itemName`, `quantity`) to cart.
  3. `PATCH /shopping-cart/:cartItemId`: Updates item details or quantity.
  4. `DELETE /shopping-cart/:cartItemId`: Removes item from cart.

### 6.2 Auto-Import Low Stock Items
* **Description**: Automatically populates shopping cart with inventory items below their threshold.
* **Flow**:
  1. User triggers `POST /shopping-cart/add-low-stock/:householdId`.
  2. Server queries `InventoryItem` records where `quantity <= lowThreshold` for the household.
  3. Server creates corresponding `ShoppingCart` items for any low-stock items not already in cart.

---

## 7. Dashboard & Activity Aggregation

### 7.1 View User Overview Dashboard
* **Description**: Displays aggregated user metrics across all households.
* **Flow**:
  1. User navigates to main dashboard (`GET /dashboard/`).
  2. Server concurrently fetches:
     - Count of households user belongs to (`householdCount`).
     - Pending chores assigned to or in user's households (`pendingChoresCount`).
     - Total user expenses / outstanding balances (`expenses`).
     - Feed of recent household activities (`activities`).
  3. Consolidated dashboard data payload is returned.
