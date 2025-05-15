import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useGetCandidateInvitationsQuery } from '@/generated/graphql';
import { formatDateRelative } from '@/utils/dates';

export function PendingInvitesDialog() {
  const [{ fetching, data }] = useGetCandidateInvitationsQuery({
    variables: {
      used: false,
    },
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>Pending Invites</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Pending Candidate Invites</DialogTitle>
          <DialogDescription>
            Candidate invites that are pending and need to be accepted.
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-2'>
          {fetching ? (
            <p>Loading...</p>
          ) : data?.getCandidateInvitations?.length === 0 ? (
            <p>No pending invites</p>
          ) : (
            data?.getCandidateInvitations?.map((invite) => (
              <div
                key={invite.id}
                className='flex items-center justify-between p-2 border-b'>
                <span>{invite.email}</span>
                <span>{formatDateRelative(invite.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
