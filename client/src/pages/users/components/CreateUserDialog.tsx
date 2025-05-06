import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from '@/components/ui/input';
import {
  RegisterInput,
  useCreateCandidateInvitationMutation,
  useInterviewerRegisterMutation,
  UserRole,
} from '@/generated/graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import { RadioGroup } from '@radix-ui/react-dropdown-menu';
import { RadioGroupItem } from '@radix-ui/react-radio-group';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { formSchema, userRoles } from '..';

interface UserCreateDialogProps {}

export const CreateUserDialog: React.FC<UserCreateDialogProps> = ({}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [, interviewerRegister] = useInterviewerRegisterMutation();
  const [, createCandidateInvitation] = useCreateCandidateInvitationMutation();

  // reset form on close
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: undefined,
      email: undefined,
      password: undefined,
      role: UserRole.Interviewer,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { role, ...rest } = values;
    if (role === UserRole.Interviewer) {
      interviewerRegister({
        input: {
          ...(rest as RegisterInput),
        },
      }).then(() => setIsOpen(false));
    }
    if (role === UserRole.Candidate) {
      createCandidateInvitation({
        email: rest.email,
      }).then(() => setIsOpen(false));
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add User</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>
            Create a user account for the application.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='user-create-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'>
            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className='flex flex-col space-y-1'>
                      {userRoles.map((role) => (
                        <FormItem
                          key={role.value}
                          className='flex items-center space-x-3 space-y-0'>
                          <FormControl>
                            <RadioGroupItem value={role.value} />
                          </FormControl>
                          <FormLabel className='font-normal'>
                            {role.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  {form.watch('role') === UserRole.Candidate && (
                    <FormDescription>
                      An email invitation will be sent to this email.
                    </FormDescription>
                  )}
                  <FormControl>
                    <Input
                      placeholder='jane@doe.it'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch('role') === UserRole.Interviewer && (
              <>
                <FormField
                  control={form.control}
                  name='fullName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Jane Doe'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='********'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </form>
        </Form>
        <DialogFooter>
          <Button
            type='submit'
            form='user-create-form'>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
