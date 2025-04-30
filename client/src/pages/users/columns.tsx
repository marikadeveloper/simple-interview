import { User } from '@/generated/graphql';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'fullName',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role: string = row.getValue('role');
      return <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>;
    },
  },
];
