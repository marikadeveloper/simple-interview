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
  useCreateInterviewTemplateMutation,
  useGetTagsQuery,
} from '@/generated/graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from '..';

interface CreateTemplateDialogProps {}
export const CreateTemplateDialog: React.FC<CreateTemplateDialogProps> = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [, createInterviewTemplate] = useCreateInterviewTemplateMutation();
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

  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      tags: [],
    },
  });

  // console log form values when they  change
  useEffect(() => {
    const subscription = createForm.watch((value) => {
      console.log('Form values:', value);
    });
    return () => subscription.unsubscribe();
  }, [createForm]);

  const handleCreateSubmit = async (values: z.infer<typeof formSchema>) => {
    await createInterviewTemplate({
      input: {
        name: values.name,
        description: values.description,
        tagsIds: values.tags?.map((tag) => parseInt(tag)) || [],
      },
    });
    setIsOpen(false);
    createForm.reset();
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Template</Button>
      {/* Create Template Dialog */}
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}>
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
              <FormField
                control={createForm.control}
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
                <Button type='submit'>Create</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
