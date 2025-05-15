import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  InterviewListItemFragment,
  InterviewStatus,
  useGetInterviewTemplatesQuery,
  useGetUsersQuery,
  UserRole,
  useUpdateInterviewMutation,
} from '@/generated/graphql';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import {
  AlertCircle,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Pencil,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { interviewFormSchema as formSchema } from '../schema';

interface UpdateInterviewDialogProps {
  interview: InterviewListItemFragment;
}
export const UpdateInterviewDialog: React.FC<UpdateInterviewDialogProps> = ({
  interview,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [{ data: interviewTemplatesData }] = useGetInterviewTemplatesQuery({
    pause: !isOpen,
  });
  const [{ data: candidatesData }] = useGetUsersQuery({
    variables: {
      filters: {
        role: UserRole.Candidate,
      },
    },
  });
  const [, updateInterview] = useUpdateInterviewMutation();
  const canUpdate: boolean = interview.status === InterviewStatus.Pending;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interviewTemplateId: interview.interviewTemplate.id.toString(),
      candidateId: interview.user.id.toString(),
      deadline: dayjs(interview.deadline).toDate(),
    },
  });

  // reset form on close
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen]);

  const handleUpdateSubmit = async (values: z.infer<typeof formSchema>) => {
    await updateInterview({
      id: interview.id,
      input: {
        interviewTemplateId: parseInt(values.interviewTemplateId),
        candidateId: parseInt(values.candidateId),
        deadline: dayjs(values.deadline).format('YYYY-MM-DD'),
      },
    });
    setIsOpen(false);
    form.reset();
  };

  const interviewTemplates =
    interviewTemplatesData?.getInterviewTemplates || [];
  const candidates = candidatesData?.getUsers || [];

  const InterviewForm = () => (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleUpdateSubmit)}
        className='space-y-4'>
        {/*  */}
        <FormField
          control={form.control}
          name='interviewTemplateId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interview Template</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-[240px] justify-between',
                        !field.value && 'text-muted-foreground',
                      )}>
                      {field.value
                        ? interviewTemplates.find(
                            (template) =>
                              template.id.toString() === field.value,
                          )?.name
                        : 'Select interview template'}
                      <ChevronsUpDown className='opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-[200px] p-0'>
                  <Command>
                    <CommandInput
                      placeholder='Search template...'
                      className='h-9'
                    />
                    <CommandList>
                      <CommandEmpty>No templates found.</CommandEmpty>
                      <CommandGroup>
                        {interviewTemplates.map((template) => (
                          <CommandItem
                            value={template.id.toString()}
                            key={template.id}
                            onSelect={() => {
                              form.setValue(
                                'interviewTemplateId',
                                template.id.toString(),
                              );
                            }}>
                            {template.name}
                            <Check
                              className={cn(
                                'ml-auto',
                                template.id.toString() === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-[240px] justify-between',
                        !field.value && 'text-muted-foreground',
                      )}>
                      {field.value
                        ? candidates.find(
                            (candidate) =>
                              candidate.id.toString() === field.value,
                          )?.fullName
                        : 'Select candidate'}
                      <ChevronsUpDown className='opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-[200px] p-0'>
                  <Command>
                    <CommandInput
                      placeholder='Search candidate...'
                      className='h-9'
                    />
                    <CommandList>
                      <CommandEmpty>No candidates found.</CommandEmpty>
                      <CommandGroup>
                        {candidates.map((candidate) => (
                          <CommandItem
                            value={candidate.id.toString()}
                            key={candidate.id}
                            onSelect={() => {
                              form.setValue(
                                'candidateId',
                                candidate.id.toString(),
                              );
                            }}>
                            {candidate.fullName}
                            <Check
                              className={cn(
                                'ml-auto',
                                candidate.id.toString() === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        {/*  */}
        <FormField
          control={form.control}
          name='deadline'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Deadline</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}>
                      {field.value ? (
                        dayjs(field.value).format('DD-MM-YYYY')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className='w-auto p-0'
                  align='start'>
                  <Calendar
                    mode='single'
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date <= new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                By default, a week from now.
                <br />
                The interview can be completed by the candidate even if it is
                expired.
              </FormDescription>
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
          <Button type='submit'>Save</Button>
        </DialogFooter>
      </form>
    </Form>
  );

  const Fallback = () => (
    <Alert variant='destructive'>
      <AlertCircle className='h-4 w-4' />
      <AlertTitle>Attention</AlertTitle>
      <AlertDescription>
        You can only update interviews that are pending.
      </AlertDescription>
    </Alert>
  );

  return (
    <>
      <Button
        variant='outline'
        size='icon'
        onClick={() => setIsOpen(true)}>
        <Pencil />
      </Button>
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-[525px]'>
          <DialogHeader>
            <DialogTitle>Update Interview</DialogTitle>
            <DialogDescription>
              Here you can update the interview details.
            </DialogDescription>
          </DialogHeader>
          {canUpdate ? <InterviewForm /> : <Fallback />}
        </DialogContent>
      </Dialog>
    </>
  );
};
