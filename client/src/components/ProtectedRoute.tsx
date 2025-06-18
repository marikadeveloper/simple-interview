import { UserRole } from '@/generated/graphql';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { DetailPageSkeleton } from './ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedUserRoles,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <DetailPageSkeleton contentBlocks={2} />;
  }

  if (!user || (allowedUserRoles && !allowedUserRoles.includes(user.role))) {
    return (
      <Navigate
        to='/login'
        replace
      />
    );
  }

  return <>{children}</>;
};
