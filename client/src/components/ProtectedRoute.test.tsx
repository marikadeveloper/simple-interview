import { describe, expect, it, vi } from 'vitest';
import { UserRole } from '../generated/graphql';
import { render, screen } from '../test/utils';
import { ProtectedRoute } from './ProtectedRoute';

// Mock the useAuth hook but keep AuthProvider
vi.mock('../contexts/AuthContext', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

const mockUseAuth = vi.mocked(await import('../contexts/AuthContext')).useAuth;

describe('ProtectedRoute', () => {
  const TestContent = () => <div>Protected Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading skeleton when authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <TestContent />
      </ProtectedRoute>,
    );

    // Should show skeleton instead of content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    // The skeleton component should be rendered (check for its presence)
    expect(
      document.querySelector('[data-slot="skeleton"]'),
    ).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <TestContent />
      </ProtectedRoute>,
    );

    // Should not show protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    // Should redirect to login (Navigate component behavior)
    expect(window.location.pathname).toBe('/login');
  });

  it('should show content when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
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

    render(
      <ProtectedRoute>
        <TestContent />
      </ProtectedRoute>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show content when user has required role', () => {
    mockUseAuth.mockReturnValue({
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

    render(
      <ProtectedRoute allowedUserRoles={[UserRole.Admin, UserRole.Interviewer]}>
        <TestContent />
      </ProtectedRoute>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect when user does not have required role', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        email: 'test@example.com',
        fullName: 'Test User',
        role: UserRole.Candidate,
        isActive: true,
        __typename: 'User',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute allowedUserRoles={[UserRole.Admin, UserRole.Interviewer]}>
        <TestContent />
      </ProtectedRoute>,
    );

    // Should not show protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    // Should redirect to login
    expect(window.location.pathname).toBe('/login');
  });

  it('should show content when no specific roles are required', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        email: 'test@example.com',
        fullName: 'Test User',
        role: UserRole.Candidate,
        isActive: true,
        __typename: 'User',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <TestContent />
      </ProtectedRoute>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
