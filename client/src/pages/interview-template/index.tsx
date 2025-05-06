import { Button } from '@/components/ui/button';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import { useGetInterviewTemplateQuery } from '@/generated/graphql';
import { useParams } from 'react-router';

const InterviewTemplate = () => {
  const { id } = useParams();
  const [{ fetching, data }] = useGetInterviewTemplateQuery({
    variables: { id: parseInt(id as string) },
  });
  console.log(data);

  if (fetching) {
    return <div>Loading...</div>;
  }

  if (!data?.getInterviewTemplate) {
    return <div>No template found</div>;
  }

  const { getInterviewTemplate: interviewTemplate } = data;
  return (
    <div className='container mx-auto'>
      <div className='flex items-center justify-between'>
        <div>
          <PageTitle>{interviewTemplate.name}</PageTitle>
          <PageSubtitle>{interviewTemplate.description}</PageSubtitle>
          <div className='mt-2'>
            {interviewTemplate.tags?.map((tag) => (
              <span
                key={tag.id}
                className='inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800 mr-2'>
                {tag.text}
              </span>
            ))}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button>Smth</Button>
        </div>
      </div>

      <div className='py-4'></div>
    </div>
  );
};

export default InterviewTemplate;
