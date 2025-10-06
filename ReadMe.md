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

- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

### Backend Setup

```bash
cd backend
cp .env.example .env   # configure DATABASE_URL and JWT secrets

npm install
npx prisma migrate dev
npm run dev
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env   # configure VITE_API_URL

npm install
npm run dev
```

Frontend will run at `http://localhost:5173`
Backend will run at `http://localhost:5000`

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
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push and open a PR

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
