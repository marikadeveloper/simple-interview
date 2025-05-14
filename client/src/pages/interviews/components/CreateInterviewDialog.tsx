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
  useCreateInterviewMutation,
  useGetInterviewTemplatesQuery,
  useGetUsersQuery,
  UserRole,
} from '@/generated/graphql';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { interviewFormSchema as formSchema } from '../schema';

const oneWeekFromNow = dayjs().add(7, 'day').toDate();

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
        deadline: dayjs(values.deadline).format('YYYY-MM-DD'),
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
