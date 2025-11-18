import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';
import LoginPage from '@/pages/auth/LoginPage';
import { AuthProvider } from '@/contexts/AuthContext';
import * as authApi from '@/api/authApi';
import TokenStore from '@/lib/TokenStore';

// Mock the API module
vi.mock('@/api/authApi', () => ({
  loginUser: vi.fn(),
}));

// Mock TokenStore
vi.mock('@/lib/TokenStore', () => ({
  default: {
    getSessionId: vi.fn(),
    setToken: vi.fn(),
    clearSession: vi.fn(),
    hasSession: vi.fn(),
  },
}));

// typed mocks
const mockedLoginUser = vi.mocked(authApi.loginUser);
const mockedGetSessionId = vi.mocked(TokenStore.getSessionId);
const mockedHasSession = vi.mocked(TokenStore.hasSession);

// Mock alert
const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

describe('LoginPage', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
    
    // Default mock implementations
    mockedGetSessionId.mockReturnValue('test-session-id');
    mockedHasSession.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginPage = (initialRoute = '/login') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
            <Route path="/register" element={<div>Register Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  // ==================== RENDERING TESTS ====================
  describe('Component Rendering', () => {
    it('should render login form', () => {
      renderLoginPage();

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Enter your details to sign in.')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render link to register page', () => {
      renderLoginPage();

      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });
  });

  // ==================== SESSION INITIALIZATION TESTS ====================
  describe('Session Initialization', () => {
    it('should ensure session ID exists before login attempt', async () => {
      mockedLoginUser.mockResolvedValue({
        data: {
          accessToken: 'test-token-123',
          email: 'test@example.com',
          name: 'Test User',
        },
      });

      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(TokenStore.getSessionId).toHaveBeenCalled();
      });
    });
  });

  // ==================== SUCCESSFUL LOGIN TESTS ====================
  describe('Successful Login Flow', () => {
    it('should call loginUser API with form values', async () => {
      mockedLoginUser.mockResolvedValue({
        data: {
          accessToken: 'test-token-123',
          email: 'test@example.com',
          name: 'Test User',
        },
      });

      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(authApi.loginUser).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should navigate to /dashboard after successful login', async () => {
      mockedLoginUser.mockResolvedValue({
        data: {
          accessToken: 'test-token-123',
          email: 'test@example.com',
          name: 'Test User',
        },
      });

      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      });
    });
  });

  // ==================== FAILED LOGIN TESTS ====================
  describe('Failed Login Flow', () => {
    it('should handle API error with message and show alert', async () => {
      mockedLoginUser.mockRejectedValue({
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      });

      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Invalid credentials');
      });
    });

    it('should handle network error gracefully', async () => {
      mockedLoginUser.mockRejectedValue(new Error('Network error'));

      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Login failed');
      });
    });

    it('should NOT navigate to dashboard when login fails', async () => {
      mockedLoginUser.mockRejectedValue({
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      });

      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalled();
      });

      // Should still be on login page
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument();
    });
  });

  // ==================== TOKEN HANDLING EDGE CASES ====================
  describe('Token Handling Edge Cases', () => {
    it('should handle missing accessToken in response', async () => {
      mockedLoginUser.mockResolvedValue({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          // accessToken is missing
        },
      });

      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(authApi.loginUser).toHaveBeenCalled();
      });

      // Should not navigate since no token
      expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument();
    });

    it('should handle empty string token', async () => {
      mockedLoginUser.mockResolvedValue({
        data: {
          accessToken: '',
          email: 'test@example.com',
          name: 'Test User',
        },
      });

      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(authApi.loginUser).toHaveBeenCalled();
      });

      // Should not navigate with empty token
      expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument();
    });
  });

  // ==================== FORM VALIDATION TESTS ====================
  describe('Form Validation', () => {
    it('should show validation errors for both fields when empty', async () => {
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      expect(await screen.findByText('Invalid email')).toBeInTheDocument();
      expect(await screen.findByText('Min 8 characters')).toBeInTheDocument();

      // Should not call API
      expect(authApi.loginUser).not.toHaveBeenCalled();
    });
  });

  // ==================== NAVIGATION TESTS ====================
  describe('Navigation', () => {
    it('should navigate to register page when clicking Sign Up link', async () => {
      renderLoginPage();

      const signUpButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(signUpButton);

      await waitFor(() => {
        expect(screen.getByText('Register Page')).toBeInTheDocument();
      });
    });
  });
});
