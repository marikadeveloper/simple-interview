import * as AuthContext from '@/contexts/AuthContext';
import { UserRole } from '@/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CreateUserDialog } from './CreateUserDialog';

// Mock mutation
const mockUserRegister = vi.fn();

vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useUserRegisterMutation: () => [null, mockUserRegister],
    UserRole: actual.UserRole,
  };
});

// Mock useMutationWithToast to just return the mutation function
vi.mock('@/hooks/useMutationWithToast', () => ({
  useMutationWithToast: (_mutation: any) => [null, mockUserRegister],
}));

// Default AuthContext mock
const defaultUser = {
  id: 1,
  email: 'admin@example.com',
  fullName: 'Admin User',
  role: UserRole.Admin,
  isActive: true,
  __typename: 'User' as const,
};

vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
  user: defaultUser,
  isLoading: false,
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
});

describe('CreateUserDialog', () => {
  beforeEach(() => {
    mockUserRegister.mockReset();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: defaultUser,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('renders dialog trigger and opens dialog', async () => {
    render(<CreateUserDialog />);
    const trigger = screen.getByRole('button', { name: /add user/i });
    expect(trigger).toBeInTheDocument();
    await userEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('New User')).toBeInTheDocument();
    expect(
      screen.getByText('Create a user account for the application.'),
    ).toBeInTheDocument();
  });

  it('shows role radio group for admin', async () => {
    render(<CreateUserDialog />);
    await userEvent.click(screen.getByRole('button', { name: /add user/i }));
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByLabelText('Interviewer')).toBeInTheDocument();
    expect(screen.getByLabelText('Candidate')).toBeInTheDocument();
  });

  it('does not show role radio group for interviewer', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { ...defaultUser, role: UserRole.Interviewer },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    render(<CreateUserDialog />);
    await userEvent.click(
      screen.getByRole('button', { name: /add candidate/i }),
    );
    expect(screen.queryByText('Role')).not.toBeInTheDocument();
    expect(screen.getByText('New Candidate')).toBeInTheDocument();
    expect(
      screen.getByText('Create a candidate account for the application.'),
    ).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<CreateUserDialog />);
    await userEvent.click(screen.getByRole('button', { name: /add user/i }));
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(await screen.findAllByText(/required/i)).not.toHaveLength(0);
  });

  it('validates email format', async () => {
    render(<CreateUserDialog />);
    await userEvent.click(screen.getByRole('button', { name: /add user/i }));
    await userEvent.type(
      screen.getByPlaceholderText('jane@doe.it'),
      'not-an-email',
    );
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });

  it('validates full name length', async () => {
    render(<CreateUserDialog />);
    await userEvent.click(screen.getByRole('button', { name: /add user/i }));
    await userEvent.type(screen.getByLabelText('Full Name'), 'A');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(
      await screen.findByText(/at least 2 character/i),
    ).toBeInTheDocument();
  });

  it('submits form and calls userRegister mutation', async () => {
    mockUserRegister.mockResolvedValue({ data: { userRegister: { id: 2 } } });
    render(<CreateUserDialog />);
    await userEvent.click(screen.getByRole('button', { name: /add user/i }));
    await userEvent.type(
      screen.getByPlaceholderText('jane@doe.it'),
      'newuser@example.com',
    );
    await userEvent.type(screen.getByPlaceholderText('Jane Doe'), 'New User');
    await userEvent.click(screen.getByLabelText('Interviewer'));
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(mockUserRegister).toHaveBeenCalledWith({
        input: {
          email: 'newuser@example.com',
          fullName: 'New User',
          role: UserRole.Interviewer,
        },
      });
    });
  });

  it('closes dialog on successful user creation', async () => {
    mockUserRegister.mockResolvedValue({ data: { userRegister: { id: 2 } } });
    render(<CreateUserDialog />);
    await userEvent.click(screen.getByRole('button', { name: /add user/i }));
    await userEvent.type(
      screen.getByPlaceholderText('jane@doe.it'),
      'newuser@example.com',
    );
    await userEvent.type(screen.getByPlaceholderText('Jane Doe'), 'New User');
    await userEvent.click(screen.getByLabelText('Interviewer'));
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
