import { Button } from '@/components/ui/button';
import { User, UserRole } from '@/generated/graphql';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { UserActions } from './components/UserActions';

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'fullName',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Name
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role: UserRole = row.getValue('role');
      return (
        <span
          className={`px-2 py-1 rounded-full text-gray-900 text-xs ${
            role === 'INTERVIEWER'
              ? 'bg-orange-100'
              : role === 'CANDIDATE'
              ? 'bg-blue-100'
              : 'bg-gray-100'
          }`}>
          {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
        </span>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <UserActions user={row.original} />,
  },
];
