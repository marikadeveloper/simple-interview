import {
  InterviewEvaluation,
  InterviewListItemFragment,
  InterviewStatus,
  InterviewTemplateFragment,
  UserFragment,
} from '@/generated/graphql';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { Crown, ThumbsDown, ThumbsUp } from 'lucide-react';
import { InterviewActions } from './components/IntreviewActions';

export const columns: ColumnDef<InterviewListItemFragment>[] = [
  {
    id: 'candidate',
    header: 'Candidate',
    cell: ({ row }) => {
      const candidate: UserFragment = row.original.user;
      return candidate.fullName;
    },
  },
  {
    id: 'interviewTemplate',
    header: 'Interview Template',
    cell: ({ row }) => {
      const template: InterviewTemplateFragment =
        row.original.interviewTemplate;
      return template.name;
    },
  },
  {
    accessorKey: 'deadline',
    header: 'Deadline',
    cell: ({ row }) => {
      const deadline: string = row.getValue('deadline');
      return dayjs(deadline).format('DD/MM/YYYY');
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status: InterviewStatus = row.getValue('status');
      return (
        <span
          className={`px-2 py-1 rounded-full text-gray-900 text-xs ${
            status === 'PENDING'
              ? 'bg-orange-100'
              : status === 'IN_PROGRESS'
              ? 'bg-blue-100'
              : status === 'EXPIRED'
              ? 'bg-red-100'
              : status === 'COMPLETED'
              ? 'bg-green-100'
              : 'bg-gray-100'
          }`}>
          {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </span>
      );
    },
  },
  {
    id: 'evaluationValue',
    header: 'Evaluation',
    cell: ({ row }) => {
      const evaluation: InterviewEvaluation | null | undefined =
        row.original.evaluationValue;
      switch (evaluation) {
        case InterviewEvaluation.Bad:
          return <ThumbsDown className='w-4 h-4' />;
        case InterviewEvaluation.Good:
          return <ThumbsUp className='w-4 h-4' />;
        case InterviewEvaluation.Excellent:
          return <Crown className='w-4 h-4' />;
        default:
          return null;
      }
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <InterviewActions interview={row.original} />,
  },
];
