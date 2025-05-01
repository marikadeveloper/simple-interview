import { UserRole } from '@/generated/graphql';
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
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const userRoles = [
  { value: UserRole.Interviewer, label: 'Interviewer' },
  { value: UserRole.Candidate, label: 'Candidate' },
];

interface UserCreateDialogProps {}

export const UserCreateDialog: React.FC<UserCreateDialogProps> = ({}) => {
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
        <div className='grid gap-4 py-4'>
          <div className='grid-grid-cols-4 items-center gap-4'>
            <Label
              htmlFor='role'
              className='text-right mb-2'>
              Role
            </Label>
            <RadioGroup>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem
                  value='interviewer'
                  id='r1'
                />
                <Label htmlFor='r1'>Interviewer</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem
                  value='candidate'
                  id='r2'
                />
                <Label htmlFor='r2'>Candidate</Label>
              </div>
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
        </div>
        <DialogFooter>
          <Button type='submit'>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
