import { Button } from '@/components/ui/button';
import {
  InterviewListItemFragment,
  InterviewStatus,
} from '@/generated/graphql';
import { Eye } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router';
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
      {interview.status === InterviewStatus.Pending && (
        <>
          <UpdateInterviewDialog interview={interview} />
          <DeleteInterviewConfirmationDialog interview={interview} />
        </>
      )}
      {interview.status === InterviewStatus.Completed && (
        <Link to={`/interviews/${interview.id}`}>
          <Button
            variant='outline'
            size='icon'>
            <Eye />
          </Button>
        </Link>
      )}
    </div>
  );
};
