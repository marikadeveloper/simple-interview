import { DataTable } from '@/components/ui/data-table';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import { useAuth } from '@/contexts/AuthContext';
import {
  QuestionBankFragment,
  useGetQuestionBanksQuery,
} from '@/generated/graphql';
import { columns } from './columns';
import { CreateQuestionBankDialog } from './components/CreateQuestionBankDialog';

const QuestionBanks = () => {
  const { user } = useAuth();
  const [{ data }] = useGetQuestionBanksQuery();

  if (!user) return null;

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
        <DataTable
          columns={columns}
          data={(data?.getQuestionBanks as QuestionBankFragment[]) || []}
        />
      </div>
    </div>
  );
};

export default QuestionBanks;
