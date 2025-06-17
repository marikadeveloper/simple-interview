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
import { format } from 'date-fns';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Star,
  Users,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router';

export default function InterviewerDashboard() {
  const { user } = useAuth();
  const [{ data: interviewsData }] = useGetInterviewsQuery();

  const interviews = interviewsData?.getInterviews || [];
  const pendingInterviews = interviews.filter(
    (interview) => interview.status === InterviewStatus.Pending,
  );
  const completedInterviews = interviews.filter(
    (interview) => interview.status === InterviewStatus.Completed,
  );
  const interviewsNeedingEvaluation = interviews.filter(
    (interview) =>
      interview.status === InterviewStatus.Completed &&
      !interview.evaluationValue,
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

  return (
    <>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <PageTitle>Interviewer Dashboard</PageTitle>
          <PageSubtitle>Welcome back, {user?.fullName}</PageSubtitle>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {/* Interview Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Statistics</CardTitle>
            <CardDescription>Overview of your interviews</CardDescription>
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
            <CardDescription>Common interviewer tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col gap-2'>
              <Button
                asChild
                variant='secondary'>
                <Link to='/interviews'>
                  <FileText className='mr-2 h-4 w-4' />
                  View All Interviews
                </Link>
              </Button>
              <Button
                asChild
                variant='secondary'>
                <Link to='/interview-templates'>
                  <Calendar className='mr-2 h-4 w-4' />
                  Interview Templates
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interviews Needing Evaluation Card */}
        <Card className='md:col-span-2 lg:col-span-3'>
          <CardHeader>
            <CardTitle>Interviews Needing Evaluation</CardTitle>
            <CardDescription>
              Completed interviews awaiting your feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            {interviewsNeedingEvaluation.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-8 text-center'>
                <Star className='mb-2 h-8 w-8 text-green-500' />
                <p className='text-muted-foreground'>
                  All interviews have been evaluated
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {interviewsNeedingEvaluation.map((interview) => (
                  <div
                    key={interview.id}
                    className='flex items-center justify-between rounded-lg border p-4'>
                    <div className='flex items-center space-x-4'>
                      <Users className='h-5 w-5 text-muted-foreground' />
                      <div>
                        <p className='font-medium'>
                          {interview.user?.fullName}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {interview.interviewTemplate?.name}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div className='text-right'>
                        {interview.completedAt && (
                          <p className='text-sm font-medium'>
                            Completed on{' '}
                            {format(
                              new Date(interview.completedAt),
                              'MMM d, yyyy',
                            )}
                          </p>
                        )}
                        <p className='text-sm text-muted-foreground'>
                          Awaiting evaluation
                        </p>
                      </div>
                      <Button
                        asChild
                        size='sm'>
                        <Link to={`/interviews/${interview.slug}`}>
                          Evaluate
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
