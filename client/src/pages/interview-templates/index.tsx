import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import { TableSkeleton } from '@/components/ui/skeleton';
import {
  InterviewTemplateFragment,
  useGetInterviewTemplatesQuery,
  useGetTagsQuery,
} from '@/generated/graphql';
import { useMemo, useState } from 'react';
import { columns } from './columns';
import { CreateTemplateDialog } from './components/CreateTemplateDialog';

const InterviewTemplates = () => {
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('');
  const [{ data: interviewTemplatesData, fetching }] =
    useGetInterviewTemplatesQuery({
      variables: { filter },
      requestPolicy: 'network-only',
    });
  const [{ data: tagsData }] = useGetTagsQuery();

  const tags = useMemo(
    () =>
      tagsData?.getTags
        ? tagsData.getTags.map((t) => ({
            label: t.text,
            value: t.id.toString(),
          }))
        : [],
    [tagsData],
  );

  return (
    <div className='container mx-auto'>
      <div className='flex items-center justify-between'>
        <div>
          <PageTitle>Interview Templates</PageTitle>
          <PageSubtitle>
            Here you can create, delete, and update interview templates.
          </PageSubtitle>
        </div>
        <div className='flex items-center gap-2'>
          <CreateTemplateDialog tags={tags} />
        </div>
      </div>

      <div className='py-8'>
        <div className='flex gap-2 items-center'>
          <Input
            type='text'
            placeholder='Filter by name or tag...'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className='mb-4 w-full max-w-xs'
          />
          <Button
            className='mb-4'
            onClick={() => setFilter(inputValue)}>
            Search
          </Button>
        </div>
        {fetching ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={
              (interviewTemplatesData?.getInterviewTemplates as InterviewTemplateFragment[]) ||
              []
            }
          />
        )}
      </div>
    </div>
  );
};

export default InterviewTemplates;
