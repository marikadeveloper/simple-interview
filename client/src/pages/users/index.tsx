import { DataTable } from '@/components/ui/data-table';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import { UserCreateDialog } from '@/components/UserCreateDialog';
import { useGetUsersQuery, User } from '@/generated/graphql';
import { columns } from './columns';

export const Users = () => {
  const [{ fetching, data }] = useGetUsersQuery({
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
        <UserCreateDialog />
      </div>

      <div className='py-4'>
        <DataTable
          columns={columns}
          data={(data?.getUsers as User[]) || []}
          filterableField='fullName'
        />
      </div>
    </div>
  );
};

export default Users;
