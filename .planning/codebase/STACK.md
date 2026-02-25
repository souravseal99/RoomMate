# Technology Stack

**Analysis Date:** 2026-02-25

## Languages

**Primary:**
- TypeScript 5.8.3 (roommate-app), 5.9.2 (roommate-server) - Full-stack type safety
- JavaScript/JSX - React components

**Secondary:**
- CSS - Tailwind CSS utility classes
- SQL - Database queries via Prisma ORM

## Runtime

**Environment:**
- Node.js (version managed by project)
- Bun (potential - using vite-node in dev)

**Package Manager:**
- npm - All packages managed via npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.1.1 - Frontend UI framework
- React Router 7.8.2 - Client-side routing
- Express 5.1.0 - Backend REST API framework

**Testing:**
- Vitest 4.0.7 - Unit testing for backend
- @vitest/ui 4.0.7 - Interactive test UI

**Build/Dev:**
- Vite 7.2.2 - Frontend bundler and dev server
- vite-node - Backend development runner
- Prisma 6.19.0 - Database ORM and migrations
- Tailwind CSS 4.1.17 - Utility-first CSS framework

## Key Dependencies

**Frontend UI:**
- Radix UI (multiple components) - Accessible UI primitives
- lucide-react 0.542.0 - Icon library
- @tabler/icons-react 3.34.1 - Additional icons
- date-fns 4.1.0 - Date manipulation
- next-themes 0.4.6 - Theme management

**Frontend Data/Forms:**
- react-hook-form 7.62.0 - Form state management
- @hookform/resolvers 5.2.1 - Zod integration for forms
- zod 4.1.5 - Schema validation
- axios 1.11.0 - HTTP client

**Frontend Styling:**
- tailwind-merge 3.3.1 - Tailwind class merging
- clsx 2.1.1 - Conditional classnames
- class-variance-authority 0.7.1 - Component variants
- tailwindcss-animate - Animation utilities

**Backend Core:**
- @prisma/client 6.19.0 - Database ORM
- bcrypt 6.0.0 - Password hashing
- jsonwebtoken 9.0.2 - JWT authentication
- cors 2.8.5 - Cross-origin resource sharing
- cookie-parser 1.4.7 - Cookie parsing
- express-validator 7.2.1 - Request validation
- http-status-codes 2.3.0 - HTTP status constants

**Backend Utilities:**
- dotenv 17.2.1 - Environment variable loading
- morgan 1.10.1 - HTTP request logging
- nanoid 5.1.5 - Unique ID generation

## Configuration

**Environment:**
- `.env` files for local development
- Environment variables: `APP_PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `BCRYPT_SALT_ROUNDS`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `USE_SECURE_COOKIE`

**Build:**
- `vite.config.ts` - Vite bundler configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS (via Vite plugin)

**Linting/Formatting:**
- ESLint 8.57.0 with airbnb config
- Prettier 3.6.2 for code formatting

## Platform Requirements

**Development:**
- Node.js runtime
- Docker & Docker Compose (for PostgreSQL)
- npm for package management

**Production:**
- Node.js server (Express)
- PostgreSQL database
- Docker deployment supported

---

*Stack analysis: 2026-02-25*
