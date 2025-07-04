import * as AuthContext from '@/contexts/AuthContext';
import { UserRole } from '@/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from './ProfilePage';

// Mock useMeQuery, useUpdateUserNameMutation, useChangePasswordMutation
const mockUpdateUserName = vi.fn();
const mockChangePassword = vi.fn();
const mockMeQuery = vi.fn();

vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useMeQuery: () => [{ data: mockMeQuery() }],
    useUpdateUserNameMutation: () => [null, mockUpdateUserName],
    useChangePasswordMutation: () => [null, mockChangePassword],
    UserRole: actual.UserRole,
  };
});

// Mock useMutationWithToast to just return the mutation function
vi.mock('@/hooks/useMutationWithToast', () => ({
  useMutationWithToast: (_mutation: any) => [
    null,
    (args: any) => _mutation()[1](args),
  ],
}));

// Mock useAuth
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

describe('ProfilePage', () => {
  beforeEach(() => {
    mockUpdateUserName.mockReset();
    mockChangePassword.mockReset();
    mockMeQuery.mockReset();
    // Reset AuthContext mock to default state
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
  });

  it('renders the profile page with forms', () => {
    mockMeQuery.mockReturnValue({ me: { fullName: 'Test User' } });
    render(<ProfilePage />);
    expect(screen.getByText('User Profile')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Old Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
  });

  it('shows loading skeleton if isLoading is true', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    render(<ProfilePage />);
    expect(screen.getByTestId('detailpageskeleton')).toBeInTheDocument();
  });

  it('submits the name form and calls updateUserName', async () => {
    const user = userEvent.setup();
    mockMeQuery.mockReturnValue({ me: { fullName: 'Test User' } });
    mockUpdateUserName.mockResolvedValue({});
    render(<ProfilePage />);

    // clear the input
    await user.clear(screen.getByLabelText('Full Name'));
    await user.type(screen.getByLabelText('Full Name'), 'New Name');
    await user.click(screen.getByRole('button', { name: /update name/i }));

    await waitFor(() => {
      expect(mockUpdateUserName).toHaveBeenCalledWith({
        fullName: 'New Name',
      });
    });
  });

  it('shows validation error if name is too short', async () => {
    const user = userEvent.setup();
    mockMeQuery.mockReturnValue({ me: { fullName: 'Test User' } });
    render(<ProfilePage />);

    await user.clear(screen.getByLabelText('Full Name'));
    await user.type(screen.getByLabelText('Full Name'), 'A');
    await user.click(screen.getByRole('button', { name: /update name/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Name must be at least 2 characters long'),
      ).toBeInTheDocument();
    });
  });

  it('shows validation error if name is too long', async () => {
    const user = userEvent.setup();
    mockMeQuery.mockReturnValue({ me: { fullName: 'Test User' } });
    render(<ProfilePage />);

    const longName = 'A'.repeat(51);
    await user.type(screen.getByLabelText('Full Name'), longName);
    await user.click(screen.getByRole('button', { name: /update name/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Name must be less than 50 characters'),
      ).toBeInTheDocument();
    });
  });

  it('submits the password form and calls changePassword', async () => {
    const user = userEvent.setup();
    mockMeQuery.mockReturnValue({ me: { fullName: 'Test User' } });
    mockChangePassword.mockResolvedValue({});
    render(<ProfilePage />);

    await user.type(screen.getByLabelText('Old Password'), 'oldpass');
    await user.type(screen.getByLabelText('New Password'), 'newpass123');
    await user.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith({
        input: { oldPassword: 'oldpass', newPassword: 'newpass123' },
      });
    });
  });

  it('shows validation error if old password is empty', async () => {
    const user = userEvent.setup();
    mockMeQuery.mockReturnValue({ me: { fullName: 'Test User' } });
    render(<ProfilePage />);

    await user.type(screen.getByLabelText('New Password'), 'newpass123');
    await user.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByText('Old password is required')).toBeInTheDocument();
    });
  });

  it('shows validation error if new password is too short', async () => {
    const user = userEvent.setup();
    mockMeQuery.mockReturnValue({ me: { fullName: 'Test User' } });
    render(<ProfilePage />);

    await user.type(screen.getByLabelText('Old Password'), 'oldpass');
    await user.type(screen.getByLabelText('New Password'), '123');
    await user.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(
        screen.getByText('New password must be at least 6 characters long'),
      ).toBeInTheDocument();
    });
  });

  it('shows validation error if new password is too long', async () => {
    const user = userEvent.setup();
    mockMeQuery.mockReturnValue({ me: { fullName: 'Test User' } });
    render(<ProfilePage />);

    const longPassword = 'A'.repeat(51);
    await user.type(screen.getByLabelText('Old Password'), 'oldpass');
    await user.type(screen.getByLabelText('New Password'), longPassword);
    await user.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(
        screen.getByText('New password must be less than 50 characters'),
      ).toBeInTheDocument();
    });
  });
});
