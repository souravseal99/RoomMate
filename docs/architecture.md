# System Architecture

The RoomMate project follows a decoupled, service-oriented architecture designed for scalability and maintainability.

## High-Level Architecture
The system is divided into two primary units:
1.  **Frontend (roommate-app)**: A modern React application for the presentation layer.
2.  **Backend (roommate-server)**: A RESTful API built with Node.js and Express for business logic and data persistence.

## Frontend Architecture
*   **Framework**: React (using Vite for high-performance builds).
*   **State Management**: React Context API for global session state; custom hooks for localized business logic.
*   **Networking**: Axios for asynchronous API communication.
*   **Styling**: TailwindCSS for modular, utility-first UI design.
*   **Routing**: React Router for client-side navigation and protected route management.

## Backend Architecture
*   **Engine**: Node.js with Express.js.
*   **Structure**: Follows a Controller-Service-Repository pattern to ensure clear separation of concerns.
*   **ORM**: Prisma ORM for type-safe database interactions and automated migrations.
*   **Security**: Middleware-driven authentication and request validation.

## API Communication Flow
1.  **Transport**: The frontend initiates HTTP/JSON requests via Axios.
2.  **Routing**: The Express router directs incoming requests to specific controllers.
3.  **Authentication**: Middleware verifies the presence and validity of the JWT.
4.  **Logic**: Controllers delegate work to Services, which interact with the database.
5.  **Response**: The server returns a standardized JSON payload to the client.

## Authentication Flow (JWT)
RoomMate utilizes a secure, stateless authentication mechanism:
1.  **Identity Verification**: On login, the server generates a short-lived `accessToken` and a long-lived `refreshToken`.
2.  **Persistence**: The `refreshToken` is stored in the database (Sessions table) to allow for session control.
3.  **Authorization**: The `accessToken` must be included in the `Authorization` header for all protected API calls.
4.  **Token Rotation**: An Axios interceptor on the frontend automatically handles `401 Unauthorized` errors by requesting a token refresh using the `refreshToken`.

## Database Design
Managed by **PostgreSQL** and **Prisma**, the schema is optimized for relational integrity:
*   **Users & Households**: Managed via a many-to-many relationship (`HouseholdMember` join table).
*   **Household Entities**: Expenses, Chores, and Inventory items are linked to specific `HouseholdID`s to ensure data isolation between groups.
*   **Integrity**: Foreign key constraints and cascading deletes ensure clean data management.

## Request Lifecycle
1.  **Client**: A user performs an action (e.g., adding an expense).
2.  **Frontend**: Axios sends a `POST /api/expenses` request with JSON data.
3.  **Backend Middleware**: The request is authenticated and the payload is validated.
4.  **Backend Service**: Prisma executes the transactional logic (e.g., creating the expense and calculating splits).
5.  **Database**: PostgreSQL persists the record.
6.  **Response**: The server sends a success response back to the frontend.
7.  **UI Sync**: The frontend updates its local state, reflecting the new change immediately for the user.
