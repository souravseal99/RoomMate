---
name: roommate-navigation-and-theming
description: Best practices, architecture patterns, and styling guidelines for the RoomMate dual-mode navigation shell (desktop sidebar & mobile bottom nav) and TailwindCSS v4 native multi-theme engine.
---

# RoomMate Navigation & Tailwind v4 Theming Guidelines

This skill documents the architecture, component decomposition, design token usage, and Tailwind v4 CSS-first multi-theme engine developed for the RoomMate application.

---

## 1. Tailwind v4 Native Multi-Theme System

Instead of dynamic JS inline style injection (which bypasses Tailwind JIT and causes FOUC), the application uses **CSS-first, class-scoped custom property palettes** combined with Tailwind v4 `@theme inline`.

### 1.1 Architecture & Token Flow

1. **`@theme inline` Block in `App.css`**:
   Maps semantic Tailwind utility names to CSS custom properties using `var()`:
   ```css
   @theme inline {
     --font-sans: var(--theme-font);
     --color-background: var(--background);
     --color-foreground: var(--foreground);
     --color-primary: var(--primary);
     --color-sidebar: var(--sidebar);
     --color-sidebar-foreground: var(--sidebar-foreground);
     --color-sidebar-primary: var(--sidebar-primary);
     --color-sidebar-accent: var(--sidebar-accent);
     --color-sidebar-border: var(--sidebar-border);
     --color-sidebar-muted: var(--sidebar-muted);
     /* ... other design system tokens */
   }
   ```

2. **Scoped Theme Blocks in `App.css`**:
   - `:root`: Default theme (*Physical Whiteboard*)
   - `.theme-ocean`: *Ocean Depth* theme
   - `.theme-forest`: *Forest Grove* theme

   ```css
   :root {
     --theme-font: 'Plus Jakarta Sans', sans-serif;
     --background: #fff8f6;
     --foreground: #222222;
     --primary: #a43e00;
     --sidebar: #222222;
     --sidebar-foreground: #FAF3E1;
     --sidebar-primary: #ff6d1f;
     --sidebar-accent: #333333;
     --sidebar-border: #404040;
     --sidebar-muted: #A3A3A3;
   }

   .theme-ocean {
     --theme-font: 'Inter', sans-serif;
     --background: #f0f7ff;
     --foreground: #0f172a;
     --primary: #0284c7;
     --sidebar: #0f172a;
     --sidebar-foreground: #f8fafc;
     --sidebar-primary: #0284c7;
     --sidebar-accent: #1e293b;
     --sidebar-border: #334155;
     --sidebar-muted: #94a3b8;
   }
   ```

3. **Font Preloading in `index.html`**:
   All theme fonts (`Plus Jakarta Sans`, `Inter`, `DM Sans`, `Playfair Display`) are preloaded in `index.html`. Font family changes dynamically via `--theme-font`.

4. **Lightweight `ThemeContext` (`contexts/ThemeContext.tsx`)**:
   - Reads/persists active theme in `localStorage` under `roommate_theme`.
   - Toggles CSS classes on `document.documentElement` (`<html class="theme-ocean">`).
   - Exports `useTheme()` hook with `{ themeName, setTheme, availableThemes }`.

### 1.2 Adding a New Theme

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

## 2. Responsive Navigation Shell Architecture

The app uses a dual-mode navigation pattern derived from Stitch UI designs:
- **Desktop (`md:` breakpoint and above)**: Fixed left rail sidebar (`AppSidebar.tsx`).
- **Mobile (`< md` breakpoint)**: Sticky top bar (`AppBar.tsx`) + fixed bottom tab bar (`MobileBottomNav.tsx`).

### 2.1 Component Breakdown (`components/app/sidebar/`)

| Component | Viewport | Purpose |
| :--- | :--- | :--- |
| **`AppSidebar.tsx`** | Desktop (`hidden md:flex`) | Pure composition assembler for the left-rail sidebar shell. |
| **`SidebarBrand.tsx`** | Desktop | App branding header: icon badge, title, uppercase tagline. |
| **`SidebarNavItem.tsx`** | Desktop | Reusable single link with active pill, icon resolution, and optional badge count. Uses React Router `<Link>`. |
| **`SidebarNavGroup.tsx`** | Desktop | Categorized sections (`Main`, `Manage`) with small uppercase section headers. |
| **`SidebarQuickSettle.tsx`**| Desktop & Shared | Prominent full-width action button navigating directly to settle expenses. |
| **`SidebarUserProfile.tsx`**| Desktop | User footer with initials avatar, status indicator, and a popover dropdown including the **Theme Selector Sub-menu**. |
| **`AppBar.tsx`** | Mobile (`md:hidden`) | Sticky top header with route-based title and user avatar trigger for profile & theme menu. |
| **`MobileBottomNav.tsx`** | Mobile (`md:hidden`) | Fixed 5-tab bottom navigation with scaled active pills. |

### 2.2 Layout Integration (`layouts/AuthenticatedLayout.tsx`)

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

## 3. Strict Coding Conventions

1. **Zero Hardcoded Hex in JSX**:
   - Always use semantic utility classes (`bg-sidebar`, `text-sidebar-foreground`, `bg-sidebar-primary`, `text-sidebar-muted`, `bg-surface-container-high`).
2. **SPA Navigation**:
   - Always use `react-router-dom` `<Link to="...">` rather than raw `<a href="...">` to prevent full page reloads.
3. **Safe Dynamic Icon Resolution**:
   - Use helper functions mapping icon names to Lucide / Tabler icons with fallback (`Icons.Square` or similar).
4. **Initials Fallback**:
   - Use multi-word splitting helper `getInitials(name)` to generate clean 2-letter uppercase initials for avatars.
