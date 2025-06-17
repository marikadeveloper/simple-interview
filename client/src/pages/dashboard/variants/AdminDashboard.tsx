import { Button } from '@/components/ui/button';
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
  InterviewStatus,
  UserRole,
  useGetInterviewsQuery,
  useGetUsersQuery,
} from '@/generated/graphql';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [{ data: interviewsData }] = useGetInterviewsQuery();
  const [{ data: usersData }] = useGetUsersQuery({
    variables: { filters: {} },
  });

  const interviews = interviewsData?.getInterviews || [];
  const pendingInterviews = interviews.filter(
    (interview) => interview.status === InterviewStatus.Pending,
  );
  const completedInterviews = interviews.filter(
    (interview) => interview.status === InterviewStatus.Completed,
  );
  const expiringInterviews = interviews.filter((interview) => {
    if (interview.status === InterviewStatus.Completed) return false;
    const deadline = new Date(interview.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && diffDays > 0;
  });
  const expiredInterviews = interviews.filter(
    (interview) => interview.status === InterviewStatus.Expired,
  );

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
                <Clock className='mb-2 h-6 w-6 text-yellow-500' />
                <span className='text-2xl font-bold'>
                  {pendingInterviews.length}
                </span>
                <span className='text-sm text-muted-foreground'>Pending</span>
              </div>
              <div className='flex flex-col items-center justify-center rounded-lg border p-4'>
                <CheckCircle2 className='mb-2 h-6 w-6 text-green-500' />
                <span className='text-2xl font-bold'>
                  {completedInterviews.length}
                </span>
                <span className='text-sm text-muted-foreground'>Completed</span>
              </div>
              <div className='flex flex-col items-center justify-center rounded-lg border p-4'>
                <AlertTriangle className='mb-2 h-6 w-6 text-orange-500' />
                <span className='text-2xl font-bold'>
                  {expiringInterviews.length}
                </span>
                <span className='text-sm text-muted-foreground'>Expiring</span>
              </div>
              <div className='flex flex-col items-center justify-center rounded-lg border p-4'>
                <XCircle className='mb-2 h-6 w-6 text-red-500' />
                <span className='text-2xl font-bold'>
                  {expiredInterviews.length}
                </span>
                <span className='text-sm text-muted-foreground'>Expired</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col gap-2'>
              <Button
                asChild
                variant='secondary'>
                <Link to='/users'>
                  <Users className='mr-2 h-4 w-4' />
                  Manage Users
                </Link>
              </Button>
              <Button
                asChild
                variant='secondary'>
                <Link to='/interviews'>
                  <FileText className='mr-2 h-4 w-4' />
                  Manage Interviews
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
