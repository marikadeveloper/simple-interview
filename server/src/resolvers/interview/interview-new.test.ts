import { ILike } from 'typeorm';
import { dataSource } from '../..';
import { Interview } from '../../entities/Interview';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { Question } from '../../entities/Question';
import { User, UserRole } from '../../entities/User';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';
import { errorStrings } from '../../utils/errorStrings';
import { sendEmail } from '../../utils/sendEmail';
import { InterviewInput } from './interview-types';

let testUsers: User[] = [];
let testAdmin: User;
let testInterviewer: User;
let testCandidate: User;
let testInterviewTemplate: InterviewTemplate;
let testInterviewTemplateQuestions: Question[] = [];
let testInterviews: Interview[] = [];

const createTestInterviewTemplate = async () => {
  testInterviewTemplate = await InterviewTemplate.create({
    name: 'Test Interview Template',
    description: 'This is a test interview template',
    slug: 'test-interview-template-' + Date.now(),
  }).save();

  testInterviewTemplateQuestions = await createMockQuestions(
    testInterviewTemplate,
  );
};
const createMockQuestions = async (interviewTemplate: InterviewTemplate) => {
  const questions = [
    { title: 'Question 1', description: 'Description 1' },
    { title: 'Question 2', description: 'Description 2' },
    { title: 'Question 3', description: 'Description 3' },
  ];

  const createdQuestions = await Promise.all(
    questions.map((question) =>
      Question.create({
        title: question.title,
        description: question.description,
      }).save(),
    ),
  );

  if (!interviewTemplate.questions) {
    interviewTemplate.questions = [];
  }

  interviewTemplate.questions.push(...createdQuestions);
  await interviewTemplate.save();

  return createdQuestions;
};

const createTestUsers = async () => {
  testAdmin = await createFakeUser(UserRole.ADMIN);
  testInterviewer = await createFakeUser(UserRole.INTERVIEWER);
  testCandidate = await createFakeUser(UserRole.CANDIDATE);
  testUsers.push(testAdmin, testInterviewer, testCandidate);
};

jest.mock('../../utils/sendEmail', () => ({
  sendEmail: jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
  }),
}));

beforeAll(async () => {
  await setupTestDB();
  await createTestUsers();
  await createTestInterviewTemplate();
});

afterAll(async () => {
  // remove all test data
  await Promise.all(testUsers.map((user) => user.remove()));
  await Promise.all(testInterviews.map((interview) => interview.remove()));
  await Promise.all(
    testInterviewTemplateQuestions.map((question) => question.remove()),
  );
  await testInterviewTemplate.remove();

  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
  }
});

const buildCreateInterviewMutation = (fields: (keyof Interview)[]) => {
  return `
    mutation CreateInterview($input: InterviewInput!) {
      createInterview(input: $input) {
        ${fields.join('\n')}
      }
    }
  `;
};

const buildGetInterviewsQuery = (fields: (keyof Interview)[]) => {
  return `
    query GetInterviews {
      getInterviews {
        ${fields.join('\n')}
      }
    }
  `;
};

describe('InterviewResolver', () => {
  describe('createInterview', () => {
    it('should create an interview successfully as an admin', async () => {
      const input: InterviewInput = {
        interviewTemplateId: testInterviewTemplate.id,
        candidateId: testCandidate.id,
        interviewerId: testInterviewer.id,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await graphqlCall({
        source: buildCreateInterviewMutation(['id']),
        variableValues: {
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          createInterview: {
            id: expect.any(Number),
          },
        },
      });
    });

    it('should create an interview successfully as an interviewer', async () => {
      const input: InterviewInput = {
        interviewTemplateId: testInterviewTemplate.id,
        candidateId: testCandidate.id,
        interviewerId: testInterviewer.id,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await graphqlCall({
        source: buildCreateInterviewMutation(['id']),
        variableValues: {
          input,
        },
        userId: testInterviewer.id,
      });

      expect(response).toMatchObject({
        data: {
          createInterview: {
            id: expect.any(Number),
          },
        },
      });
    });

    it('should not allow a candidate to create an interview', async () => {
      const input: InterviewInput = {
        interviewTemplateId: testInterviewTemplate.id,
        candidateId: testCandidate.id,
        interviewerId: testInterviewer.id,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      const response = await graphqlCall({
        source: buildCreateInterviewMutation(['id']),
        variableValues: {
          input,
        },
        userId: testCandidate.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notAuthorized }],
      });
    });

    it('should throw an error for an invalid deadline', async () => {
      const input: InterviewInput = {
        interviewTemplateId: testInterviewTemplate.id,
        candidateId: testCandidate.id,
        interviewerId: testInterviewer.id,
        deadline: 'invalid-date',
      };

      const response = await graphqlCall({
        source: buildCreateInterviewMutation(['id']),
        variableValues: {
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.date.invalidFormat }],
      });
    });

    it('should throw an error if the deadline is in the past', async () => {
      const input: InterviewInput = {
        interviewTemplateId: testInterviewTemplate.id,
        candidateId: testCandidate.id,
        interviewerId: testInterviewer.id,
        deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      };

      const response = await graphqlCall({
        source: buildCreateInterviewMutation(['id']),
        variableValues: {
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.date.mustBeInTheFuture }],
      });
    });

    it('should throw an error if the interview template does not exist', async () => {
      const input: InterviewInput = {
        interviewTemplateId: 9999999,
        candidateId: testCandidate.id,
        interviewerId: testInterviewer.id,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await graphqlCall({
        source: buildCreateInterviewMutation(['id']),
        variableValues: {
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interviewTemplate.notFound }],
      });
    });

    it('should throw an error if the interview template has no questions', async () => {
      const testInterviewTemplateWithoutQuestions =
        await InterviewTemplate.create({
          name: 'Test Interview Template Without Questions',
          description: 'This is a test interview template without questions',
          slug: 'test-interview-template-no-questions-' + Date.now(),
        }).save();

      const input: InterviewInput = {
        interviewTemplateId: testInterviewTemplateWithoutQuestions.id,
        candidateId: testCandidate.id,
        interviewerId: testInterviewer.id,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await graphqlCall({
        source: buildCreateInterviewMutation(['id']),
        variableValues: {
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interview.noQuestions }],
      });

      await testInterviewTemplateWithoutQuestions.remove();
    });

    it('should throw an error if the candidate does not exist', async () => {
      const input: InterviewInput = {
        interviewTemplateId: testInterviewTemplate.id,
        candidateId: 9999999,
        interviewerId: testInterviewer.id,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await graphqlCall({
        source: buildCreateInterviewMutation(['id']),
        variableValues: {
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notFound }],
      });
    });

    it('should throw an error if the interviewer does not exist', async () => {
      const input: InterviewInput = {
        interviewTemplateId: testInterviewTemplate.id,
        candidateId: testCandidate.id,
        interviewerId: 9999999,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await graphqlCall({
        source: buildCreateInterviewMutation(['id']),
        variableValues: {
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notFound }],
      });
    });

    it('should generate a unique slug for the interview', async () => {
      const input: InterviewInput = {
        interviewTemplateId: testInterviewTemplate.id,
        candidateId: testCandidate.id,
        interviewerId: testInterviewer.id,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await graphqlCall({
        source: buildCreateInterviewMutation(['id', 'slug']),
        variableValues: {
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          createInterview: {
            id: expect.any(Number),
            slug: expect.any(String),
          },
        },
      });
    });

    it('should send an email to the candidate upon interview creation', async () => {
      const input: InterviewInput = {
        interviewTemplateId: testInterviewTemplate.id,
        candidateId: testCandidate.id,
        interviewerId: testInterviewer.id,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await graphqlCall({
        source: buildCreateInterviewMutation(['id']),
        variableValues: {
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          createInterview: {
            id: expect.any(Number),
          },
        },
      });

      expect(sendEmail).toHaveBeenCalledWith(
        testCandidate.email,
        'Interview Invitation',
        expect.any(String),
      );
    });
  });

  describe('getInterviews', () => {
    it('should return all interviews for an admin', async () => {
      const response = await graphqlCall({
        source: buildGetInterviewsQuery(['id']),
        userId: testAdmin.id,
      });

      const allInterviewsLength = await Interview.count();

      expect(response).toMatchObject({
        data: {
          getInterviews: expect.any(Array),
        },
      });
      expect(response.data?.getInterviews).toHaveLength(allInterviewsLength);
    });

    it('should return only assigned interviews for an interviewer', async () => {
      const response = await graphqlCall({
        source: buildGetInterviewsQuery(['id']),
        userId: testInterviewer.id,
      });

      const assignedInterviewsLength = await Interview.count({
        where: {
          interviewer: {
            id: testInterviewer.id,
          },
        },
      });

      expect(response.data?.getInterviews).toHaveLength(
        assignedInterviewsLength,
      );
    });

    it('should return only their own interviews for a candidate', async () => {
      const response = await graphqlCall({
        source: buildGetInterviewsQuery(['id']),
        userId: testCandidate.id,
      });

      const assignedInterviewsLength = await Interview.count({
        where: {
          user: {
            id: testCandidate.id,
          },
        },
      });

      expect(response.data?.getInterviews).toHaveLength(
        assignedInterviewsLength,
      );
    });

    it('should filter interviews by name for an admin', async () => {
      const response = await graphqlCall({
        source: `
          query GetInterviews($filter: String!) {
            getInterviews(filter: $filter) {
              id
            }
          }
        `,
        variableValues: {
          filter: 'Test Interview',
        },
        userId: testAdmin.id,
      });

      const interviews: Interview[] = response.data
        ?.getInterviews as Interview[];

      const matchingInterviews = await Interview.find({
        where: {
          interviewTemplate: {
            name: ILike('%Test Interview%'),
          },
        },
      });

      expect(matchingInterviews.length).toBe(interviews.length);
    });

    it('should filter interviews by name for an interviewer', async () => {
      const response = await graphqlCall({
        source: `
          query GetInterviews($filter: String!) {
            getInterviews(filter: $filter) {
              id
            }
          }
        `,
        variableValues: {
          filter: 'Test Interview',
        },
        userId: testInterviewer.id,
      });

      const interviews: Interview[] = response.data
        ?.getInterviews as Interview[];

      const matchingInterviews = await Interview.find({
        where: {
          interviewer: {
            id: testInterviewer.id,
          },
          interviewTemplate: {
            name: ILike('%Test Interview%'),
          },
        },
      });

      expect(matchingInterviews.length).toBe(interviews.length);
    });

    it('should return interviews ordered by deadline in descending order', async () => {
      const response = await graphqlCall({
        source: buildGetInterviewsQuery(['id']),
        userId: testAdmin.id,
      });

      const interviews: Interview[] = response.data
        ?.getInterviews as Interview[];

      const sortedInterviews = interviews.sort((a, b) => {
        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      });

      expect(interviews).toEqual(sortedInterviews);
    });
  });

  describe('getInterviewBySlug', () => {
    it.todo('should return an interview by slug for an admin');
    it.todo('should return an interview by slug for an interviewer');
    it.todo('should not return an interview to a candidate by slug');
    it.todo('should throw an error if the interview does not exist');
  });

  describe('getCandidateInterviewBySlug', () => {
    it.todo(
      'should return the interview by slug if the user is the assigned candidate',
    );
    it.todo('should not return an interview of another candidate');
    it.todo('should throw an error if the interview does not exist');
  });

  describe('confirmInterviewCompletion', () => {
    it.todo(
      'should allow a candidate to confirm completion of their own interview',
    );
    it.todo(
      "should not allow a user to confirm completion of another user's interview",
    );
    it.todo('should set the interview status to COMPLETED');
    it.todo('should set the completedAt timestamp');
    it.todo('should send an email notification to the interviewer');
    it.todo('should return false if the interview does not exist');
  });

  describe('deleteInterview', () => {
    it.todo('should allow an admin to delete a pending interview');
    it.todo('should allow an interviewer to delete a pending interview');
    it.todo('should not allow a candidate to delete an interview');
    it.todo('should throw an error if the interview does not exist');
    it.todo(
      'should throw an error when trying to delete a non-pending interview',
    );
  });

  describe('updateInterview', () => {
    it.todo('should allow an admin to update a pending interview');
    it.todo('should allow an interviewer to update a pending interview');
    it.todo('should not allow a candidate to update an interview');
    it.todo('should throw an error if the interview does not exist');
    it.todo(
      'should throw an error when trying to update a non-pending interview',
    );
    it.todo('should throw an error for an invalid interview template');
    it.todo('should throw an error for an invalid candidate');
    it.todo('should throw an error for an invalid interviewer');
    it.todo('should throw an error for an invalid deadline');
    it.todo(
      'should send an email to the new interviewer if the interviewer is changed',
    );
  });

  describe('evaluateInterview', () => {
    it.todo('should allow an admin to evaluate a completed interview');
    it.todo('should allow an interviewer to evaluate a completed interview');
    it.todo('should not allow a candidate to evaluate an interview');
    it.todo('should throw an error if the interview does not exist');
    it.todo(
      'should throw an error when trying to evaluate a non-completed interview',
    );
    it.todo('should correctly save the evaluation value and notes');
  });

  describe('Field Resolvers', () => {
    describe('status', () => {
      it.todo('should return PENDING for a new interview');
      it.todo('should return IN_PROGRESS if there is at least one answer');
      it.todo(
        'should return COMPLETED if the status is manually set to completed',
      );
      it.todo('should return EXPIRED if the deadline has passed');
    });

    describe('evaluationValue', () => {
      it.todo('should return the evaluation value for an admin');
      it.todo('should return the evaluation value for an interviewer');
      it.todo('should return null for a candidate');
    });

    describe('evaluationNotes', () => {
      it.todo('should return the evaluation notes for an admin');
      it.todo('should return the evaluation notes for an interviewer');
      it.todo('should return null for a candidate');
    });

    describe('user', () => {
      it.todo('should resolve the user (candidate) of the interview');
    });
  });
});
