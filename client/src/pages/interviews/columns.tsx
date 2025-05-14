import {
  InterviewListItemFragment,
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
];
