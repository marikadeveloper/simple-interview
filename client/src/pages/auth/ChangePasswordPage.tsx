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
import { useForgotPasswordChangeMutation } from '@/generated/graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';

const formSchema = z
  .object({
    newPassword: z.string().min(8).max(50),
    confirmPassword: z.string().min(8).max(50),
    token: z.string(),
    // Ensure newPassword and confirmPassword match
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password must match',
    path: ['confirmPassword'],
  });

export default function ChangePasswordPage() {
  const { token } = useParams();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const [, forgotPasswordChange] = useForgotPasswordChangeMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
      token,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { newPassword, token } = values;
    setErrors({});

    try {
      const result = await forgotPasswordChange({
        input: { newPassword, token },
      });

      if (result.data?.forgotPasswordChange) {
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
            Choose a new password to secure your account.
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
