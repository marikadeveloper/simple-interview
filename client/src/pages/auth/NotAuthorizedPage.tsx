import { Button } from '@/components/ui/button';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import { Link } from 'react-router';

export const NotAuthorizedPage: React.FC = () => {
  return (
    <div className='flex items-center justify-center p-4'>
      <div className='w-full max-w-md p-6 text-center'>
        <PageTitle>403</PageTitle>
        <PageSubtitle>You are not authorized to view this page.</PageSubtitle>
        <Link to='/'>
          <Button className='mt-6 w-full'>Return to Home</Button>
        </Link>
      </div>
    </div>
  );
};
