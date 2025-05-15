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
  useGetInterviewsQuery,
} from '@/generated/graphql';
import { formatDateRelative } from '@/utils/dates';
import dayjs from 'dayjs';

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

const InterviewCard = ({
  interview,
}: {
  interview: InterviewListItemFragment;
}) => {
  return (
    <Card className={'w-[380px]'}>
      <CardHeader>
        <CardTitle>{interview.interviewTemplate.name}</CardTitle>
        <CardDescription>
          {interview.interviewTemplate.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-[20px_1fr] items-start'>
          <InterviewCardStatusDot deadline={interview.deadline} />
          <p className='text-sm leading-none'>
            Expires {formatDateRelative(interview.deadline)}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className='w-full'>Take the interview</Button>
      </CardFooter>
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

      <div className='py-8'>
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
