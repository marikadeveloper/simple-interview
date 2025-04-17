import { FULL_NAME_MIN_LENGTH, PASSWORD_MIN_LENGTH } from '../constants';
import { CandidateInvitation } from '../entities/CandidateInvitation';
import { User, UserRole } from '../entities/User';
import { FieldError, RegisterInput } from '../resolvers/user';

export const validateRegister = async (
  input: RegisterInput,
  role: UserRole,
): Promise<FieldError[] | null> => {
  if (!input.email.includes('@')) {
    return [
      {
        field: 'email',
        message: 'invalid email',
      },
    ];
  }

  if (input.password.length < PASSWORD_MIN_LENGTH) {
    return [
      {
        field: 'password',
        message: `Length must be at least ${PASSWORD_MIN_LENGTH} characters`,
      },
    ];
  }

  if (input.fullName.length < FULL_NAME_MIN_LENGTH) {
    return [
      {
        field: 'fullName',
        message: `Length must be at least ${FULL_NAME_MIN_LENGTH} characters`,
      },
    ];
  }

  if (!role) {
    return [
      {
        field: 'role',
        message: 'role must be provided',
      },
    ];
  }

  if (role !== 'admin' && role !== 'interviewer' && role !== 'candidate') {
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
  if (role === 'admin') {
    return validateAdmin();
  }
  if (role === 'candidate') {
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

// TODO: This may be useless
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
