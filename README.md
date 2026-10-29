# 🏡 RoomMate – Shared Living App

A full-stack web application that helps roommates manage shared living friction-free.  
Track **expenses**, split bills fairly, assign **chores**, manage shared **pantry inventory**, and see household **insights** — all in one place.

Built with **React 19 + Vite + TypeScript** on the frontend, and **Express 5 + Prisma + PostgreSQL** on the backend.

### 🔗 Quick Links

- 🌐 **Nightly Build**: [roommate-app-nightly.vercel.app](https://roommate-app-nightly.vercel.app)
- 🤝 **Contributing Guide**: [CONTRIBUTING.md](CONTRIBUTING.md)
- 📜 **Code of Conduct**: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
---

## ✨ Features (MVP)

- 🔐 **Authentication & Multi-Tab Sessions** – Register, Login, Refresh tokens (JWT + PostgreSQL session table)
- 👥 **Households & RBAC** – Create / Join via invite code / Manage shared households with Role-Based Access Control
- 💰 **Expenses & Settle Up** – Add expenses, split among members, track net balances with zero-sum conservation
- 🧹 **Chores & Scheduling** – Assign, prioritize, schedule, and mark chores complete
- 📦 **Inventory & Low-Stock Alerts** – Manage pantry items with thresholds and automatic shopping list addition
- 🛒 **Shared Shopping Cart** – Collaborative grocery and household shopping list
- 📊 **Household Dashboard** – Unified overview of balances, upcoming chores, and low inventory

---

## 🧱 Tech Stack

### Frontend (`roommate-app`)

- ⚛️ **Core**: React 19 + TypeScript (~5.8) + Vite (v7)
- 🎨 **Styling**: TailwindCSS v4 + `shadcn/ui` + dynamic theme engine (Whiteboard, Ocean, Forest)
- 🔄 **Async Server State**: TanStack Query v5 (`@tanstack/react-query`)
- ⚡ **Event-Driven Architecture (EDA)**: Native `BroadcastChannel` Event Bus for 0-overhead multi-tab synchronization
- 📦 **Navigation**: React Router (v7) with dual-mode responsive layout (Desktop left-rail / Mobile sticky top + bottom tabs)
- 📝 **Forms & Validation**: `react-hook-form` + `zod`
- 🌐 **API Client**: Axios singleton with silent 401 refresh interceptors and CSRF headers

### Backend (`roommate-server`)

- 🚀 **Runtime & Framework**: Node.js (>=20) + Express 5 + TypeScript (~5.8) executed via `vite-node`
- 🗄️ **Database & ORM**: PostgreSQL 15 + Prisma ORM 6 (`@generated/prisma`)
- 🔑 **Auth & Session Sync**: Short-lived JWT (15m) + Long-lived Refresh Tokens mapped in `Session` table + `X-Session-Id` header
- 🛡️ **CSRF Protection**: Double Submit Cookie HMAC pattern (`csrf-csrf`) with environment-aware SameSite cookies
- 🛡️ **Multi-Tenancy**: Household tenancy isolation middleware (`authorizeHousehold`)
- ✅ **Validation**: Declarative middleware chains via `express-validator`
- 🧪 **Testing**: Vitest (v4) with in-memory execution and Prisma mock suites

---

## 📐 Architecture & Engineering

The codebase strictly enforces established architectural contracts:

- 🎨 **Frontend Engineering Guidelines**:
  - **Primitive Immutability**: Absolute freeze on the modification of `src/components/ui/` (shadcn primitives).
  - **Token Purity**: Hardcoded hex codes are forbidden; only semantic CSS custom property classes (`bg-background`, `bg-surface`, `text-primary`, etc.) are allowed.
  - **Server State vs Client State**: TanStack Query v5 handles server data caching; React Context handles local workspace selection.
  - **Multi-Tab Sync**: Out-of-the-box cross-tab sync powered by the `BroadcastChannel` Event Bus (`src/lib/eventBus.ts`).

- ⚙️ **Backend Engineering Guidelines]**:
  - **3-Tier Layering**: Strict separation between Routes -> Controllers -> Services -> Repositories. Controllers never call Prisma directly; Services never handle raw Express `req`/`res`.
  - **Multi-Tenancy**: Every household resource is guarded by `authorizeHousehold({ requireAdmin?: boolean })`.
---

## 📂 Project Structure

```
roommate/
│
├── roommate-app/ # Vite + React + TS frontend
│ ├── src/
│ │ ├── api/ # API clients (authApi, expenseApi, etc.)
│ │ ├── components/ # Reusable UI components
│ │ ├── contexts/ # React Context providers
│ │ ├── hooks/ # Custom hooks
│ │ ├── layouts/ # Authenticated / Unauthenticated layouts
│ │ ├── pages/ # Page components (Login, Dashboard, etc.)
│ │ ├── router/ # Routing setup
│ │ ├── types/ # TypeScript types & DTOs
│ │ ├── utils/ # Helpers (TokenStore, formatters, etc.)
│ │ └── App.tsx
│ └── ...
│
└── roommate-server/ # Express + TS backend
├── prisma/ # Prisma schema & migrations
├── src/
│ ├── auth
| │ ├── middlewares/ # Auth, error handling
| │ ├── types/ # Interfaces
│ ├── chore
| │ ├── types/ # Interfaces
│ ├── common
| │ ├── middlewares/ # Auth, error handling
| │ ├── dtos/ # Data transfer objects
| │ ├── errors/ # error handler
| │ ├── utils/ # common utility functions
│ ├── expense-split
│ ├── expenses
│ ├── household-members
│ ├── households
│ ├── inventory
| │ ├── types/ # Interfaces
│ ├── users
│ └── server.ts
└── ...

```

---

## ⚡ Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (>= 20 recommended)
- [npm](https://www.npmjs.com/) (>= 10)
- [Docker & Docker Desktop](https://www.docker.com/) (recommended for containerized Postgres and one-command boot)

---

### Option 1: Docker Compose (Recommended)

Spins up the PostgreSQL database, backend server, and frontend client in isolated containers with automatic migration and database seeding:

```bash
# Clone the repository
git clone https://github.com/souravseal99/RoomMate.git
cd RoomMate

# Start all services with live reload
docker compose up --build
```

**Services & Ports:**

- 🌐 **Frontend Client**: `http://localhost:5173`
- 🚀 **Backend API**: `http://localhost:5000`
- 🗄️ **Prisma Studio**: `http://localhost:5555`
- 🐘 **PostgreSQL**: `localhost:5432`

---

### Option 2: Native Monorepo Setup

If you prefer running services directly on your host machine:

#### 1. Configure & Start Backend (`roommate-server`)

```bash
cd roommate-server
cp .env.example .env

# Configure your PostgreSQL connection in .env:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/roommate?schema=public"

npm install
npm run prisma:generate
npm run db:migrate
npm run db:seed
npm run dev
```

#### 2. Configure & Start Frontend (`roommate-app`)

In a separate terminal window:

```bash
cd roommate-app
cp .env.example .env   # Default VITE_API_URL=http://localhost:5000

npm install
npm run dev
```

The frontend client will be accessible at `http://localhost:5173`.

---

## 📜 Developer Scripts Reference

The workspace includes top-level npm scripts configured across the `roommate-app` and `roommate-server` workspaces:

### 🗄️ Database & Seeding

| Command                      | Target / Mode              | Description                                                                                       |
| :--------------------------- | :------------------------- | :------------------------------------------------------------------------------------------------ |
| `npm run db:seed`            | **Destructive Wipe**       | Purges all tables and seeds fresh development fixtures from `prisma/seeds/`.                      |
| `npm run db:seed:idempotent` | **Non-Destructive Upsert** | Uses Prisma `upsert` to populate base seed fixtures **without wiping existing manual test data**. |
| `npm run db:migrate`         | Server                     | Runs Prisma schema migrations against the active development database.                            |
| `npm run db:studio`          | GUI                        | Opens the interactive Prisma Studio database viewer on port 5555.                                 |

#### 💡 Seeder Flags Guide

- **`--idempotent`** (`npm run db:seed:idempotent`):
  - **What it does:** Bypasses `deleteMany({})` and applies idempotent upserts (`findUnique -> update if exists, insert if missing`).
  - **When to use:** Use this when you have manually created test expenses, chores, or households in the UI that you do not want destroyed.
- **`--force`** (or `--force-production-seed`):
  - **What it does:** Circuit-breaker override for the built-in safety guard.
  - **Safety Guard:** The seeder automatically aborts if `NODE_ENV === "production"` or if `DATABASE_URL` targets remote cloud hosts (e.g., Render, Supabase, Neon, AWS). Passing `--force` explicitly overrides this safety check for automated staging pipelines.

---

### 💻 Development & Local Servers

| Command              | Scope               | Description                                                                      |
| :------------------- | :------------------ | :------------------------------------------------------------------------------- |
| `npm run dev`        | Full Stack (Docker) | Spins up PostgreSQL, server, and client containers with auto-seeding.            |
| `npm run dev:build`  | Full Stack (Docker) | Rebuilds and launches Docker containers.                                         |
| `npm run dev:app`    | Client              | Starts the Vite React frontend development server (`http://localhost:5173`).     |
| `npm run dev:server` | Server              | Starts the Express server with nodemon and hot reload (`http://localhost:5000`). |

---

### 🧪 Testing & Code Quality

| Command                 | Scope      | Description                                                                             |
| :---------------------- | :--------- | :-------------------------------------------------------------------------------------- |
| `npm test`              | Server     | Runs the complete Vitest test suite (unit, authorization, and integration).             |
| `npm run test:watch`    | Server     | Launches the interactive Vitest test watcher.                                           |
| `npm run test:coverage` | Server     | Generates branch and statement test coverage reports.                                   |
| `npm run test:ui`       | Server     | Opens the Vitest graphical UI test runner in the browser.                               |
| `npm run type-check`    | Full Stack | Runs TypeScript compilation checks (`tsc --noEmit`) across both workspaces.             |
| `npm run lint`          | Full Stack | Runs ESLint across client and server.                                                   |
| `npm run lint:fix`      | Full Stack | Automatically resolves fixable ESLint errors and styling warnings.                      |
| `npm run format`        | Full Stack | Automatically formats all TypeScript, JSX, JSON, CSS, and Markdown files with Prettier. |
| `npm run format:check`  | Full Stack | Checks code formatting compliance across the repository via Prettier.                   |

---

## 🔐 Pre-Configured Test Accounts (Dev Fixtures)

After running `npm run db:seed`, you can log into the local web client (`http://localhost:5173`) using any of the following accounts:

| Role       | Name         | Email                 | Password       | Assigned Household |
| :--------- | :----------- | :-------------------- | :------------- | :----------------- |
| **ADMIN**  | Alex Johnson | `alex@roommate.dev`   | `Password123!` | Beachside Villa    |
| **MEMBER** | Taylor Smith | `taylor@roommate.dev` | `Password123!` | Beachside Villa    |
| **MEMBER** | Jordan Lee   | `jordan@roommate.dev` | `Password123!` | Beachside Villa    |
| **ADMIN**  | Jordan Lee   | `jordan@roommate.dev` | `Password123!` | Downtown Loft      |
| **MEMBER** | Morgan Davis | `morgan@roommate.dev` | `Password123!` | Downtown Loft      |
| **MEMBER** | Casey Miller | `casey@roommate.dev`  | `Password123!` | Downtown Loft      |

### 🏷️ Household Invite Codes

- **Beachside Villa:** `BEACH2026`
- **Downtown Loft:** `LOFT2026`

---

## 🚀 Deployment

- **Frontend**: Vercel / Netlify
- **Backend**: Render / Railway
- **Database**: Supabase / Neon (Postgres hosting)

---

## 🛠️ Upcoming...

- 📅 Google Calendar sync for chores
- 💳 Payment system
- 📱 PWA support
- 🧾 OCR receipt scanner

---

## 🤝 Contributing & Community

We welcome contributions of all shapes and sizes! Whether you're squashing bugs, implementing new features, or improving documentation, the RoomMate community is excited to have you.

First-time contributors are warmly welcomed. To ensure a smooth experience:

1. **Read the Guidelines**: Consult our comprehensive **[CONTRIBUTING.md](./CONTRIBUTING.md)** for detailed local setup instructions, architectural invariants, and test fixtures.
2. **Review Code of Conduct**: All participants must uphold our **[Code of Conduct](./CODE_OF_CONDUCT.md)**.
3. **Pick an Issue**: Browse open [GitHub Issues](https://github.com/souravseal99/RoomMate/issues) tagged `good first issue` or `help wanted`. Drop a comment to claim it before starting.
4. **Branch from `develop`**: Always branch off the latest `develop` branch (`git checkout -b feat/issue-no-description`).
5. **Verify Locally Before Submitting**:
   ```bash
   npm run format:check # Ensure Prettier code style compliance
   npm run type-check   # Ensure zero TypeScript compiler errors
   npm run lint         # ESLint across fullstack
   npm test             # Vitest suite
   ```
6. **Commit & Submit PR**: Format commit messages as `<keyword>: (<branch-name>) <description>` (e.g., `feat: (roommate-v1.2.2) seeder fixes, enhancemnts to the auto seeder in local and new seeder route for testing envs and enhancemnts to auto seed in local and new seeder route for testing envs`). Open a Pull Request targeting the **`develop`** branch and reference your issue (`Closes #XYZ`).

👉 **For the complete step-by-step onboarding guide, Docker setup, and seeded test credentials, check out [CONTRIBUTING.md](./CONTRIBUTING.md).**

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
