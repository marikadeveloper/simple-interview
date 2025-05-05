import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InterviewTemplateFragment,
  useDeleteInterviewTemplateMutation,
} from '@/generated/graphql';
import React from 'react';

interface DeleteTemplateConfirmationDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  template: InterviewTemplateFragment;
}
export const DeleteTemplateConfirmationDialog: React.FC<
  DeleteTemplateConfirmationDialogProps
> = ({ isOpen, setIsOpen, template }) => {
  const [, deleteInterviewTemplate] = useDeleteInterviewTemplateMutation();

  const handleDelete = async () => {
    await deleteInterviewTemplate({ id: template.id });
    setIsOpen(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{template?.name}"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={() => template && handleDelete()}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
