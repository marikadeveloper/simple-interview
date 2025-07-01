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
  query GetUsers($filter: String) {
    getUsers(filter: $filter) {
      id
      email
      fullName
      role
    }
  }
`;

const getUserQuery = `
  query GetUser($id: Int!) {
    getUser(id: $id) {
      id
      email
      fullName
    }
  }
`;

const deleteUserMutation = `
  mutation DeleteUser($id: Int!) {
    deleteUser(id: $id)
  }
`;

const updateUserNameMutation = `
  mutation UpdateUserName($fullName: String!) {
    updateUserName(fullName: $fullName) {
      id
      fullName
      email
    }
  }
`;

describe('UserResolver - Additional Coverage Tests', () => {
  describe('getUsers', () => {
    it('should filter users by name and email', async () => {
      const admin = await createFakeUser(UserRole.ADMIN);
      const user1 = await createFakeUser(UserRole.CANDIDATE, {
        fullName: 'John Smith',
        email: 'john.smith@example.com',
      });
      const user2 = await createFakeUser(UserRole.CANDIDATE, {
        fullName: 'Jane Doe',
        email: 'jane.doe@example.com',
      });
      const user3 = await createFakeUser(UserRole.CANDIDATE, {
        fullName: 'Bob Wilson',
        email: 'bob.wilson@example.com',
      });

      testUsers.push(admin, user1, user2, user3);

      const response = await graphqlCall({
        source: getUsersQuery,
        variableValues: {
          filter: 'john',
        },
        userId: admin.id,
      });

      expect(response).toMatchObject({
        data: {
          getUsers: [
            {
              id: user1.id,
              email: user1.email,
              fullName: user1.fullName,
            },
          ],
        },
      });
    });

    it('should filter users by email case insensitive', async () => {
      const admin = await createFakeUser(UserRole.ADMIN);
      const user1 = await createFakeUser(UserRole.CANDIDATE, {
        fullName: 'John Smith',
        email: 'john.smith@example.com',
      });
      const user2 = await createFakeUser(UserRole.CANDIDATE, {
        fullName: 'Jane Doe',
        email: 'jane.doe@example.com',
      });

      testUsers.push(admin, user1, user2);

      const response = await graphqlCall({
        source: getUsersQuery,
        variableValues: {
          filter: 'JOHN.SMITH',
        },
        userId: admin.id,
      });

      expect(response).toMatchObject({
        data: {
          getUsers: [
            {
              id: user1.id,
              email: user1.email,
              fullName: user1.fullName,
            },
          ],
        },
      });
    });

    it('should handle empty filter string', async () => {
      const admin = await createFakeUser(UserRole.ADMIN);
      const user1 = await createFakeUser(UserRole.CANDIDATE);
      const user2 = await createFakeUser(UserRole.CANDIDATE);

      testUsers.push(admin, user1, user2);

      const response = await graphqlCall({
        source: getUsersQuery,
        variableValues: {
          filter: '   ',
        },
        userId: admin.id,
      });

      expect(response.data?.getUsers).toHaveLength(2);
      expect(response.data?.getUsers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: user1.id }),
          expect.objectContaining({ id: user2.id }),
        ]),
      );
    });

    it('should restrict interviewers to only see candidates', async () => {
      const interviewer = await createFakeUser(UserRole.INTERVIEWER);
      const candidate1 = await createFakeUser(UserRole.CANDIDATE);
      const candidate2 = await createFakeUser(UserRole.CANDIDATE);
      const admin = await createFakeUser(UserRole.ADMIN);

      testUsers.push(interviewer, candidate1, candidate2, admin);

      const response = await graphqlCall({
        source: getUsersQuery,
        variableValues: {
          filter: '',
        },
        userId: interviewer.id,
      });

      expect(response.data?.getUsers).toHaveLength(2);
      expect(response.data?.getUsers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: candidate1.id,
            role: UserRole.CANDIDATE,
          }),
          expect.objectContaining({
            id: candidate2.id,
            role: UserRole.CANDIDATE,
          }),
        ]),
      );

      // Should not include admin
      expect(response.data?.getUsers).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ id: admin.id })]),
      );
    });
  });

  describe('getUser', () => {
    it('should throw error when user not found', async () => {
      const admin = await createFakeUser(UserRole.ADMIN);
      testUsers.push(admin);

      const response = await graphqlCall({
        source: getUserQuery,
        variableValues: {
          id: 99999, // Non-existent user ID
        },
        userId: admin.id,
      });

      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].message).toBe(errorStrings.user.notFound);
    });
  });

  describe('deleteUser', () => {
    it('should return false when user not found', async () => {
      const admin = await createFakeUser(UserRole.ADMIN);
      testUsers.push(admin);

      const response = await graphqlCall({
        source: deleteUserMutation,
        variableValues: {
          id: 99999, // Non-existent user ID
        },
        userId: admin.id,
      });

      expect(response).toMatchObject({
        data: {
          deleteUser: false,
        },
      });
    });
  });

  describe('updateUserName', () => {
    it('should throw error when user not found', async () => {
      const response = await graphqlCall({
        source: updateUserNameMutation,
        variableValues: {
          fullName: 'New Name',
        },
        userId: 99999, // Non-existent user ID
      });

      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].message).toBe(errorStrings.user.notFound);
    });

    it('should successfully update user name', async () => {
      const user = await createFakeUser(UserRole.CANDIDATE, {
        fullName: 'Old Name',
      });
      testUsers.push(user);

      const newName = 'Updated Name';
      const response = await graphqlCall({
        source: updateUserNameMutation,
        variableValues: {
          fullName: newName,
        },
        userId: user.id,
      });

      expect(response).toMatchObject({
        data: {
          updateUserName: {
            id: user.id,
            fullName: newName,
            email: user.email,
          },
        },
      });

      // Verify the change was saved to database
      const updatedUser = await User.findOneBy({ id: user.id });
      expect(updatedUser?.fullName).toBe(newName);
    });
  });
});
