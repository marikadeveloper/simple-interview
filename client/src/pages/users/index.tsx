import { PageTitle } from '@/components/PageTitle';

export const Users = () => {
  return (
    <div>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <PageTitle>Users</PageTitle>
          <p className='text-muted-foreground'>Handle user accounts here</p>
        </div>
      </div>
      <p>List of users will be displayed here.</p>
    </div>
  );
};
