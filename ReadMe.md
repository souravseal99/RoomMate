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

---

## ⚡ Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

### Backend Setup

```bash
cd roommate-server
cp .env.example .env   # configure DATABASE_URL and JWT secrets

npm install
npx prisma migrate dev
npm run dev

```

## Frontend Setup

```bash
cd roommate-app
cp .env.example .env   # configure VITE_API_URL

npm install
npm run dev
```
