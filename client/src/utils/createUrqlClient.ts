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

const invalidateAll = (cache: Cache, queryName: string) => {
  const allFields = cache.inspectFields('Query');
  const fieldInfos = allFields.filter((info) => info.fieldName === queryName);
  fieldInfos.forEach((fi) => {
    cache.invalidate('Query', queryName, fi.arguments || {});
  });
};

export const createUrqlClient = () => {
  let cookie = '';

  return {
    url: 'http://localhost:4000/graphql',
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
              invalidateAll(cache, 'getUsers');
            },

            createInterviewTemplate: (_result, _args, cache, _info) => {
              invalidateAll(cache, 'getInterviewTemplates');
            },
            updateInterviewTemplate: (_result, _args, cache, _info) => {
              invalidateAll(cache, 'getInterviewTemplates');
            },
            updateInterviewTemplateTags: (_result, _args, cache, _info) => {
              invalidateAll(cache, 'getInterviewTemplates');
            },
            deleteInterviewTemplate: (_result, _args, cache, _info) => {
              invalidateAll(cache, 'getInterviewTemplates');
            },

            createTag: (_result, _args, cache, _info) => {
              invalidateAll(cache, 'getTags');
            },
            updateTag: (_result, _args, cache, _info) => {
              invalidateAll(cache, 'getTags');
            },
            deleteTag: (_result, _args, cache, _info) => {
              invalidateAll(cache, 'getTags');
            },

            createQuestion: (_result, _args, cache, _info) => {
              invalidateAll(cache, 'getInterviewTemplate');
            },
            updateQuestion: (_result, _args, cache, _info) => {
              invalidateAll(cache, 'getInterviewTemplate');
            },
            deleteQuestion: (_result, _args, cache, _info) => {
              invalidateAll(cache, 'getInterviewTemplate');
            },

            createInterview: (_result, _args, cache, _info) => {
              invalidateAll(cache, 'getInterviews');
            },
            deleteInterview: (_result, _args, cache, _info) => {
              invalidateAll(cache, 'getInterviews');
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
