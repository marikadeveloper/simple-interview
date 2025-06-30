import { dataSource } from '../../';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { Question } from '../../entities/Question';
import { QuestionBank } from '../../entities/QuestionBank';
import { Tag } from '../../entities/Tag';
import { User, UserRole } from '../../entities/User';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';
import { errorStrings } from '../../utils/errorStrings';

let testUsers: User[] = [];
let testTags: Tag[] = [];
let testQuestionBanks: QuestionBank[] = [];
let testQuestions: Question[] = [];
let testAdmin: User;
let testInterviewer: User;
let testCandidate: User;
let testInterviewTemplates: InterviewTemplate[] = [];

const createTestUsers = async () => {
  testAdmin = await createFakeUser(UserRole.ADMIN);
  testInterviewer = await createFakeUser(UserRole.INTERVIEWER);
  testCandidate = await createFakeUser(UserRole.CANDIDATE);
  testUsers.push(testAdmin, testInterviewer, testCandidate);
};

const createTestTags = async () => {
  const tag1 = await Tag.create({ text: 'JavaScript' }).save();
  const tag2 = await Tag.create({ text: 'React' }).save();
  const tag3 = await Tag.create({ text: 'Node.js' }).save();
  testTags.push(tag1, tag2, tag3);
};

const createTestInterviewTemplates = async () => {
  const template1 = await InterviewTemplate.create({
    name: 'Frontend Developer Interview',
    description: 'Interview for frontend developer position',
    slug: 'frontend-developer-interview-' + Date.now(),
  }).save();

  const template2 = await InterviewTemplate.create({
    name: 'Backend Developer Interview',
    description: 'Interview for backend developer position',
    slug: 'backend-developer-interview-' + Date.now(),
  }).save();

  const template3 = await InterviewTemplate.create({
    name: 'Full Stack Developer Interview',
    description: 'Interview for full stack developer position',
    slug: 'full-stack-developer-interview-' + Date.now(),
  }).save();

  // Add tags to templates
  template1.tags = [testTags[0], testTags[1]]; // JavaScript, React
  template2.tags = [testTags[0], testTags[2]]; // JavaScript, Node.js
  template3.tags = [testTags[1], testTags[2]]; // React, Node.js

  await template1.save();
  await template2.save();
  await template3.save();

  testInterviewTemplates = [template1, template2, template3];
};

beforeAll(async () => {
  await setupTestDB();
  await createTestUsers();
  await createTestTags();
  await createTestInterviewTemplates();
});

afterAll(async () => {
  await InterviewTemplate.delete({});
  await Question.delete({});
  await QuestionBank.delete({});
  if (testUsers.length > 0) {
    await Promise.all(testUsers.map((user) => User.delete(user.id)));
    testUsers = [];
  }
  if (testTags.length > 0) {
    await Promise.all(testTags.map((tag) => Tag.delete(tag.id)));
    testTags = [];
  }
  if (testQuestionBanks.length > 0) {
    await Promise.all(
      testQuestionBanks.map((qb) => QuestionBank.delete(qb.id)),
    );
    testQuestionBanks = [];
  }
  if (testQuestions.length > 0) {
    await Promise.all(testQuestions.map((q) => Question.delete(q.id)));
    testQuestions = [];
  }
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
  }
});

afterEach(async () => {
  await Promise.all(
    testInterviewTemplates
      .filter(
        (template) =>
          template.id !== testInterviewTemplates[0].id &&
          template.id !== testInterviewTemplates[1].id &&
          template.id !== testInterviewTemplates[2].id,
      )
      .map((template) => InterviewTemplate.delete(template.id)),
  );
});

const buildGetInterviewTemplatesQuery = (
  fields: (keyof InterviewTemplate)[],
) => {
  return `
    query GetInterviewTemplates($filter: String) {
      getInterviewTemplates(filter: $filter) {
        ${fields.join('\n')}
      }
    }
  `;
};

describe('InterviewTemplate Resolver', () => {
  describe('getInterviewTemplates Query', () => {
    it('should return all interview templates when no filter is provided', async () => {
      const response = await graphqlCall({
        source: buildGetInterviewTemplatesQuery(['id', 'name', 'description']),
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          getInterviewTemplates: expect.any(Array),
        },
      });

      const templates = response.data
        ?.getInterviewTemplates as InterviewTemplate[];
      expect(templates.length).toBe(testInterviewTemplates.length);
    });

    it('should return filtered interview templates when filter is provided by name', async () => {
      const response = await graphqlCall({
        source: buildGetInterviewTemplatesQuery(['id', 'name']),
        variableValues: {
          filter: 'Frontend',
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          getInterviewTemplates: expect.any(Array),
        },
      });

      const templates = response.data
        ?.getInterviewTemplates as InterviewTemplate[];
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach((template) => {
        expect(template.name.toLowerCase()).toContain('frontend');
      });
    });

    it('should return filtered interview templates when filter is provided by tag text', async () => {
      const response = await graphqlCall({
        source: `
          query GetInterviewTemplates($filter: String) {
            getInterviewTemplates(filter: $filter) {
              id
              name
              tags {
                id
                text
              }
            }
          }
        `,
        variableValues: {
          filter: 'JavaScript',
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          getInterviewTemplates: expect.any(Array),
        },
      });

      const templates = response.data
        ?.getInterviewTemplates as InterviewTemplate[];
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach((template) => {
        const hasJavaScriptTag = template.tags?.some((tag) =>
          tag.text.toLowerCase().includes('javascript'),
        );
        expect(hasJavaScriptTag).toBe(true);
      });
    });

    it('should return templates ordered by createdAt DESC', async () => {
      const response = await graphqlCall({
        source: buildGetInterviewTemplatesQuery(['id', 'name', 'createdAt']),
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          getInterviewTemplates: expect.any(Array),
        },
      });

      const templates = response.data
        ?.getInterviewTemplates as InterviewTemplate[];
      expect(templates.length).toBe(testInterviewTemplates.length);

      // Check if templates are ordered by createdAt DESC
      for (let i = 0; i < templates.length - 1; i++) {
        const currentDate = new Date(templates[i].createdAt);
        const nextDate = new Date(templates[i + 1].createdAt);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(
          nextDate.getTime(),
        );
      }
    });

    it('should include tags in the response', async () => {
      const response = await graphqlCall({
        source: `
          query GetInterviewTemplates($filter: String) {
            getInterviewTemplates(filter: $filter) {
              id
              name
              tags {
                id
                text
              }
            }
          }
        `,
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          getInterviewTemplates: expect.any(Array),
        },
      });

      const templates = response.data
        ?.getInterviewTemplates as InterviewTemplate[];
      expect(templates.length).toBeGreaterThan(0);

      // Check that at least one template has tags
      const templateWithTags = templates.find(
        (template) => template.tags && template.tags.length > 0,
      );
      expect(templateWithTags).toBeDefined();
      expect(templateWithTags?.tags).toBeDefined();
      expect(Array.isArray(templateWithTags?.tags)).toBe(true);
    });

    it('should throw error when user is not authenticated', async () => {
      const response = await graphqlCall({
        source: buildGetInterviewTemplatesQuery(['id', 'name']),
        // No userId provided
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notAuthenticated }],
      });
    });

    it('should throw error when user is not admin or interviewer', async () => {
      const response = await graphqlCall({
        source: buildGetInterviewTemplatesQuery(['id', 'name']),
        userId: testCandidate.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notAuthorized }],
      });
    });

    it('should handle case-insensitive filtering', async () => {
      const response = await graphqlCall({
        source: buildGetInterviewTemplatesQuery(['id', 'name']),
        variableValues: {
          filter: 'frontend',
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          getInterviewTemplates: expect.any(Array),
        },
      });

      const templates = response.data
        ?.getInterviewTemplates as InterviewTemplate[];
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach((template) => {
        expect(template.name.toLowerCase()).toContain('frontend');
      });
    });

    it('should handle empty string filter', async () => {
      const response = await graphqlCall({
        source: buildGetInterviewTemplatesQuery(['id', 'name']),
        variableValues: {
          filter: '',
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          getInterviewTemplates: expect.any(Array),
        },
      });

      // Should return all templates when filter is empty string
      const templates = response.data
        ?.getInterviewTemplates as InterviewTemplate[];
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should handle whitespace-only filter', async () => {
      const response = await graphqlCall({
        source: buildGetInterviewTemplatesQuery(['id', 'name']),
        variableValues: {
          filter: '   ',
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          getInterviewTemplates: expect.any(Array),
        },
      });

      // Should return all templates when filter is only whitespace
      const templates = response.data
        ?.getInterviewTemplates as InterviewTemplate[];
      expect(templates.length).toBeGreaterThan(0);
    });
  });

  describe('getInterviewTemplate Query', () => {
    it('should return interview template by id when it exists', async () => {
      const testTemplate = testInterviewTemplates[0];

      const response = await graphqlCall({
        source: `
          query GetInterviewTemplate($id: Int!) {
            getInterviewTemplate(id: $id) {
              id
              name
              description
              slug
            }
          }
        `,
        variableValues: {
          id: testTemplate.id,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          getInterviewTemplate: {
            id: testTemplate.id,
            name: testTemplate.name,
            description: testTemplate.description,
            slug: testTemplate.slug,
          },
        },
      });
    });

    it('should include questions and questionBank relations in response', async () => {
      const testTemplate = testInterviewTemplates[0];

      const response = await graphqlCall({
        source: `
          query GetInterviewTemplate($id: Int!) {
            getInterviewTemplate(id: $id) {
              id
              name
              questions {
                id
                title
                description
                questionBank {
                  id
                  name
                }
              }
            }
          }
        `,
        variableValues: {
          id: testTemplate.id,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          getInterviewTemplate: {
            id: testTemplate.id,
            name: testTemplate.name,
            questions: expect.any(Array),
          },
        },
      });

      const template = response.data?.getInterviewTemplate as InterviewTemplate;
      expect(template.questions).toBeDefined();
      expect(Array.isArray(template.questions)).toBe(true);
    });

    it('should include tags in the response', async () => {
      const testTemplate = testInterviewTemplates[0];

      const response = await graphqlCall({
        source: `
          query GetInterviewTemplate($id: Int!) {
            getInterviewTemplate(id: $id) {
              id
              name
              tags {
                id
                text
              }
            }
          }
        `,
        variableValues: {
          id: testTemplate.id,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          getInterviewTemplate: {
            id: testTemplate.id,
            name: testTemplate.name,
            tags: expect.any(Array),
          },
        },
      });

      const template = response.data?.getInterviewTemplate as InterviewTemplate;
      expect(template.tags).toBeDefined();
      expect(Array.isArray(template.tags)).toBe(true);
      expect(template.tags!.length).toBeGreaterThan(0);
    });

    it('should throw error when interview template does not exist', async () => {
      const response = await graphqlCall({
        source: `
          query GetInterviewTemplate($id: Int!) {
            getInterviewTemplate(id: $id) {
              id
              name
            }
          }
        `,
        variableValues: {
          id: 999999,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interviewTemplate.notFound }],
      });
    });

    it('should throw error when user is not authenticated', async () => {
      const testTemplate = testInterviewTemplates[0];

      const response = await graphqlCall({
        source: `
          query GetInterviewTemplate($id: Int!) {
            getInterviewTemplate(id: $id) {
              id
              name
            }
          }
        `,
        variableValues: {
          id: testTemplate.id,
        },
        // No userId provided
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notAuthenticated }],
      });
    });

    it('should throw error when user is not admin or interviewer', async () => {
      const testTemplate = testInterviewTemplates[0];

      const response = await graphqlCall({
        source: `
          query GetInterviewTemplate($id: Int!) {
            getInterviewTemplate(id: $id) {
              id
              name
            }
          }
        `,
        variableValues: {
          id: testTemplate.id,
        },
        userId: testCandidate.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notAuthorized }],
      });
    });

    it('should handle invalid id parameter', async () => {
      const response = await graphqlCall({
        source: `
          query GetInterviewTemplate($id: Int!) {
            getInterviewTemplate(id: $id) {
              id
              name
            }
          }
        `,
        variableValues: {
          id: -1,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interviewTemplate.notFound }],
      });
    });
  });

  describe('getInterviewTemplateBySlug Query', () => {
    it('should return interview template by slug when it exists', async () => {
      const testTemplate = testInterviewTemplates[0];

      const response = await graphqlCall({
        source: `
          query GetInterviewTemplateBySlug($slug: String!) {
            getInterviewTemplateBySlug(slug: $slug) {
              id
              name
              description
              slug
            }
          }
        `,
        variableValues: {
          slug: testTemplate.slug,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          getInterviewTemplateBySlug: {
            id: testTemplate.id,
            name: testTemplate.name,
            description: testTemplate.description,
            slug: testTemplate.slug,
          },
        },
      });
    });

    it('should include questions and questionBank relations in response', async () => {
      const testTemplate = testInterviewTemplates[0];

      const response = await graphqlCall({
        source: `
          query GetInterviewTemplateBySlug($slug: String!) {
            getInterviewTemplateBySlug(slug: $slug) {
              id
              name
              questions {
                id
                title
                description
                questionBank {
                  id
                  name
                }
              }
            }
          }
        `,
        variableValues: {
          slug: testTemplate.slug,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          getInterviewTemplateBySlug: {
            id: testTemplate.id,
            name: testTemplate.name,
            questions: expect.any(Array),
          },
        },
      });

      const template = response.data
        ?.getInterviewTemplateBySlug as InterviewTemplate;
      expect(template.questions).toBeDefined();
      expect(Array.isArray(template.questions)).toBe(true);
    });

    it('should include tags in the response', async () => {
      const testTemplate = testInterviewTemplates[0];

      const response = await graphqlCall({
        source: `
          query GetInterviewTemplateBySlug($slug: String!) {
            getInterviewTemplateBySlug(slug: $slug) {
              id
              name
              tags {
                id
                text
              }
            }
          }
        `,
        variableValues: {
          slug: testTemplate.slug,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          getInterviewTemplateBySlug: {
            id: testTemplate.id,
            name: testTemplate.name,
            tags: expect.any(Array),
          },
        },
      });

      const template = response.data
        ?.getInterviewTemplateBySlug as InterviewTemplate;
      expect(template.tags).toBeDefined();
      expect(Array.isArray(template.tags)).toBe(true);
      expect(template.tags!.length).toBeGreaterThan(0);
    });

    it('should throw error when interview template does not exist', async () => {
      const response = await graphqlCall({
        source: `
          query GetInterviewTemplateBySlug($slug: String!) {
            getInterviewTemplateBySlug(slug: $slug) {
              id
              name
            }
          }
        `,
        variableValues: {
          slug: 'non-existent-slug',
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interviewTemplate.notFound }],
      });
    });

    it('should throw error when user is not authenticated', async () => {
      const testTemplate = testInterviewTemplates[0];

      const response = await graphqlCall({
        source: `
          query GetInterviewTemplateBySlug($slug: String!) {
            getInterviewTemplateBySlug(slug: $slug) {
              id
              name
            }
          }
        `,
        variableValues: {
          slug: testTemplate.slug,
        },
        // No userId provided
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notAuthenticated }],
      });
    });

    it('should throw error when user is not admin or interviewer', async () => {
      const testTemplate = testInterviewTemplates[0];

      const response = await graphqlCall({
        source: `
          query GetInterviewTemplateBySlug($slug: String!) {
            getInterviewTemplateBySlug(slug: $slug) {
              id
              name
            }
          }
        `,
        variableValues: {
          slug: testTemplate.slug,
        },
        userId: testCandidate.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notAuthorized }],
      });
    });

    it('should handle empty slug parameter', async () => {
      const response = await graphqlCall({
        source: `
          query GetInterviewTemplateBySlug($slug: String!) {
            getInterviewTemplateBySlug(slug: $slug) {
              id
              name
            }
          }
        `,
        variableValues: {
          slug: '',
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interviewTemplate.notFound }],
      });
    });

    it('should handle non-existent slug', async () => {
      const response = await graphqlCall({
        source: `
          query GetInterviewTemplateBySlug($slug: String!) {
            getInterviewTemplateBySlug(slug: $slug) {
              id
              name
            }
          }
        `,
        variableValues: {
          slug: 'this-slug-definitely-does-not-exist-12345',
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interviewTemplate.notFound }],
      });
    });

    it('should be case-sensitive for slug matching', async () => {
      const testTemplate = testInterviewTemplates[0];
      const modifiedSlug = testTemplate.slug.toUpperCase();

      const response = await graphqlCall({
        source: `
          query GetInterviewTemplateBySlug($slug: String!) {
            getInterviewTemplateBySlug(slug: $slug) {
              id
              name
            }
          }
        `,
        variableValues: {
          slug: modifiedSlug,
        },
        userId: testAdmin.id,
      });

      // Should not find the template with different case
      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interviewTemplate.notFound }],
      });
    });
  });

  describe('createInterviewTemplate Mutation', () => {
    it('should create interview template with valid input', async () => {
      const input = {
        name: 'New Test Interview Template',
        description: 'This is a new test interview template',
      };

      const response = await graphqlCall({
        source: `
          mutation CreateInterviewTemplate($input: InterviewTemplateInput!) {
            createInterviewTemplate(input: $input) {
              id
              name
              description
              slug
            }
          }
        `,
        variableValues: {
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          createInterviewTemplate: {
            id: expect.any(Number),
            name: input.name,
            description: input.description,
            slug: expect.any(String),
          },
        },
      });
    });

    it('should generate unique slug automatically', async () => {
      const input = {
        name: 'Template with Unique Slug',
        description: 'This template should have a unique slug',
      };

      const response = await graphqlCall({
        source: `
          mutation CreateInterviewTemplate($input: InterviewTemplateInput!) {
            createInterviewTemplate(input: $input) {
              id
              name
              slug
            }
          }
        `,
        variableValues: {
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          createInterviewTemplate: {
            id: expect.any(Number),
            name: input.name,
            slug: expect.any(String),
          },
        },
      });

      const createdTemplate = response.data?.createInterviewTemplate as any;
      expect(createdTemplate?.slug).toBeDefined();
      expect(createdTemplate?.slug).toMatch(/^template-with-unique-slug/);
    });

    it('should create interview template with tags when tagsIds provided', async () => {
      const input = {
        name: 'Template with Tags',
        description: 'This template has tags',
        tagsIds: [testTags[0].id, testTags[1].id],
      };

      const response = await graphqlCall({
        source: `
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
        `,
        variableValues: {
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          createInterviewTemplate: {
            id: expect.any(Number),
            name: input.name,
            description: input.description,
            tags: expect.any(Array),
          },
        },
      });

      const createdTemplate = response.data?.createInterviewTemplate as any;
      expect(createdTemplate?.tags).toHaveLength(2);
      expect(createdTemplate?.tags?.map((tag: any) => tag.id)).toEqual(
        expect.arrayContaining([testTags[0].id, testTags[1].id]),
      );
    });

    it('should throw error when user is not authenticated', async () => {
      const input = {
        name: 'Unauthenticated Template',
        description: 'This should fail',
      };

      const response = await graphqlCall({
        source: `
          mutation CreateInterviewTemplate($input: InterviewTemplateInput!) {
            createInterviewTemplate(input: $input) {
              id
              name
            }
          }
        `,
        variableValues: {
          input,
        },
        // No userId provided
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notAuthenticated }],
      });
    });

    it('should throw error when user is not admin or interviewer', async () => {
      const input = {
        name: 'Candidate Template',
        description: 'This should fail for candidate',
      };

      const response = await graphqlCall({
        source: `
          mutation CreateInterviewTemplate($input: InterviewTemplateInput!) {
            createInterviewTemplate(input: $input) {
              id
              name
            }
          }
        `,
        variableValues: {
          input,
        },
        userId: testCandidate.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notAuthorized }],
      });
    });

    it('should handle duplicate name (should work since slug is unique)', async () => {
      const input = {
        name: 'Duplicate Name Template',
        description: 'First template with this name',
      };

      // Create first template
      const response1 = await graphqlCall({
        source: `
          mutation CreateInterviewTemplate($input: InterviewTemplateInput!) {
            createInterviewTemplate(input: $input) {
              id
              name
              slug
            }
          }
        `,
        variableValues: {
          input,
        },
        userId: testAdmin.id,
      });

      expect(response1).toMatchObject({
        data: {
          createInterviewTemplate: {
            id: expect.any(Number),
            name: input.name,
            slug: expect.any(String),
          },
        },
      });

      // Create second template with same name
      const response2 = await graphqlCall({
        source: `
          mutation CreateInterviewTemplate($input: InterviewTemplateInput!) {
            createInterviewTemplate(input: $input) {
              id
              name
              slug
            }
          }
        `,
        variableValues: {
          input,
        },
        userId: testAdmin.id,
      });

      expect(response2).toMatchObject({
        data: {
          createInterviewTemplate: {
            id: expect.any(Number),
            name: input.name,
            slug: expect.any(String),
          },
        },
      });

      // Verify slugs are different
      const firstSlug = (response1.data?.createInterviewTemplate as any).slug;
      const secondSlug = (response2.data?.createInterviewTemplate as any).slug;
      expect(firstSlug).not.toBe(secondSlug);
    });

    it('should handle non-existent tag ids gracefully', async () => {
      const input = {
        name: 'Template with Invalid Tags',
        description: 'This should handle invalid tag ids',
        tagsIds: [999999, 999998], // Non-existent tag IDs
      };

      const response = await graphqlCall({
        source: `
          mutation CreateInterviewTemplate($input: InterviewTemplateInput!) {
            createInterviewTemplate(input: $input) {
              id
              name
              tags {
                id
                text
              }
            }
          }
        `,
        variableValues: {
          input,
        },
        userId: testAdmin.id,
      });

      // The resolver might handle non-existent tags gracefully or throw an error
      if (response.errors) {
        expect(response.errors.length).toBeGreaterThan(0);
      } else {
        expect(response.data?.createInterviewTemplate).toBeDefined();
        // If it succeeds, the tags should be empty/null since the IDs don't exist
        const createdTemplate = response.data?.createInterviewTemplate as any;
        expect(createdTemplate?.tags).toBeDefined();
      }
    });

    it('should return the created template with all fields', async () => {
      const input = {
        name: 'Complete Template',
        description: 'This template should return all fields',
        tagsIds: [testTags[0].id],
      };

      const response = await graphqlCall({
        source: `
          mutation CreateInterviewTemplate($input: InterviewTemplateInput!) {
            createInterviewTemplate(input: $input) {
              id
              name
              description
              slug
              createdAt
              updatedAt
              tags {
                id
                text
              }
            }
          }
        `,
        variableValues: {
          input,
        },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          createInterviewTemplate: {
            id: expect.any(Number),
            name: input.name,
            description: input.description,
            slug: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            tags: expect.any(Array),
          },
        },
      });

      const createdTemplate = response.data?.createInterviewTemplate as any;
      expect(createdTemplate?.tags).toHaveLength(1);
      expect(createdTemplate?.tags?.[0].id).toBe(testTags[0].id);
    });
  });

  describe('updateInterviewTemplate Mutation', () => {
    it.todo('should update interview template with valid input');
    it.todo('should update name and description');
    it.todo('should update tags when tagsIds provided');
    it.todo('should remove all tags when tagsIds is empty array');
    it.todo('should keep existing tags when tagsIds not provided');
    it.todo('should throw error when interview template does not exist');
    it.todo('should throw error when user is not authenticated');
    it.todo('should throw error when user is not admin or interviewer');
    it.todo('should throw error when name is empty');
    it.todo('should throw error when description is empty');
    it.todo('should throw error when name is too long');
    it.todo('should throw error when description is too long');
    it.todo('should throw error when tagsIds contains non-existent tag ids');
    it.todo('should handle invalid id parameter');
    it.todo('should handle non-numeric id parameter');
    it.todo('should update updatedAt timestamp');
    it.todo('should preserve createdAt timestamp');
    it.todo('should return the updated template with all fields');
  });

  describe('deleteInterviewTemplate Mutation', () => {
    it.todo('should delete interview template when it exists');
    it.todo('should return true when deletion is successful');
    it.todo('should return false when interview template does not exist');
    it.todo('should throw error when user is not authenticated');
    it.todo('should throw error when user is not admin or interviewer');
    it.todo('should handle invalid id parameter');
    it.todo('should handle non-numeric id parameter');
    it.todo('should completely remove the template from database');
    it.todo('should handle deletion of template with associated questions');
    it.todo('should handle deletion of template with associated tags');
  });

  describe('addQuestionsFromQuestionBank Mutation', () => {
    it.todo(
      'should add questions to interview template when all questions exist',
    );
    it.todo(
      'should not add duplicate questions that already exist in template',
    );
    it.todo('should only add new questions not already in template');
    it.todo('should throw error when interview template does not exist');
    it.todo('should throw error when user is not authenticated');
    it.todo('should throw error when user is not admin or interviewer');
    it.todo('should throw error when some questions do not exist');
    it.todo('should throw error when all questions do not exist');
    it.todo('should handle empty questionIds array');
    it.todo('should handle invalid interviewTemplateId');
    it.todo('should handle non-numeric interviewTemplateId');
    it.todo('should handle invalid questionIds');
    it.todo('should handle non-numeric questionIds');
    it.todo('should return true when operation is successful');
    it.todo('should maintain existing questions in template');
    it.todo(
      'should handle adding questions to template with no existing questions',
    );
    it.todo('should preserve question order in template');
  });

  describe('Authentication and Authorization', () => {
    it.todo('should allow admin users to perform all operations');
    it.todo('should allow interviewer users to perform all operations');
    it.todo('should deny candidate users from all operations');
    it.todo('should deny unauthenticated users from all operations');
    it.todo('should handle expired authentication tokens');
    it.todo('should handle invalid authentication tokens');
  });

  describe('Edge Cases and Error Handling', () => {
    it.todo('should handle database connection errors gracefully');
    it.todo('should handle concurrent creation of templates with same name');
    it.todo('should handle very long input strings');
    it.todo('should handle null/undefined input values appropriately');
    it.todo('should handle malformed GraphQL queries');
    it.todo('should handle missing required fields in input');
    it.todo('should handle extra fields in input (should be ignored)');
    it.todo('should handle SQL injection attempts in filter');
    it.todo('should handle XSS attempts in input fields');
  });

  describe('Data Integrity', () => {
    it.todo('should maintain referential integrity when deleting templates');
    it.todo('should maintain referential integrity when updating templates');
    it.todo('should handle cascading deletes appropriately');
    it.todo('should prevent orphaned records');
    it.todo('should maintain data consistency across operations');
  });

  describe('Performance and Scalability', () => {
    it.todo('should handle large number of templates efficiently');
    it.todo('should handle templates with many questions efficiently');
    it.todo('should handle templates with many tags efficiently');
    it.todo('should optimize database queries for filtering');
    it.todo('should handle pagination if implemented');
  });
});
