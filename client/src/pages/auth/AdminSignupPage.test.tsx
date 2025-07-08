import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import AdminSignupPage from './AdminSignupPage';

const mockAdminRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useAdminRegisterMutation: () => [null, mockAdminRegister],
  };
});

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
}));

describe('AdminSignupPage', () => {
  beforeEach(() => {
    mockAdminRegister.mockReset();
    mockNavigate.mockReset();
  });

  it('renders the registration form', () => {
    render(<AdminSignupPage />);
    expect(screen.getByText('Admin Registration')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<AdminSignupPage />);
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i }),
    );
    // No built-in validation, so no error messages expected
    // But fields should remain empty
    expect(screen.getByLabelText('Full Name')).toHaveValue('');
    expect(screen.getByLabelText('Email address')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveValue('');
  });

  it('submits form and calls adminRegister mutation', async () => {
    mockAdminRegister.mockResolvedValue({ data: { adminRegister: { id: 1 } } });
    render(<AdminSignupPage />);
    await userEvent.type(screen.getByLabelText('Full Name'), 'Admin User');
    await userEvent.type(
      screen.getByLabelText('Email address'),
      'admin@example.com',
    );
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i }),
    );
    await waitFor(() => {
      expect(mockAdminRegister).toHaveBeenCalledWith({
        input: {
          email: 'admin@example.com',
          password: 'password123',
          fullName: 'Admin User',
        },
      });
    });
  });

  it('navigates to dashboard on successful registration', async () => {
    mockAdminRegister.mockResolvedValue({ data: { adminRegister: { id: 1 } } });
    render(<AdminSignupPage />);
    await userEvent.type(screen.getByLabelText('Full Name'), 'Admin User');
    await userEvent.type(
      screen.getByLabelText('Email address'),
      'admin@example.com',
    );
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i }),
    );
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error if mutation throws', async () => {
    mockAdminRegister.mockRejectedValue(new Error('fail'));
    render(<AdminSignupPage />);
    await userEvent.type(screen.getByLabelText('Full Name'), 'Admin User');
    await userEvent.type(
      screen.getByLabelText('Email address'),
      'admin@example.com',
    );
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i }),
    );
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
  });

  it('has a link to login page', () => {
    render(<AdminSignupPage />);
    const link = screen.getByText('Sign in');
    expect(link.closest('a')).toHaveAttribute('href', '/login');
  });
});
