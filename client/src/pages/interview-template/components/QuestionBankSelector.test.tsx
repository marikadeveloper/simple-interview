import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { QuestionBankSelector } from './QuestionBankSelector';

const mockAddQuestions = vi.fn();
const mockGetQuestionBanks = vi.fn();
const mockGetQuestionBank = vi.fn();
const mockGetInterviewTemplate = vi.fn();

vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useAddQuestionsFromQuestionBankMutation: () => [null, mockAddQuestions],
    useGetQuestionBanksQuery: () => [{ data: mockGetQuestionBanks() }],
    useGetQuestionBankQuery: () => [{ data: mockGetQuestionBank() }],
    useGetInterviewTemplateQuery: () => [{ data: mockGetInterviewTemplate() }],
  };
});

vi.mock('@/hooks/useMutationWithToast', () => ({
  useMutationWithToast: (_mutation: any) => [null, mockAddQuestions],
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('QuestionBankSelector', () => {
  beforeEach(() => {
    mockAddQuestions.mockReset();
    mockGetQuestionBanks.mockReset();
    mockGetQuestionBank.mockReset();
    mockGetInterviewTemplate.mockReset();
    vi.clearAllMocks();
  });

  const questionBanks = [
    { id: 1, name: 'Bank 1', slug: 'bank-1', __typename: 'QuestionBank' },
    { id: 2, name: 'Bank 2', slug: 'bank-2', __typename: 'QuestionBank' },
  ];
  const questions = [
    { id: 10, title: 'Q1', description: 'Desc1', __typename: 'Question' },
    { id: 11, title: 'Q2', description: 'Desc2', __typename: 'Question' },
  ];
  const templateQuestions = [
    { id: 10, title: 'Q1', description: 'Desc1', __typename: 'Question' },
  ];

  it('renders and opens dialog', async () => {
    mockGetQuestionBanks.mockReturnValue({ questionBanks });
    mockGetQuestionBank.mockReturnValue({
      getQuestionBank: { questions, __typename: 'QuestionBank' },
    });
    mockGetInterviewTemplate.mockReturnValue({
      getInterviewTemplate: { questions: [], __typename: 'InterviewTemplate' },
    });
    render(<QuestionBankSelector templateId={'1'} />);
    expect(screen.getByText('Add from Question Bank')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: /browse question banks/i }),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByText('Add Questions from Question Bank'),
    ).toBeInTheDocument();
  });

  it('lists question banks and questions, disables already-in-template', async () => {
    mockGetQuestionBanks.mockReturnValue({ questionBanks });
    mockGetQuestionBank.mockReturnValue({
      getQuestionBank: { questions, __typename: 'QuestionBank' },
    });
    mockGetInterviewTemplate.mockReturnValue({
      getInterviewTemplate: {
        questions: templateQuestions,
        __typename: 'InterviewTemplate',
      },
    });
    render(<QuestionBankSelector templateId={'1'} />);
    await userEvent.click(
      screen.getByRole('button', { name: /browse question banks/i }),
    );
    // Open the select dropdown
    await userEvent.click(screen.getByRole('combobox'));
    // Wait for the option to appear and select it
    const bankOption = await screen.findByText('Bank 1');
    await userEvent.click(bankOption);
    // Should show questions
    expect(screen.getByText('Q1')).toBeInTheDocument();
    expect(screen.getByText('Q2')).toBeInTheDocument();
    // Q1 should be disabled (already in template)
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeDisabled();
    expect(checkboxes[1]).toBeEnabled();
  });

  it('selects and adds questions', async () => {
    mockGetQuestionBanks.mockReturnValue({ questionBanks });
    mockGetQuestionBank.mockReturnValue({
      getQuestionBank: { questions, __typename: 'QuestionBank' },
    });
    mockGetInterviewTemplate.mockReturnValue({
      getInterviewTemplate: { questions: [], __typename: 'InterviewTemplate' },
    });
    mockAddQuestions.mockResolvedValue({
      data: { addQuestionsFromQuestionBank: true },
    });
    render(<QuestionBankSelector templateId={'1'} />);
    await userEvent.click(
      screen.getByRole('button', { name: /browse question banks/i }),
    );
    // Open the select dropdown
    await userEvent.click(screen.getByRole('combobox'));
    // Wait for the option to appear and select it
    const bankOption = await screen.findByText('Bank 1');
    await userEvent.click(bankOption);
    // Select Q2
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]);
    await userEvent.click(
      screen.getByRole('button', { name: /add \d+ question/i }),
    );
    await waitFor(() => {
      expect(mockAddQuestions).toHaveBeenCalledWith({
        input: { interviewTemplateId: 1, questionIds: [11] },
      });
    });
  });

  it('shows error toast if no questions selected', async () => {
    mockGetQuestionBanks.mockReturnValue({ questionBanks });
    mockGetQuestionBank.mockReturnValue({
      getQuestionBank: { questions, __typename: 'QuestionBank' },
    });
    mockGetInterviewTemplate.mockReturnValue({
      getInterviewTemplate: { questions: [], __typename: 'InterviewTemplate' },
    });
    render(<QuestionBankSelector templateId={'1'} />);
    await userEvent.click(
      screen.getByRole('button', { name: /browse question banks/i }),
    );
    // Open the select dropdown
    await userEvent.click(screen.getByRole('combobox'));
    // Wait for the option to appear and select it
    const bankOption = await screen.findByText('Bank 1');
    await userEvent.click(bankOption);
    // The add button should be disabled
    const addButton = screen.getByRole('button', { name: /add 0 question/i });
    expect(addButton).toBeDisabled();
  });
});
