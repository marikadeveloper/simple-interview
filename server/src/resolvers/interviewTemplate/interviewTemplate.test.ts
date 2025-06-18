import { dataSource } from '../../';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { Tag } from '../../entities/Tag';
import { User, UserRole } from '../../entities/User';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';

let testUsers: User[] = [];
let testTags: Tag[] = [];

beforeAll(async () => {
  await setupTestDB();
});

// Close database connections after all tests
afterAll(async () => {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
  }
});

afterEach(async () => {
  // Clean up any data created during the test
  await InterviewTemplate.delete({});
  if (testUsers.length > 0) {
    await Promise.all(testUsers.map((user) => User.delete(user.id)));
    testUsers = [];
  }
  if (testTags.length > 0) {
    await Promise.all(testTags.map((tag) => Tag.delete(tag.id)));
    testTags = [];
  }
});

const createInterviewTemplateMutation = `
  mutation CreateInterviewTemplate($input: InterviewTemplateInput!) {
    createInterviewTemplate(input: $input) {
      id
      name
      description
      tags {
        id
        text
      }
    }
  }
`;
const getInterviewTemplatesQuery = `
  query GetInterviewTemplates {
    getInterviewTemplates {
      id
      name
      description
      tags {
        id
        text
      }
    }
  }
`;
const getInterviewTemplateQuery = `
  query GetInterviewTemplate($id: Int!) {
    getInterviewTemplate(id: $id) {
      id
      name
      description
      tags {
        id
        text
      }
      questions {
        id
        title
        description
      }
    }
  }
`;
const updateInterviewTemplateMutation = `
  mutation UpdateInterviewTemplate($id: Int!, $input: InterviewTemplateInput!) {
    updateInterviewTemplate(id: $id, input: $input) {
      id
      name
      description
    }
  }
`;
const deleteInterviewTemplateMutation = `
  mutation DeleteInterviewTemplate($id: Int!) {
    deleteInterviewTemplate(id: $id)
  }
`;

describe('interviewTemplate', () => {
  it('should create an interview template', async () => {
    const testInterviewer = await createFakeUser(UserRole.INTERVIEWER);
    testUsers.push(testInterviewer);
    const testTag = await Tag.create({ text: 'tag1' }).save();
    const testTag2 = await Tag.create({ text: 'tag2' }).save();
    testTags.push(testTag, testTag2);

    const input = {
      name: 'Test Interview Template',
      description: 'This is a test interview template',
      tagsIds: [testTag.id, testTag2.id],
    };

    const response = await graphqlCall({
      source: createInterviewTemplateMutation,
      variableValues: { input },
      userId: testInterviewer.id,
    });

    expect(response).toMatchObject({
      data: {
        createInterviewTemplate: {
          id: expect.any(Number),
          name: input.name,
          description: input.description,
          tags: [
            {
              id: testTag.id,
              text: testTag.text,
            },
            {
              id: testTag2.id,
              text: testTag2.text,
            },
          ],
        },
      },
    });
  });

  it('should get all interview templates', async () => {
    const testInterviewer = await createFakeUser(UserRole.INTERVIEWER);
    testUsers.push(testInterviewer);

    const response = await graphqlCall({
      source: getInterviewTemplatesQuery,
      userId: testInterviewer.id,
    });

    expect(response).toMatchObject({
      data: {
        getInterviewTemplates: expect.any(Array),
      },
    });
  });

  it('should get a specific interview template', async () => {
    const testInterviewer = await createFakeUser(UserRole.INTERVIEWER);
    testUsers.push(testInterviewer);

    const interviewTemplate = await InterviewTemplate.create({
      name: 'Test Interview Template',
      description: 'This is a test interview template',
      slug: 'test-interview-template-' + Date.now(),
    }).save();

    const response = await graphqlCall({
      source: getInterviewTemplateQuery,
      variableValues: { id: interviewTemplate.id },
      userId: testInterviewer.id,
    });

    expect(response).toMatchObject({
      data: {
        getInterviewTemplate: {
          id: interviewTemplate.id,
          name: interviewTemplate.name,
          description: interviewTemplate.description,
        },
      },
    });
  });

  it('should update an interview template', async () => {
    const testInterviewer = await createFakeUser(UserRole.INTERVIEWER);
    testUsers.push(testInterviewer);

    const interviewTemplate = await InterviewTemplate.create({
      name: 'Test Interview Template',
      description: 'This is a test interview template',
      slug: 'test-interview-template-' + Date.now(),
    }).save();

    const input = {
      name: 'Updated Interview Template',
      description: 'This is an updated test interview template',
    };

    const response = await graphqlCall({
      source: updateInterviewTemplateMutation,
      variableValues: { id: interviewTemplate.id, input },
      userId: testInterviewer.id,
    });

    expect(response).toMatchObject({
      data: {
        updateInterviewTemplate: {
          id: interviewTemplate.id,
          name: input.name,
          description: input.description,
        },
      },
    });
  });

  it('should delete an interview template', async () => {
    const testInterviewer = await createFakeUser(UserRole.INTERVIEWER);
    testUsers.push(testInterviewer);

    const interviewTemplate = await InterviewTemplate.create({
      name: 'Test Interview Template',
      description: 'This is a test interview template',
      slug: 'test-interview-template-' + Date.now(),
    }).save();

    const response = await graphqlCall({
      source: deleteInterviewTemplateMutation,
      variableValues: { id: interviewTemplate.id },
      userId: testInterviewer.id,
    });

    expect(response).toMatchObject({
      data: {
        deleteInterviewTemplate: true,
      },
    });
  });
});
