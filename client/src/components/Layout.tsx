import { Outlet } from 'react-router';
import { Header } from './Header';
import { Toaster } from './ui/sonner';

export const Layout: React.FC = () => {
  return (
    <div className='flex min-h-screen flex-col'>
      {/* Navigation */}
      <Header />
      {/* Main content */}
      <main className='flex-1'>
        <div className='min-h-screen bg-background p-8'>
          <div className='mx-auto max-w-5xl'>
            <Outlet />
            <Toaster />
          </div>
        </div>
      </main>
    </div>
  );
};
