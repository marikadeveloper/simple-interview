import { InterviewEvaluation } from '@/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import InterviewFeedback from './index';

// Mock the GraphQL queries and mutations
const mockGetInterviewForFeedbackBySlugQuery = vi.fn();
const mockEvaluateInterviewMutation = vi.fn();

vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useGetInterviewForFeedbackBySlugQuery: () => [
      mockGetInterviewForFeedbackBySlugQuery(),
    ],
    useEvaluateInterviewMutation: () => [null, mockEvaluateInterviewMutation],
    InterviewEvaluation: actual.InterviewEvaluation,
  };
});

// Mock useMutationWithToast to return the mutation function
vi.mock('@/hooks/useMutationWithToast', () => ({
  useMutationWithToast: (_mutation: any) => [
    null,
    (args: any) => _mutation()[1](args),
  ],
}));

// Mock react-router
const mockUseParams = vi.fn();
vi.mock('react-router', () => ({
  useParams: () => mockUseParams(),
}));

// Mock SyntaxHighlighter
vi.mock('react-syntax-highlighter', () => ({
  default: ({ children, language }: any) => (
    <pre
      data-testid='syntax-highlighter'
      data-language={language}>
      {children}
    </pre>
  ),
}));

// Mock NotFoundPage
vi.mock('../auth/NotFoundPage', () => ({
  NotFoundPage: ({ message }: { message: string }) => (
    <div data-testid='not-found-page'>{message}</div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ThumbsDown: ({ className }: { className?: string }) => (
    <span
      data-testid='thumbs-down'
      className={className}>
      ThumbsDown
    </span>
  ),
  ThumbsUp: ({ className }: { className?: string }) => (
    <span
      data-testid='thumbs-up'
      className={className}>
      ThumbsUp
    </span>
  ),
  Crown: ({ className }: { className?: string }) => (
    <span
      data-testid='crown'
      className={className}>
      Crown
    </span>
  ),
}));

describe('InterviewFeedback', () => {
  const mockInterview = {
    id: 1,
    user: {
      fullName: 'John Doe',
    },
    interviewTemplate: {
      name: 'Frontend Developer Interview',
    },
    answers: [
      {
        id: 1,
        text: 'function hello() { return "Hello World"; }',
        language: 'javascript',
        question: {
          title: 'Write a hello world function',
          description: 'Create a simple function that returns hello world',
        },
      },
      {
        id: 2,
        text: 'const sum = (a, b) => a + b;',
        language: 'javascript',
        question: {
          title: 'Create a sum function',
          description: 'Write a function that adds two numbers',
        },
      },
    ],
    evaluationValue: null,
    evaluationNotes: null,
  };

  beforeEach(() => {
    mockGetInterviewForFeedbackBySlugQuery.mockReset();
    mockEvaluateInterviewMutation.mockReset();
    mockUseParams.mockReset();
    mockUseParams.mockReturnValue({ slug: 'test-interview' });
  });

  it('renders loading skeleton when fetching', () => {
    mockGetInterviewForFeedbackBySlugQuery.mockReturnValue({
      data: null,
      error: null,
      fetching: true,
    });

    render(<InterviewFeedback />);
    expect(screen.getByTestId('detailpageskeleton')).toBeInTheDocument();
  });

  it('renders not found page when interview not found', () => {
    mockGetInterviewForFeedbackBySlugQuery.mockReturnValue({
      data: null,
      error: 'Not found',
      fetching: false,
    });

    render(<InterviewFeedback />);
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    expect(screen.getByText('Interview not found')).toBeInTheDocument();
  });

  it('renders interview feedback page with correct title', () => {
    mockGetInterviewForFeedbackBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: mockInterview },
      error: null,
      fetching: false,
    });

    render(<InterviewFeedback />);
    expect(
      screen.getByText('John Doe x Frontend Developer Interview'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Here you can give feedback for the interview.'),
    ).toBeInTheDocument();
  });

  it('renders evaluation buttons', () => {
    mockGetInterviewForFeedbackBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: mockInterview },
      error: null,
      fetching: false,
    });

    render(<InterviewFeedback />);
    expect(screen.getByText('How did the interview go?')).toBeInTheDocument();
    expect(screen.getByTestId('thumbs-down')).toBeInTheDocument();
    expect(screen.getByTestId('thumbs-up')).toBeInTheDocument();
    expect(screen.getByTestId('crown')).toBeInTheDocument();
    expect(screen.getByText('Not Good')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('renders feedback notes input', () => {
    mockGetInterviewForFeedbackBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: mockInterview },
      error: null,
      fetching: false,
    });

    render(<InterviewFeedback />);
    expect(screen.getByLabelText('Feedback Notes')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Add detailed feedback notes (optional)'),
    ).toBeInTheDocument();
  });

  it('renders submit button disabled initially', () => {
    mockGetInterviewForFeedbackBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: mockInterview },
      error: null,
      fetching: false,
    });

    render(<InterviewFeedback />);
    const submitButton = screen.getByRole('button', {
      name: /submit evaluation/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when evaluation is selected', async () => {
    const user = userEvent.setup();
    mockGetInterviewForFeedbackBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: mockInterview },
      error: null,
      fetching: false,
    });

    render(<InterviewFeedback />);
    const submitButton = screen.getByRole('button', {
      name: /submit evaluation/i,
    });
    expect(submitButton).toBeDisabled();

    // Click on Good evaluation
    await user.click(screen.getByTestId('thumbs-up'));
    expect(submitButton).toBeEnabled();
  });

  it('handles evaluation selection correctly', async () => {
    const user = userEvent.setup();
    mockGetInterviewForFeedbackBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: mockInterview },
      error: null,
      fetching: false,
    });

    render(<InterviewFeedback />);

    // Click on Good evaluation
    await user.click(screen.getByTestId('thumbs-up'));
    expect(screen.getByTestId('thumbs-up').closest('button')).toHaveClass(
      'bg-green-500',
    );

    // Click on Excellent evaluation
    await user.click(screen.getByTestId('crown'));
    expect(screen.getByTestId('crown').closest('button')).toHaveClass(
      'bg-violet-500',
    );
    expect(screen.getByTestId('thumbs-up').closest('button')).not.toHaveClass(
      'bg-green-500',
    );
  });

  it('deselects evaluation when clicked again', async () => {
    const user = userEvent.setup();
    mockGetInterviewForFeedbackBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: mockInterview },
      error: null,
      fetching: false,
    });

    render(<InterviewFeedback />);

    // Click on Good evaluation
    await user.click(screen.getByTestId('thumbs-up'));
    expect(screen.getByTestId('thumbs-up').closest('button')).toHaveClass(
      'bg-green-500',
    );

    // Click again to deselect
    await user.click(screen.getByTestId('thumbs-up'));
    expect(screen.getByTestId('thumbs-up').closest('button')).not.toHaveClass(
      'bg-green-500',
    );
  });

  it('handles feedback notes input', async () => {
    const user = userEvent.setup();
    mockGetInterviewForFeedbackBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: mockInterview },
      error: null,
      fetching: false,
    });

    render(<InterviewFeedback />);
    const notesInput = screen.getByLabelText('Feedback Notes');

    await user.type(notesInput, 'Great candidate, very knowledgeable');
    expect(notesInput).toHaveValue('Great candidate, very knowledgeable');
  });

  it('submits evaluation with correct data', async () => {
    const user = userEvent.setup();
    mockGetInterviewForFeedbackBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: mockInterview },
      error: null,
      fetching: false,
    });
    mockEvaluateInterviewMutation.mockResolvedValue({
      data: { evaluateInterview: true },
      error: null,
    });

    render(<InterviewFeedback />);

    // Select evaluation and add notes
    await user.click(screen.getByTestId('thumbs-up'));
    await user.type(
      screen.getByLabelText('Feedback Notes'),
      'Good performance',
    );
    await user.click(
      screen.getByRole('button', { name: /submit evaluation/i }),
    );

    await waitFor(() => {
      expect(mockEvaluateInterviewMutation).toHaveBeenCalledWith({
        id: 1,
        input: {
          evaluationValue: InterviewEvaluation.Good,
          evaluationNotes: 'Good performance',
        },
      });
    });
  });

  it('renders interview answers with syntax highlighting', () => {
    mockGetInterviewForFeedbackBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: mockInterview },
      error: null,
      fetching: false,
    });

    render(<InterviewFeedback />);

    // Check that answers are rendered
    expect(
      screen.getByText('Write a hello world function'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Create a simple function that returns hello world'),
    ).toBeInTheDocument();
    expect(screen.getByText('Create a sum function')).toBeInTheDocument();
    expect(
      screen.getByText('Write a function that adds two numbers'),
    ).toBeInTheDocument();

    // Check syntax highlighter components
    const syntaxHighlighters = screen.getAllByTestId('syntax-highlighter');
    expect(syntaxHighlighters).toHaveLength(2);
    expect(syntaxHighlighters[0]).toHaveAttribute(
      'data-language',
      'javascript',
    );
    expect(syntaxHighlighters[1]).toHaveAttribute(
      'data-language',
      'javascript',
    );
  });

  it('loads existing evaluation data', () => {
    const interviewWithEvaluation = {
      ...mockInterview,
      evaluationValue: InterviewEvaluation.Good,
      evaluationNotes: 'Previous evaluation notes',
    };

    mockGetInterviewForFeedbackBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: interviewWithEvaluation },
      error: null,
      fetching: false,
    });

    render(<InterviewFeedback />);

    // Check that existing evaluation is loaded
    expect(screen.getByTestId('thumbs-up').closest('button')).toHaveClass(
      'bg-green-500',
    );
    expect(screen.getByLabelText('Feedback Notes')).toHaveValue(
      'Previous evaluation notes',
    );
  });

  it('handles evaluation submission error gracefully', async () => {
    const user = userEvent.setup();
    mockGetInterviewForFeedbackBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: mockInterview },
      error: null,
      fetching: false,
    });
    mockEvaluateInterviewMutation.mockResolvedValue({
      data: null,
      error: 'Failed to submit evaluation',
    });

    render(<InterviewFeedback />);

    await user.click(screen.getByTestId('thumbs-up'));
    await user.click(
      screen.getByRole('button', { name: /submit evaluation/i }),
    );

    await waitFor(() => {
      expect(mockEvaluateInterviewMutation).toHaveBeenCalled();
    });
  });

  it('does not submit when no evaluation is selected', async () => {
    const user = userEvent.setup();
    mockGetInterviewForFeedbackBySlugQuery.mockReturnValue({
      data: { getInterviewBySlug: mockInterview },
      error: null,
      fetching: false,
    });

    render(<InterviewFeedback />);

    const submitButton = screen.getByRole('button', {
      name: /submit evaluation/i,
    });
    expect(submitButton).toBeDisabled();

    // Try to click submit without selecting evaluation
    await user.click(submitButton);
    expect(mockEvaluateInterviewMutation).not.toHaveBeenCalled();
  });
});
