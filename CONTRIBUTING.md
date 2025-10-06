# 🤝 Contributing to RoomMate – Shared Living App

Thank you for considering contributing to **RoomMate** 🎉  
We welcome contributions of all kinds: bug reports, feature requests, documentation improvements, or code changes.

---

## 📝 Code of Conduct

Please be respectful and constructive. By participating, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md) (if added later).

---

## 🚀 Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR-USERNAME/RoomMate.git
cd roommate
```

### 2. Setup Backend

```bash
cd roommate-server
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

### 3. Setup Frontend

```bash
cd roommate-app
cp .env.example .env
npm install
npm run dev
```

---

## 📂 Project Structure

See [README.md](README.md) for the full structure. In short:

- `frontend/` → React + Vite + Tailwind + shadcn/ui
- `backend/` → Express + Prisma + PostgreSQL

---

## 🛠️ Contribution Workflow

1. **Create an Issue**

   - Check if the issue already exists.
   - If not, open a new issue describing the bug or feature.

2. **Work on a Branch**

   ```bash
   git checkout -b feature/your-feature
   ```

3. **Write Clean Code**

   - Use TypeScript types/interfaces.
   - Follow existing folder conventions (`api`, `services`, `pages`, etc.).
   - Keep components small and reusable.

4. **Commit Messages**
   Follow a consistent style:

   ```
   feat: add new household creation form
   fix: resolve expense deletion state issue
   docs: improve README with setup instructions
   ```

5. **Push & Create PR**

   ```bash
   git push origin feature/your-feature
   ```

   Open a Pull Request against the `main` branch.

---

## ✅ Pull Request Guidelines

- Link the issue number (e.g., `Closes #42`).
- Keep PRs small and focused.
- Add screenshots if you changed UI.
- Ensure `npm run lint` and tests (if added later) pass.

---

## 🎯 Areas You Can Contribute

- **Frontend**: UI components, routing, state management, API integration.
- **Backend**: Routes, services, validation, Prisma models.
- **Docs**: Improve setup instructions, add examples, clarify workflows.
- **Tests**: Unit tests & integration tests (coming soon).

---

## 🌍 Hacktoberfest Notes

- We label beginner-friendly issues with **`good first issue`**.
- Feel free to pick any open issue or suggest new ideas.
- First-time contributors are especially welcome ❤️

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
