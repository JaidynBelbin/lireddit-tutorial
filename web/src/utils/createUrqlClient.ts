import {
  dedupExchange,
  Exchange,
  fetchExchange,
  stringifyVariables,
} from "urql";
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import {
  LogoutMutation,
  MeQuery,
  MeDocument,
  LoginMutation,
  RegisterMutation,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { pipe, tap } from "wonka";
import Router from "next/router";
import { resourceLimits } from "worker_threads";

const errorExchange: Exchange =
  ({ forward }) =>
  ($ops) => {
    return pipe(
      forward($ops),
      tap(({ error }) => {
        if (error?.message.includes("not authenticated")) {
          Router.replace("/login"); // redirecting rather than pushing
        }
      })
    );
  };

/// A Resolver that fetches the posts for our
export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    // entityKey = Query
    // fieldName = posts (the actual query we are making)
    const { parentKey: entityKey, fieldName } = info;

    // inspectFields returns a FieldInfo[], with all the known fields of a given entity (the Query entity in this case)
    const allFields = cache.inspectFields(entityKey);

    // allFields contains ALL the Queries that have been cached, so we filter it by fieldName to just fetch the data
    // we want, eg. we aren't interested in running the me Query here.
    const fieldInfo = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfo.length;
    if (size === 0) {
      return undefined;
    }

    // fieldKey = `posts({cursor: "1234567890", limit: 10})`
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;

    /* 
    If cache.resolve returns a value for the Query ran on posts with the fieldArgs provided, then we have already
    run it, and the value is in the cache, we do not need to run it again. 
    */

    // Have to use this syntax because we are querying a nested value (data and hasMore
    // are two separate fields on PaginatedPosts).

    const isInCache = cache.resolve(
      cache.resolve(entityKey, fieldKey) as string,
      "data"
    );

    // info.partial lets urql know that there is more data to be fetched, because the Query with the given fieldArgs
    // has NOT been run.
    info.partial = !isInCache;
    let hasMore = true;

    // This pagination query is actually stored in the cache, so all we are doing is reading the data
    // out of the cache and returning it
    const posts: string[] = [];
    fieldInfo.forEach((info) => {
      const key = cache.resolve(entityKey, info.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore");

      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      console.log("hasMore: ", hasMore);
      console.log("data", data);
      posts.push(...data); // A DataField
    });

    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: posts,
    };
  };
};

// Utility that handles creating the URQL client with support for server-side rendering
// and handling cache exchanges that update the cache after login, register and logout mutations
export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          logout: (_result, args, cache, info) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => ({ me: null })
            );
          },
          login: (_result, args, cache, info) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    me: result.login.user,
                  };
                }
              }
            );
          },

          register: (_result, cache) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {
                    me: result.register.user,
                  };
                }
              }
            );
          },
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});
