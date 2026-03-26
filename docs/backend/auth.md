# Authentication and Security

## JWT Authentication Flow
RoomMate implements a secure, stateless authentication system using **JSON Web Tokens (JWT)** with a dual-token strategy.

## Access vs. Refresh Tokens
1. **Access Token**:
   - Short-lived (e.g., 15 minutes).
   - Sent in the `Authorization: Bearer <token>` header.
   - Used for authenticating individual requests.
2. **Refresh Token**:
   - Long-lived (e.g., 7 days).
   - Stored in the database and periodically rotated.
   - Used to generate new Access Tokens without requiring user re-login.

## Security Middleware
Protected routes are wrapped with an `authenticateToken` middleware:
- It extracts the token from the header.
- Verifies the signature using the `JWT_ACCESS_SECRET`.
- Attaches the decoded user information to `req.user` for use in subsequent controllers.

## Session Management
While JWTs are stateless, we track `Session` records in the database:
- This allows the system to revoke specific refresh tokens (e.g., on logout or password change).
- Provides a "Log out from all devices" feature by clearing the user's session table entries.
