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
      sortOrder
    }
  }
`;

const updateQuestionMutation = `
  mutation UpdateQuestion($id: Int!, $input: QuestionInput!) {
    updateQuestion(id: $id, input: $input) {
      id
      title
      description
      sortOrder
    }
  }
`;

const getQuestionsQuery = `
  query GetQuestions($interviewTemplateId: Int!) {
    getQuestions(interviewTemplateId: $interviewTemplateId) {
      id
      title
      description
      sortOrder
    }
  }
`;

const updateQuestionSortOrderMutation = `
  mutation UpdateQuestionSortOrder($input: UpdateQuestionSortOrderInput!) {
    updateQuestionSortOrder(input: $input)
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
            sortOrder: expect.any(Number),
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
            sortOrder: expect.any(Number),
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
          sortOrder: 0,
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
          sortOrder: 1,
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

  it('given a correct interview template id, should return the questions', async () => {
    // create questions
    const question1 = await createFakeQuestion(interviewTemplateId, {
      sortOrder: 0,
    });
    const question2 = await createFakeQuestion(interviewTemplateId, {
      sortOrder: 1,
    });
    testQuestions.push(question1, question2);

    // get them
    const response = await graphqlCall({
      source: getQuestionsQuery,
      variableValues: { interviewTemplateId },
      userId: adminUser.id,
    });

    // @ts-ignore
    expect(response.data.getQuestions).toHaveLength(2);
    expect(response).toMatchObject({
      data: {
        getQuestions: [
          {
            id: question1.id,
            title: question1.title,
            description: question1.description,
            sortOrder: question1.sortOrder,
          },
          {
            id: question2.id,
            title: question2.title,
            description: question2.description,
            sortOrder: question2.sortOrder,
          },
        ],
      },
    });
  });

  it("should update a question's title and description", async () => {
    const question = await createFakeQuestion(interviewTemplateId, {
      sortOrder: 0,
    });
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
          sortOrder: question.sortOrder,
        },
      },
    });
  });

  it('should delete a question', async () => {
    const question = await createFakeQuestion(interviewTemplateId, {
      sortOrder: 0,
    });

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

  describe('should update the sort order of questions correctly', () => {
    const prepareTest = async () => {
      const question1 = await createFakeQuestion(interviewTemplateId, {
        sortOrder: 0,
      });
      const question2 = await createFakeQuestion(interviewTemplateId, {
        sortOrder: 1,
      });
      const question3 = await createFakeQuestion(interviewTemplateId, {
        sortOrder: 2,
      });
      testQuestions.push(question1, question2, question3);
      // Make sure there's only 3 questions in the DB
      const questions = await Question.find({
        where: { interviewTemplate: { id: interviewTemplateId } },
      });
      expect(questions).toHaveLength(3);

      return { question1, question2, question3 };
    };

    it('moves question 1 down to the end, step by step', async () => {
      const { question1, question2, question3 } = await prepareTest();

      // ! Test 1: 1 down
      // Update the sort order
      let response = await graphqlCall({
        source: updateQuestionSortOrderMutation,
        variableValues: {
          input: { questionId: question1!.id, newSortOrder: 1 },
        },
        userId: adminUser.id,
      });

      // Get all questions to check their sort order
      let updated_question1 = await Question.findOneBy({ id: question1.id });
      let updated_question2 = await Question.findOneBy({ id: question2.id });
      let updated_question3 = await Question.findOneBy({ id: question3.id });

      // Assert
      expect(response).toMatchObject({
        data: {
          updateQuestionSortOrder: true,
        },
      });
      expect(updated_question2?.sortOrder).toBe(0);
      expect(updated_question1?.sortOrder).toBe(1);
      expect(updated_question3?.sortOrder).toBe(2);

      // !Test 2: 1 down again
      response = await graphqlCall({
        source: updateQuestionSortOrderMutation,
        variableValues: {
          input: { questionId: question1.id, newSortOrder: 2 },
        },
        userId: adminUser.id,
      });

      updated_question1 = await Question.findOneBy({ id: question1.id });
      updated_question2 = await Question.findOneBy({ id: question2.id });
      updated_question3 = await Question.findOneBy({ id: question3.id });

      expect(response).toMatchObject({
        data: {
          updateQuestionSortOrder: true,
        },
      });
      expect(updated_question2?.sortOrder).toBe(0);
      expect(updated_question3?.sortOrder).toBe(1);
      expect(updated_question1?.sortOrder).toBe(2);
    });

    it('moves question 3 up to the beginning, step by step', async () => {
      const { question1, question2, question3 } = await prepareTest();

      // ! Test 1: 3 up
      // Update the sort order
      let response = await graphqlCall({
        source: updateQuestionSortOrderMutation,
        variableValues: {
          input: { questionId: question3!.id, newSortOrder: 0 },
        },
        userId: adminUser.id,
      });

      // Get all questions to check their sort order
      let updated_question1 = await Question.findOneBy({ id: question1.id });
      let updated_question2 = await Question.findOneBy({ id: question2.id });
      let updated_question3 = await Question.findOneBy({ id: question3.id });

      // Assert
      expect(response).toMatchObject({
        data: {
          updateQuestionSortOrder: true,
        },
      });
      expect(updated_question3?.sortOrder).toBe(0);
      expect(updated_question1?.sortOrder).toBe(1);
      expect(updated_question2?.sortOrder).toBe(2);

      // Test 2: 3 up again
      response = await graphqlCall({
        source: updateQuestionSortOrderMutation,
        variableValues: {
          input: { questionId: question3.id, newSortOrder: 0 },
        },
        userId: adminUser.id,
      });

      updated_question1 = await Question.findOneBy({ id: question1.id });
      updated_question2 = await Question.findOneBy({ id: question2.id });
      updated_question3 = await Question.findOneBy({ id: question3.id });

      expect(response).toMatchObject({
        data: {
          updateQuestionSortOrder: true,
        },
      });
      expect(updated_question3?.sortOrder).toBe(0);
      expect(updated_question1?.sortOrder).toBe(1);
      expect(updated_question2?.sortOrder).toBe(2);
    });

    it('moves question 2 first to the beginning, then directly to the end', async () => {
      const { question1, question2, question3 } = await prepareTest();

      // ! Test 1: 2 up
      // Update the sort order
      let response = await graphqlCall({
        source: updateQuestionSortOrderMutation,
        variableValues: {
          input: { questionId: question2!.id, newSortOrder: 0 },
        },
        userId: adminUser.id,
      });

      // Get all questions to check their sort order
      let updated_question1 = await Question.findOneBy({ id: question1.id });
      let updated_question2 = await Question.findOneBy({ id: question2.id });
      let updated_question3 = await Question.findOneBy({ id: question3.id });

      // Assert
      expect(response).toMatchObject({
        data: {
          updateQuestionSortOrder: true,
        },
      });
      expect(updated_question2?.sortOrder).toBe(0);
      expect(updated_question1?.sortOrder).toBe(1);
      expect(updated_question3?.sortOrder).toBe(2);

      // Test 2: 2 down
      response = await graphqlCall({
        source: updateQuestionSortOrderMutation,
        variableValues: {
          input: { questionId: question2.id, newSortOrder: 2 },
        },
        userId: adminUser.id,
      });

      updated_question1 = await Question.findOneBy({ id: question1.id });
      updated_question2 = await Question.findOneBy({ id: question2.id });
      updated_question3 = await Question.findOneBy({ id: question3.id });

      expect(response).toMatchObject({
        data: {
          updateQuestionSortOrder: true,
        },
      });
      expect(updated_question1?.sortOrder).toBe(0);
      expect(updated_question3?.sortOrder).toBe(1);
      expect(updated_question2?.sortOrder).toBe(2);
    });
  });
});
