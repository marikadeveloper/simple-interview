import { DataTable } from '@/components/ui/data-table';
import { MultiSelect } from '@/components/ui/multi-select'; // Assuming you have a MultiSelect component
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import {
  InterviewTemplateFragment,
  useGetInterviewTemplatesQuery,
  useGetTagsQuery,
} from '@/generated/graphql';
import { useQueryParam } from '@/hooks/useQueryParam';
import { useMemo, useState } from 'react';
import { columns } from './columns';
import { CreateTemplateDialog } from './components/CreateTemplateDialog';

const InterviewTemplates = () => {
  // if you click on a tag inside the interview template detail, it will take you here with the tag id preselected
  const queryParamsTag = useQueryParam('tags');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    queryParamsTag ? [queryParamsTag as string] : [],
  );

  const [{ data: interviewTemplatesData }, refetchInterviewTemplates] =
    useGetInterviewTemplatesQuery({
      variables: {
        tagsIds: selectedTags ? selectedTags.map((id) => parseInt(id), []) : [],
      },
      requestPolicy: 'network-only',
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

  const handleTagsChange = (tagIds: string[]) => {
    setSelectedTags(tagIds);

    refetchInterviewTemplates({
      requestPolicy: 'network-only',
    });
  };

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
        <MultiSelect
          className='mb-4'
          options={tags}
          value={selectedTags}
          onValueChange={(values) => handleTagsChange(values)}
          placeholder='Filter by tags'
        />
        <DataTable
          columns={columns}
          data={
            (interviewTemplatesData?.getInterviewTemplates as InterviewTemplateFragment[]) ||
            []
          }
        />
      </div>
    </div>
  );
};

export default InterviewTemplates;
