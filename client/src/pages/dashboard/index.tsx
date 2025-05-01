import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <PageTitle>Dashboard</PageTitle>
          <PageSubtitle>Welcome back, {user?.fullName}</PageSubtitle>
        </div>
      </div>

      {/* <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <div className='rounded-lg border bg-card p-6 shadow-sm'>
            <h2 className='mb-2 text-xl font-semibold'>Account Information</h2>
            <div className='space-y-2'>
              <div>
                <span className='block text-sm font-medium text-muted-foreground'>
                  Name
                </span>
                <span>{user?.fullName}</span>
              </div>
              <div>
                <span className='block text-sm font-medium text-muted-foreground'>
                  Email
                </span>
                <span>{user?.email}</span>
              </div>
              <div>
                <span className='block text-sm font-medium text-muted-foreground'>
                  Role
                </span>
                <span className='capitalize'>{user?.role.toLowerCase()}</span>
              </div>
            </div>
          </div>

          <div className='rounded-lg border bg-card p-6 shadow-sm'>
            <h2 className='mb-2 text-xl font-semibold'>Quick Actions</h2>
            <div className='mt-4 flex flex-col gap-2'>
              <button className='w-full rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80'>
                View Profile
              </button>
              <button className='w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground'>
                Settings
              </button>
            </div>
          </div>
        </div> */}
    </>
  );
}
