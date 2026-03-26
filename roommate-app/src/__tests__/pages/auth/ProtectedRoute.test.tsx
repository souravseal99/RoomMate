import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/routing/ProtectedRoute';
import useAuth from '@/hooks/useAuth';

// 1. Mock the module
vi.mock('@/hooks/useAuth');

// 2. Create the typed mock helper
const mockUseAuth = vi.mocked(useAuth);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading state when auth is not ready', () => {
    // Mock State: Loading
    mockUseAuth.mockReturnValue({ 
      ready: false, 
      isAuthenticated: false, 
      accessToken: null,
      email: null,
      name: null,
      setAccessToken: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter initialEntries={['/']}>
        <ProtectedRoute>
          <div>Secret Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Ensure the loading indicator (text or spinner) is present
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    // Ensure secret content is hidden
    expect(screen.queryByText('Secret Content')).not.toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    // Mock State: Ready but Not Logged In
    mockUseAuth.mockReturnValue({ 
      ready: true, 
      isAuthenticated: false, 
      accessToken: null,
      email: null,
      name: null,
      setAccessToken: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route 
            path="/protected" 
            element={
              <ProtectedRoute>
                <div>Secret Content</div>
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Should be on Login Page
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    // Mock State: Ready and Logged In
    mockUseAuth.mockReturnValue({ 
      ready: true, 
      isAuthenticated: true,
      accessToken: 'token-123',
      email: 'test@test.com',
      name: 'Test',
      setAccessToken: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route 
            path="/protected" 
            element={
              <ProtectedRoute>
                <div>Secret Content</div>
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Should see the secret content
    expect(screen.getByText('Secret Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});