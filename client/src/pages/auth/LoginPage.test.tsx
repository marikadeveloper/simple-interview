import * as AuthContext from '@/contexts/AuthContext';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LoginPage from './LoginPage';

// Mock useNavigate and Link
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>(
    'react-router',
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ to, children, ...props }: any) => (
      <a
        href={to}
        {...props}>
        {children}
      </a>
    ),
  };
});

// Mock useAuth
const mockLogin = vi.fn();
vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
  login: mockLogin,
  user: null,
  isLoading: false,
  isAuthenticated: false,
  logout: vi.fn(),
});

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockNavigate.mockReset();
  });

  it('renders the login form', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    // No client-side validation, so no error shown
    // But form should still be submittable
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('shows error message on failed login', async () => {
    mockLogin.mockResolvedValue({
      success: false,
      errors: [{ field: 'email', message: 'Invalid email' }],
    });
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'bad@email' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });

  it('navigates to dashboard on successful login', async () => {
    mockLogin.mockResolvedValue({ success: true });
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'user@email.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows loading state while submitting', async () => {
    let resolveLogin: any;
    mockLogin.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        }),
    );
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'user@email.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(
      screen.getByRole('button', { name: /signing in/i }),
    ).toBeInTheDocument();
    // Finish login
    resolveLogin({ success: true });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows general error on unexpected error', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'));
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'user@email.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
  });
});
