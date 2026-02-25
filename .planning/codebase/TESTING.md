# Testing Patterns

**Analysis Date:** 2026-02-25

## Test Framework

### Backend (roommate-server)

**Runner:**
- **Framework:** Vitest v4.0.7
- Config: No `vitest.config.ts` file detected - uses defaults
- Run via: `npm test` or `npm run test:watch`

**Commands:**
```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode
npm run test:ui       # UI mode with @vitest/ui
```

**Assertion Library:**
- Vitest built-in expect (`import { expect } from 'vitest'`)

### Frontend (roommate-app)

- No test framework detected
- No test files or test configuration present

## Test File Organization

### Backend

**Location:**
- Tests co-located in `src/__tests__/` directory
- Mirrors source structure: `src/__tests__/users/user.repo.test.ts`

**Naming:**
- Pattern: `{module}.test.ts`
- Example: `user.repo.test.ts`, `auth.service.test.ts`

**Directory Structure:**
```
src/
├── __tests__/
│   ├── auth/
│   │   ├── auth.service.test.ts
│   │   └── session.repo.test.ts
│   ├── users/
│   │   └── user.repo.test.ts
│   ├── households/
│   │   ├── household.repo.test.ts
│   │   └── household.service.test.ts
│   └── comman/utils/
│       ├── jwtHandler.test.ts
│       └── ApiResponse.test.ts
```

## Test Structure

### Suite Organization

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ModuleName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('methodName', () => {
    it('should [expected behavior] when [condition]', async () => {
      // Arrange
      const mockData = { /* ... */ };
      
      // Act
      const result = await functionUnderTest(mockData);
      
      // Assert
      expect(result).toEqual(expectedResult);
    });
  });
});
```

**Pattern observed in codebase:**
```typescript
// From src/__tests__/users/user.repo.test.ts
describe('UserRepo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser: User = { /* ... */ };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await UserRepo.getUserById('user-123');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });
  });
});
```

### Test Structure Patterns

**Setup (beforeEach):**
- Always clears mocks: `vi.clearAllMocks()`
- No global setup file detected

**Teardown:**
- Implicit via `vi.clearAllMocks()`
- No explicit afterEach for cleanup

**Assertion patterns:**
- `expect(result).toEqual(expected)` - deep equality
- `expect(result).toBeNull()` - null check
- `expect(result).toHaveBeenCalledWith(...)` - mock verification
- `expect(result).toMatchObject({...})` - partial object match

## Mocking

### Framework

- **Tool:** Vitest's built-in `vi` (vi.fn, vi.mock, vi.mocked)

### Patterns

**1. Module Mocking:**
```typescript
vi.mock('@src/common/utils/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));
```

**2. Partial Module Mocking:**
```typescript
vi.mock('@src/users/user.repo');
vi.mock('@src/auth/session.repo');
vi.mock('bcrypt');
vi.mock('@common/utils/jwtHandler');
```

**3. Config Mocks:**
```typescript
vi.mock('@common/config', () => ({
  BCRYPT_SALT_ROUNDS: 10,
  JWT_REFRESH_EXPIRES_IN: '7d',
}));
```

**4. Mock Type Assertion:**
```typescript
vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
```

**5. Spy on Date:**
```typescript
const now = Date.now();
vi.spyOn(Date, 'now').mockReturnValue(now);
```

### What to Mock

**Mocked in this codebase:**
- Prisma client (`@src/common/utils/prisma`)
- Repositories (`@src/users/user.repo`, `@src/auth/session.repo`)
- External libraries (`bcrypt`, `jsonwebtoken`)
- Configuration modules (`@common/config`)

### What NOT to Mock

- Service classes being tested
- Simple utility functions with no external dependencies
- Business logic that is the subject of the test

## Fixtures and Factories

### Test Data

**Pattern:** Inline mock objects within test files

```typescript
// From src/__tests__/users/user.repo.test.ts
const mockUser: User = {
  userId: 'user-123',
  name: 'Alice Smith',
  email: 'alice@example.com',
  password: 'hashed_password',
  createdAt: new Date('2024-01-01'),
};
```

**Location:**
- Defined inline within each test file
- No centralized fixture files detected

### Factory Functions

- Not detected in codebase
- Tests create mock data inline

## Coverage

**Requirements:** None enforced

**View Coverage:** Not configured - no coverage command in package.json

**Current test coverage:** Unknown - no coverage reports generated

## Test Types

### Unit Tests

**Scope:**
- Repository methods (Prisma queries)
- Service methods (business logic)
- Utility functions

**Approach:**
- Mock database (Prisma)
- Mock external dependencies (bcrypt, JWT)
- Test success and error paths

**Examples in codebase:**
- `src/__tests__/users/user.repo.test.ts` - tests UserRepo CRUD
- `src/__tests__/auth/auth.service.test.ts` - tests AuthService login/register

### Integration Tests

- Not detected in this codebase
- No end-to-end API tests

### E2E Tests

- **Framework:** Not used
- **No Cypress/Playwright detected**

## Common Patterns

### Async Testing

```typescript
it('should create and return new user', async () => {
  vi.mocked(prisma.user.create).mockResolvedValue(mockUser);
  const result = await UserRepo.createUser('name', 'email', 'pass');
  expect(result).toEqual(mockUser);
});
```

### Error Testing

```typescript
it('should throw error on duplicate email', async () => {
  const duplicateError = new Error('Unique constraint failed');
  (duplicateError as any).code = 'P2002';
  vi.mocked(prisma.user.create).mockRejectedValue(duplicateError);

  await expect(
    UserRepo.createUser('Eve', 'existing@example.com', 'pass')
  ).rejects.toThrow('Unique constraint failed');
});
```

### Mock Chaining

```typescript
it('should successfully register new user', async () => {
  vi.mocked(UserRepo.getUserByEmail).mockResolvedValue(null);
  vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as never);
  vi.mocked(UserRepo.createUser).mockResolvedValue(mockUser);
  vi.mocked(generateTokens).mockReturnValue({ /* ... */ });
  vi.mocked(SessionRepo.createSession).mockResolvedValue({} as any);
  // ...
});
```

### Testing Private Methods

- Not observed - all tested methods are public
- Services use static methods that are inherently accessible

### Testing Error Handling

```typescript
it('should return null when not found or error occurs', async () => {
  vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
  expect(await UserRepo.getUserById('non-existent')).toBeNull();

  vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('DB error'));
  expect(await UserRepo.getUserById('user-123')).toBeNull();
});
```

---

*Testing analysis: 2026-02-25*
