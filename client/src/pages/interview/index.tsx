import { useParams } from 'react-router';

const Interview = () => {
  const { id } = useParams();
  return <div>Interview {id}</div>;
};

export default Interview;
