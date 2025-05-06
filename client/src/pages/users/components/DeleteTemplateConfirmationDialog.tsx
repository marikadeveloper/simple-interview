import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteUserMutation, UserFragment } from '@/generated/graphql';
import { Trash } from 'lucide-react';
import React, { useState } from 'react';

interface DeleteUserConfirmationDialogProps {
  user: UserFragment;
}
export const DeleteUserConfirmationDialog: React.FC<
  DeleteUserConfirmationDialogProps
> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [, deleteUser] = useDeleteUserMutation();

  const handleDelete = async () => {
    await deleteUser({ id: user.id });
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
              Are you sure you want to delete the user "{user?.email}"? This
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
              onClick={() => user && handleDelete()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
