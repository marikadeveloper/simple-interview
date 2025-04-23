import { useAuth } from '@/contexts/AuthContext';
import { useNavLinks } from '@/hooks/useNavLinks';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Link } from 'react-router';
import { MobileNavigationLink } from './MobileNavigationLink';
import { NavigationLink } from './NavigationLink';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navLinks = useNavLinks();

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Function to close mobile menu (used when clicking a nav link)
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  return (
    <>
      {/* Navigation bar */}
      <header className='sticky top-0 z-10 border-b bg-background shadow-sm'>
        <div className='flex h-16 items-center justify-between px-8 size-full'>
          {/* Left side - Logo and navigation links */}
          <div className='flex items-center gap-6'>
            <Link
              to='/dashboard'
              className='text-xl font-bold'>
              Simple Interview
            </Link>

            {/* Desktop navigation */}
            <nav className='hidden md:flex space-x-4'>
              {navLinks.map((link) => (
                <NavigationLink
                  key={link.route}
                  link={link}
                />
              ))}
            </nav>
          </div>

          {/* Right side - User info, logout, and mobile menu button */}
          <div className='flex items-center gap-4'>
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className='block md:hidden rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground'
              aria-label='Toggle menu'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                {mobileMenuOpen ? (
                  <>
                    <line
                      x1='18'
                      y1='6'
                      x2='6'
                      y2='18'
                    />
                    <line
                      x1='6'
                      y1='6'
                      x2='18'
                      y2='18'
                    />
                  </>
                ) : (
                  <>
                    <line
                      x1='4'
                      y1='12'
                      x2='20'
                      y2='12'
                    />
                    <line
                      x1='4'
                      y1='6'
                      x2='20'
                      y2='6'
                    />
                    <line
                      x1='4'
                      y1='18'
                      x2='20'
                      y2='18'
                    />
                  </>
                )}
              </svg>
            </button>

            {user && (
              <>
                <div className='hidden md:block'>
                  <div className='text-sm font-medium'>{user.fullName}</div>
                  <div className='text-xs text-muted-foreground capitalize'>
                    {user.role.toLowerCase()}
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  className='hidden md:block rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20'>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile navigation drawer */}
        <div
          className={cn(
            'fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-background p-6 shadow-lg transform transition-transform duration-200 ease-in-out md:hidden',
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
          )}>
          <div className='flex flex-col h-full'>
            {/* Close button */}
            <div className='flex justify-end mb-6'>
              <button
                onClick={toggleMobileMenu}
                className='p-2 rounded-md hover:bg-accent'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'>
                  <line
                    x1='18'
                    y1='6'
                    x2='6'
                    y2='18'
                  />
                  <line
                    x1='6'
                    y1='6'
                    x2='18'
                    y2='18'
                  />
                </svg>
              </button>
            </div>

            {/* Mobile nav links */}
            <nav className='flex flex-col space-y-4'>
              {navLinks.map((link) => (
                <MobileNavigationLink
                  key={link.route}
                  link={link}
                  onLinkClick={closeMobileMenu}
                />
              ))}
            </nav>

            {/* User info in mobile menu */}
            {user && (
              <div className='mt-auto pt-6 border-t'>
                <div className='text-sm font-medium'>{user.fullName}</div>
                <div className='text-xs text-muted-foreground capitalize mb-4'>
                  {user.role.toLowerCase()}
                </div>
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className='w-full rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20'>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Overlay when mobile menu is open */}
      {mobileMenuOpen && (
        <div
          className='fixed inset-0 bg-black/20 z-9 md:hidden'
          onClick={closeMobileMenu}
          aria-hidden='true'
        />
      )}
    </>
  );
};
