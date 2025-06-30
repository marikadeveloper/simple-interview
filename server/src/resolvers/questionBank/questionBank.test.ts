import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { Question } from '../../entities/Question';
import { QuestionBank } from '../../entities/QuestionBank';
import { User, UserRole } from '../../entities/User';
import { graphqlCall } from '../../test-utils/graphqlCall';
import { createFakeUser } from '../../test-utils/mockData';
import { setupTestDB } from '../../test-utils/testSetup';

describe('QuestionBank Resolver', () => {
  let adminUser: User;
  let interviewerUser: User;
  let candidateUser: User;

  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    // Clear database before each test
    await QuestionBank.delete({});
    await InterviewTemplate.delete({});
    await Question.delete({});
    await User.delete({});

    // Create test users
    adminUser = await createFakeUser(UserRole.ADMIN);
    interviewerUser = await createFakeUser(UserRole.INTERVIEWER);
    candidateUser = await createFakeUser(UserRole.CANDIDATE);
  });

  afterAll(async () => {
    // Clean up all created entities after all tests
    await QuestionBank.delete({});
    await InterviewTemplate.delete({});
    await Question.delete({});
    await User.delete({});
  });

  describe('questionBanks query', () => {
    it('should return all question banks when no filter is provided', async () => {
      // Create test question banks
      const questionBank1 = await QuestionBank.create({
        name: 'JavaScript Questions',
        slug: 'javascript-questions',
      }).save();

      const questionBank2 = await QuestionBank.create({
        name: 'Python Questions',
        slug: 'python-questions',
      }).save();

      const response = await graphqlCall({
        source: `
          query {
            questionBanks {
              id
              name
              slug
            }
          }
        `,
      });

      expect(response.errors).toBeUndefined();
      expect(response).toMatchObject({
        data: {
          questionBanks: expect.arrayContaining([
            expect.objectContaining({
              id: questionBank1.id,
              name: 'JavaScript Questions',
              slug: 'javascript-questions',
            }),
            expect.objectContaining({
              id: questionBank2.id,
              name: 'Python Questions',
              slug: 'python-questions',
            }),
          ]),
        },
      });
      expect((response.data as any)?.questionBanks).toHaveLength(2);
    });

    it('should filter question banks by name', async () => {
      // Create test question banks
      await QuestionBank.create({
        name: 'JavaScript Questions',
        slug: 'javascript-questions',
      }).save();

      await QuestionBank.create({
        name: 'Python Questions',
        slug: 'python-questions',
      }).save();

      const response = await graphqlCall({
        source: `
          query GetQuestionBanks($filter: String) {
            questionBanks(filter: $filter) {
              id
              name
              slug
            }
          }
        `,
        variableValues: {
          filter: 'javascript',
        },
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.questionBanks).toHaveLength(1);
      expect(((response.data as any)?.questionBanks[0] as any).name).toBe(
        'JavaScript Questions',
      );
    });

    it('should return empty array when filter matches no question banks', async () => {
      await QuestionBank.create({
        name: 'JavaScript Questions',
        slug: 'javascript-questions',
      }).save();

      const response = await graphqlCall({
        source: `
          query GetQuestionBanks($filter: String) {
            questionBanks(filter: $filter) {
              id
              name
              slug
            }
          }
        `,
        variableValues: {
          filter: 'nonexistent',
        },
      });

      expect(response.errors).toBeUndefined();
      expect((response.data as any)?.questionBanks).toHaveLength(0);
    });

    it('should handle case-insensitive filtering', async () => {
      await QuestionBank.create({
        name: 'JavaScript Questions',
        slug: 'javascript-questions',
      }).save();

      const response = await graphqlCall({
        source: `
          query GetQuestionBanks($filter: String) {
            questionBanks(filter: $filter) {
              id
              name
              slug
            }
          }
        `,
        variableValues: {
          filter: 'JAVASCRIPT',
        },
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.questionBanks).toHaveLength(1);
      expect(((response.data as any)?.questionBanks[0] as any).name).toBe(
        'JavaScript Questions',
      );
    });
  });

  describe('getQuestionBank query', () => {
    it('should return question bank by id for authenticated admin user', async () => {
      const questionBank = await QuestionBank.create({
        name: 'Test Question Bank',
        slug: 'test-question-bank',
      }).save();

      const response = await graphqlCall({
        source: `
          query GetQuestionBank($id: Int!) {
            getQuestionBank(id: $id) {
              id
              name
              slug
              questions {
                id
              }
            }
          }
        `,
        variableValues: {
          id: questionBank.id,
        },
        userId: adminUser.id,
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.getQuestionBank).toEqual({
        id: questionBank.id,
        name: 'Test Question Bank',
        slug: 'test-question-bank',
        questions: [],
      });
    });

    it('should return question bank by id for authenticated interviewer user', async () => {
      const questionBank = await QuestionBank.create({
        name: 'Test Question Bank',
        slug: 'test-question-bank',
      }).save();

      const response = await graphqlCall({
        source: `
          query GetQuestionBank($id: Int!) {
            getQuestionBank(id: $id) {
              id
              name
              slug
            }
          }
        `,
        variableValues: {
          id: questionBank.id,
        },
        userId: interviewerUser.id,
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.getQuestionBank).toBeDefined();
    });

    it('should throw error for unauthenticated user', async () => {
      const questionBank = await QuestionBank.create({
        name: 'Test Question Bank',
        slug: 'test-question-bank',
      }).save();

      const response = await graphqlCall({
        source: `
          query GetQuestionBank($id: Int!) {
            getQuestionBank(id: $id) {
              id
              name
              slug
            }
          }
        `,
        variableValues: {
          id: questionBank.id,
        },
      });

      expect(response.errors).toBeDefined();
      expect(response.errors![0].message).toContain('not authenticated');
    });

    it('should throw error for candidate user', async () => {
      const questionBank = await QuestionBank.create({
        name: 'Test Question Bank',
        slug: 'test-question-bank',
      }).save();

      const response = await graphqlCall({
        source: `
          query GetQuestionBank($id: Int!) {
            getQuestionBank(id: $id) {
              id
              name
              slug
            }
          }
        `,
        variableValues: {
          id: questionBank.id,
        },
        userId: candidateUser.id,
      });

      expect(response.errors).toBeDefined();
      expect(response.errors![0].message).toContain('not authorized');
    });

    it('should throw error when question bank not found', async () => {
      const response = await graphqlCall({
        source: `
          query GetQuestionBank($id: Int!) {
            getQuestionBank(id: $id) {
              id
              name
              slug
            }
          }
        `,
        variableValues: {
          id: 999,
        },
        userId: adminUser.id,
      });

      expect(response.errors).toBeDefined();
      expect(response.errors![0].message).toBe('question bank not found');
    });
  });

  describe('getQuestionBankBySlug query', () => {
    it('should return question bank by slug for authenticated admin user', async () => {
      const questionBank = await QuestionBank.create({
        name: 'Test Question Bank',
        slug: 'test-question-bank',
      }).save();

      const response = await graphqlCall({
        source: `
          query GetQuestionBankBySlug($slug: String!) {
            getQuestionBankBySlug(slug: $slug) {
              id
              name
              slug
              questions {
                id
              }
            }
          }
        `,
        variableValues: {
          slug: 'test-question-bank',
        },
        userId: adminUser.id,
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.getQuestionBankBySlug).toEqual({
        id: questionBank.id,
        name: 'Test Question Bank',
        slug: 'test-question-bank',
        questions: [],
      });
    });

    it('should return null when question bank not found by slug', async () => {
      const response = await graphqlCall({
        source: `
          query GetQuestionBankBySlug($slug: String!) {
            getQuestionBankBySlug(slug: $slug) {
              id
              name
              slug
            }
          }
        `,
        variableValues: {
          slug: 'nonexistent-slug',
        },
        userId: adminUser.id,
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.getQuestionBankBySlug).toBeNull();
    });
  });

  describe('createQuestionBank mutation', () => {
    it('should create question bank for authenticated admin user', async () => {
      const response = await graphqlCall({
        source: `
          mutation CreateQuestionBank($input: QuestionBankInput!) {
            createQuestionBank(input: $input) {
              id
              name
              slug
            }
          }
        `,
        variableValues: {
          input: {
            name: 'New Question Bank',
          },
        },
        userId: adminUser.id,
      });

      expect(response.errors).toBeUndefined();
      expect((response.data as any)?.createQuestionBank).toBeDefined();
      expect(((response.data as any)?.createQuestionBank as any).name).toBe(
        'New Question Bank',
      );
      expect(((response.data as any)?.createQuestionBank as any).slug).toMatch(
        /new-question-bank/,
      );
    });

    it('should create question bank for authenticated interviewer user', async () => {
      const response = await graphqlCall({
        source: `
          mutation CreateQuestionBank($input: QuestionBankInput!) {
            createQuestionBank(input: $input) {
              id
              name
              slug
            }
          }
        `,
        variableValues: {
          input: {
            name: 'Interviewer Question Bank',
          },
        },
        userId: interviewerUser.id,
      });

      expect(response.errors).toBeUndefined();
      expect((response.data as any)?.createQuestionBank).toBeDefined();
    });

    it('should throw error for unauthenticated user', async () => {
      const response = await graphqlCall({
        source: `
          mutation CreateQuestionBank($input: QuestionBankInput!) {
            createQuestionBank(input: $input) {
              id
              name
              slug
            }
          }
        `,
        variableValues: {
          input: {
            name: 'New Question Bank',
          },
        },
      });

      expect(response.errors).toBeDefined();
      expect(response.errors![0].message).toContain('not authenticated');
    });

    it('should generate unique slug for question banks with same name', async () => {
      // Create first question bank
      await graphqlCall({
        source: `
          mutation CreateQuestionBank($input: QuestionBankInput!) {
            createQuestionBank(input: $input) {
              id
              name
              slug
            }
          }
        `,
        variableValues: {
          input: {
            name: 'Test Question Bank',
          },
        },
        userId: adminUser.id,
      });

      // Create second question bank with same name
      const response = await graphqlCall({
        source: `
          mutation CreateQuestionBank($input: QuestionBankInput!) {
            createQuestionBank(input: $input) {
              id
              name
              slug
            }
          }
        `,
        variableValues: {
          input: {
            name: 'Test Question Bank',
          },
        },
        userId: adminUser.id,
      });

      expect(response.errors).toBeUndefined();
      expect((response.data as any)?.createQuestionBank).toBeDefined();
      expect(((response.data as any)?.createQuestionBank as any).slug).toMatch(
        /test-question-bank-\d+/,
      );
    });
  });

  describe('updateQuestionBank mutation', () => {
    it('should update question bank name for authenticated admin user', async () => {
      const questionBank = await QuestionBank.create({
        name: 'Original Name',
        slug: 'original-name',
      }).save();

      const response = await graphqlCall({
        source: `
          mutation UpdateQuestionBank($id: Int!, $name: String!) {
            updateQuestionBank(id: $id, name: $name) {
              id
              name
              slug
            }
          }
        `,
        variableValues: {
          id: questionBank.id,
          name: 'Updated Name',
        },
        userId: adminUser.id,
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.updateQuestionBank).toEqual({
        id: questionBank.id,
        name: 'Updated Name',
        slug: 'original-name', // slug should remain unchanged
      });
    });

    it('should throw error when question bank not found', async () => {
      const response = await graphqlCall({
        source: `
          mutation UpdateQuestionBank($id: Int!, $name: String!) {
            updateQuestionBank(id: $id, name: $name) {
              id
              name
              slug
            }
          }
        `,
        variableValues: {
          id: 999,
          name: 'Updated Name',
        },
        userId: adminUser.id,
      });

      expect(response.errors).toBeDefined();
      expect(response.errors![0].message).toBe('question bank not found');
    });
  });

  describe('deleteQuestionBank mutation', () => {
    it('should delete question bank when not in use', async () => {
      const questionBank = await QuestionBank.create({
        name: 'Test Question Bank',
        slug: 'test-question-bank',
      }).save();

      const response = await graphqlCall({
        source: `
          mutation DeleteQuestionBank($id: Int!) {
            deleteQuestionBank(id: $id)
          }
        `,
        variableValues: {
          id: questionBank.id,
        },
        userId: adminUser.id,
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.deleteQuestionBank).toBe(true);

      // Verify question bank is deleted
      const deletedQuestionBank = await QuestionBank.findOneBy({
        id: questionBank.id,
      });
      expect(deletedQuestionBank).toBeNull();
    });

    it('should throw error when question bank not found', async () => {
      const response = await graphqlCall({
        source: `
          mutation DeleteQuestionBank($id: Int!) {
            deleteQuestionBank(id: $id)
          }
        `,
        variableValues: {
          id: 999,
        },
        userId: adminUser.id,
      });

      expect(response.errors).toBeDefined();
      expect(response.errors![0].message).toBe('question bank not found');
    });

    it('should throw error when question bank is in use by interview template', async () => {
      // Create question bank
      const questionBank = await QuestionBank.create({
        name: 'Test Question Bank',
        slug: 'test-question-bank',
      }).save();

      // Create question in the question bank
      const question = await Question.create({
        title: 'Test Question',
        description: 'Test Description',
        questionBank: questionBank,
      }).save();

      // Create interview template that uses the question bank
      await InterviewTemplate.create({
        name: 'Test Template',
        slug: 'test-template',
        description: 'Test Description',
        questions: [question],
      }).save();

      const response = await graphqlCall({
        source: `
          mutation DeleteQuestionBank($id: Int!) {
            deleteQuestionBank(id: $id)
          }
        `,
        variableValues: {
          id: questionBank.id,
        },
        userId: adminUser.id,
      });

      expect(response.errors).toBeDefined();
      expect(response.errors![0].message).toBe(
        'question bank is used in an interview template',
      );
    });
  });
});
