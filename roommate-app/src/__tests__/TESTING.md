# Testing (Vitest)

This project uses Vitest for unit and integration tests. Below are useful commands and debugging tips.

- Install dependencies: `npm install` (or `pnpm install` / `yarn`).
- Run tests (watch / UI): `npm run test` or `npm run test:ui` to open Vitest UI.
- Run tests once (CI / non-watch): `npx vitest run` or `npm run test -- run`.
- Run a single test file:
  - `npx vitest run src/components/routing/ProtectedRoute.test.tsx`
  - or with npm script: `npm run test -- run src/components/routing/ProtectedRoute.test.tsx`

- Run tests with threads disabled (useful when mocks are shared/stateful):
  - `npx vitest run --threads=false`
  - or set `test.threads = false` in `vite.config.ts`.

- Increase the per-test timeout (if you hit timing/timeouts during async UI tests):
  - `npx vitest run --testTimeout=10000`
  - or set `test.testTimeout = 10000` in `vite.config.ts`.

Debugging tips
- If you see errors like `ReferenceError: jest is not defined`, tests are using Jest globals. Use Vitest globals (`vi.mock`, `vi.spyOn`, etc.) in tests.
- If you see ESM/mock shape errors (mock factory not returning an object with a `default` key), ensure mock factories return the same export shape as the module (for default ESM exports return `{ default: ... }`).
- If nested routes or layouts don't render in router tests, ensure mocked layout components render an `<Outlet />` so child routes mount.
- If you encounter `[birpc] rpc is closed, cannot call 'onCancel'` or worker-cancellation errors, run tests non-watch (`npx vitest run`) and/or disable threads (`--threads=false`) to isolate the failure and capture the original unhandled rejection.
- Use `screen.findBy*` and `waitFor` from `@testing-library/react` to await async UI changes instead of relying on immediate assertions.

If you'd like, I can:
- run the failing tests (`npx vitest run`) and iterate on fixes;
- create a short `docs/TESTING.md` with examples for the most common test commands (this file can be moved there).
