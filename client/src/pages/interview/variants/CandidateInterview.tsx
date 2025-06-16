import {
  CandidateInterviewFragment,
  useGetCandidateInterviewBySlugQuery,
} from '@/generated/graphql';
import { useParams } from 'react-router';
import { InterviewSession } from '../components/InterviewSession';

export const CandidateInterview = () => {
  const { slug } = useParams();
  const [{ data, fetching, error }] = useGetCandidateInterviewBySlugQuery({
    variables: { slug: slug as string },
  });

  if (fetching) return <div>Loading...</div>;
  if (error || !data) return <div>Error: {error?.message}</div>;
  if (!data.getCandidateInterviewBySlug) return <div>Interview not found</div>;

  const interview: CandidateInterviewFragment =
    data.getCandidateInterviewBySlug;

  return <InterviewSession interview={interview} />;
};
