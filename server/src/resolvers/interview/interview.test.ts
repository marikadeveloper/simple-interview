import { dataSource } from '../../';
import { Interview } from '../../entities/Interview';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { User, UserRole } from '../../entities/User';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';

// Track entities created during tests for reliable cleanup
let testUsers: User[] = [];
let testInterviewTemplate: InterviewTemplate;
let testInterviews: Interview[] = [];

// Set up the database connection before all tests
beforeAll(async () => {
  await setupTestDB();
});

// Close database connections after all tests
afterAll(async () => {
  // Clean up test users
  if (testUsers.length > 0) {
    await Promise.all(testUsers.map((user) => User.delete(user.id)));
    testUsers = [];
  }
  // Clean up test template
  await testInterviewTemplate?.remove();

  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
  }
});

const createInterviewTemplate = () => {
  return InterviewTemplate.create({
    name: 'Test Interview Template',
    description: 'This is a test interview template',
  }).save();
};

const createInterviewMutation = `
  mutation CreateInterview($input: InterviewInput!) {
    createInterview(input: $input) {
      interview {
        id
        interviewTemplate {
          id
        }
        user {
          id
        }
      }
      errors {
        field
        message
      }
    }
  }
`;

const getInterviewsQuery = `
  query GetInterviews {
    getInterviews {
      interviews {
        id
        interviewTemplate {
          id
        }
        user {
          id
        }
      }
      errors {
        field
        message
      }
    }
  }
`;

describe('Interview Resolver', () => {
  let adminUser: User;
  let interviewerUser: User;
  let candidateUser: User;
  let candidateUser2: User;
  let interviewTemplateId: number;

  beforeAll(async () => {
    // Create test users
    adminUser = await createFakeUser(UserRole.ADMIN);
    interviewerUser = await createFakeUser(UserRole.INTERVIEWER);
    candidateUser = await createFakeUser(UserRole.CANDIDATE);
    candidateUser2 = await createFakeUser(UserRole.CANDIDATE);
    testUsers.push(adminUser, interviewerUser, candidateUser, candidateUser2);

    // Create a test interview template
    testInterviewTemplate = await createInterviewTemplate();
    interviewTemplateId = testInterviewTemplate.id;
  });

  afterEach(async () => {
    // Clean up test interviews
    if (testInterviews.length > 0) {
      await Promise.all(testInterviews.map((interview) => interview.remove()));
      testInterviews = [];
    }
  });

  it('should create an interview successfully', async () => {
    const response = await graphqlCall({
      source: createInterviewMutation,
      variableValues: {
        input: {
          interviewTemplateId,
          candidateId: candidateUser.id,
        },
      },
      userId: adminUser.id,
    });

    expect(response).toMatchObject({
      data: {
        createInterview: {
          interview: {
            id: expect.any(Number),
            interviewTemplate: {
              id: interviewTemplateId,
            },
            user: {
              id: candidateUser.id,
            },
          },
          errors: null,
        },
      },
    });

    // @ts-ignore
    if (response?.data?.createInterview?.interview) {
      const interviewId = // @ts-ignore
        response.data.createInterview.interview.id as unknown as number;
      const interview = await Interview.findOneBy({ id: interviewId });
      testInterviews.push(interview as Interview);
    }
  });

  it('admins and interviewers should be able to see all interviews', async () => {
    const interviewCandidate1 = await Interview.create({
      interviewTemplate: { id: interviewTemplateId },
      user: { id: candidateUser.id },
    }).save();
    const interviewCandidate2 = await Interview.create({
      interviewTemplate: { id: interviewTemplateId },
      user: { id: candidateUser2.id },
    }).save();
    testInterviews.push(interviewCandidate1, interviewCandidate2);

    const response = await graphqlCall({
      source: getInterviewsQuery,
      userId: adminUser.id,
    });

    expect(response).toMatchObject({
      data: {
        getInterviews: {
          interviews: [
            {
              id: interviewCandidate1.id,
              interviewTemplate: {
                id: interviewTemplateId,
              },
              user: {
                id: candidateUser.id,
              },
            },
            {
              id: interviewCandidate2.id,
              interviewTemplate: {
                id: interviewTemplateId,
              },
              user: {
                id: candidateUser2.id,
              },
            },
          ],
          errors: null,
        },
      },
    });
  });

  it('candidates should only see their own interviews', async () => {
    const interviewCandidate1 = await Interview.create({
      interviewTemplate: { id: interviewTemplateId },
      user: { id: candidateUser.id },
    }).save();
    const interviewCandidate2 = await Interview.create({
      interviewTemplate: { id: interviewTemplateId },
      user: { id: candidateUser2.id },
    }).save();
    testInterviews.push(interviewCandidate1, interviewCandidate2);

    const response = await graphqlCall({
      source: getInterviewsQuery,
      userId: candidateUser.id,
    });

    expect(response).toMatchObject({
      data: {
        getInterviews: {
          interviews: [
            {
              id: interviewCandidate1.id,
              interviewTemplate: {
                id: interviewTemplateId,
              },
              user: {
                id: candidateUser.id,
              },
            },
          ],
          errors: null,
        },
      },
    });
  });
});
