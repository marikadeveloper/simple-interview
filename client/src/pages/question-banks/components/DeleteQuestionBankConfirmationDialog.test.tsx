import { QuestionBankFragment } from '@/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { DeleteQuestionBankConfirmationDialog } from './DeleteQuestionBankConfirmationDialog';

// Mock the mutation
const mockDeleteQuestionBank = vi.fn();

// Mock useMutationWithToast to return the mock function
vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useDeleteQuestionBankMutation: () => [null, mockDeleteQuestionBank],
  };
});

// Mock useMutationWithToast to just return the mutation function
vi.mock('@/hooks/useMutationWithToast', () => ({
  useMutationWithToast: (_mutation: any, _options: any) => [
    null,
    async (args: any) => {
      try {
        const result = await mockDeleteQuestionBank(args);
        return result;
      } catch (error) {
        // Don't throw, just return the error for testing
        return { data: null, error };
      }
    },
  ],
}));

describe('DeleteQuestionBankConfirmationDialog', () => {
  const mockQuestionBank: QuestionBankFragment = {
    id: 1,
    name: 'JavaScript Fundamentals',
    slug: 'javascript-fundamentals',
    __typename: 'QuestionBank',
  };

  beforeEach(() => {
    mockDeleteQuestionBank.mockReset();
  });

  it('opens dialog when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <DeleteQuestionBankConfirmationDialog questionBank={mockQuestionBank} />,
    );

    const deleteButton = screen.getByRole('button');
    await user.click(deleteButton);

    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Are you sure you want to delete "JavaScript Fundamentals"/,
      ),
    ).toBeInTheDocument();
  });

  it('shows question bank name in confirmation message', async () => {
    const user = userEvent.setup();
    render(
      <DeleteQuestionBankConfirmationDialog questionBank={mockQuestionBank} />,
    );

    const deleteButton = screen.getByRole('button');
    await user.click(deleteButton);

    expect(
      screen.getByText(
        /Are you sure you want to delete "JavaScript Fundamentals"/,
      ),
    ).toBeInTheDocument();
  });

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <DeleteQuestionBankConfirmationDialog questionBank={mockQuestionBank} />,
    );

    // Open dialog
    const deleteButton = screen.getByRole('button');
    await user.click(deleteButton);

    // Verify dialog is open
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Verify dialog is closed
    expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
  });

  it('calls delete mutation when delete button is clicked', async () => {
    const user = userEvent.setup();
    mockDeleteQuestionBank.mockResolvedValue({
      data: { deleteQuestionBank: true },
      error: null,
    });

    render(
      <DeleteQuestionBankConfirmationDialog questionBank={mockQuestionBank} />,
    );

    // Open dialog
    const deleteButton = screen.getByRole('button');
    await user.click(deleteButton);

    // Click delete confirmation
    const confirmDeleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(mockDeleteQuestionBank).toHaveBeenCalledWith({ id: 1 });
    });
  });

  it('closes dialog after successful deletion', async () => {
    const user = userEvent.setup();
    mockDeleteQuestionBank.mockResolvedValue({
      data: { deleteQuestionBank: true },
      error: null,
    });

    render(
      <DeleteQuestionBankConfirmationDialog questionBank={mockQuestionBank} />,
    );

    // Open dialog
    const deleteButton = screen.getByRole('button');
    await user.click(deleteButton);

    // Click delete confirmation
    const confirmDeleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(confirmDeleteButton);

    await waitFor(
      () => {
        expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('handles deletion failure gracefully', async () => {
    const user = userEvent.setup();
    mockDeleteQuestionBank.mockRejectedValue(
      new Error('Failed to delete question bank'),
    );

    render(
      <DeleteQuestionBankConfirmationDialog questionBank={mockQuestionBank} />,
    );

    // Open dialog
    const deleteButton = screen.getByRole('button');
    await user.click(deleteButton);

    // Click delete confirmation
    const confirmDeleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(confirmDeleteButton);

    // Dialog should remain open on error
    await waitFor(() => {
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    });
  });

  it('handles question bank with empty name', async () => {
    const user = userEvent.setup();
    const questionBankWithEmptyName: QuestionBankFragment = {
      ...mockQuestionBank,
      name: '',
    };

    render(
      <DeleteQuestionBankConfirmationDialog
        questionBank={questionBankWithEmptyName}
      />,
    );

    const deleteButton = screen.getByRole('button');
    await user.click(deleteButton);

    expect(
      screen.getByText(/Are you sure you want to delete ""/),
    ).toBeInTheDocument();
  });
});
