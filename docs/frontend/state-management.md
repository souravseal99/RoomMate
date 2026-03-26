# State Management

## Strategy
RoomMate employs a hybrid state management strategy to balance performance and simplicity, primarily leveraging the **React Context API** for global state and **Custom Hooks** for localized data fetching.

## Global State (Context API)
We use two primary Context Providers to manage shared data across the component tree:

### 1. AuthContext
Manages the user's authentication status and identity.
- **State**: `user` object, `isAuthenticated` boolean, and `loading` state.
- **Actions**: `login()`, `logout()`, and `checkAuth()` (for initializing state from tokens).

### 2. HouseholdContext
Maintains the state of the user's active household.
- **State**: `currentHousehold`, `membersList`, and `stats`.
- **Actions**: `refreshHouseholdData()`, `switchHousehold()`.

## Local State and Hooks
For feature-specific data (e.g., the current list of expenses or chores), we use specialized custom hooks:
- **`useExpenses()`**: Handles fetching, adding, and deleting expenses.
- **`useChoreProgress()`**: Manages the local state for marking chores as complete.

## Data Persistence
- **Tokens**: `accessToken` and `refreshToken` are stored securely (typically in `localStorage` or `HttpOnly Cookies` depending on deployment configuration).
- **Session Restoration**: On app load, `AuthContext` verifies the token validity via the `/auth/me` endpoint to restore the user session seamlessly.
