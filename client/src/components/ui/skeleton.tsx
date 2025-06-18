import { cn } from '@/lib/utils';

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
