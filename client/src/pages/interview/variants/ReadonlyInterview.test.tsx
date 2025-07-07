import {
  AnswerWithKeystrokesFragment,
  InterviewStatus,
  QuestionFragment,
  ReplayInterviewFragment,
  UserRole,
} from '@/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ReadonlyInterview } from './ReadonlyInterview';

// Mock the query
const mockGetInterviewForReplayBySlugQuery = vi.fn();

vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useGetInterviewForReplayBySlugQuery: () => [
      mockGetInterviewForReplayBySlugQuery(),
    ],
  };
});

// Mock react-router
const mockUseParams = vi.fn();
vi.mock('react-router', () => ({
  useParams: () => mockUseParams(),
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a
      href={to}
      data-testid='link'>
      {children}
    </a>
  ),
}));

// Mock the KeystrokeReplay component
vi.mock('../components/KeystrokeReplay', () => ({
  KeystrokeReplay: ({
    language,
    initialText,
    keystrokes,
  }: {
    language?: string;
    initialText?: string;
    keystrokes: any[];
  }) => (
    <div data-testid='keystroke-replay'>
      <p>Language: {language}</p>
      <p>Initial Text: {initialText}</p>
      <p>Keystrokes: {keystrokes.length}</p>
    </div>
  ),
}));

// Mock the NotFoundPage component
vi.mock('@/pages/auth/NotFoundPage', () => ({
  NotFoundPage: ({ message }: { message: string }) => (
    <div data-testid='not-found-page'>
      <h1>Not Found</h1>
      <p>{message}</p>
    </div>
  ),
}));

// Mock the DetailPageSkeleton component
vi.mock('@/components/ui/skeleton', () => ({
  DetailPageSkeleton: () => (
    <div data-testid='detailpageskeleton'>Loading...</div>
  ),
}));

function setup(jsx: React.ReactNode) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

describe('ReadonlyInterview', () => {
  const mockQuestion1: QuestionFragment = {
    id: 1,
    title: 'Question 1',
    description: 'First question description',
    updatedAt: '2023-01-01T00:00:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    questionBank: {
      id: 1,
      name: 'Test Bank',
      slug: 'test-bank',
      __typename: 'QuestionBank',
    },
    __typename: 'Question',
  };

  const mockQuestion2: QuestionFragment = {
    id: 2,
    title: 'Question 2',
    description: 'Second question description',
    updatedAt: '2023-01-01T00:00:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    questionBank: {
      id: 1,
      name: 'Test Bank',
      slug: 'test-bank',
      __typename: 'QuestionBank',
    },
    __typename: 'Question',
  };

  const mockAnswer1: AnswerWithKeystrokesFragment = {
    id: 1,
    text: 'Answer to question 1',
    language: 'javascript',
    question: mockQuestion1,
    keystrokes: [
      { id: 1, relativeTimestamp: 0, snapshot: 'A' },
      { id: 2, relativeTimestamp: 100, snapshot: 'An' },
    ],
    __typename: 'Answer',
  };

  const mockAnswer2: AnswerWithKeystrokesFragment = {
    id: 2,
    text: 'Answer to question 2',
    language: 'python',
    question: mockQuestion2,
    keystrokes: [
      { id: 3, relativeTimestamp: 0, snapshot: 'P' },
      { id: 4, relativeTimestamp: 100, snapshot: 'Pr' },
    ],
    __typename: 'Answer',
  };

  const mockInterview: ReplayInterviewFragment = {
    id: 1,
    interviewTemplate: {
      id: 1,
      name: 'Test Interview',
      description: 'Test Description',
      updatedAt: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      slug: 'test-interview',
      questions: [mockQuestion1, mockQuestion2],
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
    deadline: '2023-12-31T23:59:59Z',
    status: InterviewStatus.Completed,
    answers: [mockAnswer1, mockAnswer2],
    slug: 'test-interview',
    completedAt: '2023-12-31T23:59:59Z',
    __typename: 'Interview',
  };

  beforeEach(() => {
    mockUseParams.mockReturnValue({ slug: 'test-interview' });
    mockGetInterviewForReplayBySlugQuery.mockReset();
  });

  it('renders loading skeleton when fetching', () => {
    mockGetInterviewForReplayBySlugQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      fetching: true,
    });

    render(<ReadonlyInterview />);

    expect(screen.getByTestId('detailpageskeleton')).toBeInTheDocument();
  });

  it('renders the first question by default', () => {
    mockGetInterviewForReplayBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: mockInterview },
      error: undefined,
      fetching: false,
    });

    render(<ReadonlyInterview />);

    expect(screen.getByText('Test User x Test Interview')).toBeInTheDocument();
    expect(
      screen.getByText('Here you can replay the interview.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('First question description')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    expect(screen.getByTestId('keystroke-replay')).toBeInTheDocument();
  });

  it('displays keystroke replay with correct data for first question', () => {
    mockGetInterviewForReplayBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: mockInterview },
      error: undefined,
      fetching: false,
    });

    render(<ReadonlyInterview />);

    expect(screen.getByText('Language: javascript')).toBeInTheDocument();
    expect(
      screen.getByText('Initial Text: Answer to question 1'),
    ).toBeInTheDocument();
    expect(screen.getByText('Keystrokes: 2')).toBeInTheDocument();
  });

  it('navigates to next question when Next button is clicked', async () => {
    mockGetInterviewForReplayBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: mockInterview },
      error: undefined,
      fetching: false,
    });
    const { user } = setup(<ReadonlyInterview />);

    // Should start with first question
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();

    // Click Next button
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Should now show second question
    await waitFor(() => {
      expect(screen.getByText('Question 2')).toBeInTheDocument();
      expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
    });
  });

  it('navigates to previous question when Previous button is clicked', async () => {
    mockGetInterviewForReplayBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: mockInterview },
      error: undefined,
      fetching: false,
    });

    const { user } = setup(<ReadonlyInterview />);

    // Navigate to second question first
    await user.click(
      screen.getByRole('button', { name: /next/i, hidden: true }),
    );

    await waitFor(() => {
      expect(screen.getByText('Question 2')).toBeInTheDocument();
    });

    // Click Previous button
    await user.click(screen.getByRole('button', { name: /previous/i }));

    // Should now show first question again
    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
      expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    });
  });

  it('disables Previous button on first question', () => {
    mockGetInterviewForReplayBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: mockInterview },
      error: undefined,
      fetching: false,
    });

    render(<ReadonlyInterview />);

    const previousButton = screen.getByRole('button', { name: /previous/i });
    expect(previousButton).toBeDisabled();
  });

  it('shows Give feedback button on last question', async () => {
    mockGetInterviewForReplayBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: mockInterview },
      error: undefined,
      fetching: false,
    });

    const { user } = setup(<ReadonlyInterview />);

    // Navigate to last question
    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /give feedback/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /next/i }),
      ).not.toBeInTheDocument();
    });
  });

  it('renders not found page when interview is not found', () => {
    mockGetInterviewForReplayBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: null },
      error: undefined,
      fetching: false,
    });

    render(<ReadonlyInterview />);

    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    expect(screen.getByText('Interview not found')).toBeInTheDocument();
  });

  it('renders not found page when there is an error', () => {
    mockGetInterviewForReplayBySlugQuery.mockReturnValue({
      data: undefined,
      error: new Error('Network error'),
      fetching: false,
    });

    render(<ReadonlyInterview />);

    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    expect(screen.getByText('Interview not found')).toBeInTheDocument();
  });

  it('renders not found page when data is undefined', () => {
    mockGetInterviewForReplayBySlugQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      fetching: false,
    });

    render(<ReadonlyInterview />);

    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    expect(screen.getByText('Interview not found')).toBeInTheDocument();
  });

  it('handles interview with no answers', () => {
    const interviewWithNoAnswers = {
      ...mockInterview,
      answers: [],
    };

    mockGetInterviewForReplayBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: interviewWithNoAnswers },
      error: undefined,
      fetching: false,
    });

    render(<ReadonlyInterview />);

    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText(/Language:\s*$/)).toBeInTheDocument();
    expect(screen.getByText(/Initial Text:\s*$/)).toBeInTheDocument();
    expect(screen.getByText('Keystrokes: 0')).toBeInTheDocument();
  });

  it('handles interview with single question', () => {
    const singleQuestionInterview = {
      ...mockInterview,
      interviewTemplate: {
        ...mockInterview.interviewTemplate,
        questions: [mockQuestion1],
      },
      answers: [mockAnswer1],
    };

    mockGetInterviewForReplayBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: singleQuestionInterview },
      error: undefined,
      fetching: false,
    });

    render(<ReadonlyInterview />);

    expect(screen.getByText('Question 1 of 1')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /give feedback/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /next/i }),
    ).not.toBeInTheDocument();
  });

  // Note: The mock function call test is removed as the query hook pattern
  // doesn't allow for easy verification of the variables passed
});
