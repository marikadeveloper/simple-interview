import { CandidateInvitation } from '../entities/CandidateInvitation';
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
beforeAll(async () => {
  await setupTestDB();
});

afterEach(async () => {
  // Clear tables after each test
  await CandidateInvitation.clear();
  await User.clear();
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
