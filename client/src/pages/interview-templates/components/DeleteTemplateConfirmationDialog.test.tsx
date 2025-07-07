import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { DeleteTemplateConfirmationDialog } from './DeleteTemplateConfirmationDialog';

// Mock the mutation
const mockDeleteInterviewTemplate = vi.fn();

// Mock useMutationWithToast to return the mock function
vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useDeleteInterviewTemplateMutation: () => [
      null,
      mockDeleteInterviewTemplate,
    ],
  };
});

// Mock useMutationWithToast to just return the mutation function
vi.mock('@/hooks/useMutationWithToast', () => ({
  useMutationWithToast: (_mutation: any) => [
    null,
    (args: any) => _mutation()[1](args),
  ],
}));

describe('DeleteTemplateConfirmationDialog', () => {
  const mockTemplate = {
    __typename: 'InterviewTemplate' as const,
    id: 1,
    name: 'Test Template',
    description: 'Test Description',
    updatedAt: '2023-01-01T00:00:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    slug: 'test-template',
    tags: null,
  };

  beforeEach(() => {
    mockDeleteInterviewTemplate.mockReset();
  });

  it('renders delete button', () => {
    render(<DeleteTemplateConfirmationDialog template={mockTemplate} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens dialog when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteTemplateConfirmationDialog template={mockTemplate} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete "Test Template"/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('closes dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteTemplateConfirmationDialog template={mockTemplate} />);

    // Open dialog
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();

    // Close dialog
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
  });

  it('deletes template when delete button is clicked', async () => {
    const user = userEvent.setup();
    mockDeleteInterviewTemplate.mockResolvedValue({ error: null });
    render(<DeleteTemplateConfirmationDialog template={mockTemplate} />);

    // Open dialog
    await user.click(screen.getByRole('button'));

    // Click delete
    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(mockDeleteInterviewTemplate).toHaveBeenCalledWith({ id: 1 });
    });

    // Dialog should close after successful deletion
    await waitFor(() => {
      expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
    });
  });

  it('does not close dialog when deletion fails', async () => {
    const user = userEvent.setup();
    mockDeleteInterviewTemplate.mockResolvedValue({ error: 'Deletion failed' });
    render(<DeleteTemplateConfirmationDialog template={mockTemplate} />);

    // Open dialog
    await user.click(screen.getByRole('button'));

    // Click delete
    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(mockDeleteInterviewTemplate).toHaveBeenCalledWith({ id: 1 });
    });

    // Dialog should remain open when deletion fails
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
  });

  it('handles template with empty name gracefully', async () => {
    const user = userEvent.setup();
    const templateWithEmptyName = {
      ...mockTemplate,
      name: '',
    };
    render(
      <DeleteTemplateConfirmationDialog template={templateWithEmptyName} />,
    );

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete ""/),
    ).toBeInTheDocument();
  });
});
