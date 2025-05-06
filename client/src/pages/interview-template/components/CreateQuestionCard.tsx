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
import { useCreateQuestionMutation } from '@/generated/graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  description: z.string().min(5, {
    message: 'Description must be at least 5 characters.',
  }),
});
export const CreateQuestionCard = ({ templateId }: { templateId: string }) => {
  const [, createQuestion] = useCreateQuestionMutation();
  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const handleCreateSubmit = async (values: z.infer<typeof formSchema>) => {
    await createQuestion({
      interviewTemplateId: parseInt(templateId),
      input: {
        title: values.title,
        description: values.description,
      },
    });
    createForm.reset();
  };

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Create question</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...createForm}>
          <form
            id='create-question-form'
            onSubmit={createForm.handleSubmit(handleCreateSubmit)}
            className='space-y-4'>
            <FormField
              control={createForm.control}
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
              control={createForm.control}
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
        <Button variant='outline'>Cancel</Button>
        <Button
          type='submit'
          form='create-question-form'>
          Save
        </Button>
      </CardFooter>
    </Card>
  );
};
