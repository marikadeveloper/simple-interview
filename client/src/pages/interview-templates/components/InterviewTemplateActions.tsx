import { InterviewTemplateFragment } from '@/generated/graphql';
import React from 'react';
import { DeleteTemplateConfirmationDialog } from './DeleteTemplateConfirmationDialog';
import { EditTemplateDialog } from './EditTemplateDialog';

interface InterviewTemplateActionsProps {
  template: InterviewTemplateFragment;
}
export const InterviewTemplateActions: React.FC<
  InterviewTemplateActionsProps
> = ({ template }) => {
  return (
    <>
      {/* Edit Template Dialog */}
      <EditTemplateDialog template={template} />
      {/* Delete Template Confirmation Dialog */}
      <DeleteTemplateConfirmationDialog template={template} />
    </>
  );
};
