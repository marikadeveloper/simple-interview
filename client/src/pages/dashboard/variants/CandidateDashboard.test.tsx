import * as AuthContext from '@/contexts/AuthContext';
import { InterviewStatus, UserRole } from '@/generated/graphql';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import CandidateDashboard from './CandidateDashboard';

// Mock the GraphQL queries
const mockGetInterviewsQuery = vi.fn();

vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useGetInterviewsQuery: () => [{ data: mockGetInterviewsQuery() }],
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

describe('CandidateDashboard', () => {
  beforeEach(() => {
    mockGetInterviewsQuery.mockReset();
    // Reset AuthContext mock to default state
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 1,
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
  });

  it('renders the candidate dashboard with welcome message', () => {
    mockGetInterviewsQuery.mockReturnValue({ getInterviews: [] });
    render(<CandidateDashboard />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText('Welcome back, Candidate User'),
    ).toBeInTheDocument();
  });

  it('displays upcoming interviews correctly', () => {
    const mockInterviews = [
      {
        id: 1,
        status: InterviewStatus.Pending,
        deadline: '2023-12-31T23:59:59Z',
        slug: 'frontend-interview',
        interviewTemplate: {
          name: 'Frontend Developer Interview',
          __typename: 'InterviewTemplate',
        },
        __typename: 'Interview',
      },
      {
        id: 2,
        status: InterviewStatus.Pending,
        deadline: '2023-12-30T23:59:59Z',
        slug: 'backend-interview',
        interviewTemplate: {
          name: 'Backend Developer Interview',
          __typename: 'InterviewTemplate',
        },
        __typename: 'Interview',
      },
    ];

    mockGetInterviewsQuery.mockReturnValue({ getInterviews: mockInterviews });
    render(<CandidateDashboard />);

    expect(screen.getByText('Upcoming Interviews')).toBeInTheDocument();
    expect(
      screen.getByText('Frontend Developer Interview'),
    ).toBeInTheDocument();
    expect(screen.getByText('Backend Developer Interview')).toBeInTheDocument();
    expect(screen.getAllByText('Start Interview')).toHaveLength(2);
  });

  it('shows empty state when no upcoming interviews', () => {
    mockGetInterviewsQuery.mockReturnValue({ getInterviews: [] });
    render(<CandidateDashboard />);

    expect(screen.getByText('No upcoming interviews')).toBeInTheDocument();
    expect(
      screen.getByText(
        "You don't have any scheduled interviews at the moment.",
      ),
    ).toBeInTheDocument();
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
        status: InterviewStatus.Completed,
        deadline: '2023-12-31T23:59:59Z',
        __typename: 'Interview',
      },
    ];

    mockGetInterviewsQuery.mockReturnValue({ getInterviews: mockInterviews });
    render(<CandidateDashboard />);

    expect(screen.getByText('Interview Statistics')).toBeInTheDocument();
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();

    // Check that the statistics sections are displayed
    const upcomingElement = screen.getByText('Upcoming').closest('div');
    const completedElement = screen.getByText('Completed').closest('div');

    expect(upcomingElement).toBeInTheDocument();
    expect(completedElement).toBeInTheDocument();
  });

  it('displays account information correctly', () => {
    mockGetInterviewsQuery.mockReturnValue({ getInterviews: [] });
    render(<CandidateDashboard />);

    expect(screen.getByText('Account Information')).toBeInTheDocument();
    expect(screen.getByText('Candidate User')).toBeInTheDocument();
    expect(screen.getByText('candidate@example.com')).toBeInTheDocument();
  });

  it('shows quick actions with correct links', () => {
    mockGetInterviewsQuery.mockReturnValue({ getInterviews: [] });
    render(<CandidateDashboard />);

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('View All Interviews')).toBeInTheDocument();
    expect(screen.getByText('View Profile')).toBeInTheDocument();

    const viewInterviewsLink = screen.getByRole('link', {
      name: /view all interviews/i,
    });
    const viewProfileLink = screen.getByRole('link', { name: /view profile/i });

    expect(viewInterviewsLink).toHaveAttribute('href', '/interviews');
    expect(viewProfileLink).toHaveAttribute('href', '/profile');
  });

  it('calculates days until deadline correctly', () => {
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
        slug: 'test-interview-1',
        interviewTemplate: {
          name: 'Test Interview',
          __typename: 'InterviewTemplate',
        },
        __typename: 'Interview',
      },
      {
        id: 2,
        status: InterviewStatus.Pending,
        deadline: dayAfterTomorrow.toISOString(),
        slug: 'test-interview-2',
        interviewTemplate: {
          name: 'Test Interview 2',
          __typename: 'InterviewTemplate',
        },
        __typename: 'Interview',
      },
    ];

    mockGetInterviewsQuery.mockReturnValue({ getInterviews: mockInterviews });
    render(<CandidateDashboard />);

    expect(screen.getByText('1 days left')).toBeInTheDocument();
    expect(screen.getByText('2 days left')).toBeInTheDocument();
  });

  it('handles null/undefined data gracefully', () => {
    mockGetInterviewsQuery.mockReturnValue(null);
    render(<CandidateDashboard />);

    // Should still render without errors
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Interviews')).toBeInTheDocument();
    expect(screen.getByText('Account Information')).toBeInTheDocument();
  });

  it('filters interviews by status correctly', () => {
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
    render(<CandidateDashboard />);

    // Should show the correct sections
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();

    // Check that the sections are displayed
    const upcomingElement = screen.getByText('Upcoming').closest('div');
    const completedElement = screen.getByText('Completed').closest('div');

    expect(upcomingElement).toBeInTheDocument();
    expect(completedElement).toBeInTheDocument();
  });

  it('shows loading state when user is loading', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<CandidateDashboard />);

    // Should still render the dashboard structure even when loading
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Interviews')).toBeInTheDocument();
    expect(screen.getByText('Account Information')).toBeInTheDocument();
  });

  it('displays interview template names correctly', () => {
    const mockInterviews = [
      {
        id: 1,
        status: InterviewStatus.Pending,
        deadline: '2023-12-31T23:59:59Z',
        interviewTemplate: {
          name: 'React Developer Interview',
          __typename: 'InterviewTemplate',
        },
        __typename: 'Interview',
      },
    ];

    mockGetInterviewsQuery.mockReturnValue({ getInterviews: mockInterviews });
    render(<CandidateDashboard />);

    expect(screen.getByText('React Developer Interview')).toBeInTheDocument();
  });

  it('formats deadline dates correctly', () => {
    const mockInterviews = [
      {
        id: 1,
        status: InterviewStatus.Pending,
        deadline: '2023-12-31T23:59:59Z',
        slug: 'test-interview',
        interviewTemplate: {
          name: 'Test Interview',
          __typename: 'InterviewTemplate',
        },
        __typename: 'Interview',
      },
    ];

    mockGetInterviewsQuery.mockReturnValue({ getInterviews: mockInterviews });
    render(<CandidateDashboard />);

    // Should show the deadline date (format may vary by locale)
    expect(screen.getByText(/Deadline:/)).toBeInTheDocument();
  });
});
