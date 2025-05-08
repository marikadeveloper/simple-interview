import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/generated/graphql';
import { AdminInterviews } from './variants/AdminInterviews';
import { CandidateInterviews } from './variants/CandidateInterviews';

const Interviews = () => {
  const { user } = useAuth();

  if (!user) return null;

  if ([UserRole.Admin, UserRole.Interviewer].includes(user.role)) {
    return <AdminInterviews />;
  }
  if (user.role === UserRole.Candidate) {
    return <CandidateInterviews />;
  }
};

export default Interviews;
