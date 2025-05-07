import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import { useGetInterviewTemplateQuery } from '@/generated/graphql';
import { useParams } from 'react-router';
import { QuestionCard } from './components/QuestionCard';

const InterviewTemplate = () => {
  const { id } = useParams();
  const [{ fetching, data }] = useGetInterviewTemplateQuery({
    variables: { id: parseInt(id as string) },
  });
  console.log(data);

  if (fetching) {
    return <div>Loading...</div>;
  }

  if (!data?.getInterviewTemplate || !id) {
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
          {/* <Button>Smth</Button> */}
        </div>
      </div>

      {/* TODO: update and edit question */}
      <div className='py-6'>
        <QuestionCard templateId={id} />
        <div className='mt-4'>
          {interviewTemplate.questions?.map((question) => (
            <QuestionCard
              key={question.id}
              templateId={id}
              question={question}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterviewTemplate;
