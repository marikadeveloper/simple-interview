import { Button } from '@/components/ui/button';
import { ElementWithTooltip } from '@/components/ui/element-with-tooltip';
import {
  InterviewListItemFragment,
  InterviewStatus,
} from '@/generated/graphql';
import { BookOpenCheck, Play } from 'lucide-react';
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
        <>
          <Link to={`/interviews/${interview.slug}`}>
            <ElementWithTooltip
              Element={
                <Button
                  variant='outline'
                  size='icon'>
                  <Play />
                </Button>
              }
              tooltip='Replay Interview'
            />
          </Link>
          <Link to={`/interviews/${interview.slug}/feedback`}>
            <ElementWithTooltip
              Element={
                <Button
                  variant='outline'
                  size='icon'>
                  <BookOpenCheck />
                </Button>
              }
              tooltip='Evaluate Interview'
            />
          </Link>
        </>
      )}
    </div>
  );
};
