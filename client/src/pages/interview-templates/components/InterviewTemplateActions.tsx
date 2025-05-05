import { Button } from '@/components/ui/button';
import { InterviewTemplateFragment } from '@/generated/graphql';
import { Pencil, Trash } from 'lucide-react';
import React from 'react';
import { DeleteTemplateConfirmationDialog } from './DeleteTemplateConfirmationDialog';
import { EditTemplateDialog } from './EditTemplateDialog';

interface InterviewTemplateActionsProps {
  template: InterviewTemplateFragment;
}
export const InterviewTemplateActions: React.FC<
  InterviewTemplateActionsProps
> = ({ template }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);

  const openEditDialog = () => {
    setIsEditDialogOpen(true);
  };
  const openDeleteConfirm = () => {
    setIsDeleteConfirmOpen(true);
  };

  return (
    <>
      <Button
        variant='outline'
        size='icon'
        className='mr-1.5'
        onClick={() => openEditDialog()}>
        <Pencil />
      </Button>
      <Button
        variant='outline'
        size='icon'
        onClick={() => openDeleteConfirm()}>
        <Trash />
      </Button>

      {/* Edit Template Dialog */}
      <EditTemplateDialog
        template={template}
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
      />
      {/* Delete Template Confirmation Dialog */}
      <DeleteTemplateConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        setIsOpen={setIsDeleteConfirmOpen}
        template={template}
      />
    </>
  );
};
