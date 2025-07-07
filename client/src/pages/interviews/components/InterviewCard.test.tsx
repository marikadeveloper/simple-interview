import {
  InterviewListItemFragment,
  InterviewStatus,
  UserRole,
} from '@/generated/graphql';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { InterviewCard } from './InterviewCard';

// Mock react-router Link component
vi.mock('react-router', () => ({
  Link: ({ children, to, className }: any) => (
    <a
      href={to}
      className={className}
      data-testid='interview-link'>
      {children}
    </a>
  ),
}));

describe('InterviewCard', () => {
  let mockInterview: InterviewListItemFragment = {
    id: 1,
    interviewTemplate: {
      id: 1,
      name: 'JavaScript Fundamentals',
      description: 'Test your JavaScript knowledge',
      updatedAt: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      slug: 'javascript-fundamentals',
      tags: null,
      __typename: 'InterviewTemplate',
    },
    user: {
      id: 1,
      email: 'test@example.com',
      fullName: 'Test User',
      role: UserRole.Candidate,
      isActive: true,
      __typename: 'User',
    },
    interviewer: {
      id: 2,
      email: 'interviewer@example.com',
      fullName: 'Interviewer User',
      role: UserRole.Interviewer,
      isActive: true,
      __typename: 'User',
    },
    deadline: '2023-12-31T23:59:59Z',
    status: InterviewStatus.Pending,
    evaluationValue: null,
    slug: 'interview-1',
    completedAt: null,
    __typename: 'Interview',
  };

  it('renders interview card with basic information', () => {
    render(<InterviewCard interview={mockInterview} />);

    expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
    expect(
      screen.getByText('Test your JavaScript knowledge'),
    ).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('shows correct status label for Pending status', () => {
    render(<InterviewCard interview={mockInterview} />);

    const statusLabel = screen.getByText('Pending');
    expect(statusLabel).toHaveClass('bg-yellow-500/50');
  });

  it('shows correct status label for Completed status', () => {
    const completedInterview = {
      ...mockInterview,
      status: InterviewStatus.Completed,
    };

    render(<InterviewCard interview={completedInterview} />);

    const statusLabel = screen.getByText('Completed');
    expect(statusLabel).toHaveClass('bg-green-500/50');
  });

  it('shows deadline information for non-completed interviews', () => {
    render(<InterviewCard interview={mockInterview} />);

    // set interview deadline to 10 days from now
    mockInterview.deadline = new Date(
      new Date().getTime() + 10 * 24 * 60 * 60 * 1000,
    ).toISOString();

    render(<InterviewCard interview={mockInterview} />);

    expect(screen.getByText(/Expires in 10 days/)).toBeInTheDocument();
  });

  it('shows green status dot for deadline more than 4 days away', () => {
    const futureInterview = {
      ...mockInterview,
      deadline: new Date(
        new Date().getTime() + 10 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 10 days from now
    };

    render(<InterviewCard interview={futureInterview} />);

    const statusDot = document.querySelector('span.bg-green-500');
    expect(statusDot).toBeInTheDocument();
  });

  it('shows yellow status dot for deadline 3-4 days away', () => {
    const nearDeadlineInterview = {
      ...mockInterview,
      deadline: new Date(
        new Date().getTime() + 3 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 3 days from now
    };

    render(<InterviewCard interview={nearDeadlineInterview} />);

    const statusDot = document.querySelector('span.bg-yellow-500');
    expect(statusDot).toBeInTheDocument();
  });

  it('shows black status dot for expired deadline', () => {
    const expiredInterview = {
      ...mockInterview,
      deadline: '2023-12-14T23:59:59Z', // some time ago
    };

    render(<InterviewCard interview={expiredInterview} />);

    const statusDot = document.querySelector('span.bg-black');
    expect(statusDot).toBeInTheDocument();
  });

  it('shows "Take the interview" button for non-completed interviews', () => {
    render(<InterviewCard interview={mockInterview} />);

    expect(screen.getByText('Take the interview')).toBeInTheDocument();
    expect(screen.getByTestId('interview-link')).toHaveAttribute(
      'href',
      '/interviews/interview-1',
    );
  });

  it('does not show deadline information or button for completed interviews', () => {
    const completedInterview = {
      ...mockInterview,
      status: InterviewStatus.Completed,
    };

    render(<InterviewCard interview={completedInterview} />);

    expect(screen.queryByText(/Expires/)).not.toBeInTheDocument();
    expect(screen.queryByText('Take the interview')).not.toBeInTheDocument();
    expect(screen.queryByTestId('interview-link')).not.toBeInTheDocument();
  });

  it('handles interview template with empty description', () => {
    const interviewWithEmptyDescription = {
      ...mockInterview,
      interviewTemplate: {
        ...mockInterview.interviewTemplate,
        description: '',
      },
    };

    render(<InterviewCard interview={interviewWithEmptyDescription} />);

    expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    // Should render correctly with empty description
  });

  it('handles interview with different interviewer', () => {
    const interviewWithDifferentInterviewer = {
      ...mockInterview,
      interviewer: {
        id: 3,
        email: 'different@example.com',
        fullName: 'Different Interviewer',
        role: UserRole.Interviewer,
        isActive: true,
        __typename: 'User' as const,
      },
    };

    render(<InterviewCard interview={interviewWithDifferentInterviewer} />);

    expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    // Should render correctly with different interviewer data
  });
});
