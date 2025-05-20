import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await login(email, password);

      if (result.success) {
        navigate('/dashboard');
      } else {
        const newErrors: { [key: string]: string } = {};
        result.errors?.forEach((error) => {
          newErrors[error.field] = error.message;
        });
        setErrors(newErrors);
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <div className='w-full max-w-md space-y-8 rounded-lg border bg-card p-6 shadow-md'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold tracking-tight'>
            Sign in to your account
          </h1>
          <p className='text-sm text-muted-foreground'>
            Enter your credentials to access your account
          </p>
        </div>

        {errors.general && (
          <div className='rounded border border-destructive bg-destructive/10 p-3 text-center text-sm text-destructive'>
            {errors.general}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className='space-y-4'>
          <div className='space-y-2'>
            <label
              htmlFor='email'
              className={cn(
                'block text-sm font-medium',
                errors.email ? 'text-destructive' : 'text-foreground',
              )}>
              Email address
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                'w-full rounded-md border bg-background px-3 py-2 text-sm',
                errors.email
                  ? 'border-destructive text-destructive focus-visible:ring-destructive'
                  : 'border-input focus-visible:ring-ring',
              )}
              placeholder='name@example.com'
              autoComplete='email'
            />
            {errors.email && (
              <p className='text-xs text-destructive'>{errors.email}</p>
            )}
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <label
                htmlFor='password'
                className={cn(
                  'block text-sm font-medium',
                  errors.password ? 'text-destructive' : 'text-foreground',
                )}>
                Password
              </label>
            </div>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                'w-full rounded-md border bg-background px-3 py-2 text-sm',
                errors.password
                  ? 'border-destructive text-destructive focus-visible:ring-destructive'
                  : 'border-input focus-visible:ring-ring',
              )}
              autoComplete='current-password'
            />
            {errors.password && (
              <p className='text-xs text-destructive'>{errors.password}</p>
            )}
          </div>

          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className='mt-4 text-center text-sm grid gap-1'>
          <p className='text-muted-foreground'>Don't have an account? </p>
          <Link
            to='/candidate-signup'
            className='font-medium text-primary hover:underline'>
            Register as a candidate
          </Link>
          <p className='text-muted-foreground'>or</p>
          <Link
            to='/admin-signup'
            className='font-medium text-primary hover:underline'>
            Register as an admin
          </Link>
        </div>
      </div>
    </div>
  );
}
