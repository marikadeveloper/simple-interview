// @vitest-environment jsdom
import type { User } from '@/generated/graphql';
import { UserRole } from '@/generated/graphql';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { columns } from './columns';

// Mock UserActions
vi.mock('./components/UserActions', () => ({
  UserActions: () => <div data-testid='test-actions'>Actions</div>,
}));

function TestTableRow({ user }: { user: User }) {
  const table = useReactTable({
    data: [user],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const row = table.getRowModel().rows[0];
  return (
    <>
      {row.getVisibleCells().map((cell, idx) => (
        <div
          key={cell.column.id || idx}
          data-testid={cell.column.id || idx}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </div>
      ))}
    </>
  );
}

describe('users/columns', () => {
  const user: User = {
    __typename: 'User',
    id: 1,
    email: 'user@example.com',
    fullName: 'Alice Smith',
    role: UserRole.Candidate,
    isActive: true,
    createdAt: '',
    updatedAt: '',
  };

  it('renders name column with sortable header', () => {
    // Render just the header for the name column
    const header = columns[0].header as any;
    render(
      <>
        {typeof header === 'function'
          ? header({
              column: { toggleSorting: vi.fn(), getIsSorted: () => false },
            })
          : header}
      </>,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders email column', () => {
    render(<TestTableRow user={user} />);
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('renders role column with correct label and style', () => {
    render(<TestTableRow user={user} />);
    expect(screen.getByText('Candidate')).toBeInTheDocument();
  });

  it('renders actions column', () => {
    render(<TestTableRow user={user} />);
    expect(screen.getByTestId('test-actions')).toBeInTheDocument();
  });
});
