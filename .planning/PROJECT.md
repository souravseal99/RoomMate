# RoomMate

## What This Is

A full-stack web app that helps roommates manage shared living more easily. Track expenses, assign chores, manage inventory, and see household stats — all in one place. Built with React + Vite + TypeScript frontend and Express + Prisma + PostgreSQL backend.

## Core Value

Enable roommates to seamlessly manage their shared household through a unified platform for tracking expenses, chores, and inventory with real-time balance calculations.

## Requirements

### Validated

- ✓ User can register and authenticate — existing
- ✓ User can log in and stay logged in across sessions — existing
- ✓ User can create, join, and manage households — existing
- ✓ User can add expenses and split among household members — existing
- ✓ User can track expense balances between members — existing
- ✓ User can assign, update, and complete chores — existing
- ✓ User can manage shared inventory items with quantities — existing
- ✓ User can view household dashboard with overview stats — existing

### Active

- [ ] Add low-stock inventory alerts
- [ ] Add household invitations via link
- [ ] Add expense categories and reporting

### Out of Scope

- Mobile app — web-first approach
- Real-time notifications — batch/email only for v1
- OAuth login — email/password sufficient for v1
- Video/image attachments for expenses

## Context

**Technical Environment:**
- Monorepo with `roommate-app` (React frontend) and `roommate-server` (Express backend)
- PostgreSQL database via Prisma ORM
- JWT-based authentication with refresh tokens
- Tailwind CSS with Radix UI components

**Existing Codebase State:**
- Full authentication flow implemented
- Household CRUD operations in place
- Expense tracking and balance calculation working
- Chore management system functional
- Basic inventory management available
- Dashboard with summary stats implemented

**Known Issues:**
- Inventory lacks low-stock alert functionality
- No household invitation system (manual join codes only)
- Limited expense categorization

## Constraints

- **Tech Stack**: React + Express + PostgreSQL + Prisma — Fixed
- **Database**: PostgreSQL — Required for relational household data
- **Authentication**: JWT with refresh tokens — Already implemented

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| JWT authentication | Stateless, works across devices | ✓ Good |
| Prisma ORM | Type-safe database access, easy migrations | ✓ Good |
| Monorepo structure | Shared types between frontend/backend | ✓ Good |
| Radix UI + Tailwind | Accessible components, rapid styling | ✓ Good |

---
*Last updated: 2026-02-25 after initialization*
