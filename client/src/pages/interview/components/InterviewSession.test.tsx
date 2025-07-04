import {
  CandidateInterviewFragment,
  InterviewStatus,
  UserRole,
} from '@/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { InterviewSession } from './InterviewSession';

// Mock the mutations
const mockCreateAnswer = vi.fn();
const mockConfirmCompletion = vi.fn();
const mockSaveKeystrokes = vi.fn();
const mockCreateInterviewMutation = vi.fn();

// Mock useMutationWithToast to return the mock functions
vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useCreateInterviewMutation: () => [null, mockCreateInterviewMutation],
    useCreateAnswerMutation: () => [null, mockCreateAnswer],
    useConfirmInterviewCompletionMutation: () => [null, mockConfirmCompletion],
    useSaveKeystrokesMutation: () => [null, mockSaveKeystrokes],
  };
});

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock the QuestionCard component
vi.mock('./QuestionCard', () => ({
  QuestionCard: ({ question, onAnswerChange, initialAnswer }: any) => (
    <div data-testid='question-card'>
      <h3>{question.title}</h3>
      <p>{question.description}</p>
      <button
        onClick={() => onAnswerChange('Test answer', [], 'javascript')}
        data-testid='answer-change-btn'>
        Trigger Answer
      </button>
      <div data-testid='initial-answer'>{initialAnswer || 'No answer'}</div>
    </div>
  ),
}));

describe('InterviewSession', () => {
  const mockInterview: CandidateInterviewFragment = {
    id: 1,
    interviewTemplate: {
      id: 1,
      name: 'Test Interview',
      description: 'Test Description',
      updatedAt: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      slug: 'test-interview',
      questions: [
        {
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
        },
        {
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
        },
      ],
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
    status: InterviewStatus.InProgress,
    answers: null,
    slug: 'test-interview',
    completedAt: null,
    __typename: 'Interview',
  };

  beforeEach(() => {
    mockCreateAnswer.mockReset();
    mockConfirmCompletion.mockReset();
    mockSaveKeystrokes.mockReset();
    mockNavigate.mockReset();
  });

  it('renders the interview session with first question', () => {
    render(<InterviewSession interview={mockInterview} />);

    expect(screen.getByText('Interview Session')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('First question description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('starts from the first unanswered question', () => {
    const interviewWithAnswers = {
      ...mockInterview,
      answers: [
        {
          id: 1,
          text: 'Answer to question 1',
          language: 'javascript',
          question: {
            id: 1,
            title: 'Question 1',
            description: 'First question description',
            __typename: 'Question' as const,
          },
          __typename: 'Answer' as const,
        },
      ],
    };

    render(<InterviewSession interview={interviewWithAnswers} />);

    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
  });

  it('handles answer changes', async () => {
    const user = userEvent.setup();
    render(<InterviewSession interview={mockInterview} />);

    await user.click(screen.getByTestId('answer-change-btn'));

    // The answer should be stored in the component state
    // We can verify this by checking if the Next button is enabled
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('moves to next question when Next is clicked', async () => {
    const user = userEvent.setup();
    mockCreateAnswer.mockResolvedValue({
      data: { createAnswer: { id: 1 } },
      error: null,
    });
    mockSaveKeystrokes.mockResolvedValue({
      data: { saveKeystrokes: true },
      error: null,
    });

    render(<InterviewSession interview={mockInterview} />);

    // First, provide an answer
    await user.click(screen.getByTestId('answer-change-btn'));

    // Then click Next
    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(mockCreateAnswer).toHaveBeenCalledWith({
        input: {
          interviewId: 1,
          questionId: 1,
          text: 'Test answer',
          language: 'javascript',
        },
      });
    });

    await waitFor(() => {
      expect(mockSaveKeystrokes).toHaveBeenCalledWith({
        input: {
          answerId: 1,
          keystrokes: [],
        },
      });
    });

    // Should now show the second question
    await waitFor(() => {
      expect(screen.getByText('Question 2')).toBeInTheDocument();
    });
  });

  it('shows Complete Interview button on last question', () => {
    const interviewWithOneQuestion = {
      ...mockInterview,
      interviewTemplate: {
        ...mockInterview.interviewTemplate,
        questions: [mockInterview.interviewTemplate.questions[0]],
      },
    };

    render(<InterviewSession interview={interviewWithOneQuestion} />);

    expect(
      screen.getByRole('button', { name: /complete interview/i }),
    ).toBeInTheDocument();
  });

  it('shows confirmation dialog when completing interview', async () => {
    const user = userEvent.setup();
    // mock the createInterviewMutation to return a success
    mockCreateAnswer.mockResolvedValue({
      data: { createAnswer: { id: 1 } },
      error: null,
    });
    mockSaveKeystrokes.mockResolvedValue({
      data: { saveKeystrokes: true },
      error: null,
    });
    mockConfirmCompletion.mockResolvedValue({
      data: { confirmInterviewCompletion: true },
      error: null,
    });

    const interviewWithOneQuestion = {
      ...mockInterview,
      interviewTemplate: {
        ...mockInterview.interviewTemplate,
        questions: [mockInterview.interviewTemplate.questions[0]],
      },
    };

    render(<InterviewSession interview={interviewWithOneQuestion} />);

    // Provide an answer and click Complete Interview
    await user.click(screen.getByTestId('answer-change-btn'));
    await user.click(
      screen.getByRole('button', { name: /complete interview/i }),
    );

    // Should show the confirmation dialog
    await waitFor(() => {
      expect(
        screen.getByText('Confirm Interview Completion'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Are you sure you want to end the interview? This action cannot be undone.',
        ),
      ).toBeInTheDocument();
    });
  });

  it('completes interview when confirmed in dialog', async () => {
    const user = userEvent.setup();
    mockCreateAnswer.mockResolvedValue({
      data: { createAnswer: { id: 1 } },
      error: null,
    });
    mockSaveKeystrokes.mockResolvedValue({
      data: { saveKeystrokes: true },
      error: null,
    });
    mockConfirmCompletion.mockResolvedValue({
      data: { confirmInterviewCompletion: true },
      error: null,
    });

    const interviewWithOneQuestion = {
      ...mockInterview,
      interviewTemplate: {
        ...mockInterview.interviewTemplate,
        questions: [mockInterview.interviewTemplate.questions[0]],
      },
    };

    render(<InterviewSession interview={interviewWithOneQuestion} />);

    // Provide an answer and complete
    await user.click(screen.getByTestId('answer-change-btn'));
    await user.click(
      screen.getByRole('button', { name: /complete interview/i }),
    );

    // Wait for dialog to appear and click confirm
    await waitFor(() => {
      expect(
        screen.getByText('Confirm Interview Completion'),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: /complete interview/i }),
    );

    await waitFor(() => {
      expect(mockConfirmCompletion).toHaveBeenCalledWith({ id: 1 });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
        state: { message: 'Thank you for completing the interview!' },
      });
    });
  });

  it('does not complete interview when user cancels in dialog', async () => {
    const user = userEvent.setup();
    mockCreateAnswer.mockResolvedValue({
      data: { createAnswer: { id: 1 } },
      error: null,
    });
    mockSaveKeystrokes.mockResolvedValue({
      data: { saveKeystrokes: true },
      error: null,
    });

    const interviewWithOneQuestion = {
      ...mockInterview,
      interviewTemplate: {
        ...mockInterview.interviewTemplate,
        questions: [mockInterview.interviewTemplate.questions[0]],
      },
    };

    render(<InterviewSession interview={interviewWithOneQuestion} />);

    await user.click(screen.getByTestId('answer-change-btn'));
    await user.click(
      screen.getByRole('button', { name: /complete interview/i }),
    );

    // Wait for dialog to appear and click cancel
    await waitFor(() => {
      expect(
        screen.getByText('Confirm Interview Completion'),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockConfirmCompletion).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles create answer error gracefully', async () => {
    const user = userEvent.setup();
    mockCreateAnswer.mockResolvedValue({
      data: null,
      error: 'Failed to create answer',
    });

    render(<InterviewSession interview={mockInterview} />);

    await user.click(screen.getByTestId('answer-change-btn'));
    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(mockCreateAnswer).toHaveBeenCalled();
    });

    // Should not proceed to next question or save keystrokes
    expect(mockSaveKeystrokes).not.toHaveBeenCalled();
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
  });

  it('handles save keystrokes error gracefully', async () => {
    const user = userEvent.setup();
    mockCreateAnswer.mockResolvedValue({
      data: { createAnswer: { id: 1 } },
      error: null,
    });
    mockSaveKeystrokes.mockResolvedValue({
      data: null,
      error: 'Failed to save keystrokes',
    });

    render(<InterviewSession interview={mockInterview} />);

    await user.click(screen.getByTestId('answer-change-btn'));
    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(mockCreateAnswer).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockSaveKeystrokes).toHaveBeenCalled();
    });

    // the screen should not change question
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
  });

  it('handles confirm completion error gracefully', async () => {
    const user = userEvent.setup();
    mockCreateAnswer.mockResolvedValue({
      data: { createAnswer: { id: 1 } },
      error: null,
    });
    mockSaveKeystrokes.mockResolvedValue({
      data: { saveKeystrokes: true },
      error: null,
    });
    mockConfirmCompletion.mockResolvedValue({
      data: null,
      error: 'Failed to complete interview',
    });

    const interviewWithOneQuestion = {
      ...mockInterview,
      interviewTemplate: {
        ...mockInterview.interviewTemplate,
        questions: [mockInterview.interviewTemplate.questions[0]],
      },
    };

    render(<InterviewSession interview={interviewWithOneQuestion} />);

    await user.click(screen.getByTestId('answer-change-btn'));
    await user.click(
      screen.getByRole('button', { name: /complete interview/i }),
    );

    // Wait for dialog to appear and click confirm
    await waitFor(() => {
      expect(
        screen.getByText('Confirm Interview Completion'),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: /complete interview/i }),
    );

    await waitFor(() => {
      expect(mockConfirmCompletion).toHaveBeenCalled();
    });

    // Should not navigate on error
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
