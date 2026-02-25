# Context: Phase 1 Authentication & Households

## Project Overview
Core user system with authentication and household management for RoomMate — a roommate management application.

## Gray Areas & Implementation Decisions

### 1. Session Handling

**Decision Needed:**
- JWT token strategy (access + refresh token pattern)
- Token storage location (httpOnly cookies vs localStorage)
- Refresh mechanism and timing
- Remember me functionality

**Recommended Approach:**
- Use short-lived access tokens (15 min) with httpOnly cookies
- Implement refresh token rotation for security
- "Remember me" extends refresh token expiry from 7d to 30d
- Auto-refresh via silent token refresh on 401 responses

### 2. Error Responses

**Decision Needed:**
- Validation error formatting and delivery
- Failed authentication error messages
- Rate limiting feedback

**Recommended Approach:**
- Return structured error responses: `{ success: false, error: { code: string, message: string, details?: Record<string, string[]> } }`
- Form validation errors mapped to specific fields
- Generic "Invalid credentials" for login failures (prevent enumeration)
- Include retry-after header for rate limits

### 3. Household Join Flow

**Decision Needed:**
- Invite code format and generation
- Link sharing mechanism
- Approval workflow (auto-join vs admin approval)
- Rejoining previously left households

**Recommended Approach:**
- 8-character alphanumeric invite codes (URL-safe)
- Shareable links: `https://app.roommate.io/join/{code}`
- Two join modes configurable per household:
  - **Open**: Anyone with code can join immediately
  - **Approval required**: Join requests pending until member approves
- Prevent duplicate memberships; allow rejoining if previously left
- Invite codes expire after 7 days or 10 uses (configurable)

### 4. User Experience

**Decision Needed:**
- Form design patterns and validation feedback
- Post-login redirect destinations
- Empty states for households/invites
- Onboarding flow for new users

**Recommended Approach:**
- Inline validation with immediate feedback
- Redirect to `/dashboard` after login, or `?redirect=` param if specified
- Empty states: friendly illustrations + clear CTAs ("Create your first household" / "Accept your first invite")
- First-time users see brief household creation wizard
- Use standard password requirements: 8+ chars, mixed case, number/special optional

## Questions for Next Phase

1. Should households support nested groups or only flat membership?
2. Do we need multi-factor authentication now or later?
3. Should household creation require payment/verification?
4. How do we handle household name uniqueness?

## Dependencies

- User authentication endpoints
- Household CRUD endpoints  
- Invite generation and validation
- Frontend auth context and protected routes
