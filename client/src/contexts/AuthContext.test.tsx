import { UserRole } from '@/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

// Mock the GraphQL mutations and queries
const mockLoginMutation = vi.fn();
const mockLogoutMutation = vi.fn();
const mockMeQuery = vi.fn();

vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useLoginMutation: () => [null, mockLoginMutation],
    useLogoutMutation: () => [null, mockLogoutMutation],
    useMeQuery: () => [{ data: mockMeQuery(), fetching: false }],
    UserRole: actual.UserRole,
  };
});

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

// Test component to access auth context
const TestComponent = () => {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <div data-testid='is-authenticated'>{isAuthenticated.toString()}</div>
      <div data-testid='is-loading'>{isLoading.toString()}</div>
      <div data-testid='user-email'>{user?.email || 'No user'}</div>
      <div data-testid='user-role'>{user?.role || 'No role'}</div>
      <div data-testid='user-name'>{user?.fullName || 'No name'}</div>
      <button
        onClick={() => login('test@example.com', 'password')}
        data-testid='login-btn'>
        Login
      </button>
      <button
        onClick={() => logout()}
        data-testid='logout-btn'>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    mockLoginMutation.mockReset();
    mockLogoutMutation.mockReset();
    mockMeQuery.mockReset();
    mockNavigate.mockReset();
  });

  it('should provide authentication state when user is authenticated', async () => {
    mockMeQuery.mockReturnValue({
      me: {
        id: 1,
        email: 'test@example.com',
        fullName: 'Test User',
        role: UserRole.Admin,
        isActive: true,
        __typename: 'User',
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'test@example.com',
      );
      expect(screen.getByTestId('user-role')).toHaveTextContent('ADMIN');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    });
  });

  it('should provide authentication state when user is not authenticated', async () => {
    mockMeQuery.mockReturnValue({ me: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      expect(screen.getByTestId('user-role')).toHaveTextContent('No role');
      expect(screen.getByTestId('user-name')).toHaveTextContent('No name');
    });
  });

  it('should handle successful login', async () => {
    const user = userEvent.setup();
    mockMeQuery.mockReturnValue({ me: null });
    mockLoginMutation.mockResolvedValue({
      data: {
        login: {
          id: 1,
          email: 'test@example.com',
          fullName: 'Test User',
          role: UserRole.Admin,
          isActive: true,
          __typename: 'User',
        },
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await user.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(mockLoginMutation).toHaveBeenCalledWith({
        input: { email: 'test@example.com', password: 'password' },
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'test@example.com',
      );
      expect(screen.getByTestId('user-role')).toHaveTextContent('ADMIN');
    });
  });

  it('should handle failed login', async () => {
    const user = userEvent.setup();
    mockMeQuery.mockReturnValue({ me: null });
    mockLoginMutation.mockResolvedValue({
      data: { login: null },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await user.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(mockLoginMutation).toHaveBeenCalledWith({
        input: { email: 'test@example.com', password: 'password' },
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    });
  });

  it('should handle login with error', async () => {
    const user = userEvent.setup();
    mockMeQuery.mockReturnValue({ me: null });
    mockLoginMutation.mockResolvedValue({
      data: null,
      error: { message: 'Network error' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await user.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(mockLoginMutation).toHaveBeenCalledWith({
        input: { email: 'test@example.com', password: 'password' },
      });
    });

    // When login fails with an error, the user should remain unauthenticated
    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    });
  });

  it('should handle logout', async () => {
    const user = userEvent.setup();
    mockMeQuery.mockReturnValue({
      me: {
        id: 1,
        email: 'test@example.com',
        fullName: 'Test User',
        role: UserRole.Admin,
        isActive: true,
        __typename: 'User',
      },
    });
    mockLogoutMutation.mockResolvedValue({ data: { logout: true } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    });

    await user.click(screen.getByTestId('logout-btn'));

    await waitFor(() => {
      expect(mockLogoutMutation).toHaveBeenCalledWith({});
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    });
  });

  it('should handle logout with error', async () => {
    const user = userEvent.setup();
    mockMeQuery.mockReturnValue({
      me: {
        id: 1,
        email: 'test@example.com',
        fullName: 'Test User',
        role: UserRole.Admin,
        isActive: true,
        __typename: 'User',
      },
    });
    mockLogoutMutation.mockResolvedValue({
      data: null,
      error: { message: 'Network error' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    });

    await user.click(screen.getByTestId('logout-btn'));

    await waitFor(() => {
      expect(mockLogoutMutation).toHaveBeenCalledWith({});
    });

    // When logout mutation succeeds but returns an error, the user should still be logged out
    // because the await doesn't throw, so setUser(null) and navigate() still execute
    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    });

    // Navigation should still happen when logout mutation succeeds
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should handle different user roles', async () => {
    mockMeQuery.mockReturnValue({
      me: {
        id: 2,
        email: 'candidate@example.com',
        fullName: 'Candidate User',
        role: UserRole.Candidate,
        isActive: true,
        __typename: 'User',
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'candidate@example.com',
      );
      expect(screen.getByTestId('user-role')).toHaveTextContent('CANDIDATE');
      expect(screen.getByTestId('user-name')).toHaveTextContent(
        'Candidate User',
      );
    });
  });

  it('should handle interviewer role', async () => {
    mockMeQuery.mockReturnValue({
      me: {
        id: 3,
        email: 'interviewer@example.com',
        fullName: 'Interviewer User',
        role: UserRole.Interviewer,
        isActive: true,
        __typename: 'User',
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'interviewer@example.com',
      );
      expect(screen.getByTestId('user-role')).toHaveTextContent('INTERVIEWER');
      expect(screen.getByTestId('user-name')).toHaveTextContent(
        'Interviewer User',
      );
    });
  });

  it('should handle inactive user', async () => {
    mockMeQuery.mockReturnValue({
      me: {
        id: 4,
        email: 'inactive@example.com',
        fullName: 'Inactive User',
        role: UserRole.Candidate,
        isActive: false,
        __typename: 'User',
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'inactive@example.com',
      );
      expect(screen.getByTestId('user-role')).toHaveTextContent('CANDIDATE');
      expect(screen.getByTestId('user-name')).toHaveTextContent(
        'Inactive User',
      );
    });
  });

  it('should handle me query with no data', async () => {
    mockMeQuery.mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    });
  });

  it('should handle me query with undefined data', async () => {
    mockMeQuery.mockReturnValue(undefined);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    });
  });
});
