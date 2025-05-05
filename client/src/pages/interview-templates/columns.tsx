import { InterviewTemplateFragment, TagFragment } from '@/generated/graphql';
import { ColumnDef } from '@tanstack/react-table';
import { InterviewTemplateActions } from './components/InterviewTemplateActions';

export const columns: ColumnDef<InterviewTemplateFragment>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => {
      const tags: TagFragment[] = row.getValue('tags');
      return (
        <div className='flex flex-wrap gap-2'>
          {tags.map((tag) => (
            <span
              key={tag.id}
              className='bg-slate-200 text-slate-800 text-xs px-2 py-1 rounded'>
              {tag.text}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <InterviewTemplateActions template={row.original} />,
  },
];
