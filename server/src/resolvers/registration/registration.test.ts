import { faker } from '@faker-js/faker';
import { User, UserRole } from '../../entities/User';
import { dataSource } from '../../index';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';
import { errorStrings } from '../../utils/errorStrings';
import { AdminRegisterInput, PreRegisterInput } from './registration-types';

// Mock the email sending functionality
jest.mock('../../utils/sendEmail', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
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
  mutation AdminRegister($input: AdminRegisterInput!) {
    adminRegister(input: $input) {
      id
      email
      fullName
      role
      isActive
    }
  }
`;

const userRegisterMutation = `
  mutation UserRegister($input: PreRegisterInput!) {
    userRegister(input: $input) {
      id
      email
      fullName
      role
      isActive
    }
  }
`;

describe('RegistrationResolver', () => {
  describe('adminRegister', () => {
    it('should successfully register the first admin', async () => {
      const input: AdminRegisterInput = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 12 }),
        fullName: faker.person.fullName(),
      };

      const response = await graphqlCall({
        source: adminRegisterMutation,
        variableValues: { input },
      });

      expect(response).toMatchObject({
        data: {
          adminRegister: {
            id: expect.any(Number),
            email: input.email,
            fullName: input.fullName,
            role: UserRole.ADMIN,
            isActive: true,
          },
        },
      });

      // Verify user was actually created in database
      const adminRegisterId = (response.data as any)?.adminRegister?.id;
      const createdUser = await User.findOne({
        where: { id: adminRegisterId },
      });
      expect(createdUser).toBeTruthy();
      expect(createdUser?.role).toBe(UserRole.ADMIN);
      expect(createdUser?.isActive).toBe(true);

      // Add to cleanup list
      if (createdUser) testUsers.push(createdUser);
    });

    it('should prevent registering a second admin', async () => {
      // Create first admin
      const firstAdmin = await createFakeUser(UserRole.ADMIN);
      testUsers.push(firstAdmin);

      // Try to create second admin
      const input: AdminRegisterInput = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 12 }),
        fullName: faker.person.fullName(),
      };

      const response = await graphqlCall({
        source: adminRegisterMutation,
        variableValues: { input },
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

    it('should handle database errors gracefully', async () => {
      // Mock User.create to throw an error
      const originalCreate = User.create;
      User.create = jest.fn().mockImplementationOnce(() => {
        throw new Error('Database connection failed');
      });

      const input: AdminRegisterInput = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 12 }),
        fullName: faker.person.fullName(),
      };

      const response = await graphqlCall({
        source: adminRegisterMutation,
        variableValues: { input },
      });

      expect(response).toMatchObject({
        data: {
          adminRegister: null,
        },
        errors: [
          {
            message: 'Database connection failed',
          },
        ],
      });

      // Restore original implementation
      User.create = originalCreate;
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

    it('should successfully register a candidate user', async () => {
      const input: PreRegisterInput = {
        email: faker.internet.email(),
        fullName: faker.person.fullName(),
        role: UserRole.CANDIDATE,
      };

      const response = await graphqlCall({
        source: userRegisterMutation,
        variableValues: { input },
        userId: adminUser.id,
      });

      expect(response).toMatchObject({
        data: {
          userRegister: {
            id: expect.any(Number),
            email: input.email,
            fullName: input.fullName,
            role: UserRole.CANDIDATE,
            isActive: false,
          },
        },
      });

      // Verify user was created with inactive status
      const userRegisterId = (response.data as any)?.userRegister?.id;
      const createdUser = await User.findOne({
        where: { id: userRegisterId },
      });
      expect(createdUser).toBeTruthy();
      expect(createdUser?.isActive).toBe(false);

      if (createdUser) testUsers.push(createdUser);
    });

    it('should successfully register an interviewer user', async () => {
      const input: PreRegisterInput = {
        email: faker.internet.email(),
        fullName: faker.person.fullName(),
        role: UserRole.INTERVIEWER,
      };

      const response = await graphqlCall({
        source: userRegisterMutation,
        variableValues: { input },
        userId: adminUser.id,
      });

      expect(response).toMatchObject({
        data: {
          userRegister: {
            id: expect.any(Number),
            email: input.email,
            fullName: input.fullName,
            role: UserRole.INTERVIEWER,
            isActive: false,
          },
        },
      });

      const userRegisterId = (response.data as any)?.userRegister?.id;
      const createdUser = await User.findOne({
        where: { id: userRegisterId },
      });
      expect(createdUser).toBeTruthy();

      if (createdUser) testUsers.push(createdUser);
    });

    it('should send welcome email to new user', async () => {
      const { sendEmail } = require('../../utils/sendEmail');

      const input: PreRegisterInput = {
        email: faker.internet.email(),
        fullName: faker.person.fullName(),
        role: UserRole.CANDIDATE,
      };

      const response = await graphqlCall({
        source: userRegisterMutation,
        variableValues: { input },
        userId: adminUser.id,
      });

      expect(response.data?.userRegister).toBeTruthy();
      expect(sendEmail).toHaveBeenCalledWith(
        input.email,
        'Welcome to Simple Interview',
        expect.stringContaining(input.fullName),
      );

      const userRegisterId = (response.data as any)?.userRegister?.id;
      const createdUser = await User.findOne({
        where: { id: userRegisterId },
      });
      if (createdUser) testUsers.push(createdUser);
    });

    it('should handle database errors gracefully', async () => {
      // Mock User.create to throw an error
      const originalCreate = User.create;
      User.create = jest.fn().mockImplementationOnce(() => {
        throw new Error('Database constraint violation');
      });

      const input: PreRegisterInput = {
        email: faker.internet.email(),
        fullName: faker.person.fullName(),
        role: UserRole.CANDIDATE,
      };

      const response = await graphqlCall({
        source: userRegisterMutation,
        variableValues: { input },
        userId: adminUser.id,
      });

      expect(response).toMatchObject({
        data: {
          userRegister: null,
        },
        errors: [
          {
            message: 'Database constraint violation',
          },
        ],
      });

      // Restore original implementation
      User.create = originalCreate;
    });

    it('should require authentication to register users', async () => {
      const input: PreRegisterInput = {
        email: faker.internet.email(),
        fullName: faker.person.fullName(),
        role: UserRole.CANDIDATE,
      };

      const response = await graphqlCall({
        source: userRegisterMutation,
        variableValues: { input },
        // No userId provided - should fail authentication
      });

      expect(response).toMatchObject({
        data: {
          userRegister: null,
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
