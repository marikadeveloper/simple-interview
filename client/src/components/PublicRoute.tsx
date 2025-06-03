import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/generated/graphql';
import { PropsWithChildren } from 'react';
import { Navigate } from 'react-router';

// Component to redirect authenticated users away from auth pages
export const PublicRoute: React.FC<PropsWithChildren> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated && (user?.role === UserRole.Admin || user?.isActive)) {
    return (
      <Navigate
        to='/dashboard'
        replace
      />
    );
  }

  return <>{children}</>;
};
