import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CreateQuestionBankDialog } from './CreateQuestionBankDialog';

// Mock the mutations
const mockCreateQuestionBank = vi.fn();

// Mock useMutationWithToast to return the mock function
vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useCreateQuestionBankMutation: () => [null, mockCreateQuestionBank],
  };
});

// Mock useMutationWithToast to just return the mutation function
vi.mock('@/hooks/useMutationWithToast', () => ({
  useMutationWithToast: (_mutation: any) => [
    null,
    (args: any) => _mutation()[1](args),
  ],
}));

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

function setup(jsx: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

describe('CreateQuestionBankDialog', () => {
  beforeEach(() => {
    mockCreateQuestionBank.mockReset();
    mockNavigate.mockReset();
  });

  it('renders the dialog button', () => {
    render(<CreateQuestionBankDialog />);
    expect(
      screen.getByRole('button', { name: /add question bank/i }),
    ).toBeInTheDocument();
  });

  it('opens dialog when button is clicked', async () => {
    const { user } = setup(<CreateQuestionBankDialog />);

    await user.click(
      screen.getByRole('button', { name: /add question bank/i }),
    );

    expect(screen.getByText('Create Question Bank')).toBeInTheDocument();
    expect(screen.getByText('Create a new question bank.')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('submits form with valid data and calls createQuestionBank', async () => {
    mockCreateQuestionBank.mockResolvedValue({
      data: {
        createQuestionBank: {
          id: 1,
          name: 'Test Question Bank',
          slug: 'test-question-bank',
        },
      },
      error: null,
    });
    const { user } = setup(<CreateQuestionBankDialog />);
    // Open dialog
    await user.click(
      screen.getByRole('button', { name: /add question bank/i }),
    );

    // Fill form
    await user.type(screen.getByLabelText('Name'), 'Test Question Bank');

    // Submit form
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(mockCreateQuestionBank).toHaveBeenCalledWith({
        input: {
          name: 'Test Question Bank',
        },
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/question-banks/test-question-bank',
      );
    });
  });

  it('shows validation error if name is too short', async () => {
    const { user } = setup(<CreateQuestionBankDialog />);

    // Open dialog
    await user.click(
      screen.getByRole('button', { name: /add question bank/i }),
    );

    // Try to submit with short name
    await user.type(screen.getByLabelText('Name'), 'A');
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Name must be at least 2 characters.'),
      ).toBeInTheDocument();
    });
  });

  it('shows validation error if name is empty', async () => {
    const { user } = setup(<CreateQuestionBankDialog />);

    // Open dialog
    await user.click(
      screen.getByRole('button', { name: /add question bank/i }),
    );

    // Try to submit with empty name
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Name must be at least 2 characters.'),
      ).toBeInTheDocument();
    });
  });

  it('closes dialog when cancel is clicked', async () => {
    const { user } = setup(<CreateQuestionBankDialog />);

    // Open dialog
    await user.click(
      screen.getByRole('button', { name: /add question bank/i }),
    );

    // Verify dialog is open
    expect(screen.getByText('Create Question Bank')).toBeInTheDocument();

    // Click cancel
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Verify dialog is closed
    await waitFor(() => {
      expect(
        screen.queryByText('Create Question Bank'),
      ).not.toBeInTheDocument();
    });
  });

  it('resets form when dialog is closed', async () => {
    const { user } = setup(<CreateQuestionBankDialog />);

    // Open dialog
    await user.click(
      screen.getByRole('button', { name: /add question bank/i }),
    );

    // Fill form
    await user.type(screen.getByLabelText('Name'), 'Test Question Bank');

    // Close dialog
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Reopen dialog
    await user.click(
      screen.getByRole('button', { name: /add question bank/i }),
    );

    // Verify form is reset
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('handles createQuestionBank error gracefully', async () => {
    mockCreateQuestionBank.mockResolvedValue({
      data: null,
      error: 'Failed to create question bank',
    });
    const { user } = setup(<CreateQuestionBankDialog />);

    // Open dialog
    await user.click(
      screen.getByRole('button', { name: /add question bank/i }),
    );

    // Fill and submit form
    await user.type(screen.getByLabelText('Name'), 'Test Question Bank');
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(mockCreateQuestionBank).toHaveBeenCalled();
    });

    // Should not navigate on error
    expect(mockNavigate).not.toHaveBeenCalled();

    // Dialog should remain open
    expect(screen.getByText('Create Question Bank')).toBeInTheDocument();
  });

  it('handles createQuestionBank success with null data gracefully', async () => {
    mockCreateQuestionBank.mockResolvedValue({
      data: { createQuestionBank: null },
      error: null,
    });
    const { user } = setup(<CreateQuestionBankDialog />);

    // Open dialog
    await user.click(
      screen.getByRole('button', { name: /add question bank/i }),
    );

    // Fill and submit form
    await user.type(screen.getByLabelText('Name'), 'Test Question Bank');
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(mockCreateQuestionBank).toHaveBeenCalled();
    });

    // Should not navigate if no data returned
    expect(mockNavigate).not.toHaveBeenCalled();

    // Dialog should remain open
    expect(screen.getByText('Create Question Bank')).toBeInTheDocument();
  });

  it('submits form when Enter key is pressed', async () => {
    mockCreateQuestionBank.mockResolvedValue({
      data: {
        createQuestionBank: {
          id: 1,
          name: 'Test Question Bank',
          slug: 'test-question-bank',
        },
      },
      error: null,
    });
    const { user } = setup(<CreateQuestionBankDialog />);

    // Open dialog
    await user.click(
      screen.getByRole('button', { name: /add question bank/i }),
    );

    // Fill form
    await user.type(screen.getByLabelText('Name'), 'Test Question Bank');

    // Press Enter in the input field
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockCreateQuestionBank).toHaveBeenCalledWith({
        input: {
          name: 'Test Question Bank',
        },
      });
    });
  });

  it('does not submit form when Enter is pressed with invalid data', async () => {
    const { user } = setup(<CreateQuestionBankDialog />);

    // Open dialog
    await user.click(
      screen.getByRole('button', { name: /add question bank/i }),
    );

    // Try to submit with short name using Enter
    await user.type(screen.getByLabelText('Name'), 'A');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(
        screen.getByText('Name must be at least 2 characters.'),
      ).toBeInTheDocument();
    });

    // Should not call the mutation
    expect(mockCreateQuestionBank).not.toHaveBeenCalled();
  });
});
