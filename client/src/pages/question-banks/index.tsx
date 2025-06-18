import { DataTable } from '@/components/ui/data-table';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import { TableSkeleton } from '@/components/ui/skeleton';
import {
  QuestionBankFragment,
  useGetQuestionBanksQuery,
} from '@/generated/graphql';
import { columns } from './columns';
import { CreateQuestionBankDialog } from './components/CreateQuestionBankDialog';

const QuestionBanks = () => {
  const [{ data, fetching }] = useGetQuestionBanksQuery();

  return (
    <div className='container mx-auto'>
      <div className='flex items-center justify-between'>
        <div>
          <PageTitle>Question Banks</PageTitle>
          <PageSubtitle>
            Here you can create, delete, and update question banks.
          </PageSubtitle>
        </div>
        <div className='flex items-center gap-2'>
          <CreateQuestionBankDialog />
        </div>
      </div>

      <div className='py-8'>
        {fetching ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={(data?.questionBanks as QuestionBankFragment[]) || []}
          />
        )}
      </div>
    </div>
  );
};

export default QuestionBanks;
