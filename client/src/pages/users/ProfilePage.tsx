import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import {
  ChangePasswordDocument,
  MeDocument,
  UpdateUserNameDocument,
} from '@/generated/graphql';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'urql';

export default function ProfilePage() {
  // Fetch current user info
  const [{ data: meData }] = useQuery({ query: MeDocument });
  const user = meData?.me;

  // Update name mutation
  const [, updateUserName] = useMutation(UpdateUserNameDocument);
  // Change password mutation
  const [, changePassword] = useMutation(ChangePasswordDocument);

  // Form for name
  const {
    register: registerName,
    handleSubmit: handleSubmitName,
    formState: { errors: nameErrors, isSubmitting: isSubmittingName },
    reset: resetName,
  } = useForm<{ fullName: string }>();

  // Form for password
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
    reset: resetPassword,
  } = useForm<{ oldPassword: string; newPassword: string }>();

  // Handlers
  const onSubmitName = async (values: { fullName: string }) => {
    const result = await updateUserName(values);
    if (!result.error) {
      alert('Name updated successfully!');
      resetName();
    } else {
      alert(result.error.message);
    }
  };

  const onSubmitPassword = async (values: {
    oldPassword: string;
    newPassword: string;
  }) => {
    const result = await changePassword({ input: values });
    if (!result.error) {
      alert('Password changed successfully!');
      resetPassword();
    } else {
      alert(result.error.message);
    }
  };

  return (
    <>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <PageTitle>User Profile</PageTitle>
          <PageSubtitle>Manage your profile information</PageSubtitle>
        </div>
      </div>
      {/* Name section */}
      <form
        onSubmit={handleSubmitName(onSubmitName)}
        className='mb-8 p-6 border rounded space-y-4'>
        <h2 className='text-lg font-semibold'>Change Name</h2>
        <label
          htmlFor='fullName'
          className='block font-medium'>
          Full Name
        </label>
        <Input
          id='fullName'
          defaultValue={user?.fullName || ''}
          {...registerName('fullName', {
            required: 'Name is required',
            minLength: 2,
          })}
        />
        {nameErrors.fullName && (
          <p className='text-red-500 text-sm'>{nameErrors.fullName.message}</p>
        )}
        <Button
          type='submit'
          disabled={isSubmittingName}>
          Update Name
        </Button>
      </form>
      {/* Password section */}
      <form
        onSubmit={handleSubmitPassword(onSubmitPassword)}
        className='p-6 border rounded space-y-4'>
        <h2 className='text-lg font-semibold'>Change Password</h2>
        <label
          htmlFor='oldPassword'
          className='block font-medium'>
          Old Password
        </label>
        <Input
          id='oldPassword'
          type='password'
          {...registerPassword('oldPassword', {
            required: 'Old password is required',
          })}
        />
        {passwordErrors.oldPassword && (
          <p className='text-red-500 text-sm'>
            {passwordErrors.oldPassword.message}
          </p>
        )}
        <label
          htmlFor='newPassword'
          className='block font-medium'>
          New Password
        </label>
        <Input
          id='newPassword'
          type='password'
          {...registerPassword('newPassword', {
            required: 'New password is required',
            minLength: 6,
          })}
        />
        {passwordErrors.newPassword && (
          <p className='text-red-500 text-sm'>
            {passwordErrors.newPassword.message}
          </p>
        )}
        <Button
          type='submit'
          disabled={isSubmittingPassword}>
          Change Password
        </Button>
      </form>
    </>
  );
}
