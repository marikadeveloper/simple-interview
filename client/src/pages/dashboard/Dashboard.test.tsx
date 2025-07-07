import * as AuthContext from '@/contexts/AuthContext';
import { UserRole } from '@/generated/graphql';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Dashboard from './index';

// Mock the dashboard variants
const mockAdminDashboard = vi.fn();
const mockCandidateDashboard = vi.fn();
const mockInterviewerDashboard = vi.fn();

vi.mock('./variants/AdminDashboard', () => ({
  default: (props: any) => {
    mockAdminDashboard(props);
    return <div data-testid='admin-dashboard'>Admin Dashboard</div>;
  },
}));

vi.mock('./variants/CandidateDashboard', () => ({
  default: (props: any) => {
    mockCandidateDashboard(props);
    return <div data-testid='candidate-dashboard'>Candidate Dashboard</div>;
  },
}));

vi.mock('./variants/InterviewerDashboard', () => ({
  default: (props: any) => {
    mockInterviewerDashboard(props);
    return <div data-testid='interviewer-dashboard'>Interviewer Dashboard</div>;
  },
}));

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  Navigate: ({ to, replace }: { to: string; replace: boolean }) => {
    mockNavigate(to, replace);
    return (
      <div
        data-testid='navigate'
        data-to={to}
        data-replace={replace}>
        Navigate to {to}
      </div>
    );
  },
}));

describe('Dashboard', () => {
  beforeEach(() => {
    mockAdminDashboard.mockClear();
    mockCandidateDashboard.mockClear();
    mockInterviewerDashboard.mockClear();
    mockNavigate.mockClear();
  });

  it('renders admin dashboard for admin users', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 1,
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: UserRole.Admin,
        isActive: true,
        __typename: 'User',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
    expect(mockAdminDashboard).toHaveBeenCalled();
    expect(screen.queryByTestId('candidate-dashboard')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('interviewer-dashboard'),
    ).not.toBeInTheDocument();
  });

  it('renders candidate dashboard for candidate users', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 2,
        email: 'candidate@example.com',
        fullName: 'Candidate User',
        role: UserRole.Candidate,
        isActive: true,
        __typename: 'User',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByTestId('candidate-dashboard')).toBeInTheDocument();
    expect(mockCandidateDashboard).toHaveBeenCalled();
    expect(screen.queryByTestId('admin-dashboard')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('interviewer-dashboard'),
    ).not.toBeInTheDocument();
  });

  it('renders interviewer dashboard for interviewer users', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 3,
        email: 'interviewer@example.com',
        fullName: 'Interviewer User',
        role: UserRole.Interviewer,
        isActive: true,
        __typename: 'User',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByTestId('interviewer-dashboard')).toBeInTheDocument();
    expect(mockInterviewerDashboard).toHaveBeenCalled();
    expect(screen.queryByTestId('admin-dashboard')).not.toBeInTheDocument();
    expect(screen.queryByTestId('candidate-dashboard')).not.toBeInTheDocument();
  });

  it('redirects inactive candidate users to first password change', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 2,
        email: 'candidate@example.com',
        fullName: 'Candidate User',
        role: UserRole.Candidate,
        isActive: false,
        __typename: 'User',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute(
      'data-to',
      '/first-password-change',
    );
    expect(screen.getByTestId('navigate')).toHaveAttribute(
      'data-replace',
      'true',
    );
    expect(mockNavigate).toHaveBeenCalledWith('/first-password-change', true);
    expect(screen.queryByTestId('candidate-dashboard')).not.toBeInTheDocument();
  });

  it('redirects inactive interviewer users to first password change', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 3,
        email: 'interviewer@example.com',
        fullName: 'Interviewer User',
        role: UserRole.Interviewer,
        isActive: false,
        __typename: 'User',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute(
      'data-to',
      '/first-password-change',
    );
    expect(screen.getByTestId('navigate')).toHaveAttribute(
      'data-replace',
      'true',
    );
    expect(mockNavigate).toHaveBeenCalledWith('/first-password-change', true);
    expect(
      screen.queryByTestId('interviewer-dashboard'),
    ).not.toBeInTheDocument();
  });

  it('does not redirect inactive admin users', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 1,
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: UserRole.Admin,
        isActive: false,
        __typename: 'User',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders default dashboard when user is null', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome back,')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-dashboard')).not.toBeInTheDocument();
    expect(screen.queryByTestId('candidate-dashboard')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('interviewer-dashboard'),
    ).not.toBeInTheDocument();
  });

  it('renders default dashboard when user role is not recognized', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 4,
        email: 'unknown@example.com',
        fullName: 'Unknown User',
        role: 'UNKNOWN_ROLE' as UserRole,
        isActive: true,
        __typename: 'User',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome back, Unknown User')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-dashboard')).not.toBeInTheDocument();
    expect(screen.queryByTestId('candidate-dashboard')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('interviewer-dashboard'),
    ).not.toBeInTheDocument();
  });

  it('handles user with empty fullName gracefully', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 5,
        email: 'user@example.com',
        fullName: '',
        role: UserRole.Candidate,
        isActive: true,
        __typename: 'User',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByTestId('candidate-dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });
});
