import { DataTable } from '@/components/ui/data-table';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import {
  InterviewTemplateFragment,
  useGetInterviewTemplatesQuery,
  useGetTagsQuery,
} from '@/generated/graphql';
import { useQueryParam } from '@/hooks/useQueryParam';
import { useMemo } from 'react';
import { columns } from './columns';
import { CreateTemplateDialog } from './components/CreateTemplateDialog';

// TODO: maybe support a more complex filter, like searching by tag name

const InterviewTemplates = () => {
  // if you click on a tag inside the interview template detail, it will take you here with the tag id preselected
  const queryParamsTag = useQueryParam('tags');

  const [{ data: interviewTemplatesData }] = useGetInterviewTemplatesQuery({
    variables: {
      tagsIds: queryParamsTag ? [parseInt(queryParamsTag as string)] : [],
    },
  });
  const [{ data: tagsData }] = useGetTagsQuery();
  const tags = useMemo(
    () =>
      tagsData
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

      <div className='py-4'>
        <DataTable
          columns={columns}
          data={
            (interviewTemplatesData?.getInterviewTemplates as InterviewTemplateFragment[]) ||
            []
          }
          filterableField='name'
        />
      </div>
    </div>
  );
};

export default InterviewTemplates;
