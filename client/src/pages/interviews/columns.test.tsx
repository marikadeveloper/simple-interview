// @vitest-environment jsdom
import type {
  InterviewEvaluation,
  InterviewListItemFragment,
  InterviewStatus,
  InterviewTemplateFragment,
  UserFragment,
} from '@/generated/graphql';
import { UserRole } from '@/generated/graphql';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { columns } from './columns';

// Mock InterviewActions and InterviewEvaluationIcon
vi.mock('./components/IntreviewActions', () => ({
  InterviewActions: () => <div data-testid='test-actions'>Actions</div>,
}));
vi.mock('@/components/InterviewEvaluationIcon', () => ({
  InterviewEvaluationIcon: ({
    evaluation,
  }: {
    evaluation: InterviewEvaluation;
  }) => <span data-testid='test-eval'>{evaluation}</span>,
}));

function TestTableRow({ interview }: { interview: InterviewListItemFragment }) {
  const table = useReactTable({
    data: [interview],
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

describe('interviews/columns', () => {
  const candidate: UserFragment = {
    __typename: 'User',
    id: 1,
    email: 'candidate@example.com',
    fullName: 'Jane Doe',
    role: UserRole.Candidate,
    isActive: true,
  };
  const interviewer: UserFragment = {
    __typename: 'User',
    id: 2,
    email: 'interviewer@example.com',
    fullName: 'John Smith',
    role: UserRole.Interviewer,
    isActive: true,
  };
  const template: InterviewTemplateFragment = {
    __typename: 'InterviewTemplate',
    id: 3,
    name: 'Frontend Template',
    description: '',
    updatedAt: '',
    createdAt: '',
    slug: 'frontend-template',
    tags: [],
  };
  const interview: InterviewListItemFragment = {
    __typename: 'Interview',
    id: 10,
    deadline: '2024-12-31T23:59:59Z',
    status: 'COMPLETED' as InterviewStatus,
    evaluationValue: 'GOOD' as InterviewEvaluation,
    slug: 'interview-10',
    completedAt: '2024-12-31T23:59:59Z',
    interviewTemplate: template,
    user: candidate,
    interviewer,
  };

  it('renders candidate and template columns', () => {
    render(<TestTableRow interview={interview} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Frontend Template')).toBeInTheDocument();
  });

  it('renders deadline in correct format', () => {
    render(<TestTableRow interview={interview} />);
    expect(screen.getByText('01/01/2025')).toBeInTheDocument();
  });

  it('renders status with correct label and style', () => {
    render(<TestTableRow interview={interview} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders evaluation with interviewer and icon', () => {
    render(<TestTableRow interview={interview} />);
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByTestId('test-eval')).toHaveTextContent('GOOD');
  });

  it('renders actions column', () => {
    render(<TestTableRow interview={interview} />);
    expect(screen.getByTestId('test-actions')).toBeInTheDocument();
  });
});
