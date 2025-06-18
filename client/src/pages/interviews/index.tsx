import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/generated/graphql';
import { NotAuthorizedPage } from '../auth/NotAuthorizedPage';
import { AdminInterviews } from './variants/AdminInterviews';
import { CandidateInterviews } from './variants/CandidateInterviews';

const Interviews = () => {
  const { user } = useAuth();

  if (!user) return <NotAuthorizedPage />;

  if ([UserRole.Admin, UserRole.Interviewer].includes(user.role)) {
    return <AdminInterviews />;
  }
  if (user.role === UserRole.Candidate) {
    return <CandidateInterviews />;
  }
};

export default Interviews;
