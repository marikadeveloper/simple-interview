import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/generated/graphql';
import { Navigate } from 'react-router';
import CandidateDashboard from './variants/CandidateDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  // This is frail. Ideally, we would block every route
  if (
    user &&
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

  if (user?.role === UserRole.Candidate) {
    return <CandidateDashboard />;
  }

  return (
    <>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <PageTitle>Dashboard</PageTitle>
          <PageSubtitle>Welcome back, {user?.fullName}</PageSubtitle>
        </div>
      </div>
    </>
  );
}
