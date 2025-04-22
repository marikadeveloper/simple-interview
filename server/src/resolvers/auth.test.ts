import { UserRole } from '../entities/User';
import { graphqlCall } from '../test-utils/graphqlCall';
import { createFakeUser } from '../test-utils/mockData';
import { setupTestDB } from '../test-utils/testSetup';

jest.mock('../utils/sendEmail', () => ({
  sendEmail: jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
  }),
}));
// Set up the database connection before all tests
beforeAll(async () => {
  await setupTestDB();
});

const meQuery = `
  query Me {
    me {
      id
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

describe('me', () => {
  it('should return the current user', async () => {
    const user = await createFakeUser(UserRole.INTERVIEWER);

    const response = await graphqlCall({
      source: meQuery,
      userId: user.id,
    });

    expect(response).toMatchObject({
      data: {
        me: {
          id: expect.any(Number),
        },
      },
    });

    // clean up
    await user.remove();
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

describe('login', () => {
  it('should log in a user', async () => {
    const user = await createFakeUser(UserRole.INTERVIEWER, {
      password: 'password',
    });

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

    // clean up
    await user.remove();
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
    const user = await createFakeUser(UserRole.INTERVIEWER);

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

    // clean up
    await user.remove();
  });
});
