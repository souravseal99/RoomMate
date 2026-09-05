---
name: roommate-app-frontend-guidelines
description: Complete architecture patterns, coding standards, TailwindCSS v4 native theming, dual-mode navigation shell, Event-Driven multi-tab sync, TanStack Query v5, and Zod+RHF validation for the RoomMate frontend application.
---

# RoomMate Frontend Architecture & Engineering Guidelines

This skill serves as the single source of truth for frontend conventions, architectural patterns, design token systems, navigation shell mechanics, multi-theming engine, and coding standards across the `roommate-app` codebase.

---

## 1. Tech Stack Overview

- **Core Framework**: React 19 + TypeScript (~5.8) + Vite (v7)
- **Styling**: TailwindCSS v4 + `shadcn/ui` + `class-variance-authority` (cva) + `clsx` + `tailwind-merge` (`cn` helper)
- **Typography**: `Plus Jakarta Sans` (Default / Whiteboard), `Inter` (Ocean), `DM Sans` (Forest) preloaded in `index.html`
- **Routing**: `react-router-dom` (v7) with Single Page Application (SPA) navigation
- **Async Server State & Caching**: TanStack Query v5 (`@tanstack/react-query`) with automatic stale-while-revalidate & window-focus sync
- **Event-Driven Architecture (EDA)**: Native `BroadcastChannel` Event Bus (`src/lib/eventBus.ts`) for 0-overhead multi-tab synchronization
- **Client Workspace State**: React Context (`AuthContext`, `HouseholdContext`, `ExpenseContext`, `InventoryContext`, `ThemeContext`)
- **API Client**: Customized Axios singleton with request/response interceptors, in-memory token store, and silent 401 token refresh
- **Icons**: `lucide-react` and `@tabler/icons-react`
- **Form Management & Validation**: `react-hook-form` + `@hookform/resolvers` + `zod`

---

## 2. Design System & Token Rules (Strict Requirement)

All component styling MUST conform to the **Design Tokens** declared in `App.css` and `.agent/stitch.md`.

### 🚫 Forbidden Practice: Hardcoded Arbitrary Hex Codes
**NEVER** write raw inline hex codes in component JSX elements (e.g. `text-[#222222]`, `bg-[#FAF3E1]`, `text-[#a43e00]`, `border-[#e1bfb2]`).

### ✅ Mandated Practice: Semantic Theme Utility Classes
Always use semantic Tailwind utility classes mapped to CSS custom variables defined in `App.css`:

| Design System Token | Hex Value (Whiteboard) | Tailwind Utility Class |
| :--- | :--- | :--- |
| **Background** | `#fff8f6` | `bg-background` |
| **Surface / Card** | `#FAF3E1` | `bg-surface`, `bg-card` |
| **Surface Container** | `#ffe9e2` | `bg-surface-container` |
| **Surface Container Low** | `#fff1ec` | `bg-surface-container-low` |
| **Surface Container High** | `#fde3d9` | `bg-surface-container-high` |
| **Surface Container Highest** | `#f7ddd3` | `bg-surface-container-highest` |
| **Text / On-Surface** | `#222222` | `text-foreground` |
| **Secondary / Subtitles** | `#594137` | `text-muted-foreground` |
| **Primary (Terracotta)** | `#a43e00` | `bg-primary`, `text-primary` |
| **Primary Foreground** | `#ffffff` | `text-primary-foreground` |
| **Primary Container** | `#ff6d1f` | `bg-primary-container`, `text-primary-container` |
| **Tertiary (Ocean Blue)** | `#006591` | `bg-tertiary`, `text-tertiary` |
| **Tertiary Container** | `#00a4e9` | `bg-tertiary-container`, `text-tertiary-container` |
| **Border / Outline** | `#222222` | `border-border` |
| **Input Outline** | `#e1bfb2` | `border-input` |
| **Error / Destructive** | `#ba1a1a` | `text-destructive`, `bg-destructive` |

---

## 3. Tailwind v4 Native Multi-Theme Engine

Instead of dynamic JavaScript inline style injection (which bypasses Tailwind JIT and causes Flash of Unstyled Content), the application uses **CSS-first, class-scoped custom property palettes** combined with Tailwind v4 `@theme inline`.

### 3.1 Architecture & Token Flow

1. **`@theme inline` Block in `App.css`**:
   Maps semantic Tailwind utility names to CSS custom properties using `var()`:
   ```css
   @theme inline {
     --font-sans: var(--theme-font);
     --color-background: var(--background);
     --color-foreground: var(--foreground);
     --color-surface: var(--surface);
     --color-surface-container: var(--surface-container);
     --color-surface-container-high: var(--surface-container-high);
     --color-card: var(--card);
     --color-card-foreground: var(--card-foreground);
     --color-primary: var(--primary);
     --color-primary-foreground: var(--primary-foreground);
     --color-primary-container: var(--primary-container);
     --color-secondary: var(--secondary);
     --color-muted: var(--muted);
     --color-muted-foreground: var(--muted-foreground);
     --color-border: var(--border);
     --color-input: var(--input);
     --color-destructive: var(--destructive);
     --color-sidebar: var(--sidebar);
     --color-sidebar-foreground: var(--sidebar-foreground);
     --color-sidebar-primary: var(--sidebar-primary);
     --color-sidebar-accent: var(--sidebar-accent);
     --color-sidebar-border: var(--sidebar-border);
     --color-sidebar-muted: var(--sidebar-muted);
   }
   ```

2. **Scoped Theme Blocks in `App.css`**:
   - `:root`: Default theme (*Physical Whiteboard*)
   - `.theme-ocean`: *Ocean Depth* theme
   - `.theme-forest`: *Forest Grove* theme

3. **Font Preloading in `index.html`**:
   All theme fonts (`Plus Jakarta Sans`, `Inter`, `DM Sans`) are preloaded in `index.html`. The font family switches dynamically via `--theme-font`.

4. **Lightweight `ThemeContext` (`contexts/ThemeContext.tsx`)**:
   - Reads/persists active theme in `localStorage` under `roommate_theme`.
   - Toggles CSS classes on `document.documentElement` (`<html class="theme-ocean">`).
   - Exports `useTheme()` hook with `{ themeName, setTheme, availableThemes }`.

### 3.2 Adding a New Theme
To add a new theme in the future, only 2 files need to be modified:
1. **`src/App.css`**: Add a new `.theme-[name]` selector with full token variables.
2. **`src/lib/themes.ts`**: Add a metadata entry to `themes` array:
   ```ts
   {
     name: 'sunset',
     label: 'Sunset Warmth',
     className: 'theme-sunset',
     swatch: '#e11d48',
     fontLabel: 'Outfit',
   }
   ```

---

## 4. Responsive Dual-Mode Navigation Shell

The app uses a dual-mode navigation pattern derived from Stitch UI designs:
- **Desktop (`md:` breakpoint and above)**: Fixed left rail sidebar (`AppSidebar.tsx`).
- **Mobile (`< md` breakpoint)**: Sticky top bar (`AppBar.tsx`) + fixed bottom tab bar (`MobileBottomNav.tsx`).

### 4.1 Component Breakdown (`components/app/sidebar/`)

| Component | Viewport | Purpose |
| :--- | :--- | :--- |
| **`AppSidebar.tsx`** | Desktop (`hidden md:flex`) | Pure composition assembler for the left-rail sidebar shell. |
| **`SidebarBrand.tsx`** | Desktop | App branding header: icon badge, title, uppercase tagline. |
| **`SidebarNavItem.tsx`** | Desktop | Reusable single link with active pill, icon resolution, and optional badge count. Uses React Router `<Link>`. |
| **`SidebarNavGroup.tsx`** | Desktop | Categorized sections (`Main`, `Manage`) with small uppercase section headers. |
| **`SidebarQuickSettle.tsx`**| Desktop & Shared | Prominent full-width action button navigating directly to settle expenses. |
| **`SidebarUserProfile.tsx`**| Desktop | User footer with initials avatar, status indicator, and popover dropdown including the **Theme Selector Sub-menu**. |
| **`AppBar.tsx`** | Mobile (`md:hidden`) | Sticky top header with route-based title and user avatar trigger for profile & theme menu. |
| **`MobileBottomNav.tsx`** | Mobile (`md:hidden`) | Fixed 5-tab bottom navigation with scaled active pills. |

### 4.2 Layout Integration (`layouts/AuthenticatedLayout.tsx`)

```tsx
function AuthenticatedLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Desktop sidebar */}
      <AppSidebar />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile top app bar */}
        <AppBar />

        {/* Scrollable content area with padding for mobile bottom bar */}
        <main className="flex-1 overflow-y-auto w-full pb-24 md:pb-6 px-4 md:px-8 pt-4 md:pt-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav bar */}
      <MobileBottomNav />
    </div>
  );
}
```

> [!IMPORTANT]
> The `<main>` element must include `pb-24 md:pb-6` so that mobile page content does not get hidden under the fixed `h-20` bottom navigation bar.

---

## 5. Event-Driven Architecture (EDA) & Multi-Tab Synchronization

To keep all open browser tabs/windows in 100% real-time synchronization without expensive HTTP polling:

### 5.1 Native `BroadcastChannel` Event Bus (`src/lib/eventBus.ts`)
- Manages an application event channel (`roommate_app_events`).
- Typed event contracts (`src/types/eventTypes.ts`):
  ```ts
  export type AppEvent =
    | { type: 'HOUSEHOLD_MUTATED'; payload?: { householdId?: string } }
    | { type: 'HOUSEHOLD_SWITCHED'; payload: { householdId: string } }
    | { type: 'ROSTER_UPDATED'; payload: { householdId: string } };
  ```
- Methods: `publish(event: AppEvent)` and `subscribe(handler: AppEventHandler)`.

### 5.2 Event Subscriber Hook (`src/hooks/useHouseholdEventSync.ts`)
- Mounts at the application root inside `AppContent` in `App.tsx`.
- Listens to incoming `AppEvent` broadcasts from other tabs and automatically triggers `queryClient.invalidateQueries` for instant cache synchronization.

### 5.3 Future-Proof Fullstack Real-Time (SSE / WebSockets)
When WebSocket or Server-Sent Events are enabled on `roommate-server`, incoming socket messages plug directly into the same `queryClient.invalidateQueries` handler in 1 line of code.

---

## 6. Server State Management with TanStack Query (v5)

All remote asynchronous data fetching, caching, and mutation must use **TanStack Query (v5)**:

### 6.1 Query Key Factory
Group query keys cleanly in domain key objects:
```ts
export const householdKeys = {
  all: ['households'] as const,
  members: (householdId?: string) => ['household-members', householdId] as const,
};
```

### 6.2 Custom Query & Mutation Hooks (`src/hooks/queries/`)
Encapsulate async operations in domain-specific hooks:
```tsx
export function useHouseholdsQuery() {
  return useQuery<HouseholdResponse[]>({
    queryKey: householdKeys.all,
    queryFn: () => householdApi().fetchAll(),
  });
}

export function useCreateHouseholdMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHouseholdInput) => householdApi().create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: householdKeys.all });
      eventBus.publish({
        type: 'HOUSEHOLD_MUTATED',
        payload: { householdId: data?.data?.household?.householdId },
      });
    },
  });
}
```

### 6.3 Decoupling Client State vs Server State
- **Server Data**: Managed purely by TanStack Query cache (`households`, `members`, `expenses`, `chores`).
- **Client Workspace Selection**: Managed by React Context (`HouseholdContext.tsx`), syncing `selectedHouseholdId` with `localStorage` (`roommate_active_household_id`).

---

## 7. Form Management & Validation Standards (Zod + React Hook Form)

Every interactive user form must adhere to the production standard:

### 7.1 Schema Definition in `src/schemas/`
```ts
import { z } from 'zod';

export const householdNameSchema = z
  .string()
  .trim()
  .min(2, 'Household name must be at least 2 characters')
  .max(50, 'Household name cannot exceed 50 characters');

export const createHouseholdSchema = z.object({
  name: householdNameSchema,
});
export type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>;
```

### 7.2 RHF Integration with shadcn Primitives
```tsx
const form = useForm<CreateHouseholdInput>({
  resolver: zodResolver(createHouseholdSchema),
  defaultValues: { name: '' },
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Household Name</FormLabel>
          <FormControl>
            <Input placeholder="e.g. The Penthouse" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit" disabled={createMutation.isPending}>
      {createMutation.isPending ? 'Creating...' : 'Create Space'}
    </Button>
  </form>
</Form>
```

### 7.3 Graceful Server-Side Error Mapping
Catch API response errors (such as 400, 404, 409 Conflict) in mutation handlers and surface them directly onto form fields via:
```ts
form.setError('fieldName', { message: serverErrorMessage });
```

---

## 8. Authentication & Security Architecture

### In-Memory Access Token & Session Persistence
- **Token Store**: Access tokens are kept strictly in memory (`src/lib/TokenStore.ts`) to mitigate XSS vulnerabilities.
- **Session Identification**: A UUID session ID generated via `nanoid()` is kept in `sessionStorage` under `roommate_session_id`.
- **Axios Interceptor**: Automatically attaches `Authorization: Bearer <token>` and `X-Session-Id` header to outbound requests. Handles 401 token refresh silently via `/auth/refresh`.

---

## 9. Directory Structure & Naming Conventions

```text
roommate-app/src/
├── api/              # Module-specific API handlers (authApi.ts, householdApi.ts, etc.)
├── components/       # Component tree split by domain + base UI
│   ├── app/          # App header, sidebar, navigation shell
│   │   └── sidebar/  # AppSidebar, SidebarBrand, SidebarNavItem, AppBar, MobileBottomNav
│   ├── chores/       # Domain components for Chores
│   ├── expenses/     # Domain components for Expenses
│   ├── households/   # Domain components for Households (Bento cards, modals, roster drawers)
│   ├── inventory/    # Domain components for Inventory items
│   ├── routing/      # ProtectedRoute, AuthGuard components
│   └── ui/           # Primitive shadcn/ui design components (button, dialog, sheet, form, etc.)
├── contexts/         # React Context providers for local client state (AuthContext, HouseholdContext)
├── hooks/            # Reusable custom React hooks
│   └── queries/      # TanStack Query & Mutation hooks by domain (useHouseholdQueries.ts)
├── layouts/          # Layout wrappers (AuthenticatedLayout, AuthLayout)
├── lib/              # Shared singletons (queryClient.ts, eventBus.ts, TokenStore.ts, utils.ts)
├── pages/            # Page-level route views (Households.tsx, Expenses.tsx, Dashboard.tsx)
├── router/           # React Router route definitions
├── schemas/          # Zod validation schemas by domain (householdSchemas.ts, authSchemas.ts)
├── types/            # TypeScript DTOs, domain interfaces, and event types
└── utils/            # Pure helper functions, date formatters, and getInitials utility
```

### Naming Conventions:
- **Components & Pages**: `PascalCase.tsx` (e.g., `Households.tsx`, `HouseholdCard.tsx`, `CreateHouseholdForm.tsx`).
- **Hooks**: `camelCase.ts` starting with `use` (e.g., `useHousehold.ts`, `useHouseholdQueries.ts`).
- **Schemas**: `camelCaseSchemas.ts` (e.g., `householdSchemas.ts`, `authSchemas.ts`).
- **Utility / Classes**: `PascalCase.ts` or `camelCase.ts` (e.g., `TokenStore.ts`, `eventBus.ts`, `utils.ts`).
- **API Modules**: `camelCaseApi.ts` (e.g., `householdApi.ts`, `choreApi.ts`).

---

## 10. Component Architecture & Coding Style

1. **Named Functional Exports**:
   ```tsx
   export function HouseholdCard({ household }: Props) { ... }
   ```
2. **Children Typing**:
   ```tsx
   export function HouseholdProvider({ children }: Readonly<{ children: ReactNode }>) { ... }
   ```
3. **Safe Class Merging**:
   Always use `cn(...)` utility from `@/utils/utils` for dynamic class concatenation:
   ```tsx
   import { cn } from '@/utils/utils';
   <div className={cn("p-4 border rounded", isActive && "border-primary-container", className)} />
   ```
4. **Initials Fallback**:
   Use `getInitials(name)` helper to generate clean 2-letter uppercase initials for user avatars:
   ```tsx
   import { getInitials } from '@/utils/utils';
   const initials = getInitials(member.user?.name);
   ```
5. **Modular UI Decomposition**:
   Keep pages lean by delegating sub-layout logic to domain components:
   - Bento Grid cards: `HouseholdCard.tsx`
   - Slide-over drawers / Bottom sheets: `MemberRosterDrawer.tsx`
   - Modals: `CreateJoinModal.tsx`, `LeaveHouseholdModal.tsx`, `DeleteHouseholdModal.tsx`
   - Skeleton Loaders: `HouseholdCardSkeleton.tsx`
   - Empty Onboarding States: `HouseholdEmptyState.tsx`
