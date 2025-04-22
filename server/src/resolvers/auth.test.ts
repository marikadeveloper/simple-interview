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
