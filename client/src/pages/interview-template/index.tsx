import { NotFoundPage } from '@/components/NotFoundPage';
import { QuestionList } from '@/components/QuestionList';
import {
  useGetInterviewTemplateBySlugQuery,
  useGetTagsQuery,
} from '@/generated/graphql';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { QuestionCard } from '../../components/QuestionCard';
import { FormHeading } from './components/FormHeading';
import { QuestionBankSelector } from './components/QuestionBankSelector';
import { ReadonlyHeading } from './components/ReadonlyHeading';

const InterviewTemplate = () => {
  const { slug } = useParams();
  const [formVisible, setFormVisible] = useState(false);
  const [{ data }] = useGetInterviewTemplateBySlugQuery({
    variables: { slug: slug as string },
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

  if (!data || !data.getInterviewTemplateBySlug)
    return <NotFoundPage message='Interview template not found' />;

  const interviewTemplate = data.getInterviewTemplateBySlug;
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
        <QuestionBankSelector templateId={interviewTemplate.id.toString()} />
        <div className='mt-4'>
          <QuestionCard templateId={interviewTemplate.id.toString()} />
        </div>
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
