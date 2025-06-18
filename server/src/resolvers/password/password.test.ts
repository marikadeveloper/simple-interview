import { faker } from '@faker-js/faker';
import { PASSWORD_MIN_LENGTH } from '../../constants';
import { User, UserRole } from '../../entities/User';
import { dataSource } from '../../index';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';
import { errorStrings } from '../../utils/errorStrings';
import { sendEmail } from '../../utils/sendEmail';

jest.mock('../../utils/sendEmail', () => ({
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
      id
    }
  }
`;

const forgotPasswordRequestMutation = `
  mutation ForgotPasswordRequest($email: String!) {
    forgotPasswordRequest(email: $email)
  }
`;

// const forgotPasswordChangeMutation = `
//   mutation ForgotPasswordChange($input: ForgotPasswordChangeInput!) {
//     forgotPasswordChange(input: $input)
//   }
// `;

describe('changePassword', () => {
  it('given correct input should change the password', async () => {
    const oldPassword = faker.internet.password();
    const user = await createFakeUser(UserRole.INTERVIEWER, {
      password: oldPassword,
    });
    testUsers.push(user); // Track for cleanup

    const newPassword = faker.internet.password();
    const response = await graphqlCall({
      source: changePasswordMutation,
      variableValues: {
        input: {
          oldPassword,
          newPassword,
        },
      },
      userId: user.id,
    });

    expect(response).toMatchObject({
      data: {
        changePassword: {
          id: expect.any(Number),
        },
      },
    });
  });

  it('given short password should return error', async () => {
    const oldPassword = faker.internet.password();
    const user = await createFakeUser(UserRole.INTERVIEWER, {
      password: oldPassword,
    });
    testUsers.push(user); // Track for cleanup

    const response = await graphqlCall({
      source: changePasswordMutation,
      variableValues: {
        input: {
          oldPassword,
          newPassword: 'a'.repeat(PASSWORD_MIN_LENGTH - 1),
        },
      },
      userId: user.id,
    });

    expect(response).toMatchObject({
      data: {
        changePassword: null,
      },
      errors: [{ message: errorStrings.user.passwordTooShort }],
    });
  });

  it('given non-existent user should return error', async () => {
    const response = await graphqlCall({
      source: changePasswordMutation,
      variableValues: {
        input: {
          newPassword: faker.internet.password(),
          oldPassword: faker.internet.password(),
        },
      },
      userId: -1, // Simulate a non-existent user
    });
    expect(response).toMatchObject({
      data: {
        changePassword: null,
      },
      errors: [{ message: errorStrings.user.notFound }],
    });
  });
});

describe('forgotPassword', () => {
  it('given a valid user should send a reset password email', async () => {
    const user = await createFakeUser(UserRole.INTERVIEWER);
    testUsers.push(user); // Track for cleanup

    const response = await graphqlCall({
      source: forgotPasswordRequestMutation,
      variableValues: {
        email: user.email,
      },
    });

    expect(sendEmail).toHaveBeenCalled();
    expect(response).toMatchObject({
      data: {
        forgotPasswordRequest: true,
      },
    });
  });

  it('should ignore if user does not exist', async () => {
    const response = await graphqlCall({
      source: forgotPasswordRequestMutation,
      variableValues: {
        email: 'nonexisting@email.it',
      },
    });

    expect(sendEmail).not.toHaveBeenCalled();
    expect(response).toMatchObject({
      data: {
        forgotPasswordRequest: true,
      },
    });
  });
});
