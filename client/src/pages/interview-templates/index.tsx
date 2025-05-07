import { DataTable } from '@/components/ui/data-table';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import {
  InterviewTemplateFragment,
  useGetInterviewTemplatesQuery,
} from '@/generated/graphql';
import { z } from 'zod';
import { columns } from './columns';
import { CreateTemplateDialog } from './components/CreateTemplateDialog';

// Define form schema for interview template creation/editing
export const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  description: z.string().min(5, {
    message: 'Description must be at least 5 characters.',
  }),
  tags: z.array(z.string()).optional(),
});

const InterviewTemplates = () => {
  const [{ data: interviewTemplatesData }] = useGetInterviewTemplatesQuery({
    variables: {
      tagsIds: [],
    },
  });
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
          <CreateTemplateDialog />
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
