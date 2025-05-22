import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  InterviewStatus,
  useDeleteInterviewMutation,
} from '@/generated/graphql';
import { AlertCircle, Trash } from 'lucide-react';
import React, { useState } from 'react';

interface DeleteInterviewConfirmationDialogProps {
  interview: InterviewListItemFragment;
}
export const DeleteInterviewConfirmationDialog: React.FC<
  DeleteInterviewConfirmationDialogProps
> = ({ interview }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [, deleteInterview] = useDeleteInterviewMutation();
  const canDelete: boolean = interview.status === InterviewStatus.Pending;

  const handleDelete = async () => {
    if (!canDelete) return;
    await deleteInterview({ id: interview.id });
    setIsOpen(false);
  };

  const Fallback = () => (
    <Alert variant='destructive'>
      <AlertCircle className='h-4 w-4' />
      <AlertTitle>Attention</AlertTitle>
      <AlertDescription>
        You can only delete interviews that are pending.
      </AlertDescription>
    </Alert>
  );

  return (
    <>
      <Button
        variant='outline'
        size='icon'
        disabled={!canDelete}
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
            {!canDelete && <Fallback />}
          </DialogHeader>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            {canDelete && (
              <Button
                type='button'
                variant='destructive'
                onClick={() => interview && handleDelete()}>
                Delete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
