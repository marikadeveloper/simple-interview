import { CandidateInvitation } from 'src/entities/CandidateInvitation';
import { User, UserRole } from '../entities/User';
import { FieldError, RegisterInput } from '../resolvers/user';

export const validateRegister = async (
  input: RegisterInput,
): Promise<FieldError[] | null> => {
  if (!input.email.includes('@')) {
    return [
      {
        field: 'email',
        message: 'invalid email',
      },
    ];
  }

  if (input.password.length <= 7) {
    return [
      {
        field: 'password',
        message: 'length must be greater than 7',
      },
    ];
  }

  if (input.fullName.length <= 2) {
    return [
      {
        field: 'fullName',
        message: 'length must be greater than 2',
      },
    ];
  }

  if (!input.role) {
    return [
      {
        field: 'role',
        message: 'role must be provided',
      },
    ];
  }

  if (
    input.role !== 'admin' &&
    input.role !== 'interviewer' &&
    input.role !== 'candidate'
  ) {
    return [
      {
        field: 'role',
        message: 'role must be admin, interviewer or candidate',
      },
    ];
  }

  /**
   *
   * other rules:
   * - only 1 admin
   * - interviewer sign up must be approved by admin
   * - candidate can sign up only by email invitation
   */
  if (input.role === 'admin') {
    return validateAdmin();
  }
  if (input.role === 'candidate') {
    return validateCandidate(input);
  }

  return null;
};

const validateAdmin = async (): Promise<FieldError[] | null> => {
  const adminCount = await User.count({
    where: {
      role: UserRole.ADMIN,
    },
  });

  if (adminCount > 0) {
    return [
      {
        field: 'role',
        message: 'only one admin is allowed',
      },
    ];
  }
  return null;
};

const validateCandidate = async (
  input: RegisterInput,
): Promise<FieldError[] | null> => {
  const invitation = await CandidateInvitation.findOne({
    where: {
      email: input.email,
      used: false,
    },
  });

  if (!invitation) {
    return [
      {
        field: 'email',
        message: 'invalid invitation',
      },
    ];
  }

  return null;
};
