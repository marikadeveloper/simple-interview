import { UserRole } from '@/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { DeleteUserConfirmationDialog } from './DeleteUserConfirmationDialog';

// Mock mutation
const mockDeleteUser = vi.fn();

vi.mock('@/generated/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/generated/graphql')>(
    '@/generated/graphql',
  );
  return {
    ...actual,
    useDeleteUserMutation: () => [null, mockDeleteUser],
    UserRole: actual.UserRole,
  };
});

vi.mock('@/hooks/useMutationWithToast', () => ({
  useMutationWithToast: (_mutation: any) => [null, mockDeleteUser],
}));

const mockUser = {
  __typename: 'User' as const,
  id: 42,
  email: 'delete.me@example.com',
  fullName: 'Delete Me',
  role: UserRole.Candidate,
  isActive: true,
};

describe('DeleteUserConfirmationDialog', () => {
  beforeEach(() => {
    mockDeleteUser.mockReset();
  });

  it('renders trigger button and opens dialog', async () => {
    render(<DeleteUserConfirmationDialog user={mockUser} />);
    const trigger = screen.getByRole('button');
    expect(trigger).toBeInTheDocument();
    await userEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Are you sure you want to delete the user "delete.me@example.com"/i,
      ),
    ).toBeInTheDocument();
  });

  it('closes dialog when Cancel is clicked', async () => {
    render(<DeleteUserConfirmationDialog user={mockUser} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('calls deleteUser mutation and closes dialog on success', async () => {
    mockDeleteUser.mockResolvedValue({ data: { deleteUser: true } });
    render(<DeleteUserConfirmationDialog user={mockUser} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith({ id: 42 });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('does not close dialog if mutation fails', async () => {
    mockDeleteUser.mockResolvedValue({ data: { deleteUser: false } });
    render(<DeleteUserConfirmationDialog user={mockUser} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith({ id: 42 });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
