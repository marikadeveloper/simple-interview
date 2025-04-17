import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { PASSWORD_MIN_LENGTH } from '../constants';
import { User, UserRole } from '../entities/User';
import { graphqlCall } from '../test-utils/graphqlCall';
import { testConn } from '../test-utils/testConn';
import { sendEmail } from '../utils/sendEmail';

jest.mock('../utils/sendEmail', () => ({
  sendEmail: jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
  }),
}));

let conn: DataSource;
beforeAll(async () => {
  conn = testConn(); // Get connection config (drop: false by default)
  await conn.initialize(); // Initialize connection for this test suite
  // await conn.runMigrations(); // Remove: Migrations/schema sync handled by globalSetup
});

afterAll(async () => {
  await conn.destroy();
});

const meQuery = `
  query Me {
    me {
      id
    }
  }
`;

const changePasswordMutation = `
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      errors {
        field
        message
      }
      user {
        id
      }
    }
  }
`;

const forgotPasswordMutation = `
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

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

const createFakeInterviewer = async () => {
  const user = await User.create({
    fullName: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    role: UserRole.INTERVIEWER,
  }).save();

  return user;
};

describe('UserResolver', () => {
  describe('me', () => {
    it('should return the current user', async () => {
      const user = await createFakeInterviewer();

      const response = await graphqlCall({
        source: meQuery,
        userId: user.id,
      });

      expect(response).toMatchObject({
        data: {
          me: {
            id: user.id,
          },
        },
      });
    });

    it('should return null if no user is logged in', async () => {
      const response = await graphqlCall({
        source: meQuery,
      });

      expect(response).toMatchObject({
        data: {
          me: null,
        },
      });
    });
  });

  describe('changePassword', () => {
    it('given correct input should change the password', async () => {
      const user = await createFakeInterviewer();

      const newPassword = faker.internet.password();

      const response = await graphqlCall({
        source: changePasswordMutation,
        variableValues: {
          input: {
            token: 'valid-token',
            newPassword,
          },
        },
        userId: user.id,
      });

      expect(response).toMatchObject({
        data: {
          changePassword: {
            errors: null,
            user: {
              id: user.id,
            },
          },
        },
      });
    });

    it('given short password should return error', async () => {
      const user = await createFakeInterviewer();

      const response = await graphqlCall({
        source: changePasswordMutation,
        variableValues: {
          input: {
            token: 'valid-token',
            newPassword: 'a'.repeat(PASSWORD_MIN_LENGTH - 1),
          },
        },
        userId: user.id,
      });

      expect(response).toMatchObject({
        data: {
          changePassword: {
            errors: [
              {
                field: 'newPassword',
                message: `Length must be at least ${PASSWORD_MIN_LENGTH} characters`,
              },
            ],
            user: null,
          },
        },
      });
    });

    it('given invalid token should return error', async () => {
      const response = await graphqlCall({
        source: changePasswordMutation,
        variableValues: {
          input: {
            token: 'invalid-token',
            newPassword: faker.internet.password(),
          },
        },
      });

      expect(response).toMatchObject({
        data: {
          changePassword: {
            errors: [
              {
                field: 'token',
                message: 'Token expired or invalid',
              },
            ],
            user: null,
          },
        },
      });
    });

    it('given non-existent user should return error', async () => {
      const response = await graphqlCall({
        source: changePasswordMutation,
        variableValues: {
          input: {
            token: 'valid-token',
            newPassword: faker.internet.password(),
          },
        },
        userId: -1, // Simulate a non-existent user
      });
      expect(response).toMatchObject({
        data: {
          changePassword: {
            errors: [
              {
                field: 'token',
                message: 'User no longer exists',
              },
            ],
            user: null,
          },
        },
      });
    });
  });

  describe('forgotPassword', () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Reset mock call history before each test
    });
    it('given a valid user should send a reset password email', async () => {
      const user = await createFakeInterviewer();

      const response = await graphqlCall({
        source: forgotPasswordMutation,
        variableValues: {
          email: user.email,
        },
      });

      expect(sendEmail).toHaveBeenCalled();
      expect(response).toMatchObject({
        data: {
          forgotPassword: true,
        },
      });
    });

    it('should ignore if user does not exist', async () => {
      const response = await graphqlCall({
        source: forgotPasswordMutation,
        variableValues: {
          email: 'nonexisting@email.it',
        },
      });

      expect(sendEmail).not.toHaveBeenCalled();
      expect(response).toMatchObject({
        data: {
          forgotPassword: true,
        },
      });
    });
  });

  describe('adminRegister', () => {
    const adminInput = {
      email: faker.internet.email(),
      fullName: faker.person.fullName(),
      password: faker.internet.password(),
    };

    it('should handle unexpected errors', async () => {
      // Simulate an unexpected error
      jest.spyOn(User, 'create').mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });

      const response = await graphqlCall({
        source: adminRegisterMutation,
        variableValues: {
          input: adminInput,
        },
      });

      expect(response).toMatchObject({
        data: {
          adminRegister: {
            user: null,
            errors: [
              {
                field: 'general',
                message: 'An unexpected error occurred',
              },
            ],
          },
        },
      });
    });

    it('should register a new admin', async () => {
      const response = await graphqlCall({
        source: adminRegisterMutation,
        variableValues: {
          input: adminInput,
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
    });

    it('should not register a new admin if one is already registered', async () => {
      const response = await graphqlCall({
        source: adminRegisterMutation,
        variableValues: {
          input: adminInput,
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
});
