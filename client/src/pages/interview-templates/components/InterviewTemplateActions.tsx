import { Button } from '@/components/ui/button';
import { InterviewTemplateFragment } from '@/generated/graphql';
import { Pencil } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router';
import { DeleteTemplateConfirmationDialog } from './DeleteTemplateConfirmationDialog';

interface InterviewTemplateActionsProps {
  template: InterviewTemplateFragment;
}
export const InterviewTemplateActions: React.FC<
  InterviewTemplateActionsProps
> = ({ template }) => {
  return (
    <>
      <Link to={`/interview-templates/${template.slug}`}>
        <Button
          variant='outline'
          size='icon'
          className='mr-2'>
          <Pencil />
        </Button>
      </Link>
      <DeleteTemplateConfirmationDialog template={template} />
    </>
  );
};
