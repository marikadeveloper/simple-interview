import { faker } from '@faker-js/faker';
import { PASSWORD_MIN_LENGTH } from '../../constants';
import { User, UserRole } from '../../entities/User';
import { dataSource } from '../../index';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';
import { sendEmail } from '../../utils/sendEmail';

jest.mock('../utils/sendEmail', () => ({
  sendEmail: jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
  }),
}));

// Track users created during tests for reliable cleanup
let testUsers: User[] = [];

// Set up the database connection before all tests
beforeAll(async () => {
  await setupTestDB();
});

// Clean up after each test to prevent test pollution
afterEach(async () => {
  if (testUsers.length > 0) {
    await Promise.all(testUsers.map((user) => User.delete(user.id)));
    testUsers = [];
  }
  jest.clearAllMocks();
});

// Close database connections after all tests
afterAll(async () => {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
  }
});

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

describe('changePassword', () => {
  it('given correct input should change the password', async () => {
    const user = await createFakeUser(UserRole.INTERVIEWER);
    testUsers.push(user); // Track for cleanup

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
            id: expect.any(Number),
          },
        },
      },
    });
  });

  it('given short password should return error', async () => {
    const user = await createFakeUser(UserRole.INTERVIEWER);
    testUsers.push(user); // Track for cleanup

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
  it('given a valid user should send a reset password email', async () => {
    const user = await createFakeUser(UserRole.INTERVIEWER);
    testUsers.push(user); // Track for cleanup

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
