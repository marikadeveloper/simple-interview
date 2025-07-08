import type { QuestionBankFragment } from '@/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { FormHeading } from './FormHeading';

// Mock useMutationWithToast and useUpdateQuestionBankMutation
const mockUpdateQuestionBank = vi.fn();
vi.mock('@/hooks/useMutationWithToast', () => ({
  useMutationWithToast: () => [null, mockUpdateQuestionBank],
}));
vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useUpdateQuestionBankMutation: () => [null, vi.fn()],
  };
});

describe('FormHeading', () => {
  const questionBank: QuestionBankFragment = {
    __typename: 'QuestionBank',
    id: 1,
    name: 'Algorithms',
    slug: 'algorithms',
  };
  let setFormVisible: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockUpdateQuestionBank.mockReset();
    setFormVisible = vi.fn();
  });

  it('renders the form with initial values', () => {
    render(
      <FormHeading
        questionBank={questionBank}
        setFormVisible={setFormVisible}
      />,
    );
    expect(screen.getByLabelText('Name')).toHaveValue('Algorithms');
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('shows validation error for too short name', async () => {
    const user = userEvent.setup();
    render(
      <FormHeading
        questionBank={questionBank}
        setFormVisible={setFormVisible}
      />,
    );
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'A');
    await user.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
    });
    expect(mockUpdateQuestionBank).not.toHaveBeenCalled();
  });

  it('submits the form and calls updateQuestionBank', async () => {
    const user = userEvent.setup();
    mockUpdateQuestionBank.mockResolvedValue({ error: null });
    render(
      <FormHeading
        questionBank={questionBank}
        setFormVisible={setFormVisible}
      />,
    );
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Data Structures');
    await user.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(mockUpdateQuestionBank).toHaveBeenCalledWith({
        id: 1,
        name: 'Data Structures',
      });
      expect(setFormVisible).toHaveBeenCalledWith(false);
    });
  });

  it('does not close form if updateQuestionBank returns error', async () => {
    const user = userEvent.setup();
    mockUpdateQuestionBank.mockResolvedValue({ error: 'Some error' });
    render(
      <FormHeading
        questionBank={questionBank}
        setFormVisible={setFormVisible}
      />,
    );
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Data Structures');
    await user.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(mockUpdateQuestionBank).toHaveBeenCalled();
      expect(setFormVisible).not.toHaveBeenCalledWith(false);
    });
  });

  it('resets and closes form on cancel', async () => {
    const user = userEvent.setup();
    render(
      <FormHeading
        questionBank={questionBank}
        setFormVisible={setFormVisible}
      />,
    );
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Something Else');
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    // Should reset the input to original value and close form
    expect(setFormVisible).toHaveBeenCalledWith(false);
  });
});
