import { graphql, HttpResponse } from 'msw';

// Basic handlers for common GraphQL operations
export const handlers = [
  // Mock the 'Me' query for authentication (try both 'Me' and 'me')
  graphql.query('Me', () => {
    return HttpResponse.json({
      data: {
        me: {
          id: '1',
          email: 'test@example.com',
          fullName: 'Test User',
          role: 'ADMIN',
          isActive: true,
          __typename: 'User',
        },
      },
    });
  }),
  graphql.query('me', () => {
    return HttpResponse.json({
      data: {
        me: {
          id: '1',
          email: 'test@example.com',
          fullName: 'Test User',
          role: 'ADMIN',
          isActive: true,
          __typename: 'User',
        },
      },
    });
  }),

  // Mock login mutation
  graphql.mutation('Login', () => {
    return HttpResponse.json({
      data: {
        login: {
          id: '1',
          email: 'test@example.com',
          role: 'ADMIN',
          name: 'Test User',
        },
      },
    });
  }),

  // Mock logout mutation
  graphql.mutation('Logout', () => {
    return HttpResponse.json({
      data: {
        logout: true,
      },
    });
  }),

  // Mock create question mutation
  graphql.mutation('CreateQuestion', () => {
    return HttpResponse.json({
      data: {
        createQuestion: {
          id: '1',
          title: 'Test Question',
          description: 'Test Description',
        },
      },
    });
  }),

  // Mock update question mutation
  graphql.mutation('UpdateQuestion', () => {
    return HttpResponse.json({
      data: {
        updateQuestion: {
          id: '1',
          title: 'Updated Question',
          description: 'Updated Description',
        },
      },
    });
  }),

  // Mock delete question mutation
  graphql.mutation('DeleteQuestion', () => {
    return HttpResponse.json({
      data: {
        deleteQuestion: true,
      },
    });
  }),

  // Mock ChangePassword mutation
  graphql.mutation('ChangePassword', () => {
    return HttpResponse.json({
      data: {
        changePassword: {
          id: '1',
          email: 'test@example.com',
          fullName: 'Updated User',
          role: 'ADMIN',
          isActive: true,
          __typename: 'User',
        },
      },
    });
  }),

  // Mock UpdateUserName mutation
  graphql.mutation('UpdateUserName', () => {
    return HttpResponse.json({
      data: {
        updateUserName: {
          id: '1',
          email: 'test@example.com',
          fullName: 'Updated User',
          role: 'ADMIN',
          isActive: true,
          __typename: 'User',
        },
      },
    });
  }),

  // Catch-all for debugging
  graphql.operation(async ({ operationName }) => {
    // eslint-disable-next-line no-console
    console.warn('Unhandled GraphQL operation:', operationName);
    return HttpResponse.json({ data: null });
  }),
];
