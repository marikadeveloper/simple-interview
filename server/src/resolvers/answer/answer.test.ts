import { dataSource } from '../..';
import { Interview } from '../../entities/Interview';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { Question } from '../../entities/Question';
import { User, UserRole } from '../../entities/User';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';
import { CreateAnswerInput } from './answer-types';

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
    }
  }
`;
// const saveKeystrokesMutation = `
//   mutation SaveKeystrokes($input: SaveKeystrokesInput!) {
//     saveKeystrokes(input: $input)
//   }
// `;

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
        },
      },
    });
  });
});
