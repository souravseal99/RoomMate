# External Integrations

**Analysis Date:** 2026-02-25

## APIs & External Services

**Not applicable** - This is a self-contained application with no external third-party APIs. All functionality is built in-house.

## Data Storage

**Databases:**
- PostgreSQL 15 - Primary relational database
  - Connection: `DATABASE_URL` environment variable
  - ORM: Prisma 6.19.0
  - Docker service: `db` in docker-compose.yml
  - Default connection: `postgres://postgres:password@db:5432/roommate`

**File Storage:**
- Local filesystem only - No cloud storage integration
- File uploads not implemented

**Caching:**
- None - No caching layer currently implemented

## Authentication & Identity

**Auth Provider:**
- Custom JWT-based authentication
  - Access tokens via `jsonwebtoken` package
  - Refresh tokens for session management
  - Cookie-based token storage
  - bcrypt for password hashing
  - Environment: `JWT_SECRET`, `JWT_REFRESH_SECRET`

## Monitoring & Observability

**Error Tracking:**
- None - No external error tracking service integrated

**Logs:**
- morgan 1.10.1 - HTTP request logging
  - Logs to stdout in development
  - Console.log for application errors

**Metrics:**
- None - No metrics collection

## CI/CD & Deployment

**Hosting:**
- Self-hosted (Docker)
- Docker Compose for local development
- Build targets: `roommate-client` and `roommate-server` services

**CI Pipeline:**
- None detected - No CI/CD configuration files found

## Environment Configuration

**Required env vars (server):**
- `APP_PORT` - Server port (default: 5000)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Access token signing key
- `JWT_REFRESH_SECRET` - Refresh token signing key
- `BCRYPT_SALT_ROUNDS` - Password hashing rounds
- `JWT_EXPIRES_IN` - Access token expiry (default: 1h)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiry (default: 7d)
- `USE_SECURE_COOKIE` - Cookie security flag

**Required env vars (client):**
- `SERVER_BASE_URL` - Backend API URL (default: http://127.0.0.1:5000)

**Secrets location:**
- `.env` files (not committed to version control)
- `.env.example` for documentation

## Webhooks & Callbacks

**Incoming:**
- None - No webhooks received from external services

**Outgoing:**
- None - No outgoing webhooks to external services

## Third-Party Libraries

**UI Components:**
- Radix UI primitives - Headless accessible components
- Lucide React - Icon library

**Validation:**
- Zod - Schema validation

**Date Handling:**
- date-fns - Date utilities

---

*Integration audit: 2026-02-25*
