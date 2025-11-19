# 🏡 RoomMate – Shared Living App

A full-stack web app that helps roommates manage shared living more easily.  
Track **expenses**, assign **chores**, manage **inventory**, and see household **stats** — all in one place.

Built with **React + Vite + TypeScript** on the frontend, and **Express + Prisma + PostgreSQL** on the backend.

---

## ✨ Features (MVP)

- 🔐 **Authentication** – Register, Login, Refresh tokens (JWT-based)
- 👥 **Households** – Create / Join / Manage shared households
- 💰 **Expenses** – Add expenses, split among members, track balances
- 🧹 **Chores** – Assign, update, and complete chores
- 📦 **Inventory** – Manage shared items with quantities & low-stock alerts
- 📊 **Dashboard** – Overview of expenses, chores, and inventory status

---

## 🧱 Tech Stack

### Frontend

- ⚛️ React (Vite + TypeScript)
- 🎨 TailwindCSS + shadcn/ui
- 📦 React Router
- ⚡ Axios (API client)

### Backend

- 🚀 Node.js + Express
- 🗄️ PostgreSQL + Prisma ORM
- 🔑 JWT (Access + Refresh tokens)
- ✅ Zod (validation)

---

## 📂 Project Structure

This is a Turborepo monorepo with the following structure:

```
RoomMate/                    # Root monorepo
│
├── apps/
│   ├── web/                 # Vite + React + TS frontend
│   │   ├── src/
│   │   │   ├── api/         # API clients (authApi, expenseApi, etc.)
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── contexts/    # React Context providers
│   │   │   ├── hooks/       # Custom hooks
│   │   │   ├── layouts/     # Authenticated / Unauthenticated layouts
│   │   │   ├── pages/       # Page components (Login, Dashboard, etc.)
│   │   │   ├── router/      # Routing setup
│   │   │   ├── types/       # TypeScript types & DTOs
│   │   │   ├── utils/       # Helpers (TokenStore, formatters, etc.)
│   │   │   └── App.tsx
│   │   └── package.json
│   │
│   └── server/              # Express + TS backend
│       ├── prisma/          # Prisma schema & migrations
│       ├── src/
│       │   ├── auth/
│       │   │   ├── middlewares/  # Auth middleware
│       │   │   └── types/        # Interfaces
│       │   ├── chore/
│       │   ├── common/
│       │   │   ├── middlewares/  # Auth, error handling
│       │   │   ├── dtos/         # Data transfer objects
│       │   │   ├── errors/       # Error handlers
│       │   │   └── utils/        # Common utilities
│       │   ├── expense-split/
│       │   ├── expenses/
│       │   ├── household-members/
│       │   ├── households/
│       │   ├── inventory/
│       │   ├── users/
│       │   └── server.ts
│       └── package.json
│
├── turbo.json               # Turborepo configuration
├── package.json             # Root package.json with workspaces
└── docker-compose.db.yml    # PostgreSQL database setup
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js >= 18
- Docker (for database)
- npm >= 9

### Installation

1. **Install dependencies**

```bash
npm install
```

2. **Set up environment variables**

```bash
# Server environment
cp apps/server/.env.example apps/server/.env

# Web environment
cp apps/web/.env.example apps/web/.env
```

Configure the following in `apps/server/.env`:

- `DATABASE_URL` (default: `postgresql://roommate_user:roommate_pass@localhost:5432/roommate_db`)
- JWT secrets

4. **Start the database**

```bash
npm run db:start
```

This will start a PostgreSQL database in Docker with the correct configuration.

5. **Run database migrations**

```bash
npm run db:migrate
```

6. **Start development servers**

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:server    # Backend only
npm run dev:client    # Frontend only
```

Frontend will run at `http://localhost:5173`  
Backend will run at `http://localhost:5000`

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build all apps for production
- `npm run test` - Run tests across all apps
- `npm run lint` - Lint all apps
- `npm run format` - Format code with Prettier
- `npm run db:start` - Start PostgreSQL database in Docker
- `npm run db:stop` - Stop database container
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)

<details>
<summary>Alternative Database Setup Options</summary>

### Local PostgreSQL Installation

If you prefer to install PostgreSQL locally instead of using Docker:

```bash
# Install PostgreSQL from https://www.postgresql.org/download/

# Create database and user
psql postgres

CREATE DATABASE roommate_db;
CREATE USER roommate_user WITH PASSWORD 'roommate_pass';
ALTER ROLE roommate_user SET client_encoding TO 'utf8';
ALTER ROLE roommate_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE roommate_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE roommate_db TO roommate_user;

\q
```

Update `apps/server/.env`:

```
DATABASE_URL="postgresql://roommate_user:roommate_pass@localhost:5432/roommate_db"
```

### Cloud Database (Neon DB)

1. Sign up at [Neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Update `apps/server/.env` with the provided `DATABASE_URL`

### Manual Docker Setup

```bash
docker run --name roommate_db \
  -e POSTGRES_USER=roommate_user \
  -e POSTGRES_PASSWORD=roommate_pass \
  -e POSTGRES_DB=roommate_db \
  -p 5432:5432 \
  -d postgres:15
```

</details>

---

## 🚀 Deployment

- **Frontend**: Vercel / Netlify
- **Backend**: Render / Railway
- **Database**: Supabase / Neon (Postgres hosting)

---

## 🛠️ Future Improvements

- 📅 Google Calendar sync for chores
- 💳 Stripe integration for rent splitting
- 📱 PWA support
- 🧾 OCR receipt scanner

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Pull the latest develop branch
3. Create a new branch from the latest develop branch: `git checkout -b feature/your-feature`
4. Commit changes: `git commit -m "Add your feature"`
5. Push and open a PR

Please checkout [CONTRIBUTING.md](./CONTRIBUTING.md) for a detailed guideline.

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
