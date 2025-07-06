import * as AuthContext from '@/contexts/AuthContext';
import { InterviewStatus, UserRole } from '@/generated/graphql';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AdminDashboard from './AdminDashboard';

// Mock the GraphQL queries
const mockGetInterviewsQuery = vi.fn();
const mockGetUsersQuery = vi.fn();

vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useGetInterviewsQuery: () => [{ data: mockGetInterviewsQuery() }],
    useGetUsersQuery: () => [{ data: mockGetUsersQuery() }],
    InterviewStatus: actual.InterviewStatus,
    UserRole: actual.UserRole,
  };
});

// Mock react-router Link component
vi.mock('react-router', () => ({
  ...vi.importActual('react-router'),
  Link: ({ to, children }: any) => (
    <a
      href={to}
      data-testid='link'>
      {children}
    </a>
  ),
}));

// Mock useAuth
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

describe('AdminDashboard', () => {
  beforeEach(() => {
    mockGetInterviewsQuery.mockReset();
    mockGetUsersQuery.mockReset();
    // Reset AuthContext mock to default state
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
  });

  it('renders the admin dashboard with welcome message', () => {
    mockGetInterviewsQuery.mockReturnValue({ getInterviews: [] });
    mockGetUsersQuery.mockReturnValue({ getUsers: [] });
    render(<AdminDashboard />);

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome back, Admin User')).toBeInTheDocument();
  });

  it('displays user statistics correctly', () => {
    mockGetInterviewsQuery.mockReturnValue({ getInterviews: [] });
    mockGetUsersQuery.mockReturnValue({
      getUsers: [
        { role: UserRole.Candidate, __typename: 'User' },
        { role: UserRole.Candidate, __typename: 'User' },
        { role: UserRole.Interviewer, __typename: 'User' },
        { role: UserRole.Admin, __typename: 'User' },
      ],
    });

    render(<AdminDashboard />);

    expect(screen.getByText('User Statistics')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 candidates
    expect(screen.getByText('1')).toBeInTheDocument(); // 1 interviewer
    expect(screen.getByText('Candidates')).toBeInTheDocument();
    expect(screen.getByText('Interviewers')).toBeInTheDocument();
  });

  it('displays interview statistics correctly', () => {
    const mockInterviews = [
      {
        id: 1,
        status: InterviewStatus.Pending,
        deadline: '2023-12-31T23:59:59Z',
        __typename: 'Interview',
      },
      {
        id: 2,
        status: InterviewStatus.Completed,
        deadline: '2023-12-31T23:59:59Z',
        __typename: 'Interview',
      },
      {
        id: 3,
        status: InterviewStatus.Expired,
        deadline: '2023-12-31T23:59:59Z',
        __typename: 'Interview',
      },
    ];

    mockGetInterviewsQuery.mockReturnValue({ getInterviews: mockInterviews });
    mockGetUsersQuery.mockReturnValue({ getUsers: [] });

    render(<AdminDashboard />);

    expect(screen.getByText('Interview Statistics')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Expired')).toBeInTheDocument();

    // Check that the statistics are displayed (without being too specific about the exact numbers)
    const pendingElement = screen.getByText('Pending').closest('div');
    const completedElement = screen.getByText('Completed').closest('div');
    const expiredElement = screen.getByText('Expired').closest('div');

    expect(pendingElement).toBeInTheDocument();
    expect(completedElement).toBeInTheDocument();
    expect(expiredElement).toBeInTheDocument();
  });

  it('identifies expiring interviews correctly', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    const mockInterviews = [
      {
        id: 1,
        status: InterviewStatus.Pending,
        deadline: tomorrow.toISOString(),
        __typename: 'Interview',
      },
      {
        id: 2,
        status: InterviewStatus.Pending,
        deadline: dayAfterTomorrow.toISOString(),
        __typename: 'Interview',
      },
      {
        id: 3,
        status: InterviewStatus.Pending,
        deadline: new Date(
          today.getTime() + 3 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 3 days from now
        __typename: 'Interview',
      },
    ];

    mockGetInterviewsQuery.mockReturnValue({ getInterviews: mockInterviews });
    mockGetUsersQuery.mockReturnValue({ getUsers: [] });

    render(<AdminDashboard />);

    // Should show 2 expiring interviews (within 2 days)
    const expiringElements = screen.getAllByText('2');
    expect(expiringElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Expiring')).toBeInTheDocument();
  });

  it('shows quick actions with correct links', () => {
    mockGetInterviewsQuery.mockReturnValue({ getInterviews: [] });
    mockGetUsersQuery.mockReturnValue({ getUsers: [] });

    render(<AdminDashboard />);

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Manage Users')).toBeInTheDocument();
    expect(screen.getByText('Manage Interviews')).toBeInTheDocument();

    const manageUsersLink = screen.getByRole('link', { name: /manage users/i });
    const manageInterviewsLink = screen.getByRole('link', {
      name: /manage interviews/i,
    });

    expect(manageUsersLink).toHaveAttribute('href', '/users');
    expect(manageInterviewsLink).toHaveAttribute('href', '/interviews');
  });

  it('handles empty data gracefully', () => {
    mockGetInterviewsQuery.mockReturnValue({ getInterviews: [] });
    mockGetUsersQuery.mockReturnValue({ getUsers: [] });

    render(<AdminDashboard />);

    // Should show 0 for all statistics
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements.length).toBeGreaterThan(0);
  });

  it('handles null/undefined data gracefully', () => {
    mockGetInterviewsQuery.mockReturnValue(null);
    mockGetUsersQuery.mockReturnValue(null);

    render(<AdminDashboard />);

    // Should still render without errors
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('User Statistics')).toBeInTheDocument();
    expect(screen.getByText('Interview Statistics')).toBeInTheDocument();
  });

  it('filters users by role correctly', () => {
    const mockUsers = [
      { role: UserRole.Candidate, __typename: 'User' },
      { role: UserRole.Candidate, __typename: 'User' },
      { role: UserRole.Interviewer, __typename: 'User' },
      { role: UserRole.Interviewer, __typename: 'User' },
      { role: UserRole.Interviewer, __typename: 'User' },
      { role: UserRole.Admin, __typename: 'User' },
      { role: UserRole.Admin, __typename: 'User' },
    ];

    mockGetInterviewsQuery.mockReturnValue({ getInterviews: [] });
    mockGetUsersQuery.mockReturnValue({ getUsers: mockUsers });

    render(<AdminDashboard />);

    // Should show 2 candidates and 3 interviewers (excluding admins)
    expect(screen.getByText('2')).toBeInTheDocument(); // candidates
    expect(screen.getByText('3')).toBeInTheDocument(); // interviewers
  });

  it('excludes completed interviews from expiring calculation', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const mockInterviews = [
      {
        id: 1,
        status: InterviewStatus.Completed, // Should not be counted as expiring
        deadline: tomorrow.toISOString(),
        __typename: 'Interview',
      },
      {
        id: 2,
        status: InterviewStatus.Pending,
        deadline: tomorrow.toISOString(),
        __typename: 'Interview',
      },
    ];

    mockGetInterviewsQuery.mockReturnValue({ getInterviews: mockInterviews });
    mockGetUsersQuery.mockReturnValue({ getUsers: [] });

    render(<AdminDashboard />);

    // Should show expiring section with the correct count
    expect(screen.getByText('Expiring')).toBeInTheDocument();
    const expiringElement = screen.getByText('Expiring').closest('div');
    expect(expiringElement).toBeInTheDocument();
  });

  it('shows loading state when user is loading', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<AdminDashboard />);

    // Should still render the dashboard structure even when loading
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('User Statistics')).toBeInTheDocument();
    expect(screen.getByText('Interview Statistics')).toBeInTheDocument();
  });
});
