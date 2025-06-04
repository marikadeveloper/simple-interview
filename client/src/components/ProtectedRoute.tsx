import { UserRole } from '@/generated/graphql';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

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
    return <div>Loading...</div>;
  }

  if (!user || (allowedUserRoles && !allowedUserRoles.includes(user.role))) {
    return (
      <Navigate
        to='/login'
        replace
      />
    );
  }

  if (
    [UserRole.Candidate, UserRole.Interviewer].includes(user.role) &&
    !user.isActive
  ) {
    return (
      <Navigate
        to='/first-password-change'
        replace
      />
    );
  }

  return <>{children}</>;
};
