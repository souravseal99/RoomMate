# Household Module — Essential Features & User Flows

This document details all essential features, user flows, business logic, role permissions, and API interactions for the **Household Management** module in the **RoomMate** application.

---

## 1. Feature Matrix & Capabilities

### 1.1 Core Household Management
- **Active Workspace Selection**: Seamlessly select and switch the active household context, which dynamically drives data across Expenses, Chores, Balances, and Inventory modules.
- **Household Directory**: View all households the authenticated user belongs to, including active status, member counts, creation dates, and user role (`ADMIN` vs `MEMBER`).
- **Create Household**: Create a new shared living space with auto-duplicate name protection, auto-generated unique 8-character nanoid `inviteCode`, and automatic `ADMIN` role assignment.
- **Join Household via Invite Code**: Join an existing household using an 8-character invite code, with instant duplicate checking and automatic `MEMBER` role assignment.
- **Invite & Collaboration Center**: Multiple sharing methods including 1-click clipboard copy, pre-composed WhatsApp group invites, deep link sharing (`/join?code=...`), and QR codes for in-person roommate scanning.

### 1.2 Roommate Roster & Permissions
- **Member Directory**: Inspect all members of a household, displaying name, email, avatar initials, role badge, and join date.
- **Role Distinction**:
  - `ADMIN`: Creator of the household or promoted member. Can rename the household, view roster, share invite codes, and permanently delete the household.
  - `MEMBER`: Joined roommate. Can view roster, share invite codes, and leave the household.

### 1.3 Space Settings & Lifecycle
- **Rename Household**: Admin ability to update the household display name with instant state synchronization.
- **Leave Household (Smart Role Transfer)**:
  - If a regular member leaves: Membership record is removed.
  - If an admin leaves with remaining members: Admin role is automatically promoted to the next senior member.
  - If an admin leaves as the sole occupant: The empty household and all related records are permanently deleted.
- **Delete Household (Cascade Deletion)**: Admin-only destructive action that permanently removes the household and all associated expenses, splits, chores, inventory items, and shopping cart records.
- **First-Time Onboarding (Zero State)**: Welcoming, step-by-step empty state for new users with prominent dual CTAs to create a space or join via code.

---

## 2. End-to-End User Flows

### Flow 1: First-Time User Onboarding (Zero Households)
1. **Trigger**: User logs in with no active household memberships (`households.length === 0`).
2. **UI State**: Displays empty state with welcoming copy and two primary options:
   - **Option A: "Create a Space"**
   - **Option B: "Join with Code"**
3. **Execution**:
   - Creating a space triggers **Flow 3**.
   - Joining a space triggers **Flow 4**.
4. **Resolution**: Upon completion, the new space is automatically set as the active household in `HouseholdContext`, stored in `localStorage`, and the user is transitioned to the main dashboard.

---

### Flow 2: 1-Tap Active Household Switching
1. **Trigger**: User has multiple households and taps a different household card.
2. **Client Action**:
   - Updates `selectedHousehold` in `HouseholdContext`.
   - Persists `roommate_active_household_id` to `localStorage`.
3. **Global Synchronization**: Dependent modules (`/expenses`, `/chores`, `/inventory`, `/dashboard`) automatically refresh queries for the new active `householdId`.
4. **Feedback**: Shows active indicator on the selected card and displays a success toast (*"Switched to [Household Name]"*).

---

### Flow 3: Creating a Household
1. **Trigger**: User clicks "Create Household".
2. **Form Interaction**: User enters a name (or clicks a pre-set quick name suggestion chip) and submits.
3. **API Request**: `POST /household/create` with `{ name }`.
4. **Server Logic**:
   - Appends incremental suffix if name matches existing user spaces (`Downtown Flat (1)`).
   - Generates unique 8-character `inviteCode`.
   - Creates `Household` record and adds creator as `Role.ADMIN` in `HouseholdMember`.
5. **Success State**: Opens share step revealing the new `inviteCode`, automatically refreshes household list, sets the space as active, and provides 1-tap copy/share actions.

---

### Flow 4: Joining a Household via Invite Code
1. **Trigger**: User clicks "Join Household" or visits a shared link (`/join?code=...`).
2. **Form Interaction**: User enters/pastes the 8-character code. Auto-formats to uppercase and trims whitespace.
3. **API Request**: `POST /household/join/:inviteCode`.
4. **Server Logic**:
   - Queries `Household` by `inviteCode`.
   - Verifies if user is already a member (returns `409 Conflict` if duplicate).
   - Creates `HouseholdMember` record with `Role.MEMBER`.
5. **Success State**: Refreshes household context, sets the joined space as active, and displays success toast.

---

### Flow 5: Viewing the Member Roster
1. **Trigger**: User clicks the "Roommates" action on any household card.
2. **API Request**: `GET /household-member/all/:householdId`.
3. **Drawer Display**: Renders member directory with initials avatars, names, emails, roles (`ADMIN` / `MEMBER`), and join dates.
4. **Collaboration Action**: Includes a persistent "Invite Roommates" button with 1-click code sharing.

---

### Flow 6: Renaming a Household (Admin Only)
1. **Trigger**: Admin selects "Edit Name" from household options.
2. **Form Interaction**: Enters new name and submits.
3. **API Request**: `POST /household/update` with `{ householdId, name }`.
4. **Resolution**: Updates global household state, re-renders space name across navigation headers, and toasts confirmation.

---

### Flow 7: Leaving a Household
1. **Trigger**: User selects "Leave Household" from household options.
2. **Confirmation**: Modal presents role-aware consequences:
   - For members: Confirms loss of access to shared records.
   - For sole occupant admins: Alerts that the space will be deleted.
   - For admins with roommates: Notes that admin privileges will transfer to the next roommate.
3. **API Request**: `POST /household-member/leave/:householdId`.
4. **Resolution**: Removes membership, re-fetches households, and auto-switches active space if the left household was active.

---

### Flow 8: Deleting a Household (Admin Only, Cascade)
1. **Trigger**: Admin selects "Delete Household".
2. **Confirmation**: Destructive warning modal explicitly detailing cascading deletion of all expenses, settlement records, chores, inventory, shopping cart items, and member memberships.
3. **API Request**: `POST /household/delete` with `{ householdId }`.
4. **Server Action**: Cascades deletion across all related database tables.
5. **Resolution**: Clears household from context, resets active selection, and toasts confirmation.

---

## 3. Backend API Endpoints & Data Contracts

| Operation | HTTP Method & Route | Request Data | Response Data |
| :--- | :--- | :--- | :--- |
| **Fetch All User Households** | `GET /household/all` | Bearer Token | `{ data: { household: HouseholdResponse[] } }` |
| **Create Household** | `POST /household/create` | `{ name: string }` | `{ data: { household: HouseholdResponse } }` |
| **Join Household** | `POST /household/join/:inviteCode` | URL param: `inviteCode` | `{ data: { household: JoinedMemberResponse } }` |
| **Update Household Name** | `POST /household/update` | `{ householdId: string, name: string }` | `{ data: { household: HouseholdResponse } }` |
| **Leave Household** | `POST /household-member/leave/:householdId` | URL param: `householdId` | `{ message: string }` |
| **Delete Household** | `POST /household/delete` | `{ householdId: string }` | `{ data: { household: CascadeDeleteReport } }` |
| **Get Household Members** | `GET /household-member/all/:householdId` | URL param: `householdId` | `HouseholdMemberResponse[]` |
