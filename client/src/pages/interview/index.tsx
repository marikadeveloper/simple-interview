import { useGetCandidateInterviewQuery } from '@/generated/graphql';
import { useParams } from 'react-router';

const Interview = () => {
  const { id } = useParams();
  const [{ data, fetching, error }] = useGetCandidateInterviewQuery({
    variables: { id: parseInt(id as string) },
  });

  if (fetching) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Interview {id}</div>;
};

export default Interview;
