# 🤝 Contributing to RoomMate

Welcome to the **RoomMate** open-source community! 🎉 Whether you're fixing a typo, resolving a bug, introducing a new feature, or improving test coverage, your contributions make shared living smoother and friction-free for roommates everywhere.

We are a welcoming community committed to mentorship and collaboration. First-time open-source contributors are warmly encouraged to join in!

---

## 📜 Table of Contents

1. [Code of Conduct](#-code-of-conduct)
2. [Project Architecture Overview](#-project-architecture-overview)
3. [Local Development Setup](#-local-development-setup)
   - [Option A: Docker Compose (Recommended)](#option-a-docker-compose-recommended)
   - [Option B: Native Monorepo Setup](#option-b-native-monorepo-setup)
4. [Pre-configured Test Accounts & Seeder](#-pre-configured-test-accounts--seeder)
5. [Contribution Workflow](#-contribution-workflow)
6. [Coding Standards & Core Rules](#-coding-standards--core-rules)
   - [Frontend Standards (`roommate-app`)](#frontend-standards-roommate-app)
   - [Backend Standards (`roommate-server`)](#backend-standards-roommate-server)
7. [Testing & Quality Verification](#-testing--quality-verification)
8. [Commit Convention & Pull Request Guidelines](#-commit-convention--pull-request-guidelines)
9. [Issue Levels & Mentorship](#-issue-levels--mentorship)
10. [Need Help?](#-need-help)

---

## 📜 Code of Conduct

All contributors, maintainers, and community members are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please be respectful, inclusive, and constructive in all discussions, reviews, and issue threads.

---

## 📂 Project Architecture Overview

RoomMate is organized as a full-stack monorepo:

```text
RoomMate/
├── roommate-app/              # Frontend Client (React 19 + TypeScript + Vite + Tailwind v4 + shadcn/ui)
├── roommate-server/           # Backend API (Express 5 + TypeScript + Prisma ORM + PostgreSQL)
├── docker-compose.yml         # Containerized local development orchestrator
```

> [!TIP]
> For comprehensive architectural deep-dives, consult:
>
> - Frontend: [.agents/skills/roommate-app-frontend-guidelines.md](.agents/skills/roommate-app-frontend-guidelines.md)
> - Backend: [.agents/skills/roommate-server-backend-guidelines.md](.agents/skills/roommate-server-backend-guidelines.md)

---

## 🚀 Local Development Setup

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [npm](https://www.npmjs.com/) (v10+)
- [Docker & Docker Desktop](https://www.docker.com/) (recommended for containerized Postgres and one-command boot)

---

### Option A: Docker Compose (Recommended)

The fastest and most reproducible way to get the entire ecosystem running:

1. **Fork & Clone**:

   ```bash
   git clone https://github.com/<YOUR-USERNAME>/RoomMate.git
   cd RoomMate
   git remote add upstream https://github.com/souravseal99/RoomMate.git
   ```

2. **Launch all services**:

   ```bash
   docker compose up --build
   ```

3. **Access Services**:
   - **Frontend App**: `http://localhost:5173`
   - **Backend API**: `http://localhost:5000`
   - **Prisma Studio**: `http://localhost:5555`
   - **PostgreSQL Database**: `localhost:5432`

---

### Option B: Native Monorepo Setup

If you prefer running services directly on your host machine:

#### 1. Setup Backend (`roommate-server`)

```bash
cd roommate-server
cp .env.example .env

# Edit .env with your local or cloud PostgreSQL DATABASE_URL:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/roommate?schema=public"

npm install
npm run prisma:generate
npm run db:migrate
npm run db:seed
npm run dev
```

#### 2. Setup Frontend (`roommate-app`)

In a separate terminal window:

```bash
cd roommate-app
cp .env.example .env

npm install
npm run dev
```

The web client will start at `http://localhost:5173`.

---

## 🔑 Pre-configured Test Accounts & Seeder

Running `npm run db:seed` provisions realistic multi-tenant data with pre-calculated balances, chores, inventories, and shopping carts.

| Email                 | Password       | Role                                  | Household                       | Invite Code              |
| :-------------------- | :------------- | :------------------------------------ | :------------------------------ | :----------------------- |
| `alex@roommate.dev`   | `Password123!` | Admin                                 | Beachside Villa                 | `BEACH2026`              |
| `taylor@roommate.dev` | `Password123!` | Member                                | Beachside Villa                 | `BEACH2026`              |
| `jordan@roommate.dev` | `Password123!` | Admin (Downtown) / Member (Beachside) | Beachside Villa & Downtown Loft | `BEACH2026` / `LOFT2026` |
| `morgan@roommate.dev` | `Password123!` | Member                                | Downtown Loft                   | `LOFT2026`               |
| `casey@roommate.dev`  | `Password123!` | Member                                | Downtown Loft                   | `LOFT2026`               |

> [!NOTE]
>
> - Re-run the seeder safely without resetting IDs using: `npm run db:seed:idempotent`.
> - During development, you can trigger a seed reload via HTTP: `POST http://localhost:5000/dev/seed`.

---

## 🛠️ Contribution Workflow

### 1. Find or Open an Issue

- Browse open [GitHub Issues](https://github.com/souravseal99/RoomMate/issues).
- Look for issues labeled **`good first issue`** or **`help wanted`**.
- Leave a comment indicating you would like to work on it before starting to prevent duplicate efforts.

### 2. Sync with Latest `develop`

Always branch off the latest `develop` branch:

```bash
git checkout develop
git pull upstream develop
```

### 3. Create a Descriptive Branch

Use standard branch naming:

```bash
# For new features:
git checkout -b feat/issue-42-expense-split-slider

# For bug fixes:
git checkout -b fix/issue-89-csrf-refresh-race
```

### 4. Implement Changes & Test Locally

Follow the coding standards outlined below and ensure all local tests pass.

### 5. Push & Open a Pull Request

```bash
git push -u origin feat/issue-42-expense-split-slider
```

Open your PR against the **`develop`** branch (not `main`).

---

## 📐 Coding Standards & Core Rules

### Frontend Standards (`roommate-app`)

1. **Primitive Immutability (`src/components/ui/`)**:
   - 🚫 **NEVER edit or customize files in `src/components/ui/`**. These are canonical shadcn/ui primitives.
   - Extend behavior using `className` or build domain-specific wrappers in `src/components/[domain]/`.
   - Never create ad-hoc common UI components (custom buttons, unstyled dialogs). Always use official shadcn components.
2. **Semantic Design Tokens Only**:
   - 🚫 **NEVER use hardcoded hex codes** (e.g. `bg-[#FAF3E1]`, `text-[#a43e00]`).
   - ✅ Always use semantic Tailwind v4 utility tokens (`bg-background`, `bg-surface`, `bg-card`, `text-primary`, `border-border`).
3. **Server State & Real-Time Sync**:
   - Manage remote state with **TanStack Query v5** (`@tanstack/react-query`).
   - Use the native `BroadcastChannel` Event Bus (`src/lib/eventBus.ts`) for zero-overhead multi-tab synchronization.
4. **Form Validation**:
   - Use `react-hook-form` paired with `zod` schemas in `src/schemas/`.
5. **Mobile-First Responsive Layout**:
   - Desktop uses the left-rail sidebar (`AppSidebar`).
   - Mobile uses sticky `AppBar` and fixed bottom tab navigation (`MobileBottomNav`). Ensure content has bottom padding (`pb-24 md:pb-6`).

---

### Backend Standards (`roommate-server`)

1. **Strict 3-Tier Layered Architecture**:
   - **Routes** (`*.routes.ts`): URL mapping and middleware attachment only.
   - **Controllers** (`*.controller.ts`): Request parsing and HTTP response status/formatting. **Controllers must never call Prisma directly.**
   - **Services** (`*.service.ts`): Pure business logic returning `ApiResponse`. **Services must never access Express `req` or `res` objects.**
   - **Repositories** (`*.repo.ts`): Pure database access via `@common/utils/prisma`.
2. **Multi-Tenant Household Security**:
   - Always protect household resources with `authorizeHousehold({ requireAdmin?: boolean })`.
   - Never trust client-supplied user IDs; extract `userId` from `req.user.userId`.
3. **Database Relational Integrity**:
   - Wrap multi-table updates or deletions in atomic `prisma.$transaction([ ... ])` blocks.
4. **CSRF & Session Security**:
   - Public unauthenticated endpoints (`/auth/login`, `/auth/register`, `/health`, `/dev/seed`) must be exempted in `skipCsrfProtection`.
   - Ensure `X-Session-Id` header is supported for multi-tab session scoping.
5. **Validation & Errors**:
   - Use `express-validator` chains + `validationErrorHandler`.
   - Throw custom `ApiError` rather than raw untyped `Error`.

---

## 🧪 Testing & Quality Verification

Before committing code or opening a Pull Request, run the local verification checks from the repository root:

```bash
# 1. Format code with Prettier (or check with npm run format:check)
npm run format

# 2. Type checking (zero TypeScript errors allowed)
npm run type-check

# 3. Linting
npm run lint

# 4. Unit and integration test suites
npm run test
```

### Running Targeted Backend Tests:

```bash
cd roommate-server
npm run test              # Run all tests once via Vitest
npm run test:watch        # Interactive test watcher
npm run test:coverage     # Generate code coverage report
```

---

## 📝 Commit Convention & Pull Request Guidelines

### Standard Commit Message Format

All commits in RoomMate must adhere to the following standard structure:

```text
<keyword>: (<branch-name>) <descriptive message in lowercase>
```

#### Structure Breakdown:

- **`<keyword>`**: The primary intent of the change. Allowed keywords:
  - **`feat`** – New feature, route, component, or enhancement
  - **`fix`** – Bug fix or defect resolution
  - **`refac`** – Code refactoring or cleanup with no behavior changes
  - **`docs`** – Documentation additions or modifications
  - **`test`** – Adding, updating, or fixing test suites
  - **`chore`** – Build system, dependencies, or configuration changes
- **`(<branch-name>)`**: The name of your active working branch enclosed in parentheses.
- **`<descriptive message>`**: A concise, clear summary written in lowercase describing what was changed.

#### Examples:

```text
feat: (roommate-v1.2.2) seeder fixes, enhancemnts to the auto seeder in local and new seeder route for testing envs and enhancemnts to auto seed in local and new seeder route for testing envs
fix: (fix-login-403) resolve csrf validation failure on public login route
refac: (household-service) extract role verification into reusable tenancy helper
docs: (readme-update) add commit message standards and developer runbooks
test: (calculate-balance) add zero-sum invariant test for expense settlement
chore: (deps-update) upgrade vite and tailwindcss v4 to latest patch
```

### Pull Request Checklist

When submitting a Pull Request, please ensure:

- [ ] Target branch is set to **`develop`** (not `main`).
- [ ] PR title and commits follow the `<keyword>: (<branch-name>) <description>` standard.
- [ ] Linked the relevant issue in the PR description (e.g., `Closes #42`).
- [ ] Added before/after screenshots or GIFs for any UI changes.
- [ ] Code formatted with Prettier (`npm run format:check` passes).
- [ ] `npm run type-check`, `npm run lint`, and `npm run test` all pass with zero errors.
- [ ] No hardcoded secret tokens, private keys, or credentials committed.
- [ ] Code follows the 3-Tier backend layering and shadcn/ui frontend immutability rules.

---

## 🎯 Issue Levels & Mentorship

During hackathons, open-source cohorts (e.g., Winter of Code), and active sprints, issues are categorized to help you find the right fit:

- **Level 1 (Beginner / `good first issue`)**: Small UI tweaks, documentation improvements, straightforward unit tests, adding icons/badges.
- **Level 2 (Intermediate)**: New dashboard widgets, validation schemas, API endpoint additions, modal forms.
- **Level 3 (Advanced)**: Complex algorithmic logic (expense settlements, balance graph simplification), multi-tab state sync, database migrations, security middleware.

> [!TIP]
> Maintainers are here to guide you! If an issue feels challenging or you get stuck on TypeScript types or Prisma schemas, leave a comment on your issue or PR. We're happy to pair-debug and unblock you.

---

## 💬 Need Help?

- **Issues**: Open a discussion or question on [GitHub Issues](https://github.com/souravseal99/RoomMate/issues).
- **Maintainer**: Tag `@souravseal99` on your issue or PR for timely feedback and review.

Thank you for helping make RoomMate awesome! 🚀
