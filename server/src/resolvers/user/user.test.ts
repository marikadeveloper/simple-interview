import { dataSource } from '../..';
import { User, UserRole } from '../../entities/User';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';
import { errorStrings } from '../../utils/errorStrings';

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

const getUserQuery = `
  query GetUser($id: Int!) {
    getUser(id: $id) {
      id
      email
    }
  }
`;

const deleteUserMutation = `
  mutation DeleteUser($id: Int!) {
    deleteUser(id: $id)
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

  it('should get a user by id', async () => {
    const admin = await createFakeUser(UserRole.ADMIN);
    const user = await createFakeUser(UserRole.CANDIDATE);
    testUsers.push(admin, user);

    const response = await graphqlCall({
      source: getUserQuery,
      variableValues: {
        id: user.id,
      },
      userId: admin.id,
    });

    expect(response).toMatchObject({
      data: {
        getUser: {
          id: user.id,
          email: user.email,
        },
      },
    });
  });

  it('a candidate should not be able to get any user', async () => {
    const candidate = await createFakeUser(UserRole.CANDIDATE);
    const user = await createFakeUser(UserRole.CANDIDATE);
    testUsers.push(candidate, user);

    const response = await graphqlCall({
      source: getUserQuery,
      variableValues: {
        id: user.id,
      },
      userId: candidate.id,
    });

    expect(response).toMatchObject({
      data: {
        getUser: null,
      },
      errors: [{ message: errorStrings.user.notAuthorized }],
    });
  });

  it('should delete a user', async () => {
    const admin = await createFakeUser(UserRole.ADMIN);
    const user = await createFakeUser(UserRole.CANDIDATE);
    testUsers.push(admin);

    const response = await graphqlCall({
      source: deleteUserMutation,
      variableValues: {
        id: user.id,
      },
      userId: admin.id,
    });

    expect(response).toMatchObject({
      data: {
        deleteUser: true,
      },
    });

    // Check if the user is deleted
    const deletedUser = await User.findOneBy({ id: user.id });
    expect(deletedUser).toBeNull();
  });
});
