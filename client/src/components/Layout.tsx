import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Outlet } from 'react-router';
import { AppSidebar } from './AppSidebar';
import { Toaster } from './ui/sonner';

export const Layout: React.FC = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className='grid min-h-screen w-full'>
        <SidebarTrigger />
        <div className='min-h-screen bg-background p-8'>
          <div className='mx-auto max-w-5xl'>
            <Outlet />
            <Toaster />
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};
