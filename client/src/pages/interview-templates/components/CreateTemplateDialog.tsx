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
  useCreateTagMutation,
} from '@/generated/graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { interviewTemplateFormSchema as formSchema } from '../schema';

interface CreateTemplateDialogProps {
  tags: { label: string; value: string }[];
}
export const CreateTemplateDialog: React.FC<CreateTemplateDialogProps> = ({
  tags: initialTags,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tags, setTags] = useState(initialTags);
  const [, createInterviewTemplate] = useCreateInterviewTemplateMutation();
  const [, createTag] = useCreateTagMutation();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      tags: [],
    },
  });

  // reset form on close
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      // Reset tags to initial state when modal closes
      setTags(initialTags);
    }
  }, [isOpen, initialTags]);

  const handleCreateSubmit = async (values: z.infer<typeof formSchema>) => {
    const data = await createInterviewTemplate({
      input: {
        name: values.name,
        description: values.description,
        tagsIds: values.tags?.map((tag) => parseInt(tag)) || [],
      },
    });
    setIsOpen(false);
    navigate(
      `/interview-templates/${data.data?.createInterviewTemplate?.interviewTemplate?.id}`,
    );
    form.reset();
  };

  const handleCreateTag = async (newTagName: string) => {
    try {
      // Call your create tag mutation
      const response = await createTag({
        text: newTagName,
      });

      if (response.data?.createTag?.tag) {
        const newTag = {
          label: newTagName,
          value: response.data.createTag.tag.id.toString(),
        };

        // Add the new tag to the tags list
        setTags((prevTags) => [...prevTags, newTag]);

        // Add the newly created tag to the selected values
        const currentTags = form.getValues('tags') || [];
        form.setValue('tags', [...currentTags, newTag.value]);

        return newTag;
      }
      return null;
    } catch (error) {
      console.error('Failed to create new tag:', error);
      return null;
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Template</Button>
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-[525px]'>
          <DialogHeader>
            <DialogTitle>Create Interview Template</DialogTitle>
            <DialogDescription>
              Create a new interview template. You can add or create tags.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreateSubmit)}
              className='space-y-4'>
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                        allowCreate
                        onCreateOption={handleCreateTag}
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
