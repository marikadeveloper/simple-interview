import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserRole,
  useGetInterviewsQuery,
  useGetUsersQuery,
} from '@/generated/graphql';
import { FileText, Users } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [{ data: interviewsData }] = useGetInterviewsQuery();
  const [{ data: usersData }] = useGetUsersQuery({
    variables: { filters: {} },
  });

  const pendingInterviews =
    interviewsData?.getInterviews?.filter(
      (interview) => interview.status === 'PENDING',
    ).length || 0;
  const completedInterviews =
    interviewsData?.getInterviews?.filter(
      (interview) => interview.status === 'COMPLETED',
    ).length || 0;

  const candidates =
    usersData?.getUsers?.filter((user) => user.role === UserRole.Candidate)
      .length || 0;
  const interviewers =
    usersData?.getUsers?.filter((user) => user.role === UserRole.Interviewer)
      .length || 0;

  return (
    <>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <PageTitle>Admin Dashboard</PageTitle>
          <PageSubtitle>Welcome back, {user?.fullName}</PageSubtitle>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {/* User Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
            <CardDescription>Overview of user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col items-center justify-center rounded-lg border p-4'>
                <Users className='mb-2 h-6 w-6 text-blue-500' />
                <span className='text-2xl font-bold'>{candidates}</span>
                <span className='text-sm text-muted-foreground'>
                  Candidates
                </span>
              </div>
              <div className='flex flex-col items-center justify-center rounded-lg border p-4'>
                <Users className='mb-2 h-6 w-6 text-purple-500' />
                <span className='text-2xl font-bold'>{interviewers}</span>
                <span className='text-sm text-muted-foreground'>
                  Interviewers
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interview Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Statistics</CardTitle>
            <CardDescription>Overview of interviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col items-center justify-center rounded-lg border p-4'>
                <FileText className='mb-2 h-6 w-6 text-yellow-500' />
                <span className='text-2xl font-bold'>{pendingInterviews}</span>
                <span className='text-sm text-muted-foreground'>Pending</span>
              </div>
              <div className='flex flex-col items-center justify-center rounded-lg border p-4'>
                <FileText className='mb-2 h-6 w-6 text-green-500' />
                <span className='text-2xl font-bold'>
                  {completedInterviews}
                </span>
                <span className='text-sm text-muted-foreground'>Completed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
