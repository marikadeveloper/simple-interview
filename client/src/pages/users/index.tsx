import { DataTable } from '@/components/ui/data-table';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import { useGetUsersQuery, User, UserRole } from '@/generated/graphql';
import { z } from 'zod';
import { columns } from './columns';
import { CreateUserDialog } from './components/CreateUserDialog';
import { PendingInvitesDialog } from './components/PendingInvitesDialog';

export const userRoles: {
  value: UserRole;
  label: string;
}[] = [
  { value: UserRole.Interviewer, label: 'Interviewer' },
  { value: UserRole.Candidate, label: 'Candidate' },
];

const interviewerSchema = z.object({
  role: z.literal(UserRole.Interviewer),
  email: z.string().email(),
  fullName: z.string().min(2).max(50),
  password: z.string().min(8).max(50),
});
const candidateSchema = z.object({
  role: z.literal(UserRole.Candidate),
  email: z.string().email(),
});
export const formSchema = z.discriminatedUnion('role', [
  interviewerSchema,
  candidateSchema,
]);

const Users = () => {
  const [{ data }] = useGetUsersQuery({
    variables: {
      filters: {},
    },
  });

  return (
    <div className='container mx-auto'>
      <div className='flex items-center justify-between'>
        <div>
          <PageTitle>Users</PageTitle>
          <PageSubtitle>
            Here you can create, delete, and update users.
          </PageSubtitle>
        </div>
        <div className='flex items-center gap-2'>
          <PendingInvitesDialog />
          <CreateUserDialog />
        </div>
      </div>

      <div className='py-4'>
        <DataTable
          columns={columns}
          data={(data?.getUsers as User[]) || []}
          filterableField='fullName'
        />
      </div>
    </div>
  );
};

export default Users;
