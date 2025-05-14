import { dataSource } from '../../';
import { Interview, InterviewStatus } from '../../entities/Interview';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { Question } from '../../entities/Question';
import { User, UserRole } from '../../entities/User';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';
import { InterviewInput } from './interview-types';

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
const createMockQuestions = async (interviewTemplateId: number) => {
  const questions = [
    { title: 'Question 1', description: 'Description 1', sortOrder: 0 },
    { title: 'Question 2', description: 'Description 2', sortOrder: 1 },
    { title: 'Question 3', description: 'Description 3', sortOrder: 2 },
  ];

  await Promise.all(
    questions.map((question) =>
      Question.create({
        title: question.title,
        description: question.description,
        sortOrder: question.sortOrder,
        interviewTemplate: { id: interviewTemplateId },
      }).save(),
    ),
  );
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
        deadline
        status
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
        deadline
        status
      }
      errors {
        field
        message
      }
    }
  }
`;

const getInterviewQuery = `
  query GetInterview($id: Int!) {
    getInterview(id: $id) {
      interview {
        id
        interviewTemplate {
          id
        }
        user {
          id
        }
        deadline
        status
      }
      errors {
        field
        message
      }
    }
  }
`;

const getCandidateInterviewQuery = `
  query GetCandidateInterview($id: Int!) {
    getCandidateInterview(id: $id) {
      interview {
        id
        interviewTemplate {
          id
          questions {
            id
          }
        }
        user {
          id
        }
        answers {
          id
          text
        }
        deadline
        status
      }
      errors {
        field
        message
      }
    }
  }
`;

const createInterview = async (
  interviewTemplateId: number,
  candidateId: number,
  deadline?: string,
) => {
  if (!deadline) {
    // Default to 1 day from now
    deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  }

  const interview = await Interview.create({
    interviewTemplate: { id: interviewTemplateId },
    user: { id: candidateId },
    deadline,
  }).save();
  return interview;
};

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
    await createMockQuestions(interviewTemplateId);
  });

  afterEach(async () => {
    // Clean up test interviews
    if (testInterviews.length > 0) {
      await Promise.all(testInterviews.map((interview) => interview.remove()));
      testInterviews = [];
    }
  });

  it('should create an interview successfully', async () => {
    const input: InterviewInput = {
      interviewTemplateId,
      candidateId: candidateUser.id,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    };
    const response = await graphqlCall({
      source: createInterviewMutation,
      variableValues: {
        input,
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
            deadline: input.deadline,
            status: InterviewStatus.PENDING,
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

  it('should not create an interview with an invalid date string', async () => {
    const input: InterviewInput = {
      interviewTemplateId,
      candidateId: candidateUser.id,
      deadline: 'invalid-date-string',
    };
    const response = await graphqlCall({
      source: createInterviewMutation,
      variableValues: {
        input,
      },
      userId: adminUser.id,
    });

    expect(response).toMatchObject({
      data: {
        createInterview: {
          interview: null,
          errors: [
            {
              field: 'deadline',
              message: 'Invalid date format',
            },
          ],
        },
      },
    });
  });

  it('should not create an interview with a past date', async () => {
    const input: InterviewInput = {
      interviewTemplateId,
      candidateId: candidateUser.id,
      deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day in the past
    };
    const response = await graphqlCall({
      source: createInterviewMutation,
      variableValues: {
        input,
      },
      userId: adminUser.id,
    });

    expect(response).toMatchObject({
      data: {
        createInterview: {
          interview: null,
          errors: [
            {
              field: 'deadline',
              message: 'Date must be in the future',
            },
          ],
        },
      },
    });
  });

  it('admins and interviewers should be able to see all interviews', async () => {
    const interviewCandidate1 = await createInterview(
      interviewTemplateId,
      candidateUser.id,
    );
    const interviewCandidate2 = await createInterview(
      interviewTemplateId,
      candidateUser2.id,
    );
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
    const interviewCandidate1 = await createInterview(
      interviewTemplateId,
      candidateUser.id,
    );
    const interviewCandidate2 = await createInterview(
      interviewTemplateId,
      candidateUser2.id,
    );
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

  it('admins and interviewers should be able to get a single interview', async () => {
    const interviewCandidate = await createInterview(
      interviewTemplateId,
      candidateUser.id,
    );
    testInterviews.push(interviewCandidate);

    const response = await graphqlCall({
      source: getInterviewQuery,
      variableValues: {
        id: interviewCandidate.id,
      },
      userId: adminUser.id,
    });

    expect(response).toMatchObject({
      data: {
        getInterview: {
          interview: {
            id: interviewCandidate.id,
            interviewTemplate: {
              id: interviewTemplateId,
            },
            user: {
              id: candidateUser.id,
            },
            deadline: interviewCandidate.deadline.toString().split('T')[0],
            status: InterviewStatus.PENDING,
          },
          errors: null,
        },
      },
    });
  });

  it('should automatically set the status to "expired" if the deadline is in the past', async () => {
    const pastDeadline = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString(); // 1 day in the past
    const interviewCandidate = await createInterview(
      interviewTemplateId,
      candidateUser.id,
      pastDeadline,
    );
    testInterviews.push(interviewCandidate);

    const response = await graphqlCall({
      source: getInterviewQuery,
      variableValues: {
        id: interviewCandidate.id,
      },
      userId: adminUser.id,
    });
    expect(response).toMatchObject({
      data: {
        getInterview: {
          interview: {
            id: interviewCandidate.id,
            interviewTemplate: {
              id: interviewTemplateId,
            },
            user: {
              id: candidateUser.id,
            },
            deadline: pastDeadline.toString().split('T')[0],
            status: InterviewStatus.EXPIRED,
          },
          errors: null,
        },
      },
    });
  });

  it('candidates should be able to get their own interview', async () => {
    let interviewCandidate = await createInterview(
      interviewTemplateId,
      candidateUser.id,
    );
    testInterviews.push(interviewCandidate);

    const response = await graphqlCall({
      source: getCandidateInterviewQuery,
      variableValues: {
        id: interviewCandidate.id,
      },
      userId: candidateUser.id,
    });

    expect(response).toMatchObject({
      data: {
        getCandidateInterview: {
          interview: {
            id: interviewCandidate.id,
            interviewTemplate: {
              id: interviewTemplateId,
              questions: expect.any(Array),
            },
            user: {
              id: candidateUser.id,
            },
            answers: expect.any(Array),
            deadline: interviewCandidate.deadline.toString().split('T')[0],
            status: InterviewStatus.PENDING,
          },
          errors: null,
        },
      },
    });
  });

  it("candidates should not be able to get other candidates' interviews", async () => {
    const interviewCandidate2 = await createInterview(
      interviewTemplateId,
      candidateUser2.id,
    );
    testInterviews.push(interviewCandidate2);

    const response = await graphqlCall({
      source: getCandidateInterviewQuery,
      variableValues: {
        id: interviewCandidate2.id,
      },
      userId: candidateUser.id,
    });

    expect(response).toMatchObject({
      data: {
        getCandidateInterview: {
          interview: null,
          errors: [
            {
              field: 'id',
              message: 'Interview not found',
            },
          ],
        },
      },
    });
  });
});
