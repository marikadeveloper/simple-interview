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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import {
  PreRegisterInput,
  UserRole,
  useUserRegisterMutation,
} from '@/generated/graphql';
import { useMutationWithToast } from '@/hooks/useMutationWithToast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  role: z.nativeEnum(UserRole),
  email: z.string().email(),
  fullName: z.string().min(2).max(50),
});

interface UserCreateDialogProps {}

export const CreateUserDialog: React.FC<UserCreateDialogProps> = ({}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [, userRegister] = useMutationWithToast(useUserRegisterMutation, {
    successMessage: 'User created successfully',
    errorMessage: 'Failed to create user',
  });
  const { user } = useAuth();

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
      role:
        user?.role === UserRole.Interviewer
          ? UserRole.Candidate
          : UserRole.Interviewer,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await userRegister({
      input: {
        ...(values as PreRegisterInput),
      },
    });
    if (response.data?.userRegister) {
      setIsOpen(false);
    }
  }

  const renderTrigger = () => {
    if (user?.role === UserRole.Interviewer) {
      return 'Add Candidate';
    }
    return 'Add User';
  };

  const renderTitle = () => {
    if (user?.role === UserRole.Interviewer) {
      return 'New Candidate';
    }
    return 'New User';
  };

  const renderDescription = () => {
    if (user?.role === UserRole.Interviewer) {
      return 'Create a candidate account for the application.';
    }
    return 'Create a user account for the application.';
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>{renderTrigger()}</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{renderTitle()}</DialogTitle>
          <DialogDescription>{renderDescription()}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='user-create-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'>
            {user?.role === UserRole.Admin && (
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
                        <FormItem
                          key={UserRole.Interviewer}
                          className='flex items-center space-x-3 space-y-0'>
                          <FormControl>
                            <RadioGroupItem value={UserRole.Interviewer} />
                          </FormControl>
                          <FormLabel className='font-normal'>
                            Interviewer
                          </FormLabel>
                        </FormItem>
                        <FormItem
                          key={UserRole.Candidate}
                          className='flex items-center space-x-3 space-y-0'>
                          <FormControl>
                            <RadioGroupItem value={UserRole.Candidate} />
                          </FormControl>
                          <FormLabel className='font-normal'>
                            Candidate
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
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
