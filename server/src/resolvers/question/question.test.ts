import { Interview, InterviewStatus } from '../../entities/Interview';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { Question } from '../../entities/Question';
import { QuestionBank } from '../../entities/QuestionBank';
import { User, UserRole } from '../../entities/User';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';
import { errorStrings } from '../../utils/errorStrings';

// Utility to create a QuestionBank for tests
const createQuestionBank = async () => {
  return QuestionBank.create({
    name: 'Test Bank ' + Math.random().toString(36).substring(7),
    slug:
      'test-bank-' + Math.random().toString(36).substring(7) + '-' + Date.now(),
  }).save();
};

describe('QuestionResolver', () => {
  let adminUser: User;
  let interviewerUser: User;
  let interviewTemplate: InterviewTemplate;
  let questionBank: QuestionBank;

  beforeAll(async () => {
    await setupTestDB();
    adminUser = await createFakeUser(UserRole.ADMIN);
    interviewerUser = await createFakeUser(UserRole.INTERVIEWER);
    interviewTemplate = await InterviewTemplate.create({
      name: 'Edge Template',
      description: 'desc',
      slug:
        'edge-template-' +
        Math.random().toString(36).substring(7) +
        '-' +
        Date.now(),
    }).save();
    questionBank = await createQuestionBank();
  });

  afterAll(async () => {
    await Question.delete({});
    await Interview.delete({});
    await InterviewTemplate.delete({});
    await QuestionBank.delete({});
    await User.delete({});
  });

  const createQuestionMutation = `
    mutation CreateQuestion($input: QuestionCreateInput!) {
      createQuestion(input: $input) {
        id
        title
        description
      }
    }
  `;

  const updateQuestionMutation = `
    mutation UpdateQuestion($id: Int!, $input: QuestionUpdateInput!) {
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

  it('should error if neither questionBankId nor interviewTemplateId is provided', async () => {
    const input = { title: 'Q', description: 'D' };
    const res = await graphqlCall({
      source: createQuestionMutation,
      variableValues: { input },
      userId: adminUser.id,
    });
    expect(res.errors?.[0].message).toBe(
      errorStrings.question.missingTemplateOrBank,
    );
  });

  it('should error if interviewTemplateId does not exist', async () => {
    const input = { title: 'Q', description: 'D', interviewTemplateId: 999999 };
    const res = await graphqlCall({
      source: createQuestionMutation,
      variableValues: { input },
      userId: adminUser.id,
    });
    expect(res.errors?.[0].message).toBe(
      errorStrings.interviewTemplate.notFound,
    );
  });

  it('should error if interview template is used in an interview', async () => {
    // Create an interview using the template
    await Interview.create({
      slug: 'int-' + Math.random().toString(36).substring(7) + '-' + Date.now(),
      status: InterviewStatus.PENDING,
      deadline: new Date(),
      interviewTemplate: interviewTemplate,
      user: adminUser,
      interviewer: interviewerUser,
    }).save();
    const input = {
      title: 'Q',
      description: 'D',
      interviewTemplateId: interviewTemplate.id,
    };
    const res = await graphqlCall({
      source: createQuestionMutation,
      variableValues: { input },
      userId: adminUser.id,
    });
    expect(res.errors?.[0].message).toBe(
      errorStrings.interviewTemplate.usedInInterview,
    );
  });

  it('should error if updating a question that is used in an interview', async () => {
    // Create a new template and question
    const temp = await InterviewTemplate.create({
      name: 'UpdateTest',
      description: 'desc',
      slug:
        'update-test-' +
        Math.random().toString(36).substring(7) +
        '-' +
        Date.now(),
    }).save();
    const q = await Question.create({
      title: 'Q',
      description: 'D',
    }).save();
    temp.questions = [q];
    await temp.save();
    // Create an interview using the template
    await Interview.create({
      slug:
        'int-update-' +
        Math.random().toString(36).substring(7) +
        '-' +
        Date.now(),
      status: InterviewStatus.PENDING,
      deadline: new Date(),
      interviewTemplate: temp,
      user: adminUser,
      interviewer: interviewerUser,
    }).save();
    const input = { title: 'New', description: 'New' };
    const res = await graphqlCall({
      source: updateQuestionMutation,
      variableValues: { id: q.id, input },
      userId: adminUser.id,
    });
    expect(res.errors?.[0].message).toBe(errorStrings.question.usedInInterview);
  });

  it('should return false when deleting a non-existent question', async () => {
    const res = await graphqlCall({
      source: deleteQuestionMutation,
      variableValues: { id: 999999 },
      userId: adminUser.id,
    });
    expect(res.data?.deleteQuestion).toBe(false);
  });

  it('should create a question with a questionBankId', async () => {
    const input = {
      title: 'Q',
      description: 'D',
      questionBankId: questionBank.id,
    };
    const res = await graphqlCall({
      source: createQuestionMutation,
      variableValues: { input },
      userId: adminUser.id,
    });
    expect(res.data?.createQuestion).toMatchObject({
      title: 'Q',
      description: 'D',
    });
    // Clean up
    const created = res.data?.createQuestion as any;
    if (created && typeof created.id === 'number') {
      await Question.delete(created.id);
    }
  });
});
