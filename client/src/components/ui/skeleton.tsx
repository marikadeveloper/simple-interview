import { cn } from '@/lib/utils';

const NUM_SKELETON_ROWS = 4;

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='skeleton'
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

export { Skeleton };

export function TableSkeleton() {
  return (
    <div className='rounded-md border mb-2'>
      <table className='min-w-full'>
        <thead>
          <tr>
            <th className='px-4 py-2'>
              <Skeleton className='h-4 w-32' />
            </th>
            <th className='px-4 py-2'>
              <Skeleton className='h-4 w-48' />
            </th>
            <th className='px-4 py-2'>
              <Skeleton className='h-4 w-24' />
            </th>
            <th className='px-4 py-2'>
              <Skeleton className='h-4 w-12' />
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(NUM_SKELETON_ROWS)].map((_, i) => (
            <tr key={i}>
              {Array.from({ length: NUM_SKELETON_ROWS }).map((_, j) => (
                <td
                  className='px-4 py-3'
                  key={j}>
                  <Skeleton className='h-4 w-full' />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DetailPageSkeleton({
  contentBlocks = 3,
}: {
  contentBlocks?: number;
}) {
  return (
    <div className='container mx-auto py-8'>
      <div className='mb-8'>
        <Skeleton className='h-10 w-1/2 mb-4' />
        <Skeleton className='h-6 w-1/3 mb-8' />
      </div>
      <div className='space-y-4'>
        {[...Array(contentBlocks)].map((_, i) => (
          <Skeleton
            key={i}
            className='h-32 w-full mb-4'
          />
        ))}
      </div>
    </div>
  );
}
