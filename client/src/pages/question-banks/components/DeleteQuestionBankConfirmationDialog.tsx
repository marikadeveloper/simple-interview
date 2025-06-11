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
  QuestionBankFragment,
  useDeleteQuestionBankMutation,
} from '@/generated/graphql';
import { Trash } from 'lucide-react';
import React, { useState } from 'react';

interface DeleteQuestionBankConfirmationDialogProps {
  questionBank: QuestionBankFragment;
}
export const DeleteQuestionBankConfirmationDialog: React.FC<
  DeleteQuestionBankConfirmationDialogProps
> = ({ questionBank }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [, deleteQuestionBank] = useDeleteQuestionBankMutation();

  const handleDelete = async () => {
    await deleteQuestionBank({ id: questionBank.id });
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
              Are you sure you want to delete "{questionBank?.name}"? This
              action cannot be undone.
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
              onClick={() => questionBank && handleDelete()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
