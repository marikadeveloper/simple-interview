import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/generated/graphql';
import { Navigate } from 'react-router';
import AdminDashboard from './variants/AdminDashboard';
import CandidateDashboard from './variants/CandidateDashboard';
import InterviewerDashboard from './variants/InterviewerDashboard';

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

  if (user?.role === UserRole.Admin) {
    return <AdminDashboard />;
  }

  if (user?.role === UserRole.Interviewer) {
    return <InterviewerDashboard />;
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
