import { Button } from '@/components/ui/button';
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
import { MultiSelect } from '@/components/ui/multi-select';
import {
  InterviewTemplateFragment,
  useGetTagsQuery,
  useUpdateInterviewTemplateMutation,
} from '@/generated/graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from '..';

interface EditTemplateDialogProps {
  template: InterviewTemplateFragment;
}
export const EditTemplateDialog: React.FC<EditTemplateDialogProps> = ({
  template,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [, updateInterviewTemplate] = useUpdateInterviewTemplateMutation();
  const [{ data: tagsData }] = useGetTagsQuery();
  const tags = useMemo(
    () =>
      tagsData
        ? tagsData.getTags.map((t) => ({
            label: t.text,
            value: t.id.toString(),
          }))
        : [],
    [tagsData],
  );

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template.name,
      description: template.description,
      tags: template.tags?.map((tag) => tag.id.toString()),
    },
  });

  const handleEditSubmit = async (values: z.infer<typeof formSchema>) => {
    await updateInterviewTemplate({
      id: template.id,
      input: {
        name: values.name,
        description: values.description,
        tagsIds: values.tags?.map((tag) => parseInt(tag)) || [],
      },
    });
    setIsOpen(false);
    editForm.reset();
  };

  return (
    <>
      <Button
        variant='outline'
        size='icon'
        className='mr-1.5'
        onClick={() => setIsOpen(true)}>
        <Pencil />
      </Button>
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-[525px]'>
          <DialogHeader>
            <DialogTitle>Edit Interview Template</DialogTitle>
            <DialogDescription>
              Update the template information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className='space-y-4'>
              <FormField
                control={editForm.control}
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
                control={editForm.control}
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
              <FormField
                control={editForm.control}
                name='tags'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <MultiSelect
                        modalPopover
                        options={tags}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        placeholder='Select tags'
                        variant='inverted'
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
                  onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type='submit'>Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
