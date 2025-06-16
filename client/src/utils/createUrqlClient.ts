import { Cache, cacheExchange, Resolver } from '@urql/exchange-graphcache';
import { Exchange, fetchExchange } from 'urql';
import { pipe, tap } from 'wonka';
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
} from '../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery.ts';

// Custom error exchange to handle errors globally
const errorExchange: Exchange =
  ({ forward }) =>
  (ops$) => {
    return pipe(
      forward(ops$),
      tap(({ error }) => {
        if (error) {
          console.log('Global error:', error);
          if (error?.message.includes('not authenticated')) {
            // go to login page
            window.location.href = '/login';
          }
        }
      }),
    );
  };

/** Creates a {@link Resolver} that combines pages of a primitive pagination field.
 */
// const cursorPagination = (): Resolver => {
//   return (_parent, fieldArgs, cache, info) => {
//     const { parentKey: entityKey, fieldName } = info;
//     // e.g. entityKey "Query", fieldName "posts"

//     const allFields = cache.inspectFields(entityKey);
//     const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
//     const size = fieldInfos.length;
//     if (size === 0) {
//       return undefined;
//     }

//     // check if data is in the cache and return it
//     const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
//     const itIsInTheCache = cache.resolve(
//       cache.resolve(entityKey, fieldKey) as string,
//       'posts',
//     );
//     info.partial = !itIsInTheCache;

//     let hasMore = true;
//     const results: string[] = [];
//     fieldInfos.forEach((fi) => {
//       const key = cache.resolve(entityKey, fi.fieldKey) as string;
//       const data = cache.resolve(key, 'posts') as string[];
//       const _hasMore = cache.resolve(key, 'hasMore');
//       if (!_hasMore) {
//         hasMore = _hasMore as boolean;
//       }
//       results.push(...data);
//     });

//     return { hasMore, posts: results, __typename: 'PaginatedPosts' };
//   };
// };

// const invalidateAll = (cache: Cache, queryName: string) => {
//   const allFields = cache.inspectFields('Query');
//   const fieldInfos = allFields.filter((info) => info.fieldName === queryName);
//   fieldInfos.forEach((fi) => {
//     cache.invalidate('Query', queryName, fi.arguments || {});
//   });
// };
const invalidateAll = (
  cache: Cache,
  name: string,
  args?: { input: { id: any } },
) =>
  args
    ? cache.invalidate({ __typename: name, id: args.input.id })
    : cache
        .inspectFields('Query')
        .filter((field) => field.fieldName === name)
        .forEach((field) => {
          cache.invalidate('Query', field.fieldKey);
        });

export const createUrqlClient = () => {
  let cookie = '';

  return {
    url: import.meta.env.VITE_API_URL || 'http://localhost:3000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
      headers: cookie ? { cookie } : undefined,
    },
    exchanges: [
      cacheExchange({
        keys: {
          Tag: () => null,
        },
        resolvers: {
          Query: {},
        },
        updates: {
          Mutation: {
            logout: (_result, _args, cache, _info) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null }),
              );
              // delete other cache
              invalidateAll(cache, 'getUsers');
              invalidateAll(cache, 'getInterviews');
            },

            login: (_result, _args, cache, _info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (!result.login) {
                    return query;
                  } else {
                    return {
                      me: result.login,
                    };
                  }
                },
              );
            },

            interviewerRegister: (_result, _args, cache, _info) => {
              invalidateAll(cache, 'getUsers');
            },
            createCandidateInvitation: (_result, _args, cache, _info) => {
              invalidateAll(cache, 'getCandidateInvitations');
            },
            deleteUser: (_result, _args, cache, _info) => {
              cache.invalidate({
                __typename: 'User',
                id: _args.id as number,
              });
            },

            createInterviewTemplate: (_result, _args, cache, _info) => {
              invalidateAll(cache, 'getInterviewTemplates');
            },
            updateInterviewTemplate: (_result, _args, cache, _info) => {
              cache.invalidate({
                __typename: 'InterviewTemplate',
                id: _args.id as number,
              });
            },
            updateInterviewTemplateTags: (_result, _args, cache, _info) => {
              cache.invalidate({
                __typename: 'InterviewTemplate',
                id: _args.id as number,
              });
            },
            deleteInterviewTemplate: (_result, _args, cache, _info) => {
              cache.invalidate({
                __typename: 'InterviewTemplate',
                id: _args.id as number,
              });
            },

            createTag: (_result, _args, cache, _info) => {
              invalidateAll(cache, 'getTags');
            },
            updateTag: (_result, _args, cache, _info) => {
              cache.invalidate({
                __typename: 'Tag',
                id: _args.id as number,
              });
            },
            deleteTag: (_result, _args, cache, _info) => {
              cache.invalidate({
                __typename: 'Tag',
                id: _args.id as number,
              });
            },

            createQuestion: (_result, _args, cache, _info) => {
              invalidateAll(cache, 'getInterviewTemplate');
              invalidateAll(cache, 'getQuestionBankBySlug');
            },
            updateQuestion: (_result, _args, cache, _info) => {
              cache.invalidate({
                __typename: 'Question',
                id: _args.id as number,
              });
            },
            deleteQuestion: (_result, _args, cache, _info) => {
              cache.invalidate({
                __typename: 'Question',
                id: _args.id as number,
              });
            },

            createInterview: (_result, _args, cache, _info) => {
              invalidateAll(cache, 'getInterviews');
            },
            updateInterview: (_result, _args, cache, _info) => {
              cache.invalidate({
                __typename: 'Interview',
                id: _args.id as number,
              });
            },
            deleteInterview: (_result, _args, cache, _info) => {
              cache.invalidate({
                __typename: 'Interview',
                id: _args.id as number,
              });
            },
            confirmInterviewCompletion: (_result, _args, cache, _info) => {
              cache.invalidate({
                __typename: 'Interview',
                id: _args.id as number,
              });
            },
            evaluateInterview: (_result, _args, cache, _info) => {
              cache.invalidate({
                __typename: 'Interview',
                id: _args.id as number,
              });
            },

            createQuestionBank: (_result, _args, cache, _info) => {
              invalidateAll(cache, 'getQuestionBanks');
            },
            updateQuestionBank: (_result, _args, cache, _info) => {
              cache.invalidate({
                __typename: 'QuestionBank',
                id: _args.id as number,
              });
            },
            deleteQuestionBank: (_result, _args, cache, _info) => {
              cache.invalidate({
                __typename: 'QuestionBank',
                id: _args.id as number,
              });
            },
            addQuestionsFromQuestionBank: (_result, _args, cache, _info) => {
              const input = _args.input as any;
              cache.invalidate({
                __typename: 'InterviewTemplate',
                id: input?.interviewTemplateId as number,
              });
            },

            // register: (_result, _args, cache, _info) => {
            //   betterUpdateQuery<RegisterMutation, MeQuery>(
            //     cache,
            //     { query: MeDocument },
            //     _result,
            //     (result, query) => {
            //       if (result.register.errors) {
            //         return query;
            //       } else {
            //         return {
            //           me: result.register.user,
            //         };
            //       }
            //     },
            //   );
            // },
          },
        },
      }),
      errorExchange,
      fetchExchange,
    ],
  };
};
