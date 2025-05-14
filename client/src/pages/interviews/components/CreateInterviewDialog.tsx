import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateInterviewMutation,
  useGetInterviewTemplatesQuery,
  useGetUsersQuery,
  UserRole,
} from '@/generated/graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { interviewFormSchema as formSchema } from '../schema';

const oneWeekFromNow = dayjs().add(7, 'day').format('YYYY-MM-DD');

interface CreateInterviewDialogProps {}
export const CreateInterviewDialog: React.FC<
  CreateInterviewDialogProps
> = ({}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [{ data: interviewTemplatesData }] = useGetInterviewTemplatesQuery();
  const [{ data: candidatesData }] = useGetUsersQuery({
    variables: {
      filters: {
        role: UserRole.Candidate,
      },
    },
  });
  const [, createInterview] = useCreateInterviewMutation();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interviewTemplateId: '',
      candidateId: '',
      deadline: oneWeekFromNow,
    },
  });

  // reset form on close
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen]);

  const handleCreateSubmit = async (values: z.infer<typeof formSchema>) => {
    await createInterview({
      input: {
        interviewTemplateId: parseInt(values.interviewTemplateId),
        candidateId: parseInt(values.candidateId),
        deadline: values.deadline,
      },
    });
    setIsOpen(false);
    form.reset();
  };

  const interviewTemplates =
    interviewTemplatesData?.getInterviewTemplates?.interviewTemplates || [];
  const candidates = candidatesData?.getUsers?.users || [];

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Interview</Button>
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-[525px]'>
          <DialogHeader>
            <DialogTitle>Create Interview</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreateSubmit)}
              className='space-y-4'>
              {/*  */}
              <FormField
                control={form.control}
                name='interviewTemplateId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interview Template</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select an interview template' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {interviewTemplates.map((template) => (
                          <SelectItem
                            key={template.id}
                            value={template.id.toString()}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/*  */}
              <FormField
                control={form.control}
                name='candidateId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Candidate</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a candidate' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {candidates.map((candidate) => (
                          <SelectItem
                            key={candidate.id}
                            value={candidate.id.toString()}>
                            {candidate.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/*  */}

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
