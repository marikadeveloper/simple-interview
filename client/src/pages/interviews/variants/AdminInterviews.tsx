import { DataTable } from '@/components/ui/data-table';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import { TableSkeleton } from '@/components/ui/skeleton';
import {
  InterviewListItemFragment,
  useGetInterviewsQuery,
} from '@/generated/graphql';
import { columns } from '../columns';
import { CreateInterviewDialog } from '../components/CreateInterviewDialog';

export const AdminInterviews = () => {
  const [{ data, fetching }] = useGetInterviewsQuery();

  return (
    <div className='container mx-auto'>
      <div className='flex items-center justify-between'>
        <div>
          <PageTitle>Interviews</PageTitle>
          <PageSubtitle>Here you can manage interviews.</PageSubtitle>
        </div>
        <div className='flex items-center gap-2'>
          <CreateInterviewDialog />
        </div>
      </div>

      <div className='py-8'>
        {fetching ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={(data?.getInterviews as InterviewListItemFragment[]) || []}
          />
        )}
      </div>
    </div>
  );
};
