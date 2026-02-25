# Codebase Structure

**Analysis Date:** 2026-02-25

## DirectoryMate/                           # Root mon Layout

```
Roomorepo directory
├── roommate-app/                   # React frontend application
│   ├── src/
│   │   ├── api/                   # API communication layer
│   │   ├── components/            # Reusable UI components
│   │   ├── contexts/              # React Context providers
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── layouts/               # Layout components
│   │   ├── lib/                   # Utility libraries (TokenStore)
│   │   ├── pages/                 # Page components
│   │   ├── router/                # React Router configuration
│   │   ├── types/                 # TypeScript type definitions
│   │   ├── utils/                 # Helper functions
│   │   ├── App.tsx                # Root component
│   │   └── main.tsx               # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── roommate-server/               # Express backend application
│   ├── src/
│   │   ├── [module]/              # Feature modules (auth, users, etc.)
│   │   ├── __tests__/             # Test files
│   │   ├── common/                # Shared utilities, configs, DTOs
│   │   ├── App.ts                 # Express app configuration
│   │   ├── routes.ts              # Route aggregation
│   │   └── server.ts              # Entry point
│   ├── generated/                  # Generated code (Prisma client)
│   │   └── prisma/                # Prisma generated files
│   ├── package.json
│   └── vite.config.ts             # Build configuration
│
├── .planning/                     # Planning documents
├── docker-compose.yml             # Docker services
└── package.json                   # Root package.json (workspaces)
```

## Directory Purposes

**Backend Modules (`roommate-server/src/[module]/`):**
- Purpose: Feature-specific code organized by domain
- Contains: Each module has controller, service, repo, routes, types
- Key modules:
  - `auth/` - Authentication and sessions
  - `users/` - User management
  - `households/` - Household CRUD
  - `household-members/` - Household membership
  - `expenses/` - Expense tracking
  - `expense-split/` - Expense splitting logic
  - `chore/` - Chore management
  - `inventory/` - Inventory items
  - `shopping-cart/` - Shopping lists
  - `dashboard/` - Dashboard data

**Common (`roommate-server/src/common/`):**
- Purpose: Shared utilities and configurations
- Contains:
  - `config.ts` - Environment configuration
  - `dtos/` - Data Transfer Objects
  - `errors/` - Custom error classes
  - `middlewares/` - Express middleware (error handlers)
  - `utils/` - Helper functions (ApiResponse, env, prisma, etc.)

**Frontend API (`roommate-app/src/api/`):**
- Purpose: Backend communication layer
- Contains: Axios configuration, API method wrappers
- Key files: `axios.ts` (with interceptors), `authApi.ts`, `expenseApi.ts`, etc.

**Frontend Components (`roommate-app/src/components/`):**
- Purpose: Reusable UI components
- Structure: Organized by feature (`households/`, `expenses/`, `chores/`, etc.) plus `ui/` for base components
- Key files: Card components, forms, sheets, skeletons

**Frontend Pages (`roommate-app/src/pages/`):**
- Purpose: Full-page components
- Structure: Organized by feature (`households/`, `expenses/`, `chores/`, etc.)
- Key files: Page components that compose components, hooks, and contexts

**Frontend Contexts (`roommate-app/src/contexts/`):**
- Purpose: Application-wide state management
- Contains: React Context providers for household, expense, inventory data

**Frontend Hooks (`roommate-app/src/hooks/`):**
- Purpose: Encapsulate state and data-fetching logic
- Contains: Custom hooks like `useHousehold.ts`, `useExpense.ts`

## Key File Locations

**Entry Points:**
- `roommate-server/src/server.ts` - Backend server entry
- `roommate-app/src/main.tsx` - Frontend React entry

**Configuration:**
- `roommate-server/src/common/config.ts` - Backend config
- `roommate-app/src/api/config.ts` - API URL configuration
- `roommate-server/generated/prisma/schema.prisma` - Database schema

**Core Logic:**
- `roommate-server/src/routes.ts` - Route registration
- `roommate-server/src/App.ts` - Express middleware setup
- `roommate-app/src/router/index.tsx` - React Router setup

**Testing:**
- `roommate-server/src/__tests__/` - Backend unit tests

## Naming Conventions

**Backend Files:**
- Pattern: `[module].[type].ts` (e.g., `user.controller.ts`, `expense.service.ts`)
- Directories: lowercase, hyphenated (e.g., `household-members/`)

**Frontend Files:**
- Pattern: PascalCase for components (`Households.tsx`), camelCase for utilities
- Directories: PascalCase for pages/components (`Households/`), camelCase for hooks

**TypeScript:**
- Classes: PascalCase (`UserService`, `ApiResponse`)
- Interfaces: PascalCase with optional prefix (`UserDto`, `ExpenseDto`)
- Enums: PascalCase with PascalCase values (`Role.ADMIN`)

## Where to Add New Code

**New Backend Feature:**
1. Create module directory in `roommate-server/src/[feature]/`
2. Add `feature.controller.ts`, `feature.service.ts`, `feature.repo.ts`, `feature.routes.ts`
3. Register routes in `roommate-server/src/routes.ts`
4. Add tests in `roommate-server/src/__tests__/[feature]/`

**New Frontend Feature:**
1. Add API methods in `roommate-app/src/api/[feature]Api.ts`
2. Add custom hook in `roommate-app/src/hooks/use[Feature].ts`
3. Add context if needed in `roommate-app/src/contexts/[Feature]Context.tsx`
4. Add components in `roommate-app/src/components/[feature]/`
5. Add page in `roommate-app/src/pages/[feature]/`
6. Register route in `roommate-app/src/router/index.tsx`

**New Database Model:**
1. Add model to `roommate-server/generated/prisma/schema.prisma`
2. Run `npx prisma generate`
3. Create repository methods in appropriate module
4. Generate types if needed

**Utilities:**
- Backend shared utilities: `roommate-server/src/common/utils/`
- Frontend utilities: `roommate-app/src/utils/`
- API utilities: `roommate-app/src/lib/`

## Special Directories

**Generated (`roommate-server/generated/`):**
- Purpose: Prisma generated client code
- Generated: Yes (run `npx prisma generate`)
- Committed: Yes (ensures consistency)

**Prisma Schema (`roommate-server/generated/prisma/schema.prisma`):**
- Purpose: Database schema definition
- Generated: No (source file)
- Committed: Yes (version controlled)

**Planning Documents (`.planning/codebase/`):**
- Purpose: Architecture and planning documentation
- Generated: No
- Committed: No (in .gitignore)

---

*Structure analysis: 2026-02-25*
