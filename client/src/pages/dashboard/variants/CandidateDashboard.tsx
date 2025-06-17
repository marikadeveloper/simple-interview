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
import { InterviewStatus, useGetInterviewsQuery } from '@/generated/graphql';
import { AlertCircle, CalendarDays, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [{ data: interviewsData }] = useGetInterviewsQuery();

  const upcomingInterviews =
    interviewsData?.getInterviews?.filter(
      (interview) => interview.status === InterviewStatus.Pending,
    ) || [];

  const completedInterviews =
    interviewsData?.getInterviews?.filter(
      (interview) => interview.status === InterviewStatus.Completed,
    ) || [];

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <PageTitle>Dashboard</PageTitle>
          <PageSubtitle>Welcome back, {user?.fullName}</PageSubtitle>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {/* Upcoming Interviews Card */}
        <Card className='md:col-span-2 lg:col-span-3'>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
            <CardDescription>Your scheduled interviews</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingInterviews.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-8 text-center'>
                <CalendarDays className='mb-2 h-8 w-8 text-muted-foreground' />
                <p className='text-lg font-medium'>No upcoming interviews</p>
                <p className='text-sm text-muted-foreground'>
                  You don't have any scheduled interviews at the moment.
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {upcomingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className='flex items-center justify-between rounded-lg border p-4'>
                    <div>
                      <h3 className='font-medium'>
                        {interview.interviewTemplate?.name}
                      </h3>
                      <p className='text-sm text-muted-foreground'>
                        Deadline:{' '}
                        {new Date(interview.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <div className='flex items-center gap-4'>
                      <div className='flex items-center gap-2'>
                        <AlertCircle className='h-4 w-4 text-yellow-500' />
                        <span className='text-sm'>
                          {getDaysUntilDeadline(interview.deadline)} days left
                        </span>
                      </div>
                      <Button asChild>
                        <Link to={`/interviews/${interview.slug}`}>
                          Start Interview
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div>
                <span className='block text-sm font-medium text-muted-foreground'>
                  Name
                </span>
                <span>{user?.fullName}</span>
              </div>
              <div>
                <span className='block text-sm font-medium text-muted-foreground'>
                  Email
                </span>
                <span>{user?.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interview Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Statistics</CardTitle>
            <CardDescription>Your interview progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col items-center justify-center rounded-lg border p-4'>
                <Clock className='mb-2 h-6 w-6 text-blue-500' />
                <span className='text-2xl font-bold'>
                  {upcomingInterviews.length}
                </span>
                <span className='text-sm text-muted-foreground'>Upcoming</span>
              </div>
              <div className='flex flex-col items-center justify-center rounded-lg border p-4'>
                <CheckCircle className='mb-2 h-6 w-6 text-green-500' />
                <span className='text-2xl font-bold'>
                  {completedInterviews.length}
                </span>
                <span className='text-sm text-muted-foreground'>Completed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col gap-2'>
              <Button
                asChild
                variant='secondary'>
                <Link to='/interviews'>View All Interviews</Link>
              </Button>
              <Button
                asChild
                variant='outline'>
                <Link to='/profile'>View Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
