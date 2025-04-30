import { DataTable } from '@/components/ui/data-table';
import { useGetUsersQuery, User } from '@/generated/graphql';
import { columns } from './columns';

export const Users = () => {
  const [{ fetching, data }] = useGetUsersQuery({
    variables: {
      filters: {},
    },
  });

  return (
    <div className='container mx-auto py-10'>
      <DataTable
        columns={columns}
        data={(data?.getUsers as User[]) || []}
      />
    </div>
  );
};

export default Users;
