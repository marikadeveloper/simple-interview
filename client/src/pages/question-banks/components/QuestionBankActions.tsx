import { Button } from '@/components/ui/button';
import { QuestionBankFragment } from '@/generated/graphql';
import { Pencil } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router';
import { DeleteQuestionBankConfirmationDialog } from './DeleteQuestionBankConfirmationDialog';

interface QuestionBankActionsProps {
  questionBank: QuestionBankFragment;
}
export const QuestionBankActions: React.FC<QuestionBankActionsProps> = ({
  questionBank,
}) => {
  return (
    <>
      <Link to={`/question-banks/${questionBank.slug}`}>
        <Button
          variant='outline'
          size='icon'
          className='mr-2'>
          <Pencil />
        </Button>
      </Link>
      <DeleteQuestionBankConfirmationDialog questionBank={questionBank} />
    </>
  );
};
