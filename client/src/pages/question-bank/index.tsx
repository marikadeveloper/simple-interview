import { QuestionList } from '@/components/QuestionList';
import { useGetQuestionBankBySlugQuery } from '@/generated/graphql';
import { useState } from 'react';
import { useParams } from 'react-router';
import { QuestionCard } from '../../components/QuestionCard';
import { FormHeading } from './components/FormHeading';
import { ReadonlyHeading } from './components/ReadonlyHeading';

const QuestionBank = () => {
  const { slug } = useParams();
  const [formVisible, setFormVisible] = useState(false);
  const [{ fetching, data }] = useGetQuestionBankBySlugQuery({
    variables: { slug: slug as string },
  });

  if (fetching) {
    return <div>Loading...</div>;
  }

  if (!data?.getQuestionBankBySlug || !slug) {
    return <div>No question bank found</div>;
  }

  const questionBank = data.getQuestionBankBySlug;
  return (
    <div className='container mx-auto'>
      <div className='flex align-top justify-between'>
        {!formVisible && (
          <ReadonlyHeading
            questionBank={questionBank}
            setFormVisible={setFormVisible}
          />
        )}
        {formVisible && (
          <FormHeading
            questionBank={questionBank}
            setFormVisible={setFormVisible}
          />
        )}
      </div>

      <div className='py-14'>
        <QuestionCard questionBankId={questionBank.id.toString()} />
        <div className='mt-4'>
          <QuestionList
            key={questionBank.questions?.length}
            questions={questionBank.questions || []}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
