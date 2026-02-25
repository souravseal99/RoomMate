# Architecture

**Analysis Date:** 2026-02-25

## Pattern Overview

**Overall:** Layered Service-Oriented Architecture (MVC-like)

The backend follows a three-tier layered pattern: Controller → Service → Repository. The frontend uses React with Context API for state management and a component-based architecture.

**Key Characteristics:**
- Clear separation between HTTP handling (controllers), business logic (services), and data access (repositories)
- API-first design with RESTful endpoints
- Monorepo structure with `roommate-app` (frontend) and `roommate-server` (backend)
- Database-first design using Prisma ORM with PostgreSQL

## Layers

**Backend - Controller Layer:**
- Purpose: Handle HTTP requests and responses
- Location: `roommate-server/src/[module]/[module].controller.ts`
- Contains: Request handlers that extract parameters, call services, and format responses
- Depends on: Service layer
- Used by: Routes

**Backend - Service Layer:**
- Purpose: Business logic and orchestration
- Location: `roommate-server/src/[module]/[module].service.ts`
- Contains: Business rules, validation, coordination between repositories
- Depends on: Repository layer
- Used by: Controller layer

**Backend - Repository Layer:**
- Purpose: Data access abstraction
- Location: `roommate-server/src/[module]/[module].repo.ts`
- Contains: Prisma queries for database operations
- Depends on: Prisma client
- Used by: Service layer

**Frontend - Presentation Layer:**
- Purpose: UI rendering
- Location: `roommate-app/src/components/`, `roommate-app/src/pages/`
- Contains: React components and page components
- Depends on: Hooks, contexts, API layer
- Used by: React Router

**Frontend - State Management Layer:**
- Purpose: Application state and data fetching
- Location: `roommate-app/src/contexts/`, `roommate-app/src/hooks/`
- Contains: React Context providers and custom hooks
- Depends on: API layer
- Used by: Presentation layer

**Frontend - API Layer:**
- Purpose: HTTP communication with backend
- Location: `roommate-app/src/api/`
- Contains: Axios instance with interceptors, API methods
- Depends on: Axios library
- Used by: Hooks and contexts

## Data Flow

**API Request Flow:**

1. Client sends HTTP request (e.g., `GET /api/expense?householdId=xyz`)
2. Express router matches route in `roommate-server/src/routes.ts`
3. Controller receives request, extracts parameters
4. Controller calls Service method
5. Service performs business logic, may call multiple Repositories
6. Repository queries Prisma database
7. Response bubbles back through Service → Controller → HTTP response

**Frontend Data Flow:**

1. Page component renders, calls custom hook (e.g., `useExpense`)
2. Hook calls API layer (e.g., `expenseApi.getExpenses()`)
3. Axios interceptor adds auth token
4. Backend responds with data
5. Hook returns data to component
6. Component renders with data

**Example - Creating an Expense:**
```typescript
// 1. User submits form
// 2. Page calls useExpense().createExpense(data)
// 3. Hook calls expenseApi.create(data)
// 4. Axios POST /api/expense with token
// 5. ExpenseController.create() receives request
// 6. ExpenseService.create() validates, calls ExpenseSplitService
// 7. ExpenseRepo.create() inserts to DB via Prisma
// 8. Response flows back to frontend
```

## Key Abstractions

**API Response Wrapper:**
- Purpose: Standardize API responses
- Examples: `roommate-server/src/common/utils/ApiResponse.ts`
- Pattern: Success/error helper methods returning `{ status, data, message }`

**Authentication Middleware:**
- Purpose: Protect routes requiring authentication
- Examples: `roommate-server/src/auth/middlewares/ensureAuthenticated.ts`
- Pattern: Express middleware that validates JWT and attaches user to request

**Custom Hooks:**
- Purpose: Encapsulate data fetching and state logic
- Examples: `roommate-app/src/hooks/useHousehold.ts`, `roommate-app/src/hooks/useExpense.ts`
- Pattern: React hooks that manage loading, error, and data states

**Context Providers:**
- Purpose: Share state across components
- Examples: `roommate-app/src/contexts/HouseholdContext.tsx`, `roommate-app/src/contexts/ExpenseContext.tsx`
- Pattern: React Context with Provider component wrapping children

## Entry Points

**Backend Entry Point:**
- Location: `roommate-server/src/server.ts`
- Triggers: `npm start` or `npm run dev`
- Responsibilities: Initialize Express app, apply CORS, start HTTP server

**Backend App Configuration:**
- Location: `roommate-server/src/App.ts`
- Triggers: Called by server.ts
- Responsibilities: Configure middleware (CORS, body-parser, cookie-parser, logger), register routes, set up error handlers

**Frontend Entry Point:**
- Location: `roommate-app/src/main.tsx`
- Triggers: Vite dev server or production build
- Responsibilities: Render root App component with React

**Frontend App Root:**
- Location: `roommate-app/src/App.tsx`
- Triggers: Mounted by main.tsx
- Responsibilities: Set up router, toast notifications, global styles

**API Routes:**
- Location: `roommate-server/src/routes.ts`
- Triggers: HTTP requests to `/api/*` endpoints
- Responsibilities: Route requests to specific module routes

## Error Handling

**Strategy:** Centralized middleware-based error handling

**Patterns:**
- **Backend Error Handler:** `roommate-server/src/common/middlewares/errorHandlder.ts` catches all unhandled errors and returns standardized JSON response
- **Validation Errors:** `roommate-server/src/common/middlewares/validationErrorHandler.ts` handles Zod/Express-validator errors
- **API Response Errors:** `roommate-server/src/common/utils/ApiResponse.ts` provides `error()` static method for service-layer error responses
- **Frontend Error Handling:** Try-catch in API calls with toast notifications for user feedback

## Cross-Cutting Concerns

**Logging:** Morgan middleware (`morgan("dev")`) for HTTP request logging in development

**Validation:**
- Backend: Zod for request validation, express-validator for route validation
- Frontend: React Hook Form for form validation

**Authentication:**
- JWT-based with refresh tokens
- Session-based (multi-tab support via `X-Session-Id` header)
- Token stored in httpOnly cookies (refresh) and memory (access)
- See: `roommate-server/src/auth/`, `roommate-app/src/lib/TokenStore.ts`

**Database:**
- Prisma ORM with PostgreSQL
- Schema: `roommate-server/generated/prisma/schema.prisma`
- Generated client: `roommate-server/generated/prisma/client.js`

---

*Architecture analysis: 2026-02-25*
