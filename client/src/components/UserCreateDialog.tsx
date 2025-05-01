import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UserRole } from '@/generated/graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const userRoles: {
  value: UserRole;
  label: string;
}[] = [
  { value: UserRole.Interviewer, label: 'Interviewer' },
  { value: UserRole.Candidate, label: 'Candidate' },
];

const formSchema = z.object({
  role: z.enum([UserRole.Interviewer, UserRole.Candidate]),
  fullName: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(50),
});

interface UserCreateDialogProps {}

export const UserCreateDialog: React.FC<UserCreateDialogProps> = ({}) => {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: UserRole.Interviewer,
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <Dialog>
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
          </form>
        </Form>
        {/* <div className='grid gap-4 py-4'>
          <div className='grid-grid-cols-4 items-center gap-4'>
            <Label
              htmlFor='role'
              className='text-right mb-2'>
              Role
            </Label>
            <RadioGroup>
              {userRoles.map((role) => (
                <div
                  key={role.value}
                  className='flex items-center space-x-2'>
                  <RadioGroupItem
                    value={role.value}
                    id={role.label}
                  />
                  <Label htmlFor={role.label}>{role.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className='grid gap-2'>
            <Label
              htmlFor='name'
              className='text-right'>
              Name
            </Label>
            <Input
              id='name'
              value=''
              className='col-span-3'
            />
          </div>
          <div className='grid gap-2'>
            <Label
              htmlFor='username'
              className='text-right'>
              Username
            </Label>
            <Input
              id='username'
              value=''
              className='col-span-3'
            />
          </div>
        </div> */}
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
