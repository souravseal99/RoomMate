import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RegisterPage from '@/pages/auth/RegisterPage';
import { AuthProvider } from '@/contexts/AuthContext';
import * as authApi from '@/api/authApi';
import TokenStore from '@/lib/TokenStore';

vi.mock('@/api/authApi', () => ({
  registerUser: vi.fn(),
  loginUser: vi.fn(),
}));


vi.mock('@/lib/TokenStore', () => ({
  default: {
    getSessionId: vi.fn(),
    setToken: vi.fn(),
    clearSession: vi.fn(),
    hasSession: vi.fn(),
  },
}));


const mockedRegisterUser = vi.mocked(authApi.registerUser);
const mockedGetSessionId = vi.mocked(TokenStore.getSessionId);
const mockedHasSession = vi.mocked(TokenStore.hasSession);


const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

describe('RegisterPage', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
    
   
    mockedGetSessionId.mockReturnValue('test-session-id');
    mockedHasSession.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderRegisterPage = (initialRoute = '/register') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  describe('Component Rendering', () => {
    it('should render registration form', () => {
      renderRegisterPage();

      expect(screen.getByText('Create an Account')).toBeInTheDocument();
      expect(screen.getByText('Enter your details to get started.')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should render link to login page', () => {
      renderRegisterPage();

      expect(screen.getByText('Already have an account?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });


  describe('Session Initialization', () => {
    it('should ensure session ID exists before registration attempt', async () => {
      mockedRegisterUser.mockResolvedValue({
        data: {
          accessToken: 'test-token-123',
          email: 'newuser@example.com',
          name: 'New User',
        },
      });

      renderRegisterPage();

      const nameInput = screen.getByPlaceholderText('Your name');
      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'New User');
      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(TokenStore.getSessionId).toHaveBeenCalled();
      });
    });
  });


  describe('Successful Registration Flow', () => {
    it('should call registerUser API with all form values', async () => {
      mockedRegisterUser.mockResolvedValue({
        data: {
          accessToken: 'test-token-123',
          email: 'newuser@example.com',
          name: 'New User',
        },
      });

      renderRegisterPage();

      const nameInput = screen.getByPlaceholderText('Your name');
      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'New User');
      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(authApi.registerUser).toHaveBeenCalledWith({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
        });
      });
    });

    it('should navigate to /dashboard after successful registration', async () => {
      mockedRegisterUser.mockResolvedValue({
        data: {
          accessToken: 'test-token-123',
          email: 'newuser@example.com',
          name: 'New User',
        },
      });

      renderRegisterPage();

      const nameInput = screen.getByPlaceholderText('Your name');
      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'New User');
      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      });
    });
  });


  describe('Failed Registration Flow', () => {
    it('should handle API error with message and show alert', async () => {
      mockedRegisterUser.mockRejectedValue({
        response: {
          data: {
            message: 'Email already exists',
          },
        },
      });

      renderRegisterPage();

      const nameInput = screen.getByPlaceholderText('Your name');
      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'Existing User');
      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Email already exists');
      });
    });

    it('should handle network error gracefully', async () => {
      mockedRegisterUser.mockRejectedValue(new Error('Network error'));

      renderRegisterPage();

      const nameInput = screen.getByPlaceholderText('Your name');
      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Registration failed');
      });
    });

    it('should NOT navigate to dashboard when registration fails', async () => {
      mockedRegisterUser.mockRejectedValue({
        response: {
          data: {
            message: 'Email already exists',
          },
        },
      });

      renderRegisterPage();

      const nameInput = screen.getByPlaceholderText('Your name');
      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalled();
      });

   
      expect(screen.getByText('Create an Account')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument();
    });
  });


  describe('Token Handling Edge Cases', () => {
    it('should handle missing accessToken in response', async () => {
      mockedRegisterUser.mockResolvedValue({
        data: {
          email: 'newuser@example.com',
          name: 'New User',
          // accessToken is missing
        },
      });

      renderRegisterPage();

      const nameInput = screen.getByPlaceholderText('Your name');
      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'New User');
      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(authApi.registerUser).toHaveBeenCalled();
      });

      expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument();
    });

    it('should handle empty string token', async () => {
      mockedRegisterUser.mockResolvedValue({
        data: {
          accessToken: '',
          email: 'newuser@example.com',
          name: 'New User',
        },
      });

      renderRegisterPage();

      const nameInput = screen.getByPlaceholderText('Your name');
      const emailInput = screen.getByPlaceholderText('your@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'New User');
      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(authApi.registerUser).toHaveBeenCalled();
      });

      expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for all fields when empty', async () => {
      renderRegisterPage();

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name required')).toBeInTheDocument();
        expect(screen.getByText('Invalid email')).toBeInTheDocument();
        expect(screen.getByText('Min 8 characters')).toBeInTheDocument();
      });

      // Should not call API
      expect(authApi.registerUser).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to login page when clicking Sign In link', async () => {
      renderRegisterPage();

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });
  });
});
