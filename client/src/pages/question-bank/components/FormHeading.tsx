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
import {
  QuestionBankFragment,
  useUpdateQuestionBankMutation,
} from '@/generated/graphql';
import { useMutationWithToast } from '@/hooks/useMutationWithToast';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { questionBankFormSchema as formSchema } from '../../question-banks/schema';

interface FormHeadingProps {
  questionBank: QuestionBankFragment;
  setFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
export const FormHeading: React.FC<FormHeadingProps> = ({
  questionBank,
  setFormVisible,
}) => {
  const [, updateQuestionBank] = useMutationWithToast(
    useUpdateQuestionBankMutation,
    {
      successMessage: 'Question bank updated successfully',
      errorMessage: 'Failed to update question bank',
    },
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: questionBank.name || '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const { error } = await updateQuestionBank({
      id: questionBank.id,
      name: values.name,
    });
    if (error) {
      return;
    }
    setFormVisible(false);
  };

  const handleCancel = () => {
    setFormVisible(false);
    form.reset({
      name: questionBank.name || '',
    });
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
