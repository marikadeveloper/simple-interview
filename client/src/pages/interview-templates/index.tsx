import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import {
  InterviewTemplateFragment,
  Tag,
  useCreateTagMutation,
  useDeleteTagMutation,
  useGetInterviewTemplatesQuery,
  useGetTagsQuery,
  useUpdateTagMutation,
} from '@/generated/graphql';
import { useState } from 'react';
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
});

export const InterviewTemplates = () => {
  const [{ data: interviewTemplatesData }] = useGetInterviewTemplatesQuery({
    variables: {
      tagsIds: [],
    },
  });
  const [{ data: tagsData }] = useGetTagsQuery();
  const [, createTag] = useCreateTagMutation();
  const [, deleteTag] = useDeleteTagMutation();
  const [, updateTag] = useUpdateTagMutation();

  // State for dialogs
  const [newTagText, setNewTagText] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  // Handle form submissions
  const handleCreateTag = async () => {
    if (newTagText.trim()) {
      await createTag({ text: newTagText.trim() });
      setNewTagText('');
    }
  };

  const handleUpdateTag = async (id: number, text: string) => {
    await updateTag({ id, text });
    setEditingTag(null);
  };

  const handleDeleteTag = async (id: number) => {
    await deleteTag({ id });
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

      {/* Tag Management Section */}
      <div className='mt-10 pt-6 border-t'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-bold'>Tags</h2>
        </div>

        <div className='flex flex-wrap gap-2 mb-4'>
          {tagsData?.getTags?.map((tag) => (
            <div
              key={tag.id}
              className='group flex items-center bg-slate-100 hover:bg-slate-200 rounded px-3 py-1.5'>
              {editingTag?.id === tag.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateTag(tag.id, (e.target as any).tagText.value);
                  }}
                  className='flex items-center'>
                  <Input
                    name='tagText'
                    defaultValue={tag.text}
                    className='h-6 py-1 px-2 w-[100px]'
                    autoFocus
                  />
                  <Button
                    type='submit'
                    size='sm'
                    variant='ghost'
                    className='h-6 px-2 ml-1'>
                    Save
                  </Button>
                </form>
              ) : (
                <>
                  <span className='mr-2'>{tag.text}</span>
                  <div className='opacity-0 group-hover:opacity-100 flex items-center'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-6 px-2'
                      onClick={() => setEditingTag(tag)}>
                      Edit
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-6 px-2 text-red-500'
                      onClick={() => handleDeleteTag(tag.id)}>
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className='flex items-center gap-2'>
          <Input
            value={newTagText}
            onChange={(e) => setNewTagText(e.target.value)}
            placeholder='New tag'
            className='max-w-xs'
          />
          <Button
            onClick={handleCreateTag}
            disabled={!newTagText.trim()}>
            Add Tag
          </Button>
        </div>
      </div>
    </div>
  );
};
