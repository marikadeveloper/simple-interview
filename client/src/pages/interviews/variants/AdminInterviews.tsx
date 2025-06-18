import { DataTable } from '@/components/ui/data-table';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import SearchBar from '@/components/ui/search-bar';
import { TableSkeleton } from '@/components/ui/skeleton';
import {
  InterviewListItemFragment,
  useGetInterviewsQuery,
} from '@/generated/graphql';
import { useState } from 'react';
import { columns } from '../columns';
import { CreateInterviewDialog } from '../components/CreateInterviewDialog';

export const AdminInterviews = () => {
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<string>('');
  const [{ data, fetching }, reexecuteQuery] = useGetInterviewsQuery({
    variables: { filter },
    requestPolicy: 'network-only',
  });

  const handleSearch = () => {
    setFilter(inputValue);
    setTimeout(() => {
      reexecuteQuery({ requestPolicy: 'network-only' });
    }, 0);
  };

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
        <SearchBar
          placeholder='Filter by candidate or template name...'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onSearch={handleSearch}
          className='mb-4'
        />
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
