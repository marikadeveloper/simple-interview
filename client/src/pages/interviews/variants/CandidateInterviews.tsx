import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';

export const CandidateInterviews = () => {
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

      <div className='py-8'></div>
    </div>
  );
};
