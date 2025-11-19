# 🤝 Contributing to RoomMate – Shared Living App

Thank you to all the contributors of **RoomMate** 🎉 , small changes are the most impactfull changes 🚀

We welcome contributions of all kinds: bug reports, feature requests, documentation improvements, or code changes.

Always remember guys, communication is the heart of a community, and open source is all about community. So please feel free to tag us whenenver something slows you down, we'll be more than happy to help.

---

<!-- ## 📝 Code of Conduct

Please be respectful and constructive. By participating, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md) (if added later).

--- -->

## 🚀 Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR-USERNAME/RoomMate.git
cd roommate
git remote add origin </LINK TO YOUR FORKED REPO/>
git remote add upstream https://github.com/souravseal99/RoomMate.git

```

check if your origin and upstream is properly set -

```bash
git remote -v
```

You should see both `origin` (your fork) and `upstream` (main repository) listed.

### 2. Install Dependencies

This is a Turborepo monorepo, so install all dependencies from the root:

```bash
npm install
```

### 3. Setup Environment Variables

```bash
# Server environment
cp apps/server/.env.example apps/server/.env

# Web environment (if .env.example exists)
cp apps/web/.env.example apps/web/.env
```

Configure `apps/server/.env` with:

- `DATABASE_URL` (default works with Docker setup below)
- JWT secrets and other required variables

### 4. Setup Database

The easiest way is using Docker (recommended):

```bash
npm run db:start
```

Then run migrations:

```bash
npm run db:migrate
```

<details>
<summary>Alternative Database Setup Options</summary>

- **Local PostgreSQL**: [Install PostgreSQL](https://www.postgresql.org/download/) and create a database
- **Docker Manual**: Use `docker run` with PostgreSQL image
- **Cloud Database**: [Neon](https://neon.tech/) or other PostgreSQL hosting

See [README.md](./README.md) for detailed instructions.

</details>

### 5. Start Development

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:server    # Backend only (http://localhost:5000)
npm run dev:client    # Frontend only (http://localhost:5173)
```

#### **NOTE:** Roommate follows mobile first development approach, to simply put, the UI should look good on a mobile device.

---

## 📂 Project Structure

This is a **Turborepo monorepo**. See [README.md](./README.md) for the full structure. In short:

- `apps/web/` → React + Vite + TypeScript + Tailwind + shadcn/ui
- `apps/server/` → Express + Prisma + PostgreSQL + TypeScript
- `turbo.json` → Turborepo task pipeline configuration
- Root `package.json` → Workspaces and shared scripts

---

## 🛠️ Contribution Workflow

1. **Create an Issue**
   - Check if the issue already exists.
   - If not, open a new issue describing the bug or feature.
   - drop a note asking to contribute on the issue (before you start working)

2. **Pull the latest develop Branch**

   ```bash
   git pull upstream develop
   ```

3. **Work on a Branch created from the latest develop branch**

   ```bash
   git checkout -b feature-(ISSUE_NO)/your-feature
   ```

4. **Write Clean Code**
   - Use TypeScript types/interfaces.
   - Follow existing folder conventions (`api`, `services`, `pages`, etc.).
   - Keep components small and reusable. Modularity is a must have.
   - Run `npm run lint` and `npm run format:check` before committing.
   - Test your changes with `npm run test` (when applicable).

5. **Commit Messages**
   Follow a consistent style:

   ```
   feat: add new household creation form
   fix: resolve expense deletion state issue
   docs: improve README with setup instructions
   ```

6. **Push & Create PR**

   ```bash
   git push origin feature-(ISSUE_NO)/your-feature
   ```

   Open a Pull Request against the `develop` branch.

---

## ✅ Pull Request Guidelines

- Link the issue number (e.g., `Closes #42`).
- Keep PRs small and focused.
- Add screenshots if you changed UI.
- Ensure `npm run lint` and tests (if added later) pass.

---

## 🎯 Areas You Can Contribute

- **Frontend** (`apps/web/`): UI components, routing, state management, API integration.
- **Backend** (`apps/server/`): Routes, services, validation, Prisma models.
- **Monorepo**: Turborepo configuration, shared tooling, build optimization.
- **Docs**: Improve setup instructions, add examples, clarify workflows.
- **Tests**: Unit tests & integration tests.

---

## ❄️ Winter of Code Social Notes

- We label beginner-friendly issues with **`good first issue`**.
- Feel free to pick any open issue or suggest new ideas.
- First-time contributors are especially welcome ❤️
- Issues will be assigned based on the FCFS (First Come First Serve) principle
- Based on the difficulty level issues will be tagged as level-1, level-2 & level-3 issues
- Based on the work done, PRs will also be tagged as the same
- Each level has points assigned to it, which will help the contributor to climb the leaderboard.

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
