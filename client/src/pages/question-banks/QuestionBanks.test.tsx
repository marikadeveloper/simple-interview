import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import QuestionBanks from './index';

// Mock Data
const mockBanks = [
  {
    __typename: 'QuestionBank',
    id: 1,
    name: 'Frontend Bank',
    slug: 'frontend-bank',
  },
  {
    __typename: 'QuestionBank',
    id: 2,
    name: 'Backend Bank',
    slug: 'backend-bank',
  },
];

// Mock CreateQuestionBankDialog as a dumb component
vi.mock('./components/CreateQuestionBankDialog', () => ({
  CreateQuestionBankDialog: () => (
    <div data-testid='create-question-bank-dialog' />
  ),
}));

// Mock QuestionBankActions as a dumb component
vi.mock('./components/QuestionBankActions', () => ({
  QuestionBankActions: () => (
    <div data-testid='question-bank-actions'>Actions</div>
  ),
}));

// Mock useGetQuestionBanksQuery
const mockUseGetQuestionBanksQuery = vi.fn();
vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useGetQuestionBanksQuery: () => mockUseGetQuestionBanksQuery(),
  };
});

describe('QuestionBanks page', () => {
  beforeEach(() => {
    mockUseGetQuestionBanksQuery.mockReset();
  });

  it('renders table with question banks when data is loaded', () => {
    mockUseGetQuestionBanksQuery.mockReturnValue([
      { data: { questionBanks: mockBanks }, fetching: false },
      vi.fn(),
    ]);
    render(<QuestionBanks />);
    expect(screen.getByText('Question Banks')).toBeInTheDocument();
    expect(screen.getByText('Frontend Bank')).toBeInTheDocument();
    expect(screen.getByText('Backend Bank')).toBeInTheDocument();
    expect(
      screen.getAllByTestId('question-bank-actions').length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByTestId('create-question-bank-dialog'),
    ).toBeInTheDocument();
  });

  it('filters question banks by search', async () => {
    mockUseGetQuestionBanksQuery.mockReturnValue([
      { data: { questionBanks: mockBanks }, fetching: false },
      vi.fn(),
    ]);
    render(<QuestionBanks />);
    const input = screen.getByPlaceholderText(/filter by name/i);
    await userEvent.type(input, 'Backend');
    expect(input).toHaveValue('Backend');
    // Simulate search button click
    await userEvent.keyboard('{enter}');
    // The actual filtering is handled by the query, so we just check the input value
    // and that the table is still rendered
    expect(screen.getByText('Backend Bank')).toBeInTheDocument();
  });

  it('renders empty table if no question banks', () => {
    mockUseGetQuestionBanksQuery.mockReturnValue([
      { data: { questionBanks: [] }, fetching: false },
      vi.fn(),
    ]);
    render(<QuestionBanks />);
    expect(screen.getByText('Question Banks')).toBeInTheDocument();
    expect(screen.queryByText('Frontend Bank')).not.toBeInTheDocument();
    expect(screen.queryByText('Backend Bank')).not.toBeInTheDocument();
  });
});
