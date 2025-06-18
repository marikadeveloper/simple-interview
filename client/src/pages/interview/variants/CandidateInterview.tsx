import { DetailPageSkeleton } from '@/components/ui/skeleton';
import {
  CandidateInterviewFragment,
  useGetCandidateInterviewBySlugQuery,
} from '@/generated/graphql';
import { NotFoundPage } from '@/pages/auth/NotFoundPage';
import { useParams } from 'react-router';
import { InterviewSession } from '../components/InterviewSession';

export const CandidateInterview = () => {
  const { slug } = useParams();
  const [{ data, error, fetching }] = useGetCandidateInterviewBySlugQuery({
    variables: { slug: slug as string },
  });

  if (fetching) {
    return <DetailPageSkeleton />;
  }

  if (error || !data || !data.getCandidateInterviewBySlug)
    return <NotFoundPage message='Interview not found' />;

  const interview: CandidateInterviewFragment =
    data.getCandidateInterviewBySlug;

  return <InterviewSession interview={interview} />;
};
