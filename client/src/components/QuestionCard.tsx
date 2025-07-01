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
import { useMutationWithToast } from '@/hooks/useMutationWithToast';
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
    : templateId || questionBankId
    ? 'create'
    : 'unsupported';

  const [formVisible, setFormVisible] = useState(
    !!templateId || !!questionBankId,
  );

  const [, createQuestion] = useMutationWithToast(useCreateQuestionMutation, {
    successMessage: 'Question created successfully',
    errorMessage: 'Failed to create question',
  });
  const [, updateQuestion] = useMutationWithToast(useUpdateQuestionMutation, {
    successMessage: 'Question updated successfully',
    errorMessage: 'Failed to update question',
  });
  const [, deleteQuestion] = useMutationWithToast(useDeleteQuestionMutation, {
    successMessage: 'Question deleted successfully',
    errorMessage: 'Failed to delete question',
  });

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
      const response = await updateQuestion({
        id: question.id,
        input,
      });
      if (response.data?.updateQuestion) {
        setFormVisible(false);
      }
    } else if (mode === 'create') {
      if (!templateId && !questionBankId) return; // Ensures templateId is defined
      const response = await createQuestion({
        input,
      });
      if (response.data?.createQuestion) {
        form.reset();
      }
    }
  };

  const handleQuestionDelete = async () => {
    if (mode === 'edit') {
      if (!question) return; // Ensures question is defined
      const response = await deleteQuestion({
        id: question.id,
      });
      if (response.data?.deleteQuestion) {
        setFormVisible(false);
      }
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
          data-testid='question-card'
          className={cn(
            'w-full bg-white',
            formVisible ? 'gap-6' : 'gap-2',
            mode === 'create' && 'border-dashed border-2 shadow-none',
          )}>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col items-start gap-2'>
                {/* Question Bank Label */}
                {question?.questionBank && (
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200'>
                    From: {question.questionBank.name}
                  </span>
                )}
                <CardTitle>
                  {question ? form.watch('title') : 'Create Question'}
                </CardTitle>
              </div>
              {question && formVisible && (
                <Button
                  variant='outline'
                  onClick={handleQuestionDelete}
                  data-testid='delete-question-btn'>
                  <Trash />
                </Button>
              )}
              {question && !formVisible && (
                <Button
                  variant='outline'
                  onClick={() => setFormVisible(true)}
                  data-testid='edit-question-btn'>
                  <Pencil />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p
              className={formVisible ? 'hidden' : 'block'}
              data-testid='question-description-readonly'>
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
                            data-testid='question-description-textarea'
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
            {formVisible && (
              <>
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
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  );
};
