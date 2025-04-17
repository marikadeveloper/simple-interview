import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
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

/**
 * Problems:
 * - test is run twice
 */

describe('UserResolver', () => {
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
});
