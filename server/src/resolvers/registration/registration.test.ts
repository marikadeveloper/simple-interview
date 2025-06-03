import { PASSWORD_MIN_LENGTH } from '../../constants';
import { User, UserRole } from '../../entities/User';
import { dataSource } from '../../index';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser, fakeUserData } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';
import { errorStrings } from '../../utils/errorStrings';

jest.mock('../../utils/sendEmail', () => ({
  sendEmail: jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
  }),
}));

// Track entities created during tests for reliable cleanup
let testUsers: User[] = [];

// Set up the database connection before all tests
beforeAll(async () => {
  await setupTestDB();
});

afterEach(async () => {
  // Clean up in reverse order (users first, then invitations)
  // to avoid foreign key constraint issues
  if (testUsers.length > 0) {
    await Promise.all(testUsers.map((user) => User.delete(user.id)));
    testUsers = [];
  }
});

// Close database connections after all tests
afterAll(async () => {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
  }
});

const adminRegisterMutation = `
  mutation Register($input: RegisterInput!) {
    adminRegister(input: $input) {
      id
    }
  }
`;

const candidateRegisterMutation = `
  mutation CandidateRegister($input: RegisterInput!) {
    candidateRegister(input: $input) {
      id
    }
  }
`;

const interviewerRegisterMutation = `
  mutation InterviewerRegister($input: RegisterInput!) {
    interviewerRegister(input: $input) {
      id
    }
  }
`;

describe('UserResolver', () => {
  describe('adminRegister', () => {
    it('should handle unexpected errors', async () => {
      // Simulate an unexpected error
      jest.spyOn(User, 'create').mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });

      const response = await graphqlCall({
        source: adminRegisterMutation,
        variableValues: {
          input: fakeUserData(),
        },
      });

      expect(response).toMatchObject({
        data: {
          adminRegister: null,
        },
        errors: [
          {
            message: 'Unexpected error',
          },
        ],
      });

      // Restore the original implementation
      jest.restoreAllMocks();
    });

    it('should register a new admin', async () => {
      const response = await graphqlCall({
        source: adminRegisterMutation,
        variableValues: {
          input: fakeUserData(),
        },
      });

      expect(response).toMatchObject({
        data: {
          adminRegister: {
            id: expect.any(Number),
          },
        },
      });

      // Add to cleanup list
      // @ts-ignore
      if (response?.data?.adminRegister?.id) {
        const user = await User.findOne({
          // @ts-ignore
          where: { id: response.data.adminRegister.id },
        });
        if (user) testUsers.push(user);
      }
    });

    it('should not register a new admin if one is already registered', async () => {
      const admin = await createFakeUser(UserRole.ADMIN);
      testUsers.push(admin);

      // Try to create a second admin
      const response = await graphqlCall({
        source: adminRegisterMutation,
        variableValues: {
          input: fakeUserData(),
        },
      });

      expect(response).toMatchObject({
        data: {
          adminRegister: null,
        },
        errors: [
          {
            message: errorStrings.user.onlyOneAdminAllowed,
          },
        ],
      });
    });
  });

  describe('candidateRegister', () => {
    it.todo('given a correct input should register a new candidate');

    it('given an invalid email should return an error', async () => {
      const candidateInput = {
        ...fakeUserData(),
        email: 'invalid-email',
      };

      const response = await graphqlCall({
        source: candidateRegisterMutation,
        variableValues: {
          input: candidateInput,
        },
      });

      expect(response).toMatchObject({
        data: {
          candidateRegister: null,
        },
        errors: [
          {
            message: errorStrings.user.invalidEmail,
          },
        ],
      });
    });

    it('given a short password should return an error', async () => {
      const candidateInput = {
        ...fakeUserData(),
        password: 'a'.repeat(PASSWORD_MIN_LENGTH - 1),
      };

      const response = await graphqlCall({
        source: candidateRegisterMutation,
        variableValues: {
          input: candidateInput,
        },
      });

      expect(response).toMatchObject({
        data: {
          candidateRegister: null,
        },
        errors: [
          {
            message: errorStrings.user.passwordTooShort,
          },
        ],
      });
    });

    it('given a short full name should return an error', async () => {
      const candidateInput = {
        ...fakeUserData(),
        fullName: 'a',
      };

      const response = await graphqlCall({
        source: candidateRegisterMutation,
        variableValues: {
          input: candidateInput,
        },
      });

      expect(response).toMatchObject({
        data: {
          candidateRegister: null,
        },
        errors: [
          {
            message: errorStrings.user.fullNameTooShort,
          },
        ],
      });
    });

    it('given no valid invite should return an error', async () => {
      const candidateInput = {
        ...fakeUserData(),
      };

      const response = await graphqlCall({
        source: candidateRegisterMutation,
        variableValues: {
          input: candidateInput,
        },
      });

      expect(response).toMatchObject({
        data: {
          candidateRegister: null,
        },
        errors: [
          {
            message: errorStrings.user.invalidInvitation,
          },
        ],
      });
    });
  });

  describe('interviewerRegister', () => {
    it('given a correct input should register a new interviewer', async () => {
      // Get admin ID to log in
      const admin = await createFakeUser(UserRole.ADMIN);
      testUsers.push(admin);

      const interviewerInput = {
        ...fakeUserData(),
      };

      const response = await graphqlCall({
        source: interviewerRegisterMutation,
        variableValues: {
          input: interviewerInput,
        },
        userId: admin.id,
      });

      expect(response).toMatchObject({
        data: {
          interviewerRegister: {
            id: expect.any(Number),
          },
        },
      });

      // Add to cleanup list
      // @ts-ignore
      if (response?.data?.interviewerRegister?.id) {
        const user = await User.findOne({
          // @ts-ignore
          where: { id: response.data.interviewerRegister.id },
        });
        if (user) testUsers.push(user);
      }
    });

    it('should return error trying to register an interviewer without sign in', async () => {
      const interviewerInput = {
        ...fakeUserData(),
      };

      const response = await graphqlCall({
        source: interviewerRegisterMutation,
        variableValues: {
          input: interviewerInput,
        },
      });

      expect(response).toMatchObject({
        data: {
          interviewerRegister: null,
        },
        errors: [
          {
            message: errorStrings.user.notAuthenticated,
          },
        ],
      });
    });
  });
});
