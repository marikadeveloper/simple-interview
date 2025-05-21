import { useParams } from 'react-router';

export const ReadonlyInterview = () => {
  const { id } = useParams();
  return <div>ReadonlyInterview</div>;
};
