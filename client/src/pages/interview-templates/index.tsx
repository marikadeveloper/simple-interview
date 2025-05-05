import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  InterviewTemplateFragment,
  Tag,
  useCreateInterviewTemplateMutation,
  useCreateTagMutation,
  useDeleteTagMutation,
  useGetInterviewTemplatesQuery,
  useGetTagsQuery,
  useUpdateTagMutation,
} from '@/generated/graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { columns } from './columns';

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
  const [, createInterviewTemplate] = useCreateInterviewTemplateMutation();
  const [{ data: tagsData }] = useGetTagsQuery();
  const [, createTag] = useCreateTagMutation();
  const [, deleteTag] = useDeleteTagMutation();
  const [, updateTag] = useUpdateTagMutation();

  // State for dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  // Forms
  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Handle form submissions
  const handleCreateSubmit = async (values: z.infer<typeof formSchema>) => {
    await createInterviewTemplate({
      input: {
        name: values.name,
        description: values.description,
      },
    });
    setIsCreateDialogOpen(false);
    createForm.reset();
  };

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
    <div className='container mx-auto py-10 space-y-8'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Interview Templates</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' /> Create Template
        </Button>
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

      {/* Create Template Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className='sm:max-w-[525px]'>
          <DialogHeader>
            <DialogTitle>Create Interview Template</DialogTitle>
            <DialogDescription>
              Create a new interview template. You can add tags later.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(handleCreateSubmit)}
              className='space-y-4'>
              <FormField
                control={createForm.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter template name'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter template description'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type='submit'>Create</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
