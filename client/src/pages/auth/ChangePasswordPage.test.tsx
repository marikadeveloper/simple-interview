import * as AuthContext from '@/contexts/AuthContext';
import { UserRole } from '@/generated/graphql';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ChangePasswordPage from './ChangePasswordPage';

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
    useParams: () => ({ token: 'test-token' }),
  };
});

// Mock useForgotPasswordChangeMutation
const mockForgotPasswordChange = vi.fn();
vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useForgotPasswordChangeMutation: () => [null, mockForgotPasswordChange],
    UserRole: actual.UserRole,
  };
});

// Mock useAuth (for completeness, but not used for password change)
vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
  user: {
    id: 1,
    email: 'test@example.com',
    fullName: 'Test User',
    role: UserRole.Admin,
    isActive: true,
    __typename: 'User',
  },
  isLoading: false,
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
});

describe('ChangePasswordPage', () => {
  beforeEach(() => {
    mockForgotPasswordChange.mockReset();
    mockNavigate.mockReset();
  });

  it('renders the change password form', () => {
    render(<ChangePasswordPage />);
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('submits the form and calls forgotPasswordChange', async () => {
    mockForgotPasswordChange.mockResolvedValue({
      data: { forgotPasswordChange: { id: 1 } },
    });
    render(<ChangePasswordPage />);
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(mockForgotPasswordChange).toHaveBeenCalledWith({
        input: { newPassword: 'newpass123', token: 'test-token' },
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error message on unexpected error', async () => {
    mockForgotPasswordChange.mockRejectedValue(new Error('Network error'));
    render(<ChangePasswordPage />);
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
  });

  it('shows validation error if passwords do not match', async () => {
    render(<ChangePasswordPage />);
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'differentpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    // Wait for the error message to appear in a <p data-slot="form-message">
    await waitFor(() => {
      const errorMessages = Array.from(
        document.querySelectorAll('p[data-slot="form-message"]'),
      );
      expect(
        errorMessages.some((el) =>
          el.textContent?.toLowerCase().includes('must match'),
        ),
      ).toBe(true);
    });
  });
});
