import type { InterviewTemplateFragment } from '@/generated/graphql';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { columns } from './columns';

// Mock InterviewTemplateActions
vi.mock('./components/InterviewTemplateActions', () => ({
  InterviewTemplateActions: () => <div data-testid='test-actions'>Actions</div>,
}));

function TestTableRow({ template }: { template: InterviewTemplateFragment }) {
  const table = useReactTable({
    data: [template],
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

describe('interview-templates/columns', () => {
  const template: InterviewTemplateFragment = {
    __typename: 'InterviewTemplate',
    id: 1,
    name: 'Frontend Template',
    description: 'A template for frontend interviews',
    updatedAt: '2023-01-01T00:00:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    slug: 'frontend-template',
    tags: [
      { __typename: 'Tag', id: 10, text: 'React' },
      { __typename: 'Tag', id: 11, text: 'UI' },
    ],
  };

  it('renders name and description columns', () => {
    render(<TestTableRow template={template} />);
    expect(screen.getByText('Frontend Template')).toBeInTheDocument();
    expect(
      screen.getByText('A template for frontend interviews'),
    ).toBeInTheDocument();
  });

  it('renders tags as badges', () => {
    render(<TestTableRow template={template} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('UI')).toBeInTheDocument();
  });

  it('renders actions column', () => {
    render(<TestTableRow template={template} />);
    expect(screen.getByTestId('test-actions')).toBeInTheDocument();
  });
});
