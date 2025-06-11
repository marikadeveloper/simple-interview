import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/ui/page-title';
import { QuestionBankFragment } from '@/generated/graphql';
import { Pencil } from 'lucide-react';
import React from 'react';

interface ReadonlyHeadingProps {
  questionBank: QuestionBankFragment;
  setFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
export const ReadonlyHeading: React.FC<ReadonlyHeadingProps> = ({
  questionBank,
  setFormVisible,
}) => (
  <div className='w-full flex justify-between'>
    <div>
      <PageTitle>{questionBank.name}</PageTitle>
    </div>
    <div className='flex gap-2'>
      <Button
        variant='outline'
        onClick={() => setFormVisible(true)}>
        <Pencil />
      </Button>
    </div>
  </div>
);
