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
import { Textarea } from '@/components/ui/textarea';
import {
  QuestionCreateInput,
  QuestionFragment,
  useCreateQuestionMutation,
  useDeleteQuestionMutation,
  useUpdateQuestionMutation,
} from '@/generated/graphql';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Trash } from 'lucide-react';
import React, { useState } from 'react';
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
  templateId?: string;
  questionBankId?: string;
  question?: QuestionFragment;
}
export const QuestionCard: React.FC<QuestionCardProps> = ({
  templateId,
  questionBankId,
  question,
}) => {
  const mode: 'create' | 'edit' | 'unsupported' = question
    ? 'edit'
    : templateId
    ? 'create'
    : 'unsupported';
  //
  const [formVisible, setFormVisible] = useState(!!templateId);
  //
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
    const input: QuestionCreateInput = {
      title: values.title,
      description: values.description,
    };
    if (questionBankId) {
      input.questionBankId = parseInt(questionBankId);
    }
    if (templateId) {
      input.interviewTemplateId = parseInt(templateId);
    }
    if (mode === 'edit') {
      if (!question) return; // Ensures question is defined
      await updateQuestion({
        id: question.id,
        input,
      });
      setFormVisible(false);
    } else if (mode === 'create') {
      if (!templateId) return; // Ensures templateId is defined
      await createQuestion({
        input,
      });
      form.reset();
    }
  };

  const handleQuestionDelete = async () => {
    if (mode === 'edit') {
      if (!question) return; // Ensures question is defined
      await deleteQuestion({
        id: question.id,
      });
    }
  };

  const handleCancel = () => {
    if (mode === 'edit') {
      setFormVisible(false);
    }
    form.reset();
  };

  return (
    <>
      <div className='relative'>
        <Card
          data-question-id={question ? question.id : undefined}
          className={cn(
            'w-full bg-white',
            formVisible ? 'gap-6' : 'gap-2',
            mode === 'create' && 'border-dashed border-2 shadow-none',
          )}>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <CardTitle>
                  {question ? form.watch('title') : 'Create Question'}
                </CardTitle>
              </div>
              {question && formVisible && (
                <Button
                  variant='outline'
                  onClick={handleQuestionDelete}>
                  <Trash />
                </Button>
              )}
              {question && !formVisible && (
                <Button
                  variant='outline'
                  onClick={() => setFormVisible(true)}>
                  <Pencil />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className={formVisible ? 'hidden' : 'block'}>
              {form.watch('description')}
            </p>
            <div className={!formVisible ? `hidden` : ''}>
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
                          <Textarea
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
            </div>
          </CardContent>
          <CardFooter
            className={cn(
              'flex justify-between',
              !formVisible ? `hidden` : '',
            )}>
            <Button
              variant='outline'
              onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type='submit'
              form={`question-form-${question?.id || 'new'}`}>
              Save
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};
