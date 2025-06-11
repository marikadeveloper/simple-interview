import { useGetQuestionBankQuery } from '@/generated/graphql';
import { useState } from 'react';
import { useParams } from 'react-router';
import { QuestionCard } from '../interview-template/components/QuestionCard';
import { QuestionList } from '../interview-template/components/QuestionList';
import { FormHeading } from './components/FormHeading';
import { ReadonlyHeading } from './components/ReadonlyHeading';

const QuestionBank = () => {
  const { id } = useParams();
  const [formVisible, setFormVisible] = useState(false);
  const [{ fetching, data }] = useGetQuestionBankQuery({
    variables: { id: parseInt(id as string) },
  });

  if (fetching) {
    return <div>Loading...</div>;
  }

  if (!data?.getQuestionBank || !id) {
    return <div>No question bank found</div>;
  }

  const questionBank = data.getQuestionBank;
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
        <QuestionCard questionBankId={id} />
        <div className='mt-4'>
          <QuestionList
            key={questionBank.questions?.length}
            questions={questionBank.questions}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
