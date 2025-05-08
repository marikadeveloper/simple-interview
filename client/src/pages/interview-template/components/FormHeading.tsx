import { Button } from '@/components/ui/button';
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
  useCreateTagMutation,
  useUpdateInterviewTemplateMutation,
} from '@/generated/graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { interviewTemplateFormSchema as formSchema } from '../../interview-templates/schema';

interface FormHeadingProps {
  interviewTemplate: InterviewTemplateFragment;
  tags: { label: string; value: string }[];
  setFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
export const FormHeading: React.FC<FormHeadingProps> = ({
  tags: initialTags,
  interviewTemplate,
  setFormVisible,
}) => {
  const [tags, setTags] = useState(initialTags);
  const [, updateInterviewTemplate] = useUpdateInterviewTemplateMutation();
  const [, createTag] = useCreateTagMutation();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: interviewTemplate.name || '',
      description: interviewTemplate.description || '',
      tags: interviewTemplate.tags?.map((t) => t.id.toString()),
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await updateInterviewTemplate({
      id: interviewTemplate.id,
      input: {
        name: values.name,
        description: values.description,
        tagsIds: values.tags?.map((tag) => parseInt(tag)) || [],
      },
    });
    setFormVisible(false);
  };

  const handleCancel = () => {
    setFormVisible(false);
    form.reset({
      name: interviewTemplate.name || '',
      description: interviewTemplate.description || '',
      tags: interviewTemplate.tags?.map((t) => t.id.toString()),
    });
  };

  const handleCreateTag = async (newTagName: string) => {
    try {
      // Call your create tag mutation
      const response = await createTag({
        text: newTagName,
      });

      if (response.data?.createTag) {
        const newTag = {
          label: newTagName,
          value: response.data.createTag.id.toString(),
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className='flex w-full'>
        <div className='w-[50%] grid gap-4'>
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
        </div>
        <div className='w-[50%] flex gap-2 justify-end'>
          <Button
            type='button'
            variant='outline'
            onClick={handleCancel}>
            Cancel
          </Button>
          <Button type='submit'>Save</Button>
        </div>
      </form>
    </Form>
  );
};
