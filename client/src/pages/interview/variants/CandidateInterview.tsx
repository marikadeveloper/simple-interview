import { NotFoundPage } from '@/components/NotFoundPage';
import {
  CandidateInterviewFragment,
  useGetCandidateInterviewBySlugQuery,
} from '@/generated/graphql';
import { useParams } from 'react-router';
import { InterviewSession } from '../components/InterviewSession';

export const CandidateInterview = () => {
  const { slug } = useParams();
  const [{ data, error }] = useGetCandidateInterviewBySlugQuery({
    variables: { slug: slug as string },
  });

  if (error || !data || !data.getCandidateInterviewBySlug)
    return <NotFoundPage message='Interview not found' />;

  const interview: CandidateInterviewFragment =
    data.getCandidateInterviewBySlug;

  return <InterviewSession interview={interview} />;
};
