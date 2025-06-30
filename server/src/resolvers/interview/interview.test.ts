import { ILike } from 'typeorm';
import { dataSource } from '../..';
import { Answer } from '../../entities/Answer';
import {
  Interview,
  InterviewEvaluation,
  InterviewStatus,
} from '../../entities/Interview';
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
  // remove all test data in the correct order to avoid foreign key constraints
  // First delete all interviews (which will cascade delete answers)
  await Interview.delete({});

  // Then delete questions
  await Promise.all(
    testInterviewTemplateQuestions.map((question) => question.remove()),
  );

  // Delete interview template
  await testInterviewTemplate.remove();

  // Finally delete users
  await Promise.all(testUsers.map((user) => user.remove()));

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
    it('should return an interview by slug for an admin', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const response = await graphqlCall({
        source: `
          query GetInterviewBySlug($slug: String!) {
            getInterviewBySlug(slug: $slug) {
              id
            }
          }
        `,
        variableValues: {
          slug: testInterview.slug,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          getInterviewBySlug: {
            id: expect.any(Number),
          },
        },
      });
    });

    it('should return an interview by slug for an interviewer', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const response = await graphqlCall({
        source: `
          query GetInterviewBySlug($slug: String!) {
            getInterviewBySlug(slug: $slug) {
              id
            }
          }
        `,
        variableValues: {
          slug: testInterview.slug,
        },
        userId: testInterviewer.id,
      });

      expect(response).toMatchObject({
        data: {
          getInterviewBySlug: {
            id: expect.any(Number),
          },
        },
      });
    });

    it('should not return an interview to a candidate by slug', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const response = await graphqlCall({
        source: `
          query GetInterviewBySlug($slug: String!) {
            getInterviewBySlug(slug: $slug) {
              id
            }
          }
        `,
        variableValues: {
          slug: testInterview.slug,
        },
        userId: testCandidate.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notAuthorized }],
      });
    });
  });

  describe('getCandidateInterviewBySlug', () => {
    it('should return the interview by slug if the user is the assigned candidate', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const response = await graphqlCall({
        source: `
          query GetCandidateInterviewBySlug($slug: String!) {
            getCandidateInterviewBySlug(slug: $slug) {
              id
            }
          }
        `,
        variableValues: {
          slug: testInterview.slug,
        },
        userId: testCandidate.id,
      });

      expect(response).toMatchObject({
        data: {
          getCandidateInterviewBySlug: {
            id: expect.any(Number),
          },
        },
      });
    });

    it('should not return an interview of another candidate', async () => {
      const testCandidate2 = await createFakeUser(UserRole.CANDIDATE);
      testUsers.push(testCandidate2);

      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const response = await graphqlCall({
        source: `
          query GetCandidateInterviewBySlug($slug: String!) {
            getCandidateInterviewBySlug(slug: $slug) {
              id
            }
          }
        `,
        variableValues: {
          slug: testInterview.slug,
        },
        userId: testCandidate2.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interview.notFound }],
      });
    });

    it('should throw an error if the interview does not exist', async () => {
      const response = await graphqlCall({
        source: `
          query GetCandidateInterviewBySlug($slug: String!) {
            getCandidateInterviewBySlug(slug: $slug) {
              id
            }
          }
        `,
        variableValues: {
          slug: 'non-existent-interview-slug',
        },
        userId: testCandidate.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interview.notFound }],
      });
    });
  });

  describe('confirmInterviewCompletion', () => {
    it('should allow a candidate to confirm completion of their own interview', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const response = await graphqlCall({
        source: `
            mutation ConfirmInterviewCompletion($id: Int!) {
              confirmInterviewCompletion(id: $id)
            }
          `,
        variableValues: {
          id: testInterview.id,
        },
        userId: testCandidate.id,
      });

      expect(response).toMatchObject({
        data: {
          confirmInterviewCompletion: true,
        },
      });
    });

    it("should not allow a user to confirm completion of another user's interview", async () => {
      const testCandidate2 = await createFakeUser(UserRole.CANDIDATE);
      testUsers.push(testCandidate2);

      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const response = await graphqlCall({
        source: `
          mutation ConfirmInterviewCompletion($id: Int!) {
            confirmInterviewCompletion(id: $id)
          }
        `,
        variableValues: {
          id: testInterview.id,
        },
        userId: testCandidate2.id,
      });

      expect(response).toMatchObject({
        data: {
          confirmInterviewCompletion: false,
        },
      });
    });

    it('should set the interview status to COMPLETED', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const response = await graphqlCall({
        source: `
          mutation ConfirmInterviewCompletion($id: Int!) {
            confirmInterviewCompletion(id: $id)
          }
        `,
        variableValues: {
          id: testInterview.id,
        },
        userId: testCandidate.id,
      });

      expect(response).toMatchObject({
        data: {
          confirmInterviewCompletion: true,
        },
      });

      const updatedInterview = await Interview.findOne({
        where: { id: testInterview.id },
      });

      expect(updatedInterview?.status).toBe(InterviewStatus.COMPLETED);
    });

    it('should set the completedAt timestamp', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const response = await graphqlCall({
        source: `
          mutation ConfirmInterviewCompletion($id: Int!) {
            confirmInterviewCompletion(id: $id)
          }
        `,
        variableValues: {
          id: testInterview.id,
        },
        userId: testCandidate.id,
      });

      expect(response).toMatchObject({
        data: {
          confirmInterviewCompletion: true,
        },
      });

      const updatedInterview = await Interview.findOne({
        where: { id: testInterview.id },
      });

      expect(updatedInterview?.completedAt).toBeDefined();
    });

    it('should send an email notification to the interviewer', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const response = await graphqlCall({
        source: `
          mutation ConfirmInterviewCompletion($id: Int!) {
            confirmInterviewCompletion(id: $id)
          }
        `,
        variableValues: {
          id: testInterview.id,
        },
        userId: testCandidate.id,
      });

      expect(response).toMatchObject({
        data: {
          confirmInterviewCompletion: true,
        },
      });

      expect(sendEmail).toHaveBeenCalledWith(
        testInterviewer.email,
        'Interview Completed',
        expect.any(String),
      );
    });

    it('should return false if the interview does not exist', async () => {
      const response = await graphqlCall({
        source: `
          mutation ConfirmInterviewCompletion($id: Int!) {
            confirmInterviewCompletion(id: $id)
          }
        `,
        variableValues: {
          id: 9999999,
        },
        userId: testCandidate.id,
      });

      expect(response).toMatchObject({
        data: {
          confirmInterviewCompletion: false,
        },
      });
    });
  });

  describe('deleteInterview', () => {
    it('should allow an admin to delete a pending interview', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const response = await graphqlCall({
        source: `
          mutation DeleteInterview($id: Int!) {
            deleteInterview(id: $id)
          }
        `,
        variableValues: {
          id: testInterview.id,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          deleteInterview: true,
        },
      });

      const updatedInterview = await Interview.findOne({
        where: { id: testInterview.id },
      });

      expect(updatedInterview).toBeNull();
    });

    it('should allow an interviewer to delete a pending interview', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const response = await graphqlCall({
        source: `
          mutation DeleteInterview($id: Int!) {
            deleteInterview(id: $id)
          }
        `,
        variableValues: {
          id: testInterview.id,
        },
        userId: testInterviewer.id,
      });

      expect(response).toMatchObject({
        data: {
          deleteInterview: true,
        },
      });

      const updatedInterview = await Interview.findOne({
        where: { id: testInterview.id },
      });

      expect(updatedInterview).toBeNull();
    });

    it('should not allow a candidate to delete an interview', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const response = await graphqlCall({
        source: `
          mutation DeleteInterview($id: Int!) {
            deleteInterview(id: $id)
          }
        `,
        variableValues: {
          id: testInterview.id,
        },
        userId: testCandidate.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notAuthorized }],
      });

      const updatedInterview = await Interview.findOne({
        where: { id: testInterview.id },
      });

      expect(updatedInterview).toBeDefined();
    });

    it('should throw an error if the interview does not exist', async () => {
      const response = await graphqlCall({
        source: `
          mutation DeleteInterview($id: Int!) {
            deleteInterview(id: $id)
          }
        `,
        variableValues: {
          id: 9999999,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interview.notFound }],
      });
    });

    it('should throw an error when trying to delete a non-pending interview', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
        status: InterviewStatus.COMPLETED,
      }).save();

      const response = await graphqlCall({
        source: `
          mutation DeleteInterview($id: Int!) {
            deleteInterview(id: $id)
          }
        `,
        variableValues: {
          id: testInterview.id,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interview.canNotDelete }],
      });

      const updatedInterview = await Interview.findOne({
        where: { id: testInterview.id },
      });

      expect(updatedInterview).toBeDefined();
    });
  });

  describe('updateInterview', () => {
    it('should allow an admin to update a pending interview', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const input: InterviewInput = {
        interviewTemplateId: testInterviewTemplate.id,
        candidateId: testCandidate.id,
        interviewerId: testInterviewer.id,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await graphqlCall({
        source: `
          mutation UpdateInterview($id: Int!, $input: InterviewInput!) {
            updateInterview(id: $id, input: $input) {
              id
              interviewTemplate {
                id
              }
              user {
                id
              }
            }
          }
        `,
        variableValues: {
          id: testInterview.id,
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          updateInterview: {
            id: testInterview.id,
            interviewTemplate: {
              id: testInterviewTemplate.id,
            },
            user: {
              id: testCandidate.id,
            },
          },
        },
      });
    });

    it('should allow an interviewer to update a pending interview', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const input: InterviewInput = {
        interviewTemplateId: testInterviewTemplate.id,
        candidateId: testCandidate.id,
        interviewerId: testInterviewer.id,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await graphqlCall({
        source: `
          mutation UpdateInterview($id: Int!, $input: InterviewInput!) {
            updateInterview(id: $id, input: $input) {
              id
            }
          }
        `,
        variableValues: {
          id: testInterview.id,
          input,
        },
        userId: testInterviewer.id,
      });

      expect(response).toMatchObject({
        data: {
          updateInterview: {
            id: testInterview.id,
          },
        },
      });
    });

    it('should not allow a candidate to update an interview', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const input: InterviewInput = {
        interviewTemplateId: testInterviewTemplate.id,
        candidateId: testCandidate.id,
        interviewerId: testInterviewer.id,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await graphqlCall({
        source: `
          mutation UpdateInterview($id: Int!, $input: InterviewInput!) {
            updateInterview(id: $id, input: $input) {
              id
            }
          }
        `,
        variableValues: {
          id: testInterview.id,
          input,
        },
        userId: testCandidate.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notAuthorized }],
      });
    });

    it('should throw an error if the interview does not exist', async () => {
      const input: InterviewInput = {
        interviewTemplateId: testInterviewTemplate.id,
        candidateId: testCandidate.id,
        interviewerId: testInterviewer.id,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await graphqlCall({
        source: `
          mutation UpdateInterview($id: Int!, $input: InterviewInput!) {
            updateInterview(id: $id, input: $input) {
              id
            }
          }
        `,
        variableValues: {
          id: 9999999,
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interview.notFound }],
      });
    });

    it('should throw an error when trying to update a non-pending interview', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
        status: InterviewStatus.COMPLETED,
      }).save();

      const input: InterviewInput = {
        interviewTemplateId: testInterviewTemplate.id,
        candidateId: testCandidate.id,
        interviewerId: testInterviewer.id,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await graphqlCall({
        source: `
          mutation UpdateInterview($id: Int!, $input: InterviewInput!) {
            updateInterview(id: $id, input: $input) {
              id
            }
          }
        `,
        variableValues: {
          id: testInterview.id,
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interview.canNotUpdate }],
      });
    });

    it('should throw an error for an invalid interview template', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const input: InterviewInput = {
        interviewTemplateId: 9999999,
        candidateId: testCandidate.id,
        interviewerId: testInterviewer.id,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await graphqlCall({
        source: `
          mutation UpdateInterview($id: Int!, $input: InterviewInput!) {
            updateInterview(id: $id, input: $input) {
              id
            }
          }
        `,
        variableValues: {
          id: testInterview.id,
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interviewTemplate.notFound }],
      });
    });

    it('should throw an error for an invalid candidate', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const input: InterviewInput = {
        interviewTemplateId: testInterviewTemplate.id,
        candidateId: 9999999,
        interviewerId: testInterviewer.id,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await graphqlCall({
        source: `
          mutation UpdateInterview($id: Int!, $input: InterviewInput!) {
            updateInterview(id: $id, input: $input) {
              id
            }
          }
        `,
        variableValues: {
          id: testInterview.id,
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notCandidate }],
      });
    });

    it('should throw an error for an invalid interviewer', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const input: InterviewInput = {
        interviewTemplateId: testInterviewTemplate.id,
        candidateId: testCandidate.id,
        interviewerId: 9999999,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await graphqlCall({
        source: `
          mutation UpdateInterview($id: Int!, $input: InterviewInput!) {
            updateInterview(id: $id, input: $input) {
              id
            }
          }
        `,
        variableValues: {
          id: testInterview.id,
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notFound }],
      });
    });

    it('should throw an error for an invalid deadline', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const input: InterviewInput = {
        interviewTemplateId: testInterviewTemplate.id,
        candidateId: testCandidate.id,
        interviewerId: testInterviewer.id,
        deadline: 'invalid-date',
      };

      const response = await graphqlCall({
        source: `
          mutation UpdateInterview($id: Int!, $input: InterviewInput!) {
            updateInterview(id: $id, input: $input) {
              id
            }
          }
        `,
        variableValues: {
          id: testInterview.id,
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.date.invalidFormat }],
      });
    });

    it('should send an email to the new interviewer if the interviewer is changed', async () => {
      const testInterviewer2 = await createFakeUser(UserRole.INTERVIEWER);
      testUsers.push(testInterviewer2);

      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
      }).save();

      const input: InterviewInput = {
        interviewTemplateId: testInterviewTemplate.id,
        candidateId: testCandidate.id,
        interviewerId: testInterviewer2.id,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await graphqlCall({
        source: `
            mutation UpdateInterview($id: Int!, $input: InterviewInput!) {
              updateInterview(id: $id, input: $input) {
                id
              }
            }
          `,
        variableValues: {
          id: testInterview.id,
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          updateInterview: {
            id: testInterview.id,
          },
        },
      });

      expect(sendEmail).toHaveBeenCalledWith(
        testInterviewer2.email,
        'Interview Assigned',
        expect.any(String),
      );
    });
  });

  describe('evaluateInterview', () => {
    it('should allow an admin to evaluate a completed interview', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
        status: InterviewStatus.COMPLETED,
      }).save();

      const input = {
        evaluationValue: InterviewEvaluation.GOOD,
        evaluationNotes: 'Good performance overall',
      };

      const response = await graphqlCall({
        source: `
          mutation EvaluateInterview($id: Int!, $input: InterviewEvaluationInput!) {
            evaluateInterview(id: $id, input: $input)
          }
        `,
        variableValues: {
          id: testInterview.id,
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          evaluateInterview: true,
        },
      });
    });

    it('should allow an interviewer to evaluate a completed interview', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
        status: InterviewStatus.COMPLETED,
      }).save();

      const input = {
        evaluationValue: InterviewEvaluation.EXCELLENT,
        evaluationNotes: 'Outstanding performance',
      };

      const response = await graphqlCall({
        source: `
          mutation EvaluateInterview($id: Int!, $input: InterviewEvaluationInput!) {
            evaluateInterview(id: $id, input: $input)
          }
        `,
        variableValues: {
          id: testInterview.id,
          input,
        },
        userId: testInterviewer.id,
      });

      expect(response).toMatchObject({
        data: {
          evaluateInterview: true,
        },
      });
    });

    it('should not allow a candidate to evaluate an interview', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
        status: InterviewStatus.COMPLETED,
      }).save();

      const input = {
        evaluationValue: InterviewEvaluation.GOOD,
        evaluationNotes: 'Good performance',
      };

      const response = await graphqlCall({
        source: `
          mutation EvaluateInterview($id: Int!, $input: InterviewEvaluationInput!) {
            evaluateInterview(id: $id, input: $input)
          }
        `,
        variableValues: {
          id: testInterview.id,
          input,
        },
        userId: testCandidate.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notAuthorized }],
      });
    });

    it('should throw an error if the interview does not exist', async () => {
      const input = {
        evaluationValue: InterviewEvaluation.GOOD,
        evaluationNotes: 'Good performance',
      };

      const response = await graphqlCall({
        source: `
          mutation EvaluateInterview($id: Int!, $input: InterviewEvaluationInput!) {
            evaluateInterview(id: $id, input: $input)
          }
        `,
        variableValues: {
          id: 9999999,
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interview.notFound }],
      });
    });

    it('should throw an error when trying to evaluate a non-completed interview', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
        status: InterviewStatus.PENDING,
      }).save();

      const input = {
        evaluationValue: InterviewEvaluation.GOOD,
        evaluationNotes: 'Good performance',
      };

      const response = await graphqlCall({
        source: `
            mutation EvaluateInterview($id: Int!, $input: InterviewEvaluationInput!) {
              evaluateInterview(id: $id, input: $input)
            }
          `,
        variableValues: {
          id: testInterview.id,
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interview.canNotEvaluate }],
      });
    });

    it('should correctly save the evaluation value and notes', async () => {
      const testInterview = await Interview.create({
        interviewTemplate: testInterviewTemplate,
        user: testCandidate,
        interviewer: testInterviewer,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slug: 'test-interview-slug-' + Date.now(),
        status: InterviewStatus.COMPLETED,
      }).save();

      const input = {
        evaluationValue: InterviewEvaluation.EXCELLENT,
        evaluationNotes: 'Outstanding performance with great technical skills',
      };

      const response = await graphqlCall({
        source: `
          mutation EvaluateInterview($id: Int!, $input: InterviewEvaluationInput!) {
            evaluateInterview(id: $id, input: $input)
          }
        `,
        variableValues: {
          id: testInterview.id,
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          evaluateInterview: true,
        },
      });

      const updatedInterview = await Interview.findOne({
        where: { id: testInterview.id },
      });

      expect(updatedInterview?.evaluationValue).toBe(
        InterviewEvaluation.EXCELLENT,
      );
      expect(updatedInterview?.evaluationNotes).toBe(
        'Outstanding performance with great technical skills',
      );
    });
  });

  describe('Field Resolvers', () => {
    describe('status', () => {
      it('should return PENDING for a new interview', async () => {
        const testInterview = await Interview.create({
          interviewTemplate: testInterviewTemplate,
          user: testCandidate,
          interviewer: testInterviewer,
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          slug: 'test-interview-slug-' + Date.now(),
          status: InterviewStatus.PENDING,
        }).save();

        const response = await graphqlCall({
          source: `
            query GetInterviewBySlug($slug: String!) {
              getInterviewBySlug(slug: $slug) {
                status
              }
            }
          `,
          variableValues: {
            slug: testInterview.slug,
          },
          userId: testAdmin.id,
        });

        expect(response).toMatchObject({
          data: {
            getInterviewBySlug: {
              status: 'PENDING',
            },
          },
        });
      });

      it('should return IN_PROGRESS if there is at least one answer', async () => {
        const testInterview = await Interview.create({
          interviewTemplate: testInterviewTemplate,
          user: testCandidate,
          interviewer: testInterviewer,
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          slug: 'test-interview-slug-' + Date.now(),
          status: InterviewStatus.PENDING,
        }).save();

        // Create an answer for the interview
        const answer = new Answer();
        answer.interview = testInterview;
        answer.question = testInterviewTemplateQuestions[0];
        answer.text = 'Test answer content';
        await answer.save();

        const response = await graphqlCall({
          source: `
            query GetInterviewBySlug($slug: String!) {
              getInterviewBySlug(slug: $slug) {
                status
              }
            }
          `,
          variableValues: {
            slug: testInterview.slug,
          },
          userId: testAdmin.id,
        });

        expect(response).toMatchObject({
          data: {
            getInterviewBySlug: {
              status: 'IN_PROGRESS',
            },
          },
        });
      });

      it('should return COMPLETED if the status is manually set to completed', async () => {
        const testInterview = await Interview.create({
          interviewTemplate: testInterviewTemplate,
          user: testCandidate,
          interviewer: testInterviewer,
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          slug: 'test-interview-slug-' + Date.now(),
          status: InterviewStatus.COMPLETED,
        }).save();

        const response = await graphqlCall({
          source: `
              query GetInterviewBySlug($slug: String!) {
                getInterviewBySlug(slug: $slug) {
                  status
                }
              }
            `,
          variableValues: {
            slug: testInterview.slug,
          },
          userId: testAdmin.id,
        });

        expect(response).toMatchObject({
          data: {
            getInterviewBySlug: {
              status: 'COMPLETED',
            },
          },
        });
      });

      it('should return EXPIRED if the deadline has passed', async () => {
        const testInterview = await Interview.create({
          interviewTemplate: testInterviewTemplate,
          user: testCandidate,
          interviewer: testInterviewer,
          deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          slug: 'test-interview-slug-' + Date.now(),
          status: InterviewStatus.PENDING,
        }).save();

        const response = await graphqlCall({
          source: `
            query GetInterviewBySlug($slug: String!) {
              getInterviewBySlug(slug: $slug) {
                status
              }
            }
          `,
          variableValues: {
            slug: testInterview.slug,
          },
          userId: testAdmin.id,
        });

        expect(response).toMatchObject({
          data: {
            getInterviewBySlug: {
              status: 'EXPIRED',
            },
          },
        });
      });
    });

    describe('evaluationValue', () => {
      it('should return the evaluation value for an admin', async () => {
        const testInterview = await Interview.create({
          interviewTemplate: testInterviewTemplate,
          user: testCandidate,
          interviewer: testInterviewer,
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          slug: 'test-interview-slug-' + Date.now(),
          evaluationValue: InterviewEvaluation.GOOD,
        }).save();

        const response = await graphqlCall({
          source: `
            query GetInterviewBySlug($slug: String!) {
              getInterviewBySlug(slug: $slug) {
                evaluationValue
              }
            }
          `,
          variableValues: {
            slug: testInterview.slug,
          },
          userId: testAdmin.id,
        });

        expect(response).toMatchObject({
          data: {
            getInterviewBySlug: {
              evaluationValue: InterviewEvaluation.GOOD,
            },
          },
        });
      });

      it('should return the evaluation value for an interviewer', async () => {
        const testInterview = await Interview.create({
          interviewTemplate: testInterviewTemplate,
          user: testCandidate,
          interviewer: testInterviewer,
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          slug: 'test-interview-slug-' + Date.now(),
          evaluationValue: InterviewEvaluation.EXCELLENT,
        }).save();

        const response = await graphqlCall({
          source: `
            query GetInterviewBySlug($slug: String!) {
              getInterviewBySlug(slug: $slug) {
                evaluationValue
              }
            }
          `,
          variableValues: {
            slug: testInterview.slug,
          },
          userId: testInterviewer.id,
        });

        expect(response).toMatchObject({
          data: {
            getInterviewBySlug: {
              evaluationValue: InterviewEvaluation.EXCELLENT,
            },
          },
        });
      });

      it('should return null for a candidate', async () => {
        const testInterview = await Interview.create({
          interviewTemplate: testInterviewTemplate,
          user: testCandidate,
          interviewer: testInterviewer,
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          slug: 'test-interview-slug-' + Date.now(),
          evaluationValue: InterviewEvaluation.GOOD,
        }).save();

        const response = await graphqlCall({
          source: `
            query GetCandidateInterviewBySlug($slug: String!) {
              getCandidateInterviewBySlug(slug: $slug) {
                evaluationValue
              }
            }
          `,
          variableValues: {
            slug: testInterview.slug,
          },
          userId: testCandidate.id,
        });

        expect(response).toMatchObject({
          data: {
            getCandidateInterviewBySlug: {
              evaluationValue: null,
            },
          },
        });
      });
    });

    describe('evaluationNotes', () => {
      it('should return the evaluation notes for an admin', async () => {
        const testInterview = await Interview.create({
          interviewTemplate: testInterviewTemplate,
          user: testCandidate,
          interviewer: testInterviewer,
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          slug: 'test-interview-slug-' + Date.now(),
          evaluationNotes:
            'Good technical skills, needs improvement in communication',
        }).save();

        const response = await graphqlCall({
          source: `
            query GetInterviewBySlug($slug: String!) {
              getInterviewBySlug(slug: $slug) {
                evaluationNotes
              }
            }
          `,
          variableValues: {
            slug: testInterview.slug,
          },
          userId: testAdmin.id,
        });

        expect(response).toMatchObject({
          data: {
            getInterviewBySlug: {
              evaluationNotes:
                'Good technical skills, needs improvement in communication',
            },
          },
        });
      });

      it('should return the evaluation notes for an interviewer', async () => {
        const testInterview = await Interview.create({
          interviewTemplate: testInterviewTemplate,
          user: testCandidate,
          interviewer: testInterviewer,
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          slug: 'test-interview-slug-' + Date.now(),
          evaluationNotes: 'Excellent problem-solving abilities',
        }).save();

        const response = await graphqlCall({
          source: `
            query GetInterviewBySlug($slug: String!) {
              getInterviewBySlug(slug: $slug) {
                evaluationNotes
              }
            }
          `,
          variableValues: {
            slug: testInterview.slug,
          },
          userId: testInterviewer.id,
        });

        expect(response).toMatchObject({
          data: {
            getInterviewBySlug: {
              evaluationNotes: 'Excellent problem-solving abilities',
            },
          },
        });
      });

      it('should return null for a candidate', async () => {
        const testInterview = await Interview.create({
          interviewTemplate: testInterviewTemplate,
          user: testCandidate,
          interviewer: testInterviewer,
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          slug: 'test-interview-slug-' + Date.now(),
          evaluationNotes: 'Good technical skills',
        }).save();

        const response = await graphqlCall({
          source: `
            query GetCandidateInterviewBySlug($slug: String!) {
              getCandidateInterviewBySlug(slug: $slug) {
                evaluationNotes
              }
            }
          `,
          variableValues: {
            slug: testInterview.slug,
          },
          userId: testCandidate.id,
        });

        expect(response).toMatchObject({
          data: {
            getCandidateInterviewBySlug: {
              evaluationNotes: null,
            },
          },
        });
      });
    });

    describe('user', () => {
      it('should resolve the user (candidate) of the interview', async () => {
        const testInterview = await Interview.create({
          interviewTemplate: testInterviewTemplate,
          user: testCandidate,
          interviewer: testInterviewer,
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          slug: 'test-interview-slug-' + Date.now(),
        }).save();

        const response = await graphqlCall({
          source: `
            query GetInterviewBySlug($slug: String!) {
              getInterviewBySlug(slug: $slug) {
                user {
                  id
                  fullName
                  email
                }
              }
            }
          `,
          variableValues: {
            slug: testInterview.slug,
          },
          userId: testAdmin.id,
        });

        expect(response).toMatchObject({
          data: {
            getInterviewBySlug: {
              user: {
                id: testCandidate.id,
                fullName: testCandidate.fullName,
                email: testCandidate.email,
              },
            },
          },
        });
      });
    });
  });
});
