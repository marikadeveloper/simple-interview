import { InterviewStatus, UserRole } from '@/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { DeleteInterviewConfirmationDialog } from './DeleteInterviewConfirmationDialog';

// Mock the mutation
const mockDeleteInterview = vi.fn();

// Mock useMutationWithToast to return the mock function
vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useDeleteInterviewMutation: () => [null, mockDeleteInterview],
  };
});

// Mock useMutationWithToast to just return the mutation function
vi.mock('@/hooks/useMutationWithToast', () => ({
  useMutationWithToast: (_mutation: any) => [
    null,
    (args: any) => _mutation()[1](args),
  ],
}));

describe('DeleteInterviewConfirmationDialog', () => {
  const mockPendingInterview = {
    __typename: 'Interview' as const,
    id: 1,
    deadline: '2023-12-31T23:59:59Z',
    status: InterviewStatus.Pending,
    evaluationValue: null,
    slug: 'test-interview',
    completedAt: null,
    interviewTemplate: {
      __typename: 'InterviewTemplate' as const,
      id: 1,
      name: 'Test Template',
      description: 'Test Description',
      updatedAt: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      slug: 'test-template',
      tags: null,
    },
    user: {
      __typename: 'User' as const,
      id: 1,
      email: 'test@example.com',
      fullName: 'Test User',
      role: UserRole.Candidate,
      isActive: true,
    },
    interviewer: {
      __typename: 'User' as const,
      id: 2,
      email: 'interviewer@example.com',
      fullName: 'Interviewer User',
      role: UserRole.Interviewer,
      isActive: true,
    },
  };

  const mockCompletedInterview = {
    ...mockPendingInterview,
    status: InterviewStatus.Completed,
  };

  beforeEach(() => {
    mockDeleteInterview.mockReset();
  });

  it('renders delete button enabled for pending interview', () => {
    render(
      <DeleteInterviewConfirmationDialog interview={mockPendingInterview} />,
    );
    const deleteButton = screen.getByRole('button');
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).not.toBeDisabled();
  });

  it('renders delete button disabled for completed interview', () => {
    render(
      <DeleteInterviewConfirmationDialog interview={mockCompletedInterview} />,
    );
    const deleteButton = screen.getByRole('button');
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();
  });

  it('opens dialog when delete button is clicked for pending interview', async () => {
    const user = userEvent.setup();
    render(
      <DeleteInterviewConfirmationDialog interview={mockPendingInterview} />,
    );

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Are you sure you want to delete the interview "Test User @ Test Template"/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('closes dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <DeleteInterviewConfirmationDialog interview={mockPendingInterview} />,
    );

    // Open dialog
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();

    // Close dialog
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
  });

  it('deletes interview when delete button is clicked for pending interview', async () => {
    const user = userEvent.setup();
    mockDeleteInterview.mockResolvedValue({ error: null });
    render(
      <DeleteInterviewConfirmationDialog interview={mockPendingInterview} />,
    );

    // Open dialog
    await user.click(screen.getByRole('button'));

    // Click delete
    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(mockDeleteInterview).toHaveBeenCalledWith({ id: 1 });
    });

    // Dialog should close after successful deletion
    await waitFor(() => {
      expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
    });
  });

  it('does not close dialog when deletion fails', async () => {
    const user = userEvent.setup();
    mockDeleteInterview.mockResolvedValue({ error: 'Deletion failed' });
    render(
      <DeleteInterviewConfirmationDialog interview={mockPendingInterview} />,
    );

    // Open dialog
    await user.click(screen.getByRole('button'));

    // Click delete
    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(mockDeleteInterview).toHaveBeenCalledWith({ id: 1 });
    });

    // Dialog should remain open when deletion fails
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
  });

  it('does not call delete mutation for completed interview', async () => {
    const user = userEvent.setup();
    render(
      <DeleteInterviewConfirmationDialog interview={mockCompletedInterview} />,
    );

    // Open dialog
    await user.click(screen.getByRole('button'));

    // No delete button should be present
    expect(
      screen.queryByRole('button', { name: /delete/i }),
    ).not.toBeInTheDocument();

    // Should not call delete mutation
    expect(mockDeleteInterview).not.toHaveBeenCalled();
  });
});
