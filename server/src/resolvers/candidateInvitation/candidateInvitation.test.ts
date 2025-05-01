import { faker } from '@faker-js/faker';
import { CandidateInvitation } from '../../entities/CandidateInvitation';
import { User, UserRole } from '../../entities/User';
import { dataSource } from '../../index';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';

jest.mock('../../utils/sendEmail', () => ({
  sendEmail: jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
  }),
}));

// Set up the database connection before all tests
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
  await CandidateInvitation.clear();
  if (testUsers.length > 0) {
    await Promise.all(testUsers.map((user) => User.delete(user.id)));
    testUsers = [];
  }
});

const createCandidateInvitationMutation = `
  mutation CreateCandidateInvitation($email: String!) {
    createCandidateInvitation(email: $email)
  }
`;

const getCandidateInvitationsQuery = `
  query GetCandidateInvitations {
    getCandidateInvitations {
      id
      email
      used
    }
  }
`;

describe('candidateInvitation', () => {
  it('should create a candidate invitation and send an email', async () => {
    const testInterviewer = await createFakeUser(UserRole.INTERVIEWER);
    const email = faker.internet.email();

    const response = await graphqlCall({
      source: createCandidateInvitationMutation,
      variableValues: { email },
      userId: testInterviewer.id,
    });

    expect(response).toMatchObject({
      data: {
        createCandidateInvitation: true,
      },
    });
  });

  it('should get all candidate invitations', async () => {
    const testInterviewer = await createFakeUser(UserRole.INTERVIEWER);
    testUsers.push(testInterviewer);

    const email = faker.internet.email();
    const candidateInvitation = await CandidateInvitation.create({
      email,
      used: false,
    }).save();

    const response = await graphqlCall({
      source: getCandidateInvitationsQuery,
      userId: testInterviewer.id,
    });

    expect(response).toMatchObject({
      data: {
        getCandidateInvitations: [
          {
            id: candidateInvitation.id,
            email: candidateInvitation.email,
            used: candidateInvitation.used,
          },
        ],
      },
    });
  });
});
