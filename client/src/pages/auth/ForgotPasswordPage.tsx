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
import { useForgotPasswordRequestMutation } from '@/generated/graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

export default function ForgotPasswordPage() {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [, forgotPasswordRequest] = useForgotPasswordRequestMutation();
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
    mode: 'all',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { email } = values;
    setErrors({});

    try {
      const result = await forgotPasswordRequest({
        email,
      });

      if (result.data?.forgotPasswordRequest) {
        setEmailSent(true);
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <div className='w-full max-w-md space-y-8 rounded-lg border bg-card p-6 shadow-md'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold tracking-tight'>
            Request Password Change
          </h1>
          <p className='text-sm text-muted-foreground'>
            Enter your email to receive a password reset link.
          </p>
        </div>

        {errors.general && (
          <div className='rounded border border-destructive bg-destructive/10 p-3 text-center text-sm text-destructive'>
            {errors.general}
          </div>
        )}

        {!emailSent && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-8'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='jane@doe.it'
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
        )}

        {emailSent && (
          <div className='rounded border border-green-500 bg-green-500/10 p-3 text-center text-sm text-success'>
            A password reset link has been sent to your email.
          </div>
        )}
      </div>
    </div>
  );
}
