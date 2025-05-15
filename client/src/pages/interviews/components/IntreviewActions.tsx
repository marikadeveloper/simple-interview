import { InterviewListItemFragment } from '@/generated/graphql';
import React from 'react';
import { DeleteInterviewConfirmationDialog } from './DeleteInterviewConfirmationDialog';
import { UpdateInterviewDialog } from './UpdateInterviewDialog';

interface InterviewActionsProps {
  interview: InterviewListItemFragment;
}
export const InterviewActions: React.FC<InterviewActionsProps> = ({
  interview,
}) => {
  return (
    <div className='space-x-2'>
      <UpdateInterviewDialog interview={interview} />
      <DeleteInterviewConfirmationDialog interview={interview} />
    </div>
  );
};
