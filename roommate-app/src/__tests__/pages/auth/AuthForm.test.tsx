import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthForm } from '@/components/auth/AuthForm';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AuthForm component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  it('renders name input when mode is register', () => {
    render(<AuthForm mode="register" onSubmit={() => {}} />);

    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty login form', async () => {
    render(<AuthForm mode="login" onSubmit={() => {}} />);

    const submitBtn = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitBtn);

    expect(await screen.findByText('Invalid email')).toBeInTheDocument();
    expect(await screen.findByText('Min 8 characters')).toBeInTheDocument();
  });

  it('calls onSubmit with correct values for register mode', async () => {
    const mockSubmit = vi.fn();
    render(<AuthForm mode="register" onSubmit={mockSubmit} />);

    const name = screen.getByPlaceholderText('Your name');
    const email = screen.getByPlaceholderText('your@email.com');
    const password = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /create account/i });

    await user.type(name, 'Alice');
    await user.type(email, 'alice@example.com');
    await user.type(password, 'password123');
    await user.click(submitBtn);
    
    expect(mockSubmit).toHaveBeenCalled();
    const firstCallFirstArg = mockSubmit.mock.calls[0][0];
    expect(firstCallFirstArg).toEqual({ name: 'Alice', email: 'alice@example.com', password: 'password123' });
  });

  it('navigates to login when clicking Sign In link from register mode', async () => {
    render(<AuthForm mode="register" onSubmit={() => {}} />);

    const signInBtn = screen.getByRole('button', { name: /sign in/i });
    await user.click(signInBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to register when clicking Sign Up link from login mode', async () => {
    render(<AuthForm mode="login" onSubmit={() => {}} />);

    const signUpBtn = screen.getByRole('button', { name: /sign up/i });
    await user.click(signUpBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});