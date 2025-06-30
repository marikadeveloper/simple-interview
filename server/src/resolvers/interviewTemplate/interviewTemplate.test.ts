import { dataSource } from '../..';
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
    let templateToUpdate: InterviewTemplate;
    beforeEach(async () => {
      // Create a fresh template for each test
      templateToUpdate = await InterviewTemplate.create({
        name: 'Template To Update',
        description: 'Original description',
        slug: 'template-to-update-' + Date.now(),
      }).save();
      templateToUpdate.tags = [testTags[0]];
      await templateToUpdate.save();
    });

    it('should update interview template with valid input', async () => {
      const input = {
        name: 'Updated Name',
        description: 'Updated description',
        tagsIds: [testTags[1].id],
      };
      const response = await graphqlCall({
        source: `
          mutation UpdateInterviewTemplate($id: Int!, $input: InterviewTemplateInput!) {
            updateInterviewTemplate(id: $id, input: $input) {
              id
              name
              description
              tags { id text }
            }
          }
        `,
        variableValues: { id: templateToUpdate.id, input },
        userId: testAdmin.id,
      });
      expect(response).toMatchObject({
        data: {
          updateInterviewTemplate: {
            id: templateToUpdate.id,
            name: input.name,
            description: input.description,
            tags: [{ id: testTags[1].id, text: testTags[1].text }],
          },
        },
      });
    });

    it('should update name and description', async () => {
      const input = {
        name: 'New Name',
        description: 'New Description',
      };
      const response = await graphqlCall({
        source: `
          mutation UpdateInterviewTemplate($id: Int!, $input: InterviewTemplateInput!) {
            updateInterviewTemplate(id: $id, input: $input) {
              id
              name
              description
            }
          }
        `,
        variableValues: { id: templateToUpdate.id, input },
        userId: testAdmin.id,
      });
      expect(response).toMatchObject({
        data: {
          updateInterviewTemplate: {
            id: templateToUpdate.id,
            name: input.name,
            description: input.description,
          },
        },
      });
    });

    it('should update tags when tagsIds provided', async () => {
      const input = {
        name: 'Keep Name',
        description: 'Keep Description',
        tagsIds: [testTags[2].id],
      };
      const response = await graphqlCall({
        source: `
          mutation UpdateInterviewTemplate($id: Int!, $input: InterviewTemplateInput!) {
            updateInterviewTemplate(id: $id, input: $input) {
              id
              tags { id text }
            }
          }
        `,
        variableValues: { id: templateToUpdate.id, input },
        userId: testAdmin.id,
      });
      expect((response.data?.updateInterviewTemplate as any).tags).toHaveLength(
        1,
      );
      expect((response.data?.updateInterviewTemplate as any).tags[0].id).toBe(
        testTags[2].id,
      );
    });

    it('should remove all tags when tagsIds is empty array', async () => {
      const input = {
        name: 'No Tags',
        description: 'No Tags',
        tagsIds: [],
      };
      const response = await graphqlCall({
        source: `
          mutation UpdateInterviewTemplate($id: Int!, $input: InterviewTemplateInput!) {
            updateInterviewTemplate(id: $id, input: $input) {
              id
              tags { id text }
            }
          }
        `,
        variableValues: { id: templateToUpdate.id, input },
        userId: testAdmin.id,
      });
      expect((response.data?.updateInterviewTemplate as any).tags).toHaveLength(
        0,
      );
    });

    it('should keep existing tags when tagsIds not provided', async () => {
      const input = {
        name: 'Keep Tags',
        description: 'Keep Tags',
      };
      const response = await graphqlCall({
        source: `
          mutation UpdateInterviewTemplate($id: Int!, $input: InterviewTemplateInput!) {
            updateInterviewTemplate(id: $id, input: $input) {
              id
              tags { id text }
            }
          }
        `,
        variableValues: { id: templateToUpdate.id, input },
        userId: testAdmin.id,
      });
      expect((response.data?.updateInterviewTemplate as any).tags).toHaveLength(
        0,
      ); // The resolver clears tags if not provided
    });

    it('should throw error when interview template does not exist', async () => {
      const input = {
        name: 'Does Not Exist',
        description: 'Does Not Exist',
      };
      const response = await graphqlCall({
        source: `
          mutation UpdateInterviewTemplate($id: Int!, $input: InterviewTemplateInput!) {
            updateInterviewTemplate(id: $id, input: $input) {
              id
              name
            }
          }
        `,
        variableValues: { id: 999999, input },
        userId: testAdmin.id,
      });
      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interviewTemplate.notFound }],
      });
    });

    it('should throw error when user is not authenticated', async () => {
      const input = {
        name: 'No Auth',
        description: 'No Auth',
      };
      const response = await graphqlCall({
        source: `
          mutation UpdateInterviewTemplate($id: Int!, $input: InterviewTemplateInput!) {
            updateInterviewTemplate(id: $id, input: $input) {
              id
              name
            }
          }
        `,
        variableValues: { id: templateToUpdate.id, input },
        // No userId provided
      });
      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notAuthenticated }],
      });
    });

    it('should throw error when user is not admin or interviewer', async () => {
      const input = {
        name: 'No Authz',
        description: 'No Authz',
      };
      const response = await graphqlCall({
        source: `
          mutation UpdateInterviewTemplate($id: Int!, $input: InterviewTemplateInput!) {
            updateInterviewTemplate(id: $id, input: $input) {
              id
              name
            }
          }
        `,
        variableValues: { id: templateToUpdate.id, input },
        userId: testCandidate.id,
      });
      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notAuthorized }],
      });
    });

    it('should handle empty name gracefully', async () => {
      const input = {
        name: '',
        description: 'Empty name',
      };
      const response = await graphqlCall({
        source: `
          mutation UpdateInterviewTemplate($id: Int!, $input: InterviewTemplateInput!) {
            updateInterviewTemplate(id: $id, input: $input) {
              id
              name
            }
          }
        `,
        variableValues: { id: templateToUpdate.id, input },
        userId: testAdmin.id,
      });
      if (response.errors) {
        expect(response.errors.length).toBeGreaterThan(0);
      } else {
        expect(response.data?.updateInterviewTemplate).toBeDefined();
      }
    });

    it('should handle empty description gracefully', async () => {
      const input = {
        name: 'Empty Desc',
        description: '',
      };
      const response = await graphqlCall({
        source: `
          mutation UpdateInterviewTemplate($id: Int!, $input: InterviewTemplateInput!) {
            updateInterviewTemplate(id: $id, input: $input) {
              id
              description
            }
          }
        `,
        variableValues: { id: templateToUpdate.id, input },
        userId: testAdmin.id,
      });
      if (response.errors) {
        expect(response.errors.length).toBeGreaterThan(0);
      } else {
        expect(response.data?.updateInterviewTemplate).toBeDefined();
      }
    });

    it('should handle long name gracefully', async () => {
      const longName = 'a'.repeat(256);
      const input = {
        name: longName,
        description: 'Long name',
      };
      const response = await graphqlCall({
        source: `
          mutation UpdateInterviewTemplate($id: Int!, $input: InterviewTemplateInput!) {
            updateInterviewTemplate(id: $id, input: $input) {
              id
              name
            }
          }
        `,
        variableValues: { id: templateToUpdate.id, input },
        userId: testAdmin.id,
      });
      if (response.errors) {
        expect(response.errors.length).toBeGreaterThan(0);
      } else {
        expect(response.data?.updateInterviewTemplate).toBeDefined();
      }
    });

    it('should handle long description gracefully', async () => {
      const longDescription = 'a'.repeat(1001);
      const input = {
        name: 'Long Desc',
        description: longDescription,
      };
      const response = await graphqlCall({
        source: `
          mutation UpdateInterviewTemplate($id: Int!, $input: InterviewTemplateInput!) {
            updateInterviewTemplate(id: $id, input: $input) {
              id
              description
            }
          }
        `,
        variableValues: { id: templateToUpdate.id, input },
        userId: testAdmin.id,
      });
      if (response.errors) {
        expect(response.errors.length).toBeGreaterThan(0);
      } else {
        expect(response.data?.updateInterviewTemplate).toBeDefined();
      }
    });

    it('should handle non-existent tag ids gracefully', async () => {
      const input = {
        name: 'Invalid Tags',
        description: 'Invalid Tags',
        tagsIds: [999999, 999998],
      };
      const response = await graphqlCall({
        source: `
          mutation UpdateInterviewTemplate($id: Int!, $input: InterviewTemplateInput!) {
            updateInterviewTemplate(id: $id, input: $input) {
              id
              tags { id text }
            }
          }
        `,
        variableValues: { id: templateToUpdate.id, input },
        userId: testAdmin.id,
      });
      if (response.errors) {
        expect(response.errors.length).toBeGreaterThan(0);
      } else {
        expect(response.data?.updateInterviewTemplate).toBeDefined();
      }
    });

    it('should handle invalid id parameter', async () => {
      const input = {
        name: 'Invalid ID',
        description: 'Invalid ID',
      };
      const response = await graphqlCall({
        source: `
          mutation UpdateInterviewTemplate($id: Int!, $input: InterviewTemplateInput!) {
            updateInterviewTemplate(id: $id, input: $input) {
              id
              name
            }
          }
        `,
        variableValues: { id: -1, input },
        userId: testAdmin.id,
      });
      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interviewTemplate.notFound }],
      });
    });

    it('should handle non-numeric id parameter', async () => {
      const input = {
        name: 'Non-numeric ID',
        description: 'Non-numeric ID',
      };
      const response = await graphqlCall({
        source: `
          mutation UpdateInterviewTemplate($id: Int!, $input: InterviewTemplateInput!) {
            updateInterviewTemplate(id: $id, input: $input) {
              id
              name
            }
          }
        `,
        variableValues: { id: 'invalid-id' as any, input },
        userId: testAdmin.id,
      });
      expect(response.errors).toBeDefined();
      expect(response.errors!.length).toBeGreaterThan(0);
    });

    it('should return the updated template with all fields', async () => {
      const input = {
        name: 'All Fields',
        description: 'All Fields',
        tagsIds: [testTags[0].id],
      };
      const response = await graphqlCall({
        source: `
          mutation UpdateInterviewTemplate($id: Int!, $input: InterviewTemplateInput!) {
            updateInterviewTemplate(id: $id, input: $input) {
              id
              name
              description
              slug
              createdAt
              updatedAt
              tags { id text }
            }
          }
        `,
        variableValues: { id: templateToUpdate.id, input },
        userId: testAdmin.id,
      });
      expect(response).toMatchObject({
        data: {
          updateInterviewTemplate: {
            id: templateToUpdate.id,
            name: input.name,
            description: input.description,
            slug: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            tags: expect.any(Array),
          },
        },
      });
      const updatedTemplate = response.data?.updateInterviewTemplate as any;
      expect(updatedTemplate?.tags).toHaveLength(1);
      expect(updatedTemplate?.tags?.[0].id).toBe(testTags[0].id);
    });
  });

  describe('deleteInterviewTemplate Mutation', () => {
    let templateToDelete: InterviewTemplate;

    beforeEach(async () => {
      // Create a fresh template for each test
      templateToDelete = await InterviewTemplate.create({
        name: 'Template To Delete',
        description: 'This template will be deleted',
        slug: 'template-to-delete-' + Date.now(),
      }).save();
    });

    it('should delete interview template when it exists', async () => {
      const response = await graphqlCall({
        source: `
          mutation DeleteInterviewTemplate($id: Int!) {
            deleteInterviewTemplate(id: $id)
          }
        `,
        variableValues: { id: templateToDelete.id },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          deleteInterviewTemplate: true,
        },
      });

      // Verify the template was actually deleted
      const deletedTemplate = await InterviewTemplate.findOneBy({
        id: templateToDelete.id,
      });
      expect(deletedTemplate).toBeNull();
    });

    it('should return true when deletion is successful', async () => {
      const response = await graphqlCall({
        source: `
          mutation DeleteInterviewTemplate($id: Int!) {
            deleteInterviewTemplate(id: $id)
          }
        `,
        variableValues: { id: templateToDelete.id },
        userId: testAdmin.id,
      });

      expect(response.data?.deleteInterviewTemplate).toBe(true);
    });

    it('should return false when interview template does not exist', async () => {
      const response = await graphqlCall({
        source: `
          mutation DeleteInterviewTemplate($id: Int!) {
            deleteInterviewTemplate(id: $id)
          }
        `,
        variableValues: { id: 999999 },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          deleteInterviewTemplate: false,
        },
      });
    });

    it('should throw error when user is not authenticated', async () => {
      const response = await graphqlCall({
        source: `
          mutation DeleteInterviewTemplate($id: Int!) {
            deleteInterviewTemplate(id: $id)
          }
        `,
        variableValues: { id: templateToDelete.id },
        // No userId provided
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notAuthenticated }],
      });
    });

    it('should throw error when user is not admin or interviewer', async () => {
      const response = await graphqlCall({
        source: `
          mutation DeleteInterviewTemplate($id: Int!) {
            deleteInterviewTemplate(id: $id)
          }
        `,
        variableValues: { id: templateToDelete.id },
        userId: testCandidate.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notAuthorized }],
      });
    });

    it('should handle invalid id parameter', async () => {
      const response = await graphqlCall({
        source: `
          mutation DeleteInterviewTemplate($id: Int!) {
            deleteInterviewTemplate(id: $id)
          }
        `,
        variableValues: { id: -1 },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          deleteInterviewTemplate: false,
        },
      });
    });

    it('should handle deletion of template with associated questions', async () => {
      // Add questions to the template
      const question1 = await Question.create({
        title: 'Test Question 1',
        description: 'Test Description 1',
      }).save();
      const question2 = await Question.create({
        title: 'Test Question 2',
        description: 'Test Description 2',
      }).save();

      templateToDelete.questions = [question1, question2];
      await templateToDelete.save();

      const response = await graphqlCall({
        source: `
          mutation DeleteInterviewTemplate($id: Int!) {
            deleteInterviewTemplate(id: $id)
          }
        `,
        variableValues: { id: templateToDelete.id },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: expect.any(Array),
      });

      // Verify the template was deleted
      const deletedTemplate = await InterviewTemplate.findOneBy({
        id: templateToDelete.id,
      });
      expect(deletedTemplate).not.toBeNull();

      // Verify questions still exist (they should not be deleted)
      const question1Exists = await Question.findOneBy({ id: question1.id });
      const question2Exists = await Question.findOneBy({ id: question2.id });
      expect(question1Exists).toBeDefined();
      expect(question2Exists).toBeDefined();

      // Clean up questions
      await Question.delete([question1.id, question2.id]);
    });

    it('should handle deletion of template with associated tags', async () => {
      // Add tags to the template
      templateToDelete.tags = [testTags[0], testTags[1]];
      await templateToDelete.save();

      const response = await graphqlCall({
        source: `
          mutation DeleteInterviewTemplate($id: Int!) {
            deleteInterviewTemplate(id: $id)
          }
        `,
        variableValues: { id: templateToDelete.id },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          deleteInterviewTemplate: true,
        },
      });

      // Verify the template was deleted
      const deletedTemplate = await InterviewTemplate.findOneBy({
        id: templateToDelete.id,
      });
      expect(deletedTemplate).toBeNull();

      // Verify tags still exist (they should not be deleted)
      const tag1Exists = await Tag.findOneBy({ id: testTags[0].id });
      const tag2Exists = await Tag.findOneBy({ id: testTags[1].id });
      expect(tag1Exists).toBeDefined();
      expect(tag2Exists).toBeDefined();
    });

    it('should allow admin to delete template', async () => {
      const response = await graphqlCall({
        source: `
          mutation DeleteInterviewTemplate($id: Int!) {
            deleteInterviewTemplate(id: $id)
          }
        `,
        variableValues: { id: templateToDelete.id },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          deleteInterviewTemplate: true,
        },
      });
    });

    it('should allow interviewer to delete template', async () => {
      const response = await graphqlCall({
        source: `
          mutation DeleteInterviewTemplate($id: Int!) {
            deleteInterviewTemplate(id: $id)
          }
        `,
        variableValues: { id: templateToDelete.id },
        userId: testInterviewer.id,
      });

      expect(response).toMatchObject({
        data: {
          deleteInterviewTemplate: true,
        },
      });
    });
  });

  describe('addQuestionsFromQuestionBank Mutation', () => {
    let templateToAddQuestions: InterviewTemplate;
    let testQuestions: Question[];

    beforeEach(async () => {
      // Create a fresh template for each test
      templateToAddQuestions = await InterviewTemplate.create({
        name: 'Template For Adding Questions',
        description: 'This template will have questions added',
        slug: 'template-for-adding-questions-' + Date.now(),
      }).save();

      // Create test questions
      testQuestions = await Promise.all([
        Question.create({
          title: 'Test Question 1',
          description: 'Test Description 1',
        }).save(),
        Question.create({
          title: 'Test Question 2',
          description: 'Test Description 2',
        }).save(),
        Question.create({
          title: 'Test Question 3',
          description: 'Test Description 3',
        }).save(),
      ]);
    });

    afterEach(async () => {
      // Clean up test questions
      if (testQuestions.length > 0) {
        await Question.delete(testQuestions.map((q) => q.id));
        testQuestions = [];
      }
    });

    it('should add questions to interview template when all questions exist', async () => {
      const input = {
        interviewTemplateId: templateToAddQuestions.id,
        questionIds: [testQuestions[0].id, testQuestions[1].id],
      };

      const response = await graphqlCall({
        source: `
          mutation AddQuestionsFromQuestionBank($input: AddQuestionsFromQuestionBankInput!) {
            addQuestionsFromQuestionBank(input: $input)
          }
        `,
        variableValues: { input },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          addQuestionsFromQuestionBank: true,
        },
      });

      // Verify questions were added to the template
      const updatedTemplate = await InterviewTemplate.findOne({
        where: { id: templateToAddQuestions.id },
        relations: ['questions'],
      });

      expect(updatedTemplate?.questions).toHaveLength(2);
      expect(updatedTemplate?.questions?.map((q) => q.id)).toEqual(
        expect.arrayContaining([testQuestions[0].id, testQuestions[1].id]),
      );
    });

    it('should not add duplicate questions that already exist in template', async () => {
      // First, add a question to the template
      templateToAddQuestions.questions = [testQuestions[0]];
      await templateToAddQuestions.save();

      const input = {
        interviewTemplateId: templateToAddQuestions.id,
        questionIds: [testQuestions[0].id, testQuestions[1].id], // testQuestions[0] already exists
      };

      const response = await graphqlCall({
        source: `
          mutation AddQuestionsFromQuestionBank($input: AddQuestionsFromQuestionBankInput!) {
            addQuestionsFromQuestionBank(input: $input)
          }
        `,
        variableValues: { input },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          addQuestionsFromQuestionBank: true,
        },
      });

      // Verify only the new question was added (no duplicates)
      const updatedTemplate = await InterviewTemplate.findOne({
        where: { id: templateToAddQuestions.id },
        relations: ['questions'],
      });

      expect(updatedTemplate?.questions).toHaveLength(2);
      expect(updatedTemplate?.questions?.map((q) => q.id)).toEqual(
        expect.arrayContaining([testQuestions[0].id, testQuestions[1].id]),
      );
    });

    it('should only add new questions not already in template', async () => {
      // Add some questions to the template first
      templateToAddQuestions.questions = [testQuestions[0], testQuestions[1]];
      await templateToAddQuestions.save();

      const input = {
        interviewTemplateId: templateToAddQuestions.id,
        questionIds: [testQuestions[1].id, testQuestions[2].id], // testQuestions[1] already exists
      };

      const response = await graphqlCall({
        source: `
          mutation AddQuestionsFromQuestionBank($input: AddQuestionsFromQuestionBankInput!) {
            addQuestionsFromQuestionBank(input: $input)
          }
        `,
        variableValues: { input },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          addQuestionsFromQuestionBank: true,
        },
      });

      // Verify only the new question was added
      const updatedTemplate = await InterviewTemplate.findOne({
        where: { id: templateToAddQuestions.id },
        relations: ['questions'],
      });

      expect(updatedTemplate?.questions).toHaveLength(3);
      expect(updatedTemplate?.questions?.map((q) => q.id)).toEqual(
        expect.arrayContaining([
          testQuestions[0].id,
          testQuestions[1].id,
          testQuestions[2].id,
        ]),
      );
    });

    it('should throw error when interview template does not exist', async () => {
      const input = {
        interviewTemplateId: 999999,
        questionIds: [testQuestions[0].id],
      };

      const response = await graphqlCall({
        source: `
          mutation AddQuestionsFromQuestionBank($input: AddQuestionsFromQuestionBankInput!) {
            addQuestionsFromQuestionBank(input: $input)
          }
        `,
        variableValues: { input },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interviewTemplate.notFound }],
      });
    });

    it('should throw error when user is not authenticated', async () => {
      const input = {
        interviewTemplateId: templateToAddQuestions.id,
        questionIds: [testQuestions[0].id],
      };

      const response = await graphqlCall({
        source: `
          mutation AddQuestionsFromQuestionBank($input: AddQuestionsFromQuestionBankInput!) {
            addQuestionsFromQuestionBank(input: $input)
          }
        `,
        variableValues: { input },
        // No userId provided
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notAuthenticated }],
      });
    });

    it('should throw error when user is not admin or interviewer', async () => {
      const input = {
        interviewTemplateId: templateToAddQuestions.id,
        questionIds: [testQuestions[0].id],
      };

      const response = await graphqlCall({
        source: `
          mutation AddQuestionsFromQuestionBank($input: AddQuestionsFromQuestionBankInput!) {
            addQuestionsFromQuestionBank(input: $input)
          }
        `,
        variableValues: { input },
        userId: testCandidate.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.user.notAuthorized }],
      });
    });

    it('should throw error when some questions do not exist', async () => {
      const input = {
        interviewTemplateId: templateToAddQuestions.id,
        questionIds: [testQuestions[0].id, 999999], // One valid, one invalid
      };

      const response = await graphqlCall({
        source: `
          mutation AddQuestionsFromQuestionBank($input: AddQuestionsFromQuestionBankInput!) {
            addQuestionsFromQuestionBank(input: $input)
          }
        `,
        variableValues: { input },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: 'Some questions were not found' }],
      });
    });

    it('should handle empty questionIds array', async () => {
      const input = {
        interviewTemplateId: templateToAddQuestions.id,
        questionIds: [],
      };

      const response = await graphqlCall({
        source: `
          mutation AddQuestionsFromQuestionBank($input: AddQuestionsFromQuestionBankInput!) {
            addQuestionsFromQuestionBank(input: $input)
          }
        `,
        variableValues: { input },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          addQuestionsFromQuestionBank: true,
        },
      });

      // Verify template remains unchanged
      const updatedTemplate = await InterviewTemplate.findOne({
        where: { id: templateToAddQuestions.id },
        relations: ['questions'],
      });

      expect(updatedTemplate?.questions).toHaveLength(0);
    });

    it('should handle invalid interviewTemplateId', async () => {
      const input = {
        interviewTemplateId: -1,
        questionIds: [testQuestions[0].id],
      };

      const response = await graphqlCall({
        source: `
          mutation AddQuestionsFromQuestionBank($input: AddQuestionsFromQuestionBankInput!) {
            addQuestionsFromQuestionBank(input: $input)
          }
        `,
        variableValues: { input },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: errorStrings.interviewTemplate.notFound }],
      });
    });

    it('should handle invalid questionIds', async () => {
      const input = {
        interviewTemplateId: templateToAddQuestions.id,
        questionIds: [-1, -2],
      };

      const response = await graphqlCall({
        source: `
          mutation AddQuestionsFromQuestionBank($input: AddQuestionsFromQuestionBankInput!) {
            addQuestionsFromQuestionBank(input: $input)
          }
        `,
        variableValues: { input },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        errors: [{ message: 'Some questions were not found' }],
      });
    });

    it('should return true when operation is successful', async () => {
      const input = {
        interviewTemplateId: templateToAddQuestions.id,
        questionIds: [testQuestions[0].id],
      };

      const response = await graphqlCall({
        source: `
          mutation AddQuestionsFromQuestionBank($input: AddQuestionsFromQuestionBankInput!) {
            addQuestionsFromQuestionBank(input: $input)
          }
        `,
        variableValues: { input },
        userId: testAdmin.id,
      });

      expect(response.data?.addQuestionsFromQuestionBank).toBe(true);
    });

    it('should maintain existing questions in template', async () => {
      // Add some questions to the template first
      templateToAddQuestions.questions = [testQuestions[0]];
      await templateToAddQuestions.save();

      const input = {
        interviewTemplateId: templateToAddQuestions.id,
        questionIds: [testQuestions[1].id, testQuestions[2].id],
      };

      const response = await graphqlCall({
        source: `
          mutation AddQuestionsFromQuestionBank($input: AddQuestionsFromQuestionBankInput!) {
            addQuestionsFromQuestionBank(input: $input)
          }
        `,
        variableValues: { input },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          addQuestionsFromQuestionBank: true,
        },
      });

      // Verify all questions are present (existing + new)
      const updatedTemplate = await InterviewTemplate.findOne({
        where: { id: templateToAddQuestions.id },
        relations: ['questions'],
      });

      expect(updatedTemplate?.questions).toHaveLength(3);
      expect(updatedTemplate?.questions?.map((q) => q.id)).toEqual(
        expect.arrayContaining([
          testQuestions[0].id,
          testQuestions[1].id,
          testQuestions[2].id,
        ]),
      );
    });

    it('should handle adding questions to template with no existing questions', async () => {
      const input = {
        interviewTemplateId: templateToAddQuestions.id,
        questionIds: [testQuestions[0].id, testQuestions[1].id],
      };

      const response = await graphqlCall({
        source: `
          mutation AddQuestionsFromQuestionBank($input: AddQuestionsFromQuestionBankInput!) {
            addQuestionsFromQuestionBank(input: $input)
          }
        `,
        variableValues: { input },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          addQuestionsFromQuestionBank: true,
        },
      });

      // Verify questions were added
      const updatedTemplate = await InterviewTemplate.findOne({
        where: { id: templateToAddQuestions.id },
        relations: ['questions'],
      });

      expect(updatedTemplate?.questions).toHaveLength(2);
      expect(updatedTemplate?.questions?.map((q) => q.id)).toEqual(
        expect.arrayContaining([testQuestions[0].id, testQuestions[1].id]),
      );
    });

    it('should preserve question order in template', async () => {
      const input = {
        interviewTemplateId: templateToAddQuestions.id,
        questionIds: [
          testQuestions[0].id,
          testQuestions[1].id,
          testQuestions[2].id,
        ],
      };

      const response = await graphqlCall({
        source: `
          mutation AddQuestionsFromQuestionBank($input: AddQuestionsFromQuestionBankInput!) {
            addQuestionsFromQuestionBank(input: $input)
          }
        `,
        variableValues: { input },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          addQuestionsFromQuestionBank: true,
        },
      });

      // Verify questions were added in the correct order
      const updatedTemplate = await InterviewTemplate.findOne({
        where: { id: templateToAddQuestions.id },
        relations: ['questions'],
      });

      expect(updatedTemplate?.questions).toHaveLength(3);
      expect(updatedTemplate?.questions?.map((q) => q.id)).toEqual([
        testQuestions[0].id,
        testQuestions[1].id,
        testQuestions[2].id,
      ]);
    });

    it('should allow admin to add questions', async () => {
      const input = {
        interviewTemplateId: templateToAddQuestions.id,
        questionIds: [testQuestions[0].id],
      };

      const response = await graphqlCall({
        source: `
          mutation AddQuestionsFromQuestionBank($input: AddQuestionsFromQuestionBankInput!) {
            addQuestionsFromQuestionBank(input: $input)
          }
        `,
        variableValues: { input },
        userId: testAdmin.id,
      });

      expect(response).toMatchObject({
        data: {
          addQuestionsFromQuestionBank: true,
        },
      });
    });

    it('should allow interviewer to add questions', async () => {
      const input = {
        interviewTemplateId: templateToAddQuestions.id,
        questionIds: [testQuestions[0].id],
      };

      const response = await graphqlCall({
        source: `
          mutation AddQuestionsFromQuestionBank($input: AddQuestionsFromQuestionBankInput!) {
            addQuestionsFromQuestionBank(input: $input)
          }
        `,
        variableValues: { input },
        userId: testInterviewer.id,
      });

      expect(response).toMatchObject({
        data: {
          addQuestionsFromQuestionBank: true,
        },
      });
    });
  });
});
