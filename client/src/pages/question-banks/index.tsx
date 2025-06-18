import { DataTable } from '@/components/ui/data-table';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import SearchBar from '@/components/ui/search-bar';
import { TableSkeleton } from '@/components/ui/skeleton';
import {
  QuestionBankFragment,
  useGetQuestionBanksQuery,
} from '@/generated/graphql';
import { useState } from 'react';
import { columns } from './columns';
import { CreateQuestionBankDialog } from './components/CreateQuestionBankDialog';

const QuestionBanks = () => {
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('');
  const [{ data, fetching }, reexecuteQuery] = useGetQuestionBanksQuery({
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
        <SearchBar
          placeholder='Filter by name...'
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
            data={(data?.questionBanks as QuestionBankFragment[]) || []}
          />
        )}
      </div>
    </div>
  );
};

export default QuestionBanks;
