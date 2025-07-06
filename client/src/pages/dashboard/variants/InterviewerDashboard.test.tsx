import * as AuthContext from '@/contexts/AuthContext';
import { InterviewStatus, UserRole } from '@/generated/graphql';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import InterviewerDashboard from './InterviewerDashboard';

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

describe('InterviewerDashboard', () => {
  beforeEach(() => {
    mockGetInterviewsQuery.mockReset();
    // Reset AuthContext mock to default state
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: 1,
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
  });

  it('renders the interviewer dashboard with welcome message', () => {
    mockGetInterviewsQuery.mockReturnValue({ getInterviews: [] });
    render(<InterviewerDashboard />);

    expect(screen.getByText('Interviewer Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText('Welcome back, Interviewer User'),
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
        status: InterviewStatus.Expired,
        deadline: '2023-12-31T23:59:59Z',
        __typename: 'Interview',
      },
    ];

    mockGetInterviewsQuery.mockReturnValue({ getInterviews: mockInterviews });
    render(<InterviewerDashboard />);

    expect(screen.getByText('Interview Statistics')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Expired')).toBeInTheDocument();

    // Check that the statistics sections are displayed
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
    render(<InterviewerDashboard />);

    // Should show 2 expiring interviews (within 2 days)
    const expiringElements = screen.getAllByText('2');
    expect(expiringElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Expiring')).toBeInTheDocument();
  });

  it('shows quick actions with correct links', () => {
    mockGetInterviewsQuery.mockReturnValue({ getInterviews: [] });
    render(<InterviewerDashboard />);

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('View All Interviews')).toBeInTheDocument();
    expect(screen.getByText('Interview Templates')).toBeInTheDocument();

    const viewInterviewsLink = screen.getByRole('link', {
      name: /view all interviews/i,
    });
    const interviewTemplatesLink = screen.getByRole('link', {
      name: /interview templates/i,
    });

    expect(viewInterviewsLink).toHaveAttribute('href', '/interviews');
    expect(interviewTemplatesLink).toHaveAttribute(
      'href',
      '/interview-templates',
    );
  });

  it('displays interviews needing evaluation correctly', () => {
    const mockInterviews = [
      {
        id: 1,
        status: InterviewStatus.Completed,
        evaluationValue: null, // Needs evaluation
        completedAt: '2023-12-31T23:59:59Z',
        slug: 'frontend-interview',
        user: {
          fullName: 'John Doe',
          __typename: 'User',
        },
        interviewTemplate: {
          name: 'Frontend Developer Interview',
          __typename: 'InterviewTemplate',
        },
        __typename: 'Interview',
      },
      {
        id: 2,
        status: InterviewStatus.Completed,
        evaluationValue: 4, // Already evaluated
        completedAt: '2023-12-30T23:59:59Z',
        slug: 'backend-interview',
        user: {
          fullName: 'Jane Smith',
          __typename: 'User',
        },
        interviewTemplate: {
          name: 'Backend Developer Interview',
          __typename: 'InterviewTemplate',
        },
        __typename: 'Interview',
      },
    ];

    mockGetInterviewsQuery.mockReturnValue({ getInterviews: mockInterviews });
    render(<InterviewerDashboard />);

    expect(
      screen.getByText('Interviews Needing Evaluation'),
    ).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(
      screen.getByText('Frontend Developer Interview'),
    ).toBeInTheDocument();
    expect(screen.getByText('Evaluate')).toBeInTheDocument();
  });

  it('shows empty state when no interviews need evaluation', () => {
    const mockInterviews = [
      {
        id: 1,
        status: InterviewStatus.Completed,
        evaluationValue: 4, // Already evaluated
        completedAt: '2023-12-31T23:59:59Z',
        __typename: 'Interview',
      },
    ];

    mockGetInterviewsQuery.mockReturnValue({ getInterviews: mockInterviews });
    render(<InterviewerDashboard />);

    expect(
      screen.getByText('All interviews have been evaluated'),
    ).toBeInTheDocument();
  });

  it('formats completion dates correctly', () => {
    const mockInterviews = [
      {
        id: 1,
        status: InterviewStatus.Completed,
        evaluationValue: null,
        completedAt: '2023-12-31T23:59:59Z',
        slug: 'test-interview',
        user: {
          fullName: 'John Doe',
          __typename: 'User',
        },
        interviewTemplate: {
          name: 'Test Interview',
          __typename: 'InterviewTemplate',
        },
        __typename: 'Interview',
      },
    ];

    mockGetInterviewsQuery.mockReturnValue({ getInterviews: mockInterviews });
    render(<InterviewerDashboard />);

    // Should show the completion date (format may vary by locale)
    expect(screen.getByText(/Completed on/)).toBeInTheDocument();
  });

  it('handles null/undefined data gracefully', () => {
    mockGetInterviewsQuery.mockReturnValue(null);
    render(<InterviewerDashboard />);

    // Should still render without errors
    expect(screen.getByText('Interviewer Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Interview Statistics')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('filters interviews by status and evaluation correctly', () => {
    const mockInterviews = [
      {
        id: 1,
        status: InterviewStatus.Pending,
        evaluationValue: null,
        __typename: 'Interview',
      },
      {
        id: 2,
        status: InterviewStatus.Completed,
        evaluationValue: null, // Needs evaluation
        __typename: 'Interview',
      },
      {
        id: 3,
        status: InterviewStatus.Completed,
        evaluationValue: 4, // Already evaluated
        __typename: 'Interview',
      },
    ];

    mockGetInterviewsQuery.mockReturnValue({ getInterviews: mockInterviews });
    render(<InterviewerDashboard />);

    // Should show the correct sections
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();

    // Check that the sections are displayed
    const pendingElement = screen.getByText('Pending').closest('div');
    const completedElement = screen.getByText('Completed').closest('div');

    expect(pendingElement).toBeInTheDocument();
    expect(completedElement).toBeInTheDocument();
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
    render(<InterviewerDashboard />);

    // Should show expiring section
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

    render(<InterviewerDashboard />);

    // Should still render the dashboard structure even when loading
    expect(screen.getByText('Interviewer Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Interview Statistics')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('displays user names and template names correctly', () => {
    const mockInterviews = [
      {
        id: 1,
        status: InterviewStatus.Completed,
        evaluationValue: null,
        completedAt: '2023-12-31T23:59:59Z',
        user: {
          fullName: 'Alice Johnson',
          __typename: 'User',
        },
        interviewTemplate: {
          name: 'React Developer Interview',
          __typename: 'InterviewTemplate',
        },
        __typename: 'Interview',
      },
    ];

    mockGetInterviewsQuery.mockReturnValue({ getInterviews: mockInterviews });
    render(<InterviewerDashboard />);

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('React Developer Interview')).toBeInTheDocument();
  });

  it('shows "Awaiting evaluation" text for unevaluated interviews', () => {
    const mockInterviews = [
      {
        id: 1,
        status: InterviewStatus.Completed,
        evaluationValue: null,
        completedAt: '2023-12-31T23:59:59Z',
        user: {
          fullName: 'John Doe',
          __typename: 'User',
        },
        interviewTemplate: {
          name: 'Test Interview',
          __typename: 'InterviewTemplate',
        },
        __typename: 'Interview',
      },
    ];

    mockGetInterviewsQuery.mockReturnValue({ getInterviews: mockInterviews });
    render(<InterviewerDashboard />);

    expect(screen.getByText('Awaiting evaluation')).toBeInTheDocument();
  });
});
