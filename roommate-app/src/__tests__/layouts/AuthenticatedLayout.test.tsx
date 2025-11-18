import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

vi.mock('@/components/app/AppSidebar', () => ({ AppSidebar: () => <div>AppSidebarStub</div> }));
vi.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: ReactNode }) => <div data-testid="sidebar-provider">{children}</div>,
  SidebarTrigger: (props: ButtonHTMLAttributes<HTMLButtonElement>) => <button data-testid="sidebar-trigger" {...props} />,
}));

describe('AuthenticatedLayout', () => {
  test('renders AppSidebar, SidebarTrigger and Outlet children', () => {
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/" element={<AuthenticatedLayout />}>
            <Route path="protected" element={<div>ProtectedContent</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // children rendered via Outlet
    expect(screen.getByText('ProtectedContent')).toBeInTheDocument();

    // sidebar stub present
    expect(screen.getByText('AppSidebarStub')).toBeInTheDocument();

    // sidebar trigger present
    expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument();

    // provider wrapper present
    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
  });
});
