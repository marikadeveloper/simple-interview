// @vitest-environment jsdom
import type { QuestionBankFragment } from '@/generated/graphql';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { columns } from './columns';

// Mock QuestionBankActions
vi.mock('./components/QuestionBankActions', () => ({
  QuestionBankActions: () => <div data-testid='test-actions'>Actions</div>,
}));

function TestTableRow({
  questionBank,
}: {
  questionBank: QuestionBankFragment;
}) {
  const table = useReactTable({
    data: [questionBank],
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

describe('question-banks/columns', () => {
  const questionBank: QuestionBankFragment = {
    __typename: 'QuestionBank',
    id: 1,
    name: 'Frontend Bank',
    slug: 'frontend-bank',
  };

  it('renders name column', () => {
    render(<TestTableRow questionBank={questionBank} />);
    expect(screen.getByText('Frontend Bank')).toBeInTheDocument();
  });

  it('renders actions column', () => {
    render(<TestTableRow questionBank={questionBank} />);
    expect(screen.getByTestId('test-actions')).toBeInTheDocument();
  });
});
