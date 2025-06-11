import { QuestionBankFragment } from '@/generated/graphql';
import { ColumnDef } from '@tanstack/react-table';
import { QuestionBankActions } from './components/QuestionBankActions';

export const columns: ColumnDef<QuestionBankFragment>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    id: 'actions',
    cell: ({ row }) => <QuestionBankActions questionBank={row.original} />,
  },
];
