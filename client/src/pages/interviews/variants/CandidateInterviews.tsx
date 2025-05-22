import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import {
  InterviewListItemFragment,
  InterviewStatus,
  useGetInterviewsQuery,
} from '@/generated/graphql';
import { formatDateRelative } from '@/utils/dates';
import dayjs from 'dayjs';
import { Link } from 'react-router';

const InterviewCardStatusDot = ({ deadline }: { deadline: string }) => {
  let color: string = 'bg-green-500';
  const now = dayjs();
  const deadlineDate = dayjs(deadline);
  // 4+ days before the deadline -> green
  // 3 days before the deadline -> yellow
  // 1 day before the deadline -> red
  // expired -> black
  const diff = deadlineDate.diff(now, 'day');
  if (diff > 4) {
    color = 'bg-green-500';
  }
  if (diff <= 4 && diff > 1) {
    color = 'bg-yellow-500';
  }
  if (diff <= 1 && diff > 0) {
    color = 'bg-red-500';
  }
  if (diff <= 0) {
    color = 'bg-black';
  }

  return (
    <span className={`flex h-2 w-2 translate-y-1 rounded-full ${color}`} />
  );
};

const InterviewStatusLabel = ({ status }: { status: InterviewStatus }) => {
  switch (status) {
    case InterviewStatus.Pending:
      return (
        <span className='text-xs bg-yellow-500/50 px-2 py-1 rounded-full'>
          Pending
        </span>
      );
    case InterviewStatus.Completed:
      return (
        <span className='text-xs bg-green-500/50 px-2 py-1 rounded-full'>
          Completed
        </span>
      );
  }
};

const InterviewCard = ({
  interview,
}: {
  interview: InterviewListItemFragment;
}) => {
  return (
    <Card className={'w-[380px]'}>
      <CardHeader>
        <CardTitle className='flex justify-between items-center'>
          {interview.interviewTemplate.name}
          <InterviewStatusLabel status={interview.status} />
        </CardTitle>
        <CardDescription>
          {interview.interviewTemplate.description}
        </CardDescription>
      </CardHeader>
      {interview.status !== InterviewStatus.Completed && (
        <>
          <CardContent>
            <div className='grid grid-cols-[20px_1fr] items-start'>
              <InterviewCardStatusDot deadline={interview.deadline} />
              <p className='text-sm leading-none'>
                Expires {formatDateRelative(interview.deadline)}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Link
              className='w-full'
              to={`/interviews/${interview.id}`}>
              <Button className='w-full'>Take the interview</Button>
            </Link>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export const CandidateInterviews = () => {
  const [{ data }] = useGetInterviewsQuery();
  return (
    <div className='container mx-auto'>
      <div className='flex items-center justify-between'>
        <div>
          <PageTitle>Interviews</PageTitle>
          <PageSubtitle>
            Here you can see and take your interviews.
          </PageSubtitle>
        </div>
        <div className='flex items-center gap-2'></div>
      </div>

      <div className='py-8 flex flex-wrap gap-4'>
        {data?.getInterviews?.map((interview) => (
          <InterviewCard
            key={interview.id}
            interview={interview}
          />
        ))}
      </div>
    </div>
  );
};
