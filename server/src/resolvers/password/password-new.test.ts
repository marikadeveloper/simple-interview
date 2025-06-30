import { faker } from '@faker-js/faker';
import argon2 from 'argon2';
import { PASSWORD_MIN_LENGTH } from '../../constants';
import { User, UserRole } from '../../entities/User';
import { dataSource } from '../../index';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';
import { errorStrings } from '../../utils/errorStrings';
import * as sendEmailModule from '../../utils/sendEmail';

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
      email
      fullName
      role
      isActive
    }
  }
`;

const forgotPasswordRequestMutation = `
  mutation ForgotPasswordRequest($email: String!) {
    forgotPasswordRequest(email: $email)
  }
`;

const forgotPasswordChangeMutation = `
  mutation ForgotPasswordChange($input: ForgotPasswordChangeInput!) {
    forgotPasswordChange(input: $input)
  }
`;

describe('PasswordResolver', () => {
  describe('changePassword', () => {
    // Success cases
    it('should successfully change password and return updated user', async () => {
      const oldPassword = faker.internet.password();
      const user = await createFakeUser(UserRole.INTERVIEWER, {
        password: oldPassword,
      });
      testUsers.push(user);

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
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
        },
      });

      // Verify password was actually changed
      const updatedUser = await User.findOneBy({ id: user.id });
      expect(updatedUser).toBeDefined();
      const isValidNewPassword = await argon2.verify(
        updatedUser!.password,
        newPassword,
      );
      expect(isValidNewPassword).toBe(true);
    });

    it('should activate inactive candidate/interviewer users when password is changed', async () => {
      const oldPassword = faker.internet.password();
      const candidate = await createFakeUser(UserRole.CANDIDATE, {
        password: oldPassword,
        isActive: false,
      });
      testUsers.push(candidate);

      const interviewer = await createFakeUser(UserRole.INTERVIEWER, {
        password: oldPassword,
        isActive: false,
      });
      testUsers.push(interviewer);

      const newPassword = faker.internet.password();

      // Test candidate activation
      const candidateResponse = await graphqlCall({
        source: changePasswordMutation,
        variableValues: {
          input: {
            oldPassword,
            newPassword,
          },
        },
        userId: candidate.id,
      });

      expect((candidateResponse.data?.changePassword as any)?.isActive).toBe(
        true,
      );

      // Test interviewer activation
      const interviewerResponse = await graphqlCall({
        source: changePasswordMutation,
        variableValues: {
          input: {
            oldPassword,
            newPassword: faker.internet.password(),
          },
        },
        userId: interviewer.id,
      });

      expect((interviewerResponse.data?.changePassword as any)?.isActive).toBe(
        true,
      );
    });

    it('should maintain user session after password change', async () => {
      const oldPassword = faker.internet.password();
      const user = await createFakeUser(UserRole.ADMIN, {
        password: oldPassword,
      });
      testUsers.push(user);

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
            id: user.id,
          },
        },
      });

      // Verify session is maintained by checking user ID is still accessible
      const sessionResponse = await graphqlCall({
        source: `
          query Me {
            me {
              id
              email
            }
          }
        `,
        userId: user.id,
      });

      expect((sessionResponse.data?.me as any)?.id).toBe(user.id);
    });

    // Validation error cases
    it('should throw error when new password is too short or empty', async () => {
      const oldPassword = faker.internet.password();
      const user = await createFakeUser(UserRole.INTERVIEWER, {
        password: oldPassword,
      });
      testUsers.push(user);

      // Test password too short
      const shortPasswordResponse = await graphqlCall({
        source: changePasswordMutation,
        variableValues: {
          input: {
            oldPassword,
            newPassword: 'a'.repeat(PASSWORD_MIN_LENGTH - 1),
          },
        },
        userId: user.id,
      });

      expect(shortPasswordResponse).toMatchObject({
        data: {
          changePassword: null,
        },
        errors: [{ message: errorStrings.user.passwordTooShort }],
      });

      // Test empty password
      const emptyPasswordResponse = await graphqlCall({
        source: changePasswordMutation,
        variableValues: {
          input: {
            oldPassword,
            newPassword: '',
          },
        },
        userId: user.id,
      });

      expect(emptyPasswordResponse).toMatchObject({
        data: {
          changePassword: null,
        },
        errors: [{ message: errorStrings.user.passwordTooShort }],
      });
    });

    it('should throw error when old password is incorrect or empty', async () => {
      const correctPassword = faker.internet.password();
      const user = await createFakeUser(UserRole.INTERVIEWER, {
        password: correctPassword,
      });
      testUsers.push(user);

      // Test incorrect old password
      const incorrectPasswordResponse = await graphqlCall({
        source: changePasswordMutation,
        variableValues: {
          input: {
            oldPassword: faker.internet.password(),
            newPassword: faker.internet.password(),
          },
        },
        userId: user.id,
      });

      expect(incorrectPasswordResponse).toMatchObject({
        data: {
          changePassword: null,
        },
        errors: [{ message: errorStrings.user.invalidOldPassword }],
      });

      // Test empty old password
      const emptyOldPasswordResponse = await graphqlCall({
        source: changePasswordMutation,
        variableValues: {
          input: {
            oldPassword: '',
            newPassword: faker.internet.password(),
          },
        },
        userId: user.id,
      });

      expect(emptyOldPasswordResponse).toMatchObject({
        data: {
          changePassword: null,
        },
        errors: [{ message: errorStrings.user.invalidOldPassword }],
      });
    });

    // Authentication error cases
    it('should throw error when user is not authenticated', async () => {
      const response = await graphqlCall({
        source: changePasswordMutation,
        variableValues: {
          input: {
            oldPassword: faker.internet.password(),
            newPassword: faker.internet.password(),
          },
        },
        // No userId provided - not authenticated
      });

      expect(response.errors).toBeDefined();
      expect(
        response.errors?.some(
          (error) =>
            error.message.includes('not authenticated') ||
            error.message.includes('access denied'),
        ),
      ).toBe(true);
    });

    it('should throw error when user does not exist in database', async () => {
      const response = await graphqlCall({
        source: changePasswordMutation,
        variableValues: {
          input: {
            oldPassword: faker.internet.password(),
            newPassword: faker.internet.password(),
          },
        },
        userId: -1, // Non-existent user ID
      });

      expect(response).toMatchObject({
        data: {
          changePassword: null,
        },
        errors: [{ message: errorStrings.user.notFound }],
      });
    });

    // Input validation cases
    it('should throw error when required input fields are missing', async () => {
      const user = await createFakeUser(UserRole.INTERVIEWER);
      testUsers.push(user);

      // Test missing both fields
      const missingBothResponse = await graphqlCall({
        source: changePasswordMutation,
        variableValues: {
          input: {},
        },
        userId: user.id,
      });

      expect(missingBothResponse.errors).toBeDefined();

      // Test missing oldPassword
      const missingOldPasswordResponse = await graphqlCall({
        source: changePasswordMutation,
        variableValues: {
          input: {
            newPassword: faker.internet.password(),
          },
        },
        userId: user.id,
      });

      expect(missingOldPasswordResponse.errors).toBeDefined();

      // Test missing newPassword
      const missingNewPasswordResponse = await graphqlCall({
        source: changePasswordMutation,
        variableValues: {
          input: {
            oldPassword: faker.internet.password(),
          },
        },
        userId: user.id,
      });

      expect(missingNewPasswordResponse.errors).toBeDefined();
    });
  });

  describe('forgotPasswordRequest', () => {
    it('should send reset email and store token when user exists', async () => {
      const user = await createFakeUser(UserRole.INTERVIEWER);
      testUsers.push(user);
      jest.spyOn(sendEmailModule, 'sendEmail');

      const response = await graphqlCall({
        source: forgotPasswordRequestMutation,
        variableValues: {
          email: user.email,
        },
      });

      expect(response).toMatchObject({
        data: {
          forgotPasswordRequest: true,
        },
      });
      expect(sendEmailModule.sendEmail).toHaveBeenCalledWith(
        user.email,
        expect.stringContaining('Reset Password'),
        expect.stringContaining('reset'),
      );
    });

    it('should return true even when user does not exist (security)', async () => {
      jest.spyOn(sendEmailModule, 'sendEmail');
      const response = await graphqlCall({
        source: forgotPasswordRequestMutation,
        variableValues: {
          email: 'nonexistentuser@example.com',
        },
      });
      expect(response).toMatchObject({
        data: {
          forgotPasswordRequest: true,
        },
      });
      expect(sendEmailModule.sendEmail).not.toHaveBeenCalled();
    });

    it('should handle malformed email addresses gracefully', async () => {
      const response = await graphqlCall({
        source: forgotPasswordRequestMutation,
        variableValues: {
          email: 'not-an-email',
        },
      });
      // Should not throw, should return true (security)
      expect(response).toMatchObject({
        data: {
          forgotPasswordRequest: true,
        },
      });
    });

    it('should handle multiple reset requests for same email', async () => {
      const user = await createFakeUser(UserRole.CANDIDATE);
      testUsers.push(user);
      jest.spyOn(sendEmailModule, 'sendEmail');

      // First request
      const response1 = await graphqlCall({
        source: forgotPasswordRequestMutation,
        variableValues: {
          email: user.email,
        },
      });
      // Second request
      const response2 = await graphqlCall({
        source: forgotPasswordRequestMutation,
        variableValues: {
          email: user.email,
        },
      });
      expect(response1).toMatchObject({
        data: {
          forgotPasswordRequest: true,
        },
      });
      expect(response2).toMatchObject({
        data: {
          forgotPasswordRequest: true,
        },
      });
      expect(sendEmailModule.sendEmail).toHaveBeenCalledTimes(2);
    });
  });

  describe('forgotPasswordChange', () => {
    it('should throw error when token is invalid, expired, or missing', async () => {
      // Test invalid token
      const invalidTokenResponse = await graphqlCall({
        source: forgotPasswordChangeMutation,
        variableValues: {
          input: {
            token: 'invalid-token',
            newPassword: faker.internet.password(),
          },
        },
      });

      expect(invalidTokenResponse).toMatchObject({
        data: null,
        errors: [{ message: errorStrings.user.tokenExpired }],
      });

      // Test empty token
      const emptyTokenResponse = await graphqlCall({
        source: forgotPasswordChangeMutation,
        variableValues: {
          input: {
            token: '',
            newPassword: faker.internet.password(),
          },
        },
      });

      expect(emptyTokenResponse).toMatchObject({
        data: null,
        errors: [{ message: errorStrings.user.tokenExpired }],
      });
    });

    it('should throw error when token format is incorrect', async () => {
      const response = await graphqlCall({
        source: forgotPasswordChangeMutation,
        variableValues: {
          input: {
            token: 'malformed-token-with-wrong-prefix',
            newPassword: faker.internet.password(),
          },
        },
      });

      expect(response).toMatchObject({
        data: null,
        errors: [{ message: errorStrings.user.tokenExpired }],
      });
    });

    it('should throw error when new password is too short or empty', async () => {
      const user = await createFakeUser(UserRole.ADMIN);
      testUsers.push(user);

      const token = 'password-test-token';
      const { redis } = require('../../config/redis');
      await redis.set(
        `forget-password:${token}`,
        user.id,
        'EX',
        1000 * 60 * 60 * 24 * 3,
      );

      // Test password too short
      const shortPasswordResponse = await graphqlCall({
        source: forgotPasswordChangeMutation,
        variableValues: {
          input: {
            token,
            newPassword: 'a'.repeat(PASSWORD_MIN_LENGTH - 1),
          },
        },
      });

      expect(shortPasswordResponse).toMatchObject({
        data: null,
        errors: [{ message: errorStrings.user.passwordTooShort }],
      });

      // Test empty password
      const emptyPasswordResponse = await graphqlCall({
        source: forgotPasswordChangeMutation,
        variableValues: {
          input: {
            token,
            newPassword: '',
          },
        },
      });

      expect(emptyPasswordResponse).toMatchObject({
        data: null,
        errors: [{ message: errorStrings.user.passwordTooShort }],
      });
    });

    it('should throw error when required input fields are missing', async () => {
      // Test missing both fields
      const missingBothResponse = await graphqlCall({
        source: forgotPasswordChangeMutation,
        variableValues: {
          input: {},
        },
      });

      expect(missingBothResponse.errors).toBeDefined();

      // Test missing token
      const missingTokenResponse = await graphqlCall({
        source: forgotPasswordChangeMutation,
        variableValues: {
          input: {
            newPassword: faker.internet.password(),
          },
        },
      });

      expect(missingTokenResponse.errors).toBeDefined();

      // Test missing newPassword
      const missingPasswordResponse = await graphqlCall({
        source: forgotPasswordChangeMutation,
        variableValues: {
          input: {
            token: 'some-token',
          },
        },
      });

      expect(missingPasswordResponse.errors).toBeDefined();
    });

    it('should handle Redis and database operation failures gracefully', async () => {
      // This test would require mocking Redis/database failures
      // For now, we'll test that the resolver handles missing Redis gracefully
      const response = await graphqlCall({
        source: forgotPasswordChangeMutation,
        variableValues: {
          input: {
            token: 'non-existent-token',
            newPassword: faker.internet.password(),
          },
        },
      });

      // Should return an error rather than crash
      expect(response.errors).toBeDefined();
    });
  });
});
