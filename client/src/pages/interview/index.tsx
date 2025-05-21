import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/generated/graphql';
import { CandidateInterview } from './variants/CandidateInterview';
import { ReadonlyInterview } from './variants/ReadonlyInterview';

const Interview = () => {
  const { user } = useAuth();

  if (user?.role === UserRole.Candidate) {
    return <CandidateInterview />;
  }

  return <ReadonlyInterview />;
};

export default Interview;
