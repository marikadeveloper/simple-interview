import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  QuestionFragment,
  QuestionInput,
  useCreateQuestionMutation,
  useDeleteQuestionMutation,
  useUpdateQuestionMutation,
} from '@/generated/graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  description: z.string().min(5, {
    message: 'Description must be at least 5 characters.',
  }),
});
interface QuestionCardProps {
  templateId: string;
  question?: QuestionFragment;
}
export const QuestionCard: React.FC<QuestionCardProps> = ({
  templateId,
  question,
}) => {
  const [, createQuestion] = useCreateQuestionMutation();
  const [, updateQuestion] = useUpdateQuestionMutation();
  const [, deleteQuestion] = useDeleteQuestionMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: question?.title || '',
      description: question?.description || '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const input: QuestionInput = {
      title: values.title,
      description: values.description,
    };
    if (question) {
      await updateQuestion({
        id: question.id,
        input,
      });
    } else {
      await createQuestion({
        interviewTemplateId: parseInt(templateId),
        input,
      });
    }

    form.reset();
  };

  const handleQuestionDelete = async () => {
    if (question) {
      await deleteQuestion({
        id: question.id,
      });
    }
  };

  return (
    <Card className='w-full'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>{question ? question.title : 'Create Question'}</CardTitle>
          {question ? (
            <Button
              variant='outline'
              onClick={handleQuestionDelete}>
              <Trash />
            </Button>
          ) : (
            ''
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            id={`question-form-${question?.id || 'new'}`}
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter question title'
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
                      placeholder='Enter question description'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Button
          variant='outline'
          onClick={() => form.reset()}>
          Cancel
        </Button>
        <Button
          type='submit'
          form={`question-form-${question?.id || 'new'}`}>
          Save
        </Button>
      </CardFooter>
    </Card>
  );
};
