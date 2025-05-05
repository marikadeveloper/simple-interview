import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InterviewTemplateFragment } from '@/generated/graphql';
import { MoreHorizontal } from 'lucide-react';
import React from 'react';
import { DeleteTemplateConfirmationDialog } from './DeleteTemplateConfirmationDialog';
import { EditTemplateDialog } from './EditTemplateDialog';
import { EditTemplateTagsDialog } from './EditTemplateTagsDialog';

interface InterviewTemplateActionsProps {
  template: InterviewTemplateFragment;
}
export const InterviewTemplateActions: React.FC<
  InterviewTemplateActionsProps
> = ({ template }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);

  const openEditDialog = () => {
    setIsEditDialogOpen(true);
  };
  const openTagDialog = () => {
    setIsTagDialogOpen(true);
  };
  const openDeleteConfirm = () => {
    setIsDeleteConfirmOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => openEditDialog()}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openTagDialog()}>
            Manage Tags
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => openDeleteConfirm()}
            className='text-red-600 focus:text-red-600'>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Template Dialog */}
      <EditTemplateDialog
        template={template}
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
      />

      {/* Edit Template Tags Dialog */}
      <EditTemplateTagsDialog
        template={template}
        isOpen={isTagDialogOpen}
        setIsOpen={setIsTagDialogOpen}
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
