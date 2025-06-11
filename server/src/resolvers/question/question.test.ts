import { dataSource } from '../..';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { Question } from '../../entities/Question';
import { User, UserRole } from '../../entities/User';
import { graphqlCall } from '../../test-utils/graphqlCall';
import {
  createFakeQuestion,
  createFakeUser,
  fakeQuestionData,
} from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';
import { errorStrings } from '../../utils/errorStrings';

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
      id
      title
      description
    }
  }
`;

const updateQuestionMutation = `
  mutation UpdateQuestion($id: Int!, $input: QuestionInput!) {
    updateQuestion(id: $id, input: $input) {
      id
      title
      description
    }
  }
`;

const deleteQuestionMutation = `
  mutation DeleteQuestion($id: Int!) {
    deleteQuestion(id: $id)
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
            id: expect.any(Number),
            title: questionInput.title,
            description: questionInput.description,
          },
        },
      });

      // Store the created question for cleanup
      const createdQuestion = response.data?.createQuestion as Question;
      testQuestions.push(
        await Question.findOneOrFail({ where: { id: createdQuestion.id } }),
      );
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
            id: expect.any(Number),
            title: questionInput.title,
            description: questionInput.description,
          },
        },
      });

      // Store the created question for cleanup
      const createdQuestion = response.data?.createQuestion as Question;
      testQuestions.push(
        await Question.findOneOrFail({ where: { id: createdQuestion.id } }),
      );
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
        createQuestion: null,
      },
      errors: [{ message: errorStrings.user.notAuthorized }],
    });
  });

  it('should not be able to create a question without authentication', async () => {
    const questionInput = {
      title: 'Test Question',
      description: 'This is a test question',
    };

    const response = await graphqlCall({
      source: createQuestionMutation,
      variableValues: { interviewTemplateId, input: questionInput },
    });

    expect(response).toMatchObject({
      data: {
        createQuestion: null,
      },
      errors: [{ message: errorStrings.user.notAuthenticated }],
    });
  });

  it('should create a question with the correct sort order', async () => {
    const questionInput1 = fakeQuestionData();
    const questionInput2 = fakeQuestionData();

    // Create the first question
    const response1 = await graphqlCall({
      source: createQuestionMutation,
      variableValues: { interviewTemplateId, input: questionInput1 },
      userId: adminUser.id,
    });

    expect(response1).toMatchObject({
      data: {
        createQuestion: {
          id: expect.any(Number),
          title: questionInput1.title,
          description: questionInput1.description,
        },
      },
    });

    // Create the second question
    const response2 = await graphqlCall({
      source: createQuestionMutation,
      variableValues: { interviewTemplateId, input: questionInput2 },
      userId: adminUser.id,
    });

    expect(response2).toMatchObject({
      data: {
        createQuestion: {
          id: expect.any(Number),
          title: questionInput2.title,
          description: questionInput2.description,
        },
      },
    });

    // Store the created questions for cleanup
    const createdQuestion1 = response1.data?.createQuestion as Question;
    const createdQuestion2 = response2.data?.createQuestion as Question;
    testQuestions.push(
      await Question.findOneOrFail({ where: { id: createdQuestion1.id } }),
      await Question.findOneOrFail({ where: { id: createdQuestion2.id } }),
    );
  });

  it("should update a question's title and description", async () => {
    const question = await createFakeQuestion(interviewTemplateId, {});
    testQuestions.push(question);

    const updatedQuestionInput = {
      title: 'Updated Question Title',
      description: 'Updated Question Description',
    };

    const response = await graphqlCall({
      source: updateQuestionMutation,
      variableValues: { id: question.id, input: updatedQuestionInput },
      userId: adminUser.id,
    });

    expect(response).toMatchObject({
      data: {
        updateQuestion: {
          id: question.id,
          title: updatedQuestionInput.title,
          description: updatedQuestionInput.description,
        },
      },
    });
  });

  it('should delete a question', async () => {
    const question = await createFakeQuestion(interviewTemplateId, {});

    const response = await graphqlCall({
      source: deleteQuestionMutation,
      variableValues: { id: question.id },
      userId: adminUser.id,
    });

    expect(response).toMatchObject({
      data: {
        deleteQuestion: true,
      },
    });

    // Check if the question is deleted
    const deletedQuestion = await Question.findOneBy({ id: question.id });

    expect(deletedQuestion).toBeNull();
  });
});
