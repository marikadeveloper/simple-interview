import { graphql, GraphQLSchema } from 'graphql';
import { Maybe } from 'type-graphql';
import { createUserLoader } from '../loaders/createUserLoader';
import { createSchema } from '../utils/createSchema';

interface Options {
  source: string;
  variableValues?: Maybe<{
    readonly [variable: string]: any;
  }>;
  userId?: number;
}

let schema: GraphQLSchema;

export const graphqlCall = async ({
  source,
  variableValues,
  userId,
}: Options) => {
  if (!schema) {
    schema = await createSchema();
  }
  return graphql({
    schema,
    source,
    variableValues,
    contextValue: {
      req: {
        session: {
          userId,
          destroy: jest.fn((callback) => {
            callback(userId ? null : 'DESTROY_TEST_ERROR');
          }),
        },
      },
      res: {
        clearCookie: jest.fn(),
      },
      redis: {
        get: jest.fn().mockResolvedValue(userId ? userId.toString() : null),
        set: jest.fn(),
        del: jest.fn().mockResolvedValue(true),
      },
      userLoader: createUserLoader(),
    },
  });
};
