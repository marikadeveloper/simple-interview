import { faker } from '@faker-js/faker';
import { User, UserRole } from '../../entities/User';
import { dataSource } from '../../index';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser, fakeUserData } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';
import { errorStrings } from '../../utils/errorStrings';
import { PreRegisterInput } from './registration-types';

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
  mutation Register($input: AdminRegisterInput!) {
    adminRegister(input: $input) {
      id
    }
  }
`;

const userRegisterMutation = `
  mutation UserRegister($input: PreRegisterInput!) {
    userRegister(input: $input) {
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

  describe('userRegister', () => {
    let adminUser: User;

    beforeAll(async () => {
      adminUser = await createFakeUser(UserRole.ADMIN);
    });

    afterAll(async () => {
      await User.delete(adminUser.id);
    });

    it('given an invalid email should return an error', async () => {
      const input: PreRegisterInput = {
        email: 'invalid-email',
        role: UserRole.CANDIDATE,
        fullName: faker.person.fullName(),
      };

      const response = await graphqlCall({
        source: userRegisterMutation,
        variableValues: {
          input,
        },
        userId: adminUser.id,
      });

      expect(response).toMatchObject({
        data: {
          userRegister: null,
        },
        errors: [
          {
            message: errorStrings.user.invalidEmail,
          },
        ],
      });
    });

    it('given a short full name should return an error', async () => {
      const candidateInput = {
        fullName: 'a',
        role: UserRole.CANDIDATE,
        email: faker.internet.email(),
      };

      const response = await graphqlCall({
        source: userRegisterMutation,
        variableValues: {
          input: candidateInput,
        },
        userId: adminUser.id,
      });

      expect(response).toMatchObject({
        data: {
          userRegister: null,
        },
        errors: [
          {
            message: errorStrings.user.fullNameTooShort,
          },
        ],
      });
    });
  });
});
