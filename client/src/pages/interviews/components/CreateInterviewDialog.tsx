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
import { useAuth } from '@/contexts/AuthContext';
import {
  useCreateInterviewMutation,
  useGetInterviewTemplatesQuery,
  useGetUsersQuery,
  UserRole,
} from '@/generated/graphql';
import { useMutationWithToast } from '@/hooks/useMutationWithToast';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { interviewFormSchema as formSchema } from '../schema';

const oneWeekFromNow = dayjs().add(7, 'day').toDate();

interface CreateInterviewDialogProps {}
export const CreateInterviewDialog: React.FC<
  CreateInterviewDialogProps
> = ({}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [{ data: interviewTemplatesData }] = useGetInterviewTemplatesQuery({
    pause: !isOpen,
  });
  const [{ data: usersData }] = useGetUsersQuery({
    variables: {
      filters: {},
    },
  });
  const [, createInterview] = useMutationWithToast(useCreateInterviewMutation, {
    successMessage: 'Interview created successfully',
    errorMessage: 'Failed to create interview',
  });
  const candidatesData = useMemo(() => {
    return usersData?.getUsers?.filter((user) => user.role === 'CANDIDATE');
  }, [usersData]);
  const interviewersData = useMemo(() => {
    return usersData?.getUsers?.filter((user) => user.role === 'INTERVIEWER');
  }, [usersData]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interviewTemplateId: '',
      candidateId: '',
      deadline: oneWeekFromNow,
      interviewerId:
        user?.role === UserRole.Interviewer ? user.id.toString() : '',
    },
  });

  // reset form on close
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen]);

  const handleCreateSubmit = async (values: z.infer<typeof formSchema>) => {
    const { error } = await createInterview({
      input: {
        interviewTemplateId: parseInt(values.interviewTemplateId),
        candidateId: parseInt(values.candidateId),
        deadline: dayjs(values.deadline).format('YYYY-MM-DD'),
        interviewerId: parseInt(values.interviewerId),
      },
    });
    if (error) {
      return;
    }
    setIsOpen(false);
    form.reset();
  };

  const interviewTemplates =
    interviewTemplatesData?.getInterviewTemplates || [];
  const candidates = candidatesData || [];
  const interviewers = interviewersData || [];

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Interview</Button>
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-[525px]'>
          <DialogHeader>
            <DialogTitle>Create Interview</DialogTitle>
            <DialogDescription>
              Create a new interview for a candidate.
            </DialogDescription>
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
              {user?.role === UserRole.Interviewer && (
                <div>
                  <FormItem>
                    <FormLabel>Interviewer</FormLabel>
                  </FormItem>
                  <p className='mt-2 text-sm text-muted-foreground'>
                    You are automatically assigned as the interviewer.
                  </p>
                </div>
              )}
              {user?.role === UserRole.Admin && (
                <FormField
                  control={form.control}
                  name='interviewerId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interviewer</FormLabel>
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
                                ? interviewers.find(
                                    (interviewer) =>
                                      interviewer.id.toString() === field.value,
                                  )?.fullName
                                : 'Select interviewer'}
                              <ChevronsUpDown className='opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-[200px] p-0'>
                          <Command>
                            <CommandInput
                              placeholder='Search interviewer...'
                              className='h-9'
                            />
                            <CommandList>
                              <CommandEmpty>
                                No interviewers found.
                              </CommandEmpty>
                              <CommandGroup>
                                {interviewers.map((interviewer) => (
                                  <CommandItem
                                    value={interviewer.id.toString()}
                                    key={interviewer.id}
                                    onSelect={() => {
                                      form.setValue(
                                        'interviewerId',
                                        interviewer.id.toString(),
                                      );
                                    }}>
                                    {interviewer.fullName}
                                    <Check
                                      className={cn(
                                        'ml-auto',
                                        interviewer.id.toString() ===
                                          field.value
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
              )}
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
                      The interview can be completed by the candidate even if it
                      is expired.
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
                <Button type='submit'>Create</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
