import { dataSource } from '../..';
import { Answer } from '../../entities/Answer';
import { Interview, InterviewStatus } from '../../entities/Interview';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { Question } from '../../entities/Question';
import { User, UserRole } from '../../entities/User';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';
import { errorStrings } from '../../utils/errorStrings';
import { CreateAnswerInput, SaveKeystrokesInput } from './answer-types';

jest.mock('../../utils/sendEmail', () => ({
  sendEmail: jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
  }),
}));

// Track entities created during tests for reliable cleanup
let testUsers: User[] = [];
let testInterviewTemplate: InterviewTemplate;
let testInterview: Interview;
let testQuestion: Question;

// Set up the database connection before all tests
beforeAll(async () => {
  await setupTestDB();
  await setupInterview();
});

// Close database connections after all tests
afterAll(async () => {
  // Clean up test users
  if (testUsers.length > 0) {
    await Promise.all(testUsers.map((user) => User.delete(user.id)));
    testUsers = [];
  }

  if (testQuestion) {
    await Question.delete(testQuestion.id);
  }

  if (testInterview) {
    await Interview.delete(testInterview.id);
  }

  if (testInterviewTemplate) {
    await InterviewTemplate.delete(testInterviewTemplate.id);
  }

  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
  }
});

const setupInterview = async () => {
  let testCandidate = await createFakeUser(UserRole.CANDIDATE);
  const testInterviewer = await createFakeUser(UserRole.INTERVIEWER);

  testInterviewTemplate = await InterviewTemplate.create({
    name: 'Test Interview Template',
    description: 'This is a test interview template',
    slug: 'test-interview-template-' + Date.now(),
  }).save();

  testInterview = await Interview.create({
    interviewTemplate: testInterviewTemplate,
    user: testCandidate,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
    slug: 'test-interview-' + Date.now(),
    interviewer: testInterviewer,
  }).save();

  testQuestion = await Question.create({
    interviewTemplates: [testInterviewTemplate],
    title: 'Test Question',
    description: 'This is a test question',
  }).save();

  testUsers.push(testCandidate);
};

const createAnswerMutation = `
  mutation CreateAnswer($input: CreateAnswerInput!) {
    createAnswer(input: $input) {
      id
      keystrokes {
        id
      }
      hasReplay
    }
  }
`;
const saveKeystrokesMutation = `
  mutation SaveKeystrokes($input: SaveKeystrokesInput!) {
    saveKeystrokes(input: $input)
  }
`;

describe('Answer Resolver', () => {
  it('given a valid input should create an answer', async () => {
    const input: CreateAnswerInput = {
      interviewId: testInterview.id,
      text: 'console.log("Hello, world!");',
      language: 'js',
      questionId: testQuestion.id,
    };
    const response = await graphqlCall({
      source: createAnswerMutation,
      variableValues: {
        input,
      },
      userId: testUsers[0].id,
    });

    expect(response).toMatchObject({
      data: {
        createAnswer: {
          id: expect.any(Number),
          keystrokes: null,
        },
      },
    });
  });

  it('given a valid input, should save keystrokes', async () => {
    const answer = await Answer.create({
      interview: testInterview,
      question: testQuestion,
      text: 'console.log("Hello, world!");',
      language: 'js',
    }).save();

    const input: SaveKeystrokesInput = {
      answerId: answer.id,
      keystrokes: [
        {
          snapshot: 'console.log("Hello, world!");',
          relativeTimestamp: 1000,
          id: 1,
        },
      ],
    };

    const response = await graphqlCall({
      source: saveKeystrokesMutation,
      variableValues: { input },
      userId: testUsers[0].id,
    });

    expect(response).toMatchObject({
      data: {
        saveKeystrokes: true,
      },
    });

    // Check that the keystrokes were saved
    const savedAnswer = await Answer.findOne({
      where: { id: answer.id },
    });

    expect(savedAnswer?.keystrokes).toHaveLength(1);
    expect(savedAnswer?.keystrokes?.[0].snapshot).toBe(
      input.keystrokes[0].snapshot,
    );
    expect(savedAnswer?.keystrokes?.[0].relativeTimestamp).toBe(
      input.keystrokes[0].relativeTimestamp,
    );
    expect(savedAnswer?.keystrokes?.[0].id).toBe(input.keystrokes[0].id);
    expect(savedAnswer?.hasReplay).toBe(true);

    await Answer.delete(answer.id);
  });

  it('given no authenticated user should throw an error', async () => {
    const input: CreateAnswerInput = {
      interviewId: testInterview.id,
      text: 'console.log("Hello, world!");',
      language: 'js',
      questionId: testQuestion.id,
    };

    const response = await graphqlCall({
      source: createAnswerMutation,
      variableValues: { input },
    });

    expect(response).toMatchObject({
      errors: [
        {
          message: errorStrings.user.notAuthenticated,
        },
      ],
    });
  });

  it('given an interview that is not found should throw an error', async () => {
    const input: CreateAnswerInput = {
      interviewId: 999999,
      text: 'console.log("Hello, world!");',
      language: 'js',
      questionId: testQuestion.id,
    };

    const response = await graphqlCall({
      source: createAnswerMutation,
      variableValues: { input },
      userId: testUsers[0].id,
    });

    expect(response).toMatchObject({
      errors: [
        {
          message: errorStrings.interview.notFound,
        },
      ],
    });
  });

  it("given an interview that is not the user's should throw an error", async () => {
    const newUser = await createFakeUser(UserRole.CANDIDATE);

    const input: CreateAnswerInput = {
      interviewId: testInterview.id,
      text: 'console.log("Hello, world!");',
      language: 'js',
      questionId: testQuestion.id,
    };

    const response = await graphqlCall({
      source: createAnswerMutation,
      variableValues: { input },
      userId: newUser.id,
    });

    expect(response).toMatchObject({
      errors: [
        {
          message: errorStrings.interview.notFound,
        },
      ],
    });

    testUsers.push(newUser);
  });

  it('given an interview that is completed should throw an error', async () => {
    const input: CreateAnswerInput = {
      interviewId: testInterview.id,
      text: 'console.log("Hello, world!");',
      language: 'js',
      questionId: testQuestion.id,
    };

    await Interview.update(testInterview.id, {
      status: InterviewStatus.COMPLETED,
    });

    const response = await graphqlCall({
      source: createAnswerMutation,
      variableValues: { input },
      userId: testUsers[0].id,
    });

    expect(response).toMatchObject({
      errors: [
        {
          message: errorStrings.interview.canNotUpdate,
        },
      ],
    });

    await Interview.update(testInterview.id, {
      status: InterviewStatus.PENDING,
    });
  });

  it('given a question that is not in the interview template should throw an error', async () => {
    const input: CreateAnswerInput = {
      interviewId: testInterview.id,
      text: 'console.log("Hello, world!");',
      language: 'js',
      questionId: 999999,
    };

    const response = await graphqlCall({
      source: createAnswerMutation,
      variableValues: { input },
      userId: testUsers[0].id,
    });

    expect(response).toMatchObject({
      errors: [
        {
          message: errorStrings.question.notFound,
        },
      ],
    });
  });

  it('given a non existing answer should not save keystrokes', async () => {
    const input: SaveKeystrokesInput = {
      answerId: 999999,
      keystrokes: [],
    };
    const response = await graphqlCall({
      source: saveKeystrokesMutation,
      variableValues: { input },
      userId: testUsers[0].id,
    });

    expect(response).toMatchObject({
      errors: [
        {
          message: errorStrings.answer.notFound,
        },
      ],
    });
  });

  it("given an interview that is not the user's should not save keystrokes", async () => {
    const newUser = await createFakeUser(UserRole.CANDIDATE);
    const answer = await Answer.create({
      interview: testInterview,
      question: testQuestion,
      text: 'console.log("Hello, world!");',
      language: 'js',
    }).save();

    const input: SaveKeystrokesInput = {
      answerId: answer.id,
      keystrokes: [],
    };

    const response = await graphqlCall({
      source: saveKeystrokesMutation,
      variableValues: { input },
      userId: newUser.id,
    });

    expect(response).toMatchObject({
      errors: [
        {
          message: errorStrings.answer.notAuthorized,
        },
      ],
    });

    await Answer.delete(answer.id);
    testUsers.push(newUser);
  });
});
