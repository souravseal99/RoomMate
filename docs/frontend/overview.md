# Frontend Overview

## Structure and Organization
The RoomMate frontend is a high-performance Single Page Application (SPA) built with **React**, **Vite**, and **TypeScript**. The codebase is structured to promote reusability, type safety, and a clear separation of concerns.

### Project Structure
The `roommate-app/src` directory is organized into functional modules:
- **`components/`**: Reusable UI elements ranging from atomic components (Buttons, Inputs) to complex organisms (Expense Cards, Sidebar).
- **`pages/`**: Higher-level components that represent full application views (e.g., Dashboard, Login, Inventory).
- **`hooks/`**: Custom React hooks encompassing business logic and data fetching patterns.
- **`api/`**: Centralized Axios configuration and service modules for interfacing with the backend.
- **`contexts/`**: React Context providers for global state management (Authentication and Household data).
- **`layouts/`**: Wrappers that provide persistent UI structures like the `MainLayout` (with Sidebar/Navbar) or `AuthLayout`.
- **`types/`**: TypeScript interfaces and types shared across the application.

## UI Design Pattern
We utilize **TailwindCSS** for a utility-first styling approach, ensuring the UI is fully responsive and consistent. The application follows a "Mobile-First" design philosophy, optimized for both desktop and mobile devices to accommodate roommates on the go.
