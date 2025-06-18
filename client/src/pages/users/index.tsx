import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useGetUsersQuery, User, UserRole } from '@/generated/graphql';
import { useState } from 'react';
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
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('');
  const [{ data, fetching }, reexecuteQuery] = useGetUsersQuery({
    variables: {
      filter: filter || undefined,
    },
    requestPolicy: 'network-only',
  });

  const handleSearch = () => {
    setFilter(inputValue);
  };

  useEffect(() => {
    reexecuteQuery({ requestPolicy: 'network-only' });
  }, [filter, reexecuteQuery]);
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
        <div className='flex gap-2 items-center mb-4'>
          <Input
            type='text'
            placeholder='Filter by name or email...'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className='w-full max-w-xs'
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>
        {fetching ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={(data?.getUsers as User[]) || []}
          />
        )}
      </div>
    </div>
  );
};

export default Users;
