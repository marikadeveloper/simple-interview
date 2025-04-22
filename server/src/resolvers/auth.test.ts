import { User, UserRole } from '../entities/User';
import { graphqlCall } from '../test-utils/graphqlCall';
import { createFakeUser } from '../test-utils/mockData';
import { setupTestDB } from '../test-utils/testSetup';

jest.mock('../utils/sendEmail', () => ({
  sendEmail: jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
  }),
}));

// Set up the database connection before all tests
let testUsers: User[] = [];

beforeAll(async () => {
  await setupTestDB();
});

afterEach(async () => {
  // Clean up any users created during the test
  if (testUsers.length > 0) {
    await Promise.all(testUsers.map((user) => User.delete(user.id)));
    testUsers = [];
  }
});

const meQuery = `
  query Me {
    me {
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

const loginMutation = `
  mutation Login($input: AuthInput!) {
    login(input: $input) {
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

const logoutMutation = `
  mutation Logout {
    logout
  }
`;

describe('me', () => {
  it('should return the current user', async () => {
    // Create user and track for cleanup
    const user = await createFakeUser(UserRole.INTERVIEWER);
    testUsers.push(user);

    const response = await graphqlCall({
      source: meQuery,
      userId: user.id,
    });

    expect(response).toMatchObject({
      data: {
        me: {
          user: {
            id: expect.any(Number),
          },
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
        me: {
          user: null,
          errors: [
            {
              field: 'general',
              message: 'not authenticated',
            },
          ],
        },
      },
    });
  });

  it('should return an error if the user is not found', async () => {
    const response = await graphqlCall({
      source: meQuery,
      userId: 9999, // Non-existent user ID
    });

    expect(response).toMatchObject({
      data: {
        me: {
          user: null,
          errors: [
            {
              field: 'general',
              message: 'user not found',
            },
          ],
        },
      },
    });
  });
});

describe('login', () => {
  it('should log in a user', async () => {
    // Create user and track for cleanup
    const user = await createFakeUser(UserRole.INTERVIEWER, {
      password: 'password',
    });
    testUsers.push(user);

    const response = await graphqlCall({
      source: loginMutation,
      variableValues: {
        input: {
          email: user.email,
          password: 'password',
        },
      },
    });

    expect(response).toMatchObject({
      data: {
        login: {
          user: {
            id: expect.any(Number),
          },
        },
      },
    });
  });

  it('should return an error if the email does not exist', async () => {
    const response = await graphqlCall({
      source: loginMutation,
      variableValues: {
        input: {
          email: 'aaaaaa@aa.a',
          password: 'password',
        },
      },
    });
    expect(response).toMatchObject({
      data: {
        login: {
          errors: [
            {
              field: 'email',
              message: 'email does not exist',
            },
          ],
        },
      },
    });
  });

  it('should return an error if the password is incorrect', async () => {
    // Create user and track for cleanup
    const user = await createFakeUser(UserRole.INTERVIEWER);
    testUsers.push(user);

    const response = await graphqlCall({
      source: loginMutation,
      variableValues: {
        input: {
          email: user.email,
          password: 'wrongpassword',
        },
      },
    });

    expect(response).toMatchObject({
      data: {
        login: {
          user: null,
          errors: [
            {
              field: 'password',
              message: 'incorrect password',
            },
          ],
        },
      },
    });
  });
});

describe('logout', () => {
  it('should log out a user', async () => {
    // Create user and track for cleanup
    const user = await createFakeUser(UserRole.INTERVIEWER);
    testUsers.push(user);

    const response = await graphqlCall({
      source: logoutMutation,
      userId: user.id,
    });

    expect(response).toMatchObject({
      data: {
        logout: true,
      },
    });
  });

  it('should return an error if no user is logged in', async () => {
    const response = await graphqlCall({
      source: logoutMutation,
    });

    expect(response).toMatchObject({
      data: {
        logout: false,
      },
    });
  });
});
