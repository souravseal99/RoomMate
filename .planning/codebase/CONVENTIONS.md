# Coding Conventions

**Analysis Date:** 2026-02-25

## Naming Patterns

### Files

**Backend (roommate-server):**
- Services: `user.service.ts` - lowercase with dots (feature.module)
- Controllers: `user.controller.ts` - lowercase with dots
- Repositories: `user.repo.ts` - lowercase with dots
- Types: PascalCase with descriptive suffixes (`UpdateChoreType.ts`)
- DTOs: PascalCase with `Dto` suffix (`UserDto.ts`)
- Utils: lowercase, descriptive (`jwtHandler.ts`, `utils.ts`)

**Frontend (roommate-app):**
- React components: PascalCase (`.tsx`) - `AuthForm.tsx`, `LoginPage.tsx`
- Hooks: camelCase with `use` prefix - `useAuth.ts`, `useFormValidation.ts`
- Utilities: camelCase - `inventoryUtils.tsx`, `utils.ts`
- Types: PascalCase - `householdTypes.ts`, `expenseTypes.ts`
- API: camelCase with `Api` suffix - `authApi.ts`, `householdApi.ts`

### Functions

**Backend:**
- Static class methods: PascalCase - `UserService.profile()`, `UserRepo.getUserById()`
- Regular functions: camelCase - `errorHandler()`, `sanitizeUser()`

**Frontend:**
- React components: PascalCase (export default) - `export default function LoginPage()`
- Custom hooks: camelCase starting with `use` - `useAuth()`, `useForm()`
- Event handlers: camelCase with `handle`/`on` prefix - `handleSubmit()`, `onChange`

### Variables

- All variables: camelCase - `userRecord`, `accessToken`, `sanitizedUsers`
- Constants: SCREAMING_SNAKE_CASE for config values - `BCRYPT_SALT_ROUNDS`
- Type/interface names: PascalCase - `User`, `AuthContextType`

### Types

- Interfaces: PascalCase - `interface UserProfile { ... }`
- Type aliases: PascalCase - `type AuthContextType = { ... }`
- Enum values: PascalCase

## Code Style

### Formatting

**Backend (roommate-server):**
- Uses TypeScript with strict mode
- No explicit prettier config file, relies on default formatting
- 2-space indentation (tsconfig standard)

**Frontend (roommate-app):**
- Tool: **Prettier** (`.prettierrc`)
- Settings:
  ```json
  {
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 2,
    "useTabs": false,
    "bracketSpacing": true,
    "arrowParens": "always",
    "endOfLine": "lf"
  }
  ```

### Linting

**Backend (roommate-server):**
- No ESLint config present - uses TypeScript compiler for type checking only

**Frontend (roommate-app):**
- Tool: **ESLint** (`eslint.config.js`)
- Config: Flat config with TypeScript ESLint + React plugins
- Rules combined from:
  - `@eslint/js` (recommended)
  - `typescript-eslint` (recommended)
  - `react-hooks` (recommended-latest)
  - `react-refresh` (vite rules)
- Max warnings: 0 enforced (`--max-warnings 0`)

### Quotes
- **Frontend:** Single quotes (`'string'`)
- **Backend:** Double quotes (`"string"`)

### Semicolons
- **Frontend:** Required (semi: true)
- **Backend:** Standard TypeScript

## Import Organization

### Backend Path Aliases (tsconfig.json)

```json
{
  "@src/*": ["./*"],
  "@common/*": ["./common/*"],
  "@types/*": ["./common/types/*"],
  "@generated/*": ["../generated/*"],
  "@config/*": ["./config/*"],
  "@test/*": ["../test/*"]
}
```

### Import Order (observed pattern)

1. External packages - `import { Request, Response } from "express";`
2. Path alias imports - `import { UserService } from "@src/users/user.service";`
3. Local relative imports - `import sanitizeUser from "../utils/sanitizeUser";`

### Frontend Path Aliases (tsconfig.json)

```json
{
  "@/*": ["./src/*"]
}
```

**Example import order (roommate-app):**
```typescript
// React/External
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Components
import { AuthForm } from "../../components/auth/AuthForm";

// API
import { loginUser } from "../../api/authApi";

// Hooks
import useAuth from "@/hooks/useAuth";

// Utils/Lib
import TokenStore from "@/lib/TokenStore";
```

## Error Handling

### Backend Pattern

**ApiError class** (`src/common/errors/ApiError.ts`):
```typescript
export class ApiError extends Error {
  public statusCode: number;
  public errors: { field: String; message: String }[] | undefined;

  constructor(
    statusCode: number,
    message: string,
    errors?: { field: String; message: String }[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
```

**Error Handler Middleware** (`src/common/middlewares/errorHandlder.ts`):
- Catches `ApiError` instances - returns structured JSON with `success: false`, `errorMessage`, `errors`
- Catches generic `Error` - returns 500 with `errorMessage`
- Logs unexpected errors to console

**Service Layer Error Pattern:**
- Returns `ApiResponse.error()` with appropriate HTTP status codes
- Uses `http-status-codes` for status codes
- Example: `return ApiResponse.error("User not found", StatusCodes.NOT_FOUND, { userId });`

### Frontend Error Pattern

- Uses try-catch in async handlers
- Logs errors to console (`console.error`)
- Shows user feedback via `alert()` or toast notifications
- Example from `LoginPage.tsx`:
  ```typescript
  } catch (e: any) {
    console.error("Login failed: ", e);
    alert(e.response?.data?.message ?? "Login failed");
  }
  ```

## Logging

**Backend:**
- Console logging for errors: `console.error("Error: Roommate-server: Unexpected Error:", error.message);`
- No structured logging framework detected

**Frontend:**
- Console logging for debugging: `console.log("Login response:", token, ...)`
- Console error for failures: `console.error("Login failed: ", e)`

## Comments

### Observed Patterns

- JSDoc/TSDoc: **Not widely used** in codebase
- Inline comments: Used sparingly to explain business logic
- TODO comments: Present (found 7 TODOs in codebase)
  - Example: `//TODO - Implement logout API call`
  - Example: `//TODO - add type to this`

### When to Comment

- Complex business logic decisions
- Workarounds or non-obvious code
- TODO items for future work

## Function Design

### Backend Service Functions

- **Pattern:** Static class methods
- **Parameters:** Typed interfaces/primitives
- **Return:** `ApiResponse<T>` or raw data with error handling
- **Size:** Generally focused, single responsibility

### Backend Controller Functions

- **Pattern:** Static class methods accepting `Request, Response`
- **Parameters:** Extract from request body/params using helpers
- **Return:** Calls `response.status().json()`
- **Async:** All handlers are async

### Frontend React Components

- **Pattern:** Functional components with hooks
- **Props:** Explicitly typed via interfaces
- **Memoization:** Use `useMemo` for expensive computations
- **Effects:** `useEffect` for side effects with proper dependency arrays

## Module Design

### Backend

**Pattern:** Layered architecture
- Controllers handle HTTP request/response
- Services contain business logic
- Repositories handle data access (Prisma)
- Utils for shared helpers

**Exports:**
- Named exports for classes: `export class UserService { ... }`
- Default exports for utility functions: `export default errorHandler;`

**Barrel Files:** Not detected - imports use full paths

### Frontend

**Pattern:** Feature-based with shared UI components

**Exports:**
- Default exports for page components: `export default function LoginPage()`
- Named exports for reusable components: `export const AuthForm = ...`
- Hooks use default exports: `export default function useAuth()`

**Barrel Files:** Not detected in this codebase

---

*Convention analysis: 2026-02-25*
