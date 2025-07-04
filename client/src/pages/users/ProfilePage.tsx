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
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import { DetailPageSkeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import {
  useChangePasswordMutation,
  useMeQuery,
  useUpdateUserNameMutation,
} from '@/generated/graphql';
import { useMutationWithToast } from '@/hooks/useMutationWithToast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const nameFormSchema = z.object({
  fullName: z
    .string()
    .min(2, {
      message: 'Name must be at least 2 characters long',
    })
    .max(50, {
      message: 'Name must be less than 50 characters',
    }),
});

const passwordFormSchema = z.object({
  oldPassword: z.string().min(1, {
    message: 'Old password is required',
  }),
  newPassword: z
    .string()
    .min(6, {
      message: 'New password must be at least 6 characters long',
    })
    .max(50, {
      message: 'New password must be less than 50 characters',
    }),
});

export default function ProfilePage() {
  const { isLoading } = useAuth();

  // Fetch current user info
  const [{ data: meData }] = useMeQuery();
  const userData = meData?.me;

  // Update name mutation
  const [, updateUserName] = useMutationWithToast(useUpdateUserNameMutation, {
    successMessage: 'Name updated successfully!',
    errorMessage: 'Failed to update name',
  });

  // Change password mutation
  const [, changePassword] = useMutationWithToast(useChangePasswordMutation, {
    successMessage: 'Password changed successfully!',
    errorMessage: 'Failed to change password',
  });

  // Form for name
  const nameForm = useForm<z.infer<typeof nameFormSchema>>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: {
      fullName: userData?.fullName || '',
    },
  });

  // Form for password
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
    },
  });

  // Handlers
  const onSubmitName = async (values: z.infer<typeof nameFormSchema>) => {
    await updateUserName(values);
  };

  const onSubmitPassword = async (
    values: z.infer<typeof passwordFormSchema>,
  ) => {
    await changePassword({ input: values });
  };

  if (isLoading) {
    return <DetailPageSkeleton contentBlocks={2} />;
  }

  return (
    <>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <PageTitle>User Profile</PageTitle>
          <PageSubtitle>Manage your profile information</PageSubtitle>
        </div>
      </div>

      {/* Name section */}
      <div className='mb-8 p-6 border rounded space-y-4'>
        <h2 className='text-lg font-semibold'>Change Name</h2>
        <Form {...nameForm}>
          <form
            onSubmit={nameForm.handleSubmit(onSubmitName)}
            className='space-y-4'>
            <FormField
              control={nameForm.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter your full name'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              disabled={nameForm.formState.isSubmitting}>
              Update Name
            </Button>
          </form>
        </Form>
      </div>

      {/* Password section */}
      <div className='p-6 border rounded space-y-4'>
        <h2 className='text-lg font-semibold'>Change Password</h2>
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
            className='space-y-4'>
            <FormField
              control={passwordForm.control}
              name='oldPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Old Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Enter your current password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Enter your new password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              disabled={passwordForm.formState.isSubmitting}>
              Change Password
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}
