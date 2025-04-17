import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../entities/User';
import { graphqlCall } from '../test-utils/graphqlCall';
import { testConn } from '../test-utils/testConn';
import { RegisterInput } from './user';

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

describe('UserResolver', () => {
  describe.skip('me', () => {
    it('should return the current user', async () => {
      const user = await User.create({
        fullName: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: UserRole.INTERVIEWER,
      }).save();

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
      const user = await User.create({
        fullName: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: UserRole.INTERVIEWER,
      }).save();

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
  });

  describe.skip('adminRegister', () => {
    it('should register a new admin', async () => {
      const input: RegisterInput = {
        email: faker.internet.email(),
        fullName: faker.person.fullName(),
        password: faker.internet.password(),
      };
      const response = await graphqlCall({
        source: adminRegisterMutation,
        variableValues: {
          input,
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
      const input: RegisterInput = {
        email: faker.internet.email(),
        fullName: faker.person.fullName(),
        password: faker.internet.password(),
      };

      const response = await graphqlCall({
        source: adminRegisterMutation,
        variableValues: {
          input,
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
