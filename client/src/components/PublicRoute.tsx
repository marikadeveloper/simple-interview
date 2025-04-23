import { useAuth } from '@/contexts/AuthContext';
import { PropsWithChildren } from 'react';
import { Navigate } from 'react-router';

// Component to redirect authenticated users away from auth pages
export const PublicRoute: React.FC<PropsWithChildren> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to='/dashboard'
        replace
      />
    );
  }

  return <>{children}</>;
};
