import { InterviewListItemFragment } from '@/generated/graphql';
import React from 'react';
import { DeleteInterviewConfirmationDialog } from './DeleteInterviewConfirmationDialog';

interface InterviewActionsProps {
  interview: InterviewListItemFragment;
}
export const InterviewActions: React.FC<InterviewActionsProps> = ({
  interview,
}) => {
  return (
    <>
      <DeleteInterviewConfirmationDialog interview={interview} />
    </>
  );
};
