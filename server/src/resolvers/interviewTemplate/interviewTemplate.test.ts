import { dataSource } from '../../';
import { InterviewTemplate } from '../../entities/InterviewTemplate';
import { User } from '../../entities/User';
import { setupTestDB } from '../../test-utils/testSetup';

let testUsers: User[] = [];

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
  await InterviewTemplate.clear();
  if (testUsers.length > 0) {
    await Promise.all(testUsers.map((user) => User.delete(user.id)));
    testUsers = [];
  }
});

const createInterviewTemplateMutation = `
  mutation CreateInterviewTemplate($input: InterviewTemplateInput!) {
    createInterviewTemplate(input: $input) {
      id
      name
      description
      questions {
        id
        question
        type
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
    }
  }
`;
