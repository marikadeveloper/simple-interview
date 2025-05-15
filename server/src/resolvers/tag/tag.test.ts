import { dataSource } from '../../';
import { Tag } from '../../entities/Tag';
import { User, UserRole } from '../../entities/User';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';
import { errorStrings } from '../../utils/errorStrings';

let testUsers: User[] = [];
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

  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
  }
});

const createTagMutation = `
  mutation CreateTag($text: String!) {
    createTag(text: $text) {
      id
      text
    }
  }
`;

const getTagsQuery = `
  query GetTags {
    getTags {
      id
      text
    }
  }
`;

const updateTagMutation = `
  mutation UpdateTag($id: Int!, $text: String!) {
    updateTag(id: $id, text: $text) {
      id
      text
    }
  }
`;

const deleteTagMutation = `
  mutation DeleteTag($id: Int!) {
    deleteTag(id: $id)
  }
`;

describe('TagResolver', () => {
  let adminUser: User;
  let interviewerUser: User;
  let candidateUser: User;

  beforeAll(async () => {
    // Create test users
    adminUser = await createFakeUser(UserRole.ADMIN);
    interviewerUser = await createFakeUser(UserRole.INTERVIEWER);
    candidateUser = await createFakeUser(UserRole.CANDIDATE);
    testUsers.push(adminUser, interviewerUser, candidateUser);
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
            id: expect.any(Number),
            text: tagText.toLowerCase(),
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
            id: expect.any(Number),
            text: tagText.toLowerCase(),
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
        createTag: null,
      },
      errors: [{ message: errorStrings.user.notAuthorized }],
    });
  });

  it('should not be able to create a tag without authentication', async () => {
    const response = await graphqlCall({
      source: createTagMutation,
      variableValues: { text: 'Test Tag' },
    });

    expect(response).toMatchObject({
      data: {
        createTag: null,
      },
      errors: [{ message: errorStrings.user.notAuthenticated }],
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
        createTag: null,
      },
      errors: [{ message: errorStrings.tag.emptyText }],
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
        createTag: null,
      },
      errors: [{ message: errorStrings.tag.duplicate }],
    });
  });

  it('should be able to get all tags', async () => {
    const tag = await Tag.create({
      text: 'test tag',
    }).save();
    testTags.push(tag);

    const response = await graphqlCall({
      source: getTagsQuery,
      userId: adminUser.id,
    });

    expect(response).toMatchObject({
      data: {
        getTags: [
          {
            id: expect.any(Number),
            text: tag.text,
          },
        ],
      },
    });
  });

  it('should be able to update a tag', async () => {
    const tag = await Tag.create({
      text: 'test tag',
    }).save();

    testTags.push(tag);

    const response = await graphqlCall({
      source: updateTagMutation,
      variableValues: { id: tag.id, text: 'updated tag' },
      userId: adminUser.id,
    });

    expect(response).toMatchObject({
      data: {
        updateTag: {
          id: tag.id,
          text: 'updated tag',
        },
      },
    });
  });

  it('should not be able to update a tag with an empty text', async () => {
    const tag = await Tag.create({
      text: 'test tag',
    }).save();

    testTags.push(tag);

    const response = await graphqlCall({
      source: updateTagMutation,
      variableValues: { id: tag.id, text: '' },
      userId: adminUser.id,
    });

    expect(response).toMatchObject({
      data: {
        updateTag: null,
      },
      errors: [{ message: errorStrings.tag.emptyText }],
    });
  });

  it('should be able to delete a tag', async () => {
    const tag = await Tag.create({
      text: 'test tag',
    }).save();

    const response = await graphqlCall({
      source: deleteTagMutation,
      variableValues: { id: tag.id },
      userId: adminUser.id,
    });
    expect(response).toMatchObject({
      data: {
        deleteTag: true,
      },
    });
  });
});
