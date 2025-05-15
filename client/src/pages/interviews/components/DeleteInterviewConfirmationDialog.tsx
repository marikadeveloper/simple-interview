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
  InterviewListItemFragment,
  useDeleteInterviewMutation,
} from '@/generated/graphql';
import { Trash } from 'lucide-react';
import React, { useState } from 'react';

interface DeleteInterviewConfirmationDialogProps {
  interview: InterviewListItemFragment;
}
export const DeleteInterviewConfirmationDialog: React.FC<
  DeleteInterviewConfirmationDialogProps
> = ({ interview }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [, deleteInterview] = useDeleteInterviewMutation();

  const handleDelete = async () => {
    await deleteInterview({ id: interview.id });
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant='outline'
        size='icon'
        onClick={() => setIsOpen(true)}>
        <Trash />
      </Button>
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the interview "
              {interview.user.fullName} @ {interview.interviewTemplate.name}"?
              This action cannot be undone.
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
              onClick={() => interview && handleDelete()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
