import { vi, describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet } from 'react-router-dom';
import AppRouter from '@/router';
import useAuth from '@/hooks/useAuth'; // Import the real hook

// 1. Mock the module
vi.mock('@/hooks/useAuth');

const useAuthMock = vi.mocked(useAuth);

// Mock pages & layouts (Keep this exactly as you had it - it's perfect)
vi.mock('@/pages/auth/LoginPage', () => ({ default: () => <div>LoginPage</div> }));
vi.mock('@/pages/auth/RegisterPage', () => ({ default: () => <div>RegisterPage</div> }));
vi.mock('@/pages/dashboard/DummyDashboard', () => ({ default: () => <div>Dashboard</div> }));
vi.mock('@/pages/households/Households', () => ({ default: () => <div>Households</div> }));
vi.mock('@/pages/expenses/Expenses', () => ({ default: () => <div>Expenses</div> }));
vi.mock('@/pages/ErrorPage', () => ({ default: () => <div>ErrorPage</div> }));

vi.mock('@/layouts/UnauthenticatedLayout', () => ({
  default: () => <div data-testid="unauth-layout"><Outlet /></div>,
}));

vi.mock('@/layouts/AuthenticatedLayout', () => ({
  default: () => <div data-testid="auth-layout"><Outlet /></div>,
}));

describe('AppRouter', () => {
  // ... (Your setup/teardown code is fine)

  test('root path redirects to /login', () => {
    // Clean syntax
    useAuthMock.mockReturnValue({ 
      ready: true, 
      isAuthenticated: false,
      accessToken: null,
      email: null,
      name: null,
      setAccessToken: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(), 
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(screen.getByText('LoginPage')).toBeInTheDocument();
  });

  // ... (rest of tests)
});