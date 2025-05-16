import {
  useGetInterviewTemplateQuery,
  useGetTagsQuery,
} from '@/generated/graphql';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { FormHeading } from './components/FormHeading';
import { QuestionCard } from './components/QuestionCard';
import { QuestionList } from './components/QuestionList';
import { ReadonlyHeading } from './components/ReadonlyHeading';

const InterviewTemplate = () => {
  const { id } = useParams();
  const [formVisible, setFormVisible] = useState(false);
  const [{ fetching, data }] = useGetInterviewTemplateQuery({
    variables: { id: parseInt(id as string) },
  });
  const [{ data: tagsData }] = useGetTagsQuery();
  const tags = useMemo(
    () =>
      tagsData?.getTags
        ? tagsData.getTags.map((t) => ({
            label: t.text,
            value: t.id.toString(),
          }))
        : [],
    [tagsData],
  );

  if (fetching) {
    return <div>Loading...</div>;
  }

  if (!data?.getInterviewTemplate || !id) {
    return <div>No template found</div>;
  }

  const interviewTemplate = data.getInterviewTemplate;
  return (
    <div className='container mx-auto'>
      <div className='flex align-top justify-between'>
        {!formVisible && (
          <ReadonlyHeading
            interviewTemplate={interviewTemplate}
            setFormVisible={setFormVisible}
          />
        )}
        {formVisible && (
          <FormHeading
            interviewTemplate={interviewTemplate}
            tags={tags}
            setFormVisible={setFormVisible}
          />
        )}
      </div>

      <div className='py-14'>
        {/* TODO: can add here question bank selection */}
        <QuestionCard templateId={id} />
        <div className='mt-4'>
          <QuestionList
            key={interviewTemplate.questions?.length}
            questions={interviewTemplate.questions}
          />
        </div>
      </div>
    </div>
  );
};

export default InterviewTemplate;
