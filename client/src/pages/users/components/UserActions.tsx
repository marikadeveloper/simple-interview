import { UserFragment } from '@/generated/graphql';
import React from 'react';
import { DeleteUserConfirmationDialog } from './DeleteTemplateConfirmationDialog';

interface UserActionsProps {
  user: UserFragment;
}
export const UserActions: React.FC<UserActionsProps> = ({ user }) => {
  return (
    <>
      <DeleteUserConfirmationDialog user={user} />
    </>
  );
};
