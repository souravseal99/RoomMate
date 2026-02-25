# Codebase Concerns

**Analysis Date:** 2026-02-25

## Tech Debt

**Incomplete Type Definitions:**
- Issue: Using `any` type for household members
- Files: `roommate-app/src/contexts/HouseholdContext.tsx` (lines 14, 27)
- Impact: Type safety is compromised, IDE autocomplete won't work properly
- Fix approach: Define `HouseholdMember` type and replace `any[]` with proper typing

**Unimplemented Logout API:**
- Issue: Logout function doesn't call the backend API
- Files: `roommate-app/src/contexts/AuthContext.tsx` (lines 82-108)
- Impact: Session may not be properly invalidated server-side, potential security issue
- Fix approach: Uncomment and fix the logout API call implementation

**Incomplete Refresh Token Validation:**
- Issue: `getNewAccessToken` function doesn't validate the refresh token from cookies
- Files: `roommate-server/src/common/utils/jwtHandler.ts` (lines 21-29)
- Impact: Anyone with a valid access token can get a new token without proper refresh token validation
- Fix approach: Read refresh token from cookie, validate it, then issue new access token

**Incomplete DTO Types:**
- Issue: `HouseholdDto` has incomplete type definitions marked with TODO
- Files: `roommate-server/src/common/dtos/HouseholdDto.ts` (lines 11-15)
- Impact: Unclear what data types the fields should contain
- Fix approach: Add proper TypeScript types for members, expenses, chores, inventory

**Missing Input Validation:**
- Issue: Expense controller lacks input validation before processing
- Files: `roommate-server/src/expenses/expense.controller.ts` (line 46)
- Impact: Invalid data could be saved to database, potential data integrity issues
- Fix approach: Add express-validator middleware or Zod validation

**Hardcoded CORS Origins:**
- Issue: CORS only allows localhost development ports
- Files: `roommate-server/src/server.ts` (lines 9-16)
- Impact: Application won't work when deployed to production without updating CORS
- Fix approach: Use environment variable for allowed origins

## Known Bugs

**Error Swallowing in User Repository:**
- Issue: Database errors are caught but return `null` without logging or re-throwing
- Files: `roommate-server/src/users/user.repo.ts` (lines 5-11, 14-21, 34-39)
- Symptoms: Silent failures make debugging difficult; errors appear as "not found" when they're actually server errors
- Trigger: Any database connection error or constraint violation
- Workaround: Check server logs to distinguish between "not found" and actual errors

**Empty UseEffect:**
- Issue: Empty useEffect with only dependency on selectedHousehold
- Files: `roommate-app/src/contexts/HouseholdContext.tsx` (line 33)
- Symptoms: Unnecessary re-renders or confusion for developers
- Trigger: Component mounting
- Workaround: Remove or implement the effect

## Security Considerations

**Weak Default Secret Keys:**
- Risk: Falls back to "default_sercret_key" if environment variables aren't set
- Files: `roommate-server/src/common/config.ts` (lines 8, 11)
- Current mitigation: None - app will run with insecure defaults
- Recommendations: Make JWT_SECRET and JWT_REFRESH_SECRET required, throw error if not set in production

**Incomplete Logout:**
- Risk: User sessions persist on server after client-side logout
- Files: `roommate-app/src/contexts/AuthContext.tsx` (lines 82-108)
- Current mitigation: Only clears client-side tokens
- Recommendations: Call logout API endpoint to invalidate refresh token server-side

**Refresh Token Not Validated:**
- Risk: Access tokens can be refreshed without proper refresh token verification
- Files: `roommate-server/src/common/utils/jwtHandler.ts` (lines 21-29)
- Current mitigation: None
- Recommendations: Implement proper refresh token validation from cookies

**Hardcoded Development Origins:**
- Risk: CORS allows only localhost development ports
- Files: `roommate-server/src/server.ts` (lines 10-11)
- Current mitigation: Only allows "http://localhost:5174", "http://localhost:5173"
- Recommendations: Use environment variable for allowed origins in production

## Performance Bottlenecks

**No Database Query Optimization:**
- Problem: No explicit include/select patterns; may fetch more data than needed
- Files: Multiple repo files (e.g., `roommate-server/src/users/user.repo.ts`)
- Cause: Simple Prisma queries without optimization
- Improvement path: Add explicit field selection and relationship loading only when needed

**No Request Rate Limiting:**
- Problem: No rate limiting on API endpoints
- Files: Server-level (not present)
- Cause: Not implemented
- Improvement path: Add express-rate-limit middleware

## Fragile Areas

**JWT Handler - Incomplete Implementation:**
- Files: `roommate-server/src/common/utils/jwtHandler.ts`
- Why fragile: Refresh token validation is incomplete (TODO at line 22)
- Safe modification: Ensure refresh token is read from cookies and validated before issuing new access token
- Test coverage: Has unit tests but tests don't cover the incomplete refresh validation

**Expense Controller - No Input Validation:**
- Files: `roommate-server/src/expenses/expense.controller.ts`
- Why fragile: Accepts any input from request body without validation
- Safe modification: Add validation middleware before processing
- Test coverage: Service has tests but controller lacks validation layer

**Auth Context - Incomplete Logout:**
- Files: `roommate-app/src/contexts/AuthContext.tsx`
- Why fragile: Logout only clears client-side state
- Safe modification: Ensure logout API is called to invalidate server-side session
- Test coverage: No tests for this context

## Dependencies at Risk

**jsonwebtoken (^9.0.2):**
- Risk: Older version with known vulnerabilities in certain configurations
- Impact: Token validation could be bypassed in specific scenarios
- Migration plan: Upgrade to latest version and review security notes

**bcrypt (^6.0.0):**
- Risk: Newer major version, potential breaking changes
- Impact: Password hashing could fail if API changed
- Migration plan: Review changelog and test thoroughly

**express (^5.1.0):**
- Risk: Express 5 is a major update with breaking changes from Express 4
- Impact: Route handling and middleware behavior may differ
- Migration plan: Test all routes thoroughly, especially async handlers

## Test Coverage Gaps

**Frontend Application:**
- What's not tested: Entire React application has zero test files
- Files: `roommate-app/src/` - no `*.test.ts` or `*.test.tsx` files found
- Risk: UI bugs, state management issues, and component failures go undetected
- Priority: High

**Backend Controllers:**
- What's not tested: No controller-level tests
- Files: `roommate-server/src/*/controller.ts`
- Risk: Request/response handling bugs, missing error cases
- Priority: High

**Integration Tests:**
- What's not tested: No end-to-end or API integration tests
- Files: None found
- Risk: Real-world scenarios involving multiple components could fail
- Priority: Medium

**Auth Service Tests:**
- What's not tested: Token refresh flow with actual cookies
- Files: `roommate-server/src/__tests__/auth/auth.service.test.ts`
- Risk: Refresh token validation issues may not be caught
- Priority: High

---

*Concerns audit: 2026-02-25*
