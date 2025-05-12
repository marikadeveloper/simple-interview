import { dataSource } from '../../';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { Tag } from '../../entities/Tag';
import { User, UserRole } from '../../entities/User';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';

let testUsers: User[] = [];
let testInterviewTemplate: InterviewTemplate;
let testTags: Tag[] = [];

// Set up the database connection before all tests
beforeAll(async () => {
  await setupTestDB();
});

afterEach(async () => {
  if (testTags.length > 0) {
    await Promise.all(testTags.map((tag) => Tag.delete(tag.id)));
    testTags = [];
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

const createInterviewTemplate = () => {
  return InterviewTemplate.create({
    name: 'Test Interview Template',
    description: 'This is a test interview template',
  }).save();
};

const createTagMutation = `
  mutation CreateTag($text: String!) {
    createTag(text: $text) {
      tag {
        id
        text
      }
      errors {
        field
        message
      }
    }
  }
`;

describe('TagResolver', () => {
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
    console.log(interviewTemplateId);
  });

  describe('should be able to create a tag', () => {
    const tagText = 'Test Tag';

    it('as an admin', async () => {
      const response = await graphqlCall({
        source: createTagMutation,
        variableValues: { text: tagText },
        userId: adminUser.id,
      });

      expect(response).toMatchObject({
        data: {
          createTag: {
            tag: {
              id: expect.any(Number),
              text: tagText.toLowerCase(),
            },
            errors: null,
          },
        },
      });

      const createdTag = await Tag.findOneBy({
        text: tagText.toLowerCase(),
      });
      testTags.push(createdTag!);
    });

    it('as an interviewer', async () => {
      const response = await graphqlCall({
        source: createTagMutation,
        variableValues: { text: tagText },
        userId: interviewerUser.id,
      });

      expect(response).toMatchObject({
        data: {
          createTag: {
            tag: {
              id: expect.any(Number),
              text: tagText.toLowerCase(),
            },
            errors: null,
          },
        },
      });

      const createdTag = await Tag.findOneBy({
        text: tagText.toLowerCase(),
      });
      testTags.push(createdTag!);
    });
  });

  it('should not be able to create a tag as a candidate', async () => {
    const response = await graphqlCall({
      source: createTagMutation,
      variableValues: { text: 'Test Tag' },
      userId: candidateUser.id,
    });

    expect(response).toMatchObject({
      data: {
        createTag: {
          tag: null,
          errors: [{ message: 'not authorized', field: 'general' }],
        },
      },
    });
  });

  it('should not be able to create a tag without authentication', async () => {
    const response = await graphqlCall({
      source: createTagMutation,
      variableValues: { text: 'Test Tag' },
    });

    expect(response).toMatchObject({
      data: {
        createTag: {
          tag: null,
          errors: [{ message: 'User not logged in', field: 'general' }],
        },
      },
    });
  });

  it('should not be able to create a tag with an empty text', async () => {
    const response = await graphqlCall({
      source: createTagMutation,
      variableValues: { text: '' },
      userId: adminUser.id,
    });

    expect(response).toMatchObject({
      data: {
        createTag: {
          tag: null,
          errors: [{ message: 'Tag cannot be empty', field: 'text' }],
        },
      },
    });
  });

  it('should not be able to create a tag with an existing text', async () => {
    const existingTag = await Tag.create({
      text: 'existing tag',
    }).save();
    testTags.push(existingTag);

    const response = await graphqlCall({
      source: createTagMutation,
      variableValues: { text: existingTag.text },
      userId: adminUser.id,
    });

    expect(response).toMatchObject({
      data: {
        createTag: {
          tag: null,
          errors: [{ message: 'Tag already exists', field: 'text' }],
        },
      },
    });
  });
});
