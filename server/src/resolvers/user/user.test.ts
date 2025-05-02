import { dataSource } from '../..';
import { User, UserRole } from '../../entities/User';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';

let testUsers: User[] = [];

beforeAll(async () => {
  await setupTestDB();
});

// Close database connections after all tests
afterAll(async () => {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
  }
});

afterEach(async () => {
  // Clean up any data created during the test
  if (testUsers.length > 0) {
    await Promise.all(testUsers.map((user) => User.delete(user.id)));
    testUsers = [];
  }
});

const getUsersQuery = `
  query GetUsers($filters: UsersFilters!) {
    getUsers(filters: $filters) {
      id
      email
    }
  }
`;

describe('users', () => {
  it('should return all users', async () => {
    const admin = await createFakeUser(UserRole.ADMIN);

    const user1 = await createFakeUser(UserRole.CANDIDATE);
    const user2 = await createFakeUser(UserRole.CANDIDATE);

    testUsers.push(admin, user1, user2);

    const response = await graphqlCall({
      source: getUsersQuery,
      variableValues: {
        filters: {},
      },
      userId: admin.id,
    });

    expect(response).toMatchObject({
      data: {
        getUsers: [
          {
            id: user1.id,
            email: user1.email,
          },
          {
            id: user2.id,
            email: user2.email,
          },
        ],
      },
    });
  });
});
