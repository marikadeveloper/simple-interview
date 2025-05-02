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
import { useCandidateRegisterMutation } from '@/generated/graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(50),
  fullName: z.string().min(2).max(50),
});

export default function CandidateSignupPage() {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [queryParams] = useSearchParams();
  const email = queryParams.get('email');
  const navigate = useNavigate();
  const [, candidateRegister] = useCandidateRegisterMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email || '',
      password: '',
      fullName: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { email, password, fullName } = values;
    setErrors({});

    try {
      const result = await candidateRegister({
        input: { email, password, fullName },
      });

      if (result.data?.candidateRegister.user) {
        navigate('/dashboard');
      } else {
        const newErrors: { [key: string]: string } = {};
        result.data?.candidateRegister.errors?.forEach((error) => {
          newErrors[error.field] = error.message;
        });
        setErrors(newErrors);
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
            Candidate Registration
          </h1>
          <p className='text-sm text-muted-foreground'>
            Create your candidate account
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
                      placeholder='John Doe'
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
            <Button
              type='submit'
              className='w-full'>
              Submit
            </Button>
          </form>
        </Form>

        <div className='mt-4 text-center text-sm'>
          <p className='text-muted-foreground'>
            Already have an account?{' '}
            <Link
              to='/login'
              className='font-medium text-primary hover:underline'>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
