import { dataSource } from '../..';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { Question } from '../../entities/Question';
import { User, UserRole } from '../../entities/User';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';

// Track entities created during tests for reliable cleanup
let testUsers: User[] = [];
let testQuestions: Question[] = [];
let testInterviewTemplate: InterviewTemplate;

// Set up the database connection before all tests
beforeAll(async () => {
  await setupTestDB();
});

afterEach(async () => {
  if (testQuestions.length > 0) {
    await Promise.all(
      testQuestions.map((question) => Question.delete(question.id)),
    );
    testQuestions = [];
  }
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

const createQuestionMutation = `
  mutation CreateQuestion($interviewTemplateId: Int!, $input: QuestionInput!) {
    createQuestion(interviewTemplateId: $interviewTemplateId, input: $input) {
      question {
        id
        title
        description
        sortOrder
      }
      errors {
        field
        message
      }
    }
  }
`;

const createInterviewTemplate = () => {
  return InterviewTemplate.create({
    name: 'Test Interview Template',
    description: 'This is a test interview template',
  }).save();
};

describe('QuestionResolver', () => {
  let adminUser: User;
  let interviewerUser: User;
  let candidateUser: User;
  let interviewTemplateId: number;

  beforeAll(async () => {
    // Create test users
    adminUser = await createFakeUser(UserRole.ADMIN);
    interviewerUser = await createFakeUser(UserRole.INTERVIEWER);
    candidateUser = await createFakeUser(UserRole.CANDIDATE);
    testUsers.push(adminUser, interviewerUser, candidateUser);

    // Create a test interview template
    testInterviewTemplate = await createInterviewTemplate();
    interviewTemplateId = testInterviewTemplate.id;
  });

  describe('should be able to create a question', () => {
    const questionInput = {
      title: 'Test Question',
      description: 'This is a test question',
    };

    it('as an admin', async () => {
      const response = await graphqlCall({
        source: createQuestionMutation,
        variableValues: { interviewTemplateId, input: questionInput },
        userId: adminUser.id,
      });

      expect(response).toMatchObject({
        data: {
          createQuestion: {
            errors: null,
            question: {
              id: expect.any(Number),
              title: questionInput.title,
              description: questionInput.description,
              sortOrder: expect.any(Number),
            },
          },
        },
      });
    });

    it('as an interviewer', async () => {
      const response = await graphqlCall({
        source: createQuestionMutation,
        variableValues: { interviewTemplateId, input: questionInput },
        userId: interviewerUser.id,
      });

      expect(response).toMatchObject({
        data: {
          createQuestion: {
            errors: null,
            question: {
              id: expect.any(Number),
              title: questionInput.title,
              description: questionInput.description,
              sortOrder: expect.any(Number),
            },
          },
        },
      });
    });
  });

  it('should not be able to create a question as a candidate', async () => {
    const questionInput = {
      title: 'Test Question',
      description: 'This is a test question',
    };

    const response = await graphqlCall({
      source: createQuestionMutation,
      variableValues: { interviewTemplateId, input: questionInput },
      userId: candidateUser.id,
    });

    expect(response).toMatchObject({
      data: {
        createQuestion: {
          question: null,
          errors: [
            {
              field: 'general',
              message: 'not authorized',
            },
          ],
        },
      },
    });
  });
});
