import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Outlet } from 'react-router';
import { AppSidebar } from './AppSidebar';
import { AppBreadcrumb } from './Breadcrumb';
import { Toaster } from './ui/sonner';

export function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className='grid min-h-screen w-full'>
        <SidebarTrigger />
        <div className='min-h-screen bg-background'>
          <AppBreadcrumb />
          <div className='p-8'>
            <div className='mx-auto max-w-5xl'>
              <Outlet />
              <Toaster />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
