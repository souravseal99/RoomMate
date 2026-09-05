# User Profile & Account Security Module — Essential Features & User Flows

This document details all essential features, user flows, business logic, role permissions, and API interactions for the **User Profile & Account Security** module in the **RoomMate** application.

It is structured in accordance with [household-design-philosophy.md](file:///Users/souravseal/RoomMate/.agent/household-design-philosophy.md), adhering to the Gen-Z/Millennial target demographic (18–35), warm tactile minimalist aesthetics, transparent roommate accountability, and modern authentication best practices.

---

## 1. Feature Matrix & Capabilities

### 1.1 Personal Identity & Roommate Bio
- **User Identity**: View and update full name, email address, phone number (for instant roommate reachability), and personal roommate bio / living habits.
- **Avatar & Monogram System**: Dynamic tactile initial avatars with theme-aware background colors, with support for custom avatar image uploads.
- **Roommate Reputation & Activity Badges**:
  - *Chores Streak*: Total chores completed on-time.
  - *Reliable Settler*: Fast expense settlement track record.
  - *Living Spaces*: Total active household memberships.

### 1.2 Household Affiliations & Roles
- **Multi-Space Summary**: Overview of all households the user currently belongs to, displaying space names, member counts, creation dates, and user role (`ADMIN` vs `MEMBER`).
- **1-Click Switch Context**: Direct navigation and active household activation directly from the profile hub.

### 1.3 Account Security & Session Management
- **Password Management**: Secure credential updating with current password verification and Zod validation rules (minimum 8 characters, uppercase, number, symbol).
- **Active Device Sessions**: Inspect all active authenticated sessions (browser, device type, IP address, location estimate, last active timestamp).
- **Remote Session Revocation**: Ability to log out of specific remote sessions or revoke all other sessions with 1 click.
- **Account Deletion & Offboarding**: Secure, multi-step destructive account deletion flow with cascading cleanup checks (ensuring debts are settled and admin roles transferred).

---

## 2. End-to-End User Flows

### Flow 1: Viewing Profile & Household Affiliations
1. **Trigger**: User navigates to `/profile` or clicks their user avatar card in the desktop sidebar / mobile app bar.
2. **Data Fetching**: Hook `useProfileQuery()` executes `GET /user/profile` and combines with cached `useHouseholdsQuery()` data.
3. **UI Display**:
   - Top Hero Card with user avatar monogram, name, email, phone, and living habits bio.
   - Activity stat counters (Chores Done, Net Balance status, Active Spaces).
   - "Your Shared Spaces" card cluster with admin/member badges and quick-switch links.
4. **Resolution**: Displays loaded profile with zero-layout-shift skeleton fallback.

---

### Flow 2: Editing Personal Profile Details
1. **Trigger**: User clicks "Edit Profile" button on the profile page.
2. **Form Interaction**: Opens an edit modal or slide-over drawer with fields:
   - Name (`required`, 2–50 chars)
   - Phone Number (optional, formatted with country code)
   - Roommate Bio / Living Habits (e.g. *"Early riser, loves cooking, night owl on weekends"*)
3. **Validation**: Client-side validation via React Hook Form + Zod (`profileSchema`).
4. **API Request**: `PATCH /user/profile` with sanitized payload `{ name, phone, bio }`.
5. **Success State**:
   - Updates TanStack Query cache `['user', 'profile']`.
   - Emits `APP_EVENTS.USER_PROFILE_UPDATED` on the EventBus to update top bar and sidebar avatars.
   - Shows celebratory toast notification (*"Profile updated successfully!"*).

---

### Flow 3: Changing Account Password
1. **Trigger**: User navigates to the "Security" tab on the profile page and clicks "Change Password".
2. **Form Interaction**: User enters:
   - Current Password
   - New Password (with live strength meter)
   - Confirm New Password
3. **API Request**: `POST /auth/change-password` with `{ currentPassword, newPassword }`.
4. **Server Validation**:
   - Verifies `currentPassword` bcrypt hash against database record.
   - Enforces password complexity requirements.
   - Hashes and saves new password.
5. **Resolution**: Closes modal, issues toast confirmation (*"Password changed successfully. Please keep your credentials secure."*).

---

### Flow 4: Inspecting and Revoking Active Sessions
1. **Trigger**: User views the "Active Sessions" section in Security settings.
2. **Data Fetching**: Hook `useActiveSessionsQuery()` fetches `GET /auth/sessions`.
3. **UI Display**: List of active devices showing:
   - Device & Browser (e.g. *Chrome on macOS*, *Safari on iPhone*)
   - Current Device indicator tag (green badge)
   - Last active timestamp and IP address
4. **Action A: Revoke Single Session**:
   - User clicks "Log Out Device" on a specific entry.
   - `DELETE /auth/sessions/:sessionId` removes session record from DB.
5. **Action B: Revoke All Other Sessions**:
   - User clicks "Sign Out Everywhere Else".
   - `DELETE /auth/sessions/other` invalidates all non-current refresh tokens.
6. **Resolution**: Query cache is invalidated and list refreshes immediately.

---

### Flow 5: Account Deletion (Offboarding Guard)
1. **Trigger**: User clicks "Delete Account" in the Danger Zone.
2. **Safety Checks**:
   - If user is the sole `ADMIN` of a household with other members: Prompt requires transferring admin rights first.
   - If user has outstanding unsettled debts: Warning banner highlights unresolved expense splits.
3. **Confirmation**: User types `"DELETE MY ACCOUNT"` into confirmation input.
4. **API Request**: `DELETE /user/account`.
5. **Resolution**:
   - Clears `TokenStore`, `localStorage`, and active session cookies.
   - Navigates user to `/login` with farewell notification.

---

## 3. State Management & TanStack Query Keys

```ts
export const profileKeys = {
  all: ['user'] as const,
  profile: () => [...profileKeys.all, 'profile'] as const,
  sessions: () => [...profileKeys.all, 'sessions'] as const,
};
```

---

## 4. API Endpoints Specification

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/user/profile` | Yes | Retrieves current user profile details, email, bio, and affiliations |
| `PATCH` | `/user/profile` | Yes | Updates name, phone, avatar, and roommate bio |
| `POST` | `/auth/change-password` | Yes | Verifies current password and updates to new password |
| `GET` | `/auth/sessions` | Yes | Lists all active device sessions for the authenticated user |
| `DELETE` | `/auth/sessions/:sessionId` | Yes | Revokes a specific device session |
| `DELETE` | `/auth/sessions/other` | Yes | Revokes all active sessions except the current one |
| `DELETE` | `/user/account` | Yes | Permanently removes user account and triggers cleanup |

---

## 5. Error Handling & Edge Cases

- **Session Expiry on Password Change**: Changing the password immediately invalidates all other active session refresh tokens in the database.
- **Duplicate Email Prevention**: Email address updates require email verification before applying.
- **Optimistic Avatar Sync**: Updating personal name or initials immediately broadcasts an EventBus event (`APP_EVENTS.USER_PROFILE_UPDATED`) to keep all desktop sidebar and mobile header components in sync without a full page reload.
