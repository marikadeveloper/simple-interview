import { faker } from '@faker-js/faker';
import { FULL_NAME_MIN_LENGTH, PASSWORD_MIN_LENGTH } from '../constants';
import { CandidateInvitation } from '../entities/CandidateInvitation';
import { User, UserRole } from '../entities/User';
import { dataSource } from '../index';
import { graphqlCall } from '../test-utils/graphqlCall';
import { createFakeUser, fakeUserData } from '../test-utils/mockData';
import { setupTestDB } from '../test-utils/testSetup';

jest.mock('../utils/sendEmail', () => ({
  sendEmail: jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
  }),
}));

// Track entities created during tests for reliable cleanup
let testUsers: User[] = [];
let testInvitations: CandidateInvitation[] = [];

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

  if (testInvitations.length > 0) {
    await Promise.all(
      testInvitations.map((invite) => CandidateInvitation.delete(invite.id)),
    );
    testInvitations = [];
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
      user {
        id
      }
      errors {
        field
        message
      }
    }
  }
`;

const candidateRegisterMutation = `
  mutation CandidateRegister($input: RegisterInput!) {
    candidateRegister(input: $input) {
      user {
        id
      }
      errors {
        field
        message
      }
    }
  }
`;

const interviewerRegisterMutation = `
  mutation InterviewerRegister($input: RegisterInput!) {
    interviewerRegister(input: $input) {
      user {
        id
      }
      errors {
        field
        message
      }
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
          adminRegister: {
            user: null,
            errors: [
              {
                field: 'general',
                message: 'Unexpected error',
              },
            ],
          },
        },
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
            user: {
              id: expect.any(Number),
            },
            errors: null,
          },
        },
      });

      // Add to cleanup list
      // @ts-ignore
      if (response?.data?.adminRegister?.user?.id) {
        const user = await User.findOne({
          // @ts-ignore
          where: { id: response.data.adminRegister.user.id },
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
          adminRegister: {
            user: null,
            errors: [
              {
                field: 'role',
                message: 'only one admin is allowed',
              },
            ],
          },
        },
      });
    });
  });

  describe('candidateRegister', () => {
    it('given a correct input should register a new candidate', async () => {
      // Create an invite
      const email = faker.internet.email();
      const candidateInvitation = await CandidateInvitation.create({
        email,
        used: false,
      }).save();
      testInvitations.push(candidateInvitation);

      // Create the candidate
      const candidateInput = {
        ...fakeUserData(),
        email,
      };

      const response = await graphqlCall({
        source: candidateRegisterMutation,
        variableValues: {
          input: candidateInput,
        },
      });

      expect(response).toMatchObject({
        data: {
          candidateRegister: {
            user: {
              id: expect.any(Number),
            },
            errors: null,
          },
        },
      });

      // Add to cleanup list
      // @ts-ignore
      if (response?.data?.candidateRegister?.user?.id) {
        const user = await User.findOne({
          // @ts-ignore
          where: { id: response.data.candidateRegister.user.id },
        });
        if (user) testUsers.push(user);
      }
    });

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
          candidateRegister: {
            user: null,
            errors: [
              {
                field: 'email',
                message: 'invalid email',
              },
            ],
          },
        },
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
          candidateRegister: {
            user: null,
            errors: [
              {
                field: 'password',
                message: `Length must be at least ${PASSWORD_MIN_LENGTH} characters`,
              },
            ],
          },
        },
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
          candidateRegister: {
            user: null,
            errors: [
              {
                field: 'fullName',
                message: `Length must be at least ${FULL_NAME_MIN_LENGTH} characters`,
              },
            ],
          },
        },
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
          candidateRegister: {
            user: null,
            errors: [
              {
                field: 'general',
                message: 'invalid invitation',
              },
            ],
          },
        },
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
            user: {
              id: expect.any(Number),
            },
            errors: null,
          },
        },
      });

      // Add to cleanup list
      // @ts-ignore
      if (response?.data?.interviewerRegister?.user?.id) {
        const user = await User.findOne({
          // @ts-ignore
          where: { id: response.data.interviewerRegister.user.id },
        });
        if (user) testUsers.push(user);
      }
    });

    it('should return error trying to register an interviewer without sign in as admin', async () => {
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
          interviewerRegister: {
            user: null,
            errors: [
              {
                field: 'general',
                message: 'User not logged in',
              },
            ],
          },
        },
      });
    });
  });
});
