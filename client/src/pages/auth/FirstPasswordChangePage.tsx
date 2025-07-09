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
import { useChangePasswordMutation } from '@/generated/graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';

const formSchema = z
  .object({
    oldPassword: z.string().min(8).max(50),
    newPassword: z.string().min(8).max(50),
    confirmPassword: z.string().min(8).max(50),
    // Ensure newPassword and confirmPassword match
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password must match',
    path: ['confirmPassword'], // Show error under confirm password field
  });

export default function FirstPasswordChangePage() {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const [, changePassword] = useChangePasswordMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { oldPassword, newPassword } = values;
    setErrors({});

    try {
      const result = await changePassword({
        input: { oldPassword, newPassword },
      });

      if (result.data?.changePassword) {
        navigate('/dashboard');
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <div className='w-full max-w-md space-y-8 rounded-lg border bg-card p-6 shadow-md'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold tracking-tight'>Change Password</h1>
          <p className='text-sm text-muted-foreground'>
            This is your first time signing in. Please change your password.
          </p>
        </div>

        {errors.general && (
          <div className='rounded border border-destructive bg-destructive/10 p-3 text-center text-sm text-destructive'>
            {errors.general}
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-8'>
            <FormField
              control={form.control}
              name='oldPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Old Password</FormLabel>
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
            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
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
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
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
            <Button
              type='submit'
              className='w-full'>
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
