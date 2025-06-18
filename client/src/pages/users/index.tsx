import { DataTable } from '@/components/ui/data-table';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useGetUsersQuery, User, UserRole } from '@/generated/graphql';
import { columns } from './columns';
import { CreateUserDialog } from './components/CreateUserDialog';

export const userRoles: {
  value: UserRole;
  label: string;
}[] = [
  { value: UserRole.Interviewer, label: 'Interviewer' },
  { value: UserRole.Candidate, label: 'Candidate' },
];

const Users = () => {
  const [{ data, fetching }] = useGetUsersQuery({
    variables: {
      filters: {},
    },
  });

  return (
    <div className='container mx-auto'>
      <div className='flex items-center justify-between'>
        <div>
          <PageTitle>Users</PageTitle>
          <PageSubtitle>
            Here you can create, delete, and update users.
          </PageSubtitle>
        </div>
        <div className='flex items-center gap-2'>
          <CreateUserDialog />
        </div>
      </div>

      <div className='py-4'>
        {fetching ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={(data?.getUsers as User[]) || []}
            filterableField='fullName'
          />
        )}
      </div>
    </div>
  );
};

export default Users;
