import {
  CandidateInterviewFragment,
  useGetCandidateInterviewQuery,
} from '@/generated/graphql';
import { useParams } from 'react-router';
import { InterviewSession } from '../components/InterviewSession';

export const CandidateInterview = () => {
  const { id } = useParams();
  const [{ data, fetching, error }] = useGetCandidateInterviewQuery({
    variables: { id: parseInt(id as string) },
  });

  if (fetching) return <div>Loading...</div>;
  if (error || !data) return <div>Error: {error?.message}</div>;
  if (!data.getCandidateInterview) return <div>Interview not found</div>;

  const interview: CandidateInterviewFragment = data.getCandidateInterview;

  return <InterviewSession interview={interview} />;
};
