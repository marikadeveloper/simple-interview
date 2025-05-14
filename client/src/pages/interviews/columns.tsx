import {
  InterviewListItemFragment,
  InterviewStatus,
  InterviewTemplateFragment,
  UserFragment,
} from '@/generated/graphql';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<InterviewListItemFragment>[] = [
  {
    id: 'candidate',
    header: 'Candidate',
    cell: ({ row }) => {
      console.log(row);
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
];
