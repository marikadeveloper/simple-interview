import { Link } from 'react-router';
import { Button } from './ui/button';
import { PageSubtitle } from './ui/page-subtitle';
import { PageTitle } from './ui/page-title';

interface NotFoundPageProps {
  message?: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  message = 'Page not found',
}) => {
  return (
    <div className='flex items-center justify-center p-4'>
      <div className='w-full max-w-md p-6 text-center'>
        <PageTitle>404</PageTitle>
        <PageSubtitle>{message}</PageSubtitle>
        <Link to='/dashboard'>
          <Button className='mt-6 w-full'>Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};
