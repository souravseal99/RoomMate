# Frontend Routing

## Routing with React Router
RoomMate uses `react-router-dom` for client-side navigation. The routing architecture is designed to handle public landing pages, authentication flows, and protected dashboard views.

## Route Types

### 1. Public Routes
Accessible to all visitors. These primarily include the authentication pages:
- `/login`: Entry point for existing users.
- `/register`: For new users to create an account.

### 2. Protected Routes
These routes require a valid `accessToken`. If a user is unauthenticated, they are redirected to the `/login` page:
- `/`: The main Dashboard.
- `/expenses`: Management for shared costs and splitting.
- `/chores`: Task assignments and tracking.
- `/inventory`: Household supplies and shopping lists.
- `/households/join`: A specialized route for joining or creating a new household group.

## Layouts and Navigation Flow
The application uses **Layout Wrappers** to maintain persistent UI elements during navigation:
1. **`MainLayout`**: Used by all protected routes. It includes the `Sidebar`, `Navbar`, and an `Outlet` for the specific page content.
2. **`AuthLayout`**: A centered, card-based layout used for the login and registration experience.

## Programmatic Navigation
We use the `useNavigate` hook for logical redirects (e.g., redirecting to dashboard after successful login) and the `NavLink` component for the Sidebar to provide active-link styling.
